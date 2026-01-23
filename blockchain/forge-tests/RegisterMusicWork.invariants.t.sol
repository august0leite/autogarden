// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { RegisterMusicWork } from "./RegisterMusicWork.sol";
import { Test } from "forge-std/Test.sol";
import { StdInvariant } from "forge-std/StdInvariant.sol";

// Handler para controlar as ações que o fuzzer pode executar
contract Handler is Test {
  RegisterMusicWork public registry;
  
  // Rastreia workIds criados para testes
  uint256[] public createdWorks;
  
  // Rastreia atores para usar em operações
  address[] public actors;
  
  // Fantasmas para rastreamento
  mapping(uint256 => uint256) public ghost_sumOfSplits;
  
  // Getter para length
  function getCreatedWorksCount() public view returns (uint256) {
    return createdWorks.length;
  }
  
  constructor(RegisterMusicWork _registry) {
    registry = _registry;
    
    // Inicializa alguns atores
    actors.push(address(0x1111));
    actors.push(address(0x2222));
    actors.push(address(0x3333));
    actors.push(address(0x4444));
  }
  
  // =============== AÇÕES QUE O FUZZER PODE EXECUTAR ===============
  
  function createWork(uint256 actorSeed, string memory title, string memory hash) public {
    address actor = actors[actorSeed % actors.length];
    
    vm.prank(actor);
    uint256 workId = registry.createWork(title, hash);
    createdWorks.push(workId);
    
    // Atualiza ghost variable
    ghost_sumOfSplits[workId] = 100; // criador começa com 100
  }
  
  function addAuthor(uint256 workIdSeed, uint256 authorSeed, uint8 percent) public {
    if (createdWorks.length == 0) return;
    
    uint256 workId = createdWorks[workIdSeed % createdWorks.length];
    address author = actors[authorSeed % actors.length];
    
    // Pega o criador da obra
    (address creator,,,,) = registry.works(workId);
    
    // Limita percent a um valor razoável
    percent = uint8(bound(percent, 1, 50));
    
    vm.prank(creator);
    try registry.addAuthor(workId, author, percent) {
      ghost_sumOfSplits[workId] += percent;
    } catch {
      // Operação falhou, não atualiza ghost
    }
  }
  
  function updateAuthorSplit(uint256 workIdSeed, uint256 authorSeed, uint8 newPercent) public {
    if (createdWorks.length == 0) return;
    
    uint256 workId = createdWorks[workIdSeed % createdWorks.length];
    
    // Pega o criador da obra
    (address creator,,,,) = registry.works(workId);
    
    address[] memory authors = registry.getAuthors(workId);
    if (authors.length == 0) return;
    
    address author = authors[authorSeed % authors.length];
    
    // Limita percent a um valor razoável
    newPercent = uint8(bound(newPercent, 1, 100));
    
    uint8 oldPercent = registry.authorSplits(workId, author);
    
    vm.prank(creator);
    try registry.updateAuthorSplit(workId, author, newPercent) {
      ghost_sumOfSplits[workId] = ghost_sumOfSplits[workId] - oldPercent + newPercent;
    } catch {
      // Operação falhou, não atualiza ghost
    }
  }
  
  function lockSplits(uint256 workIdSeed) public {
    if (createdWorks.length == 0) return;
    
    uint256 workId = createdWorks[workIdSeed % createdWorks.length];
    
    // Pega qualquer autor da obra
    address[] memory authors = registry.getAuthors(workId);
    if (authors.length == 0) return;
    
    address author = authors[0];
    
    vm.prank(author);
    try registry.lockSplits(workId) {
      // Sucesso
    } catch {
      // Falhou
    }
  }
  
  function registerWork(uint256 workIdSeed) public {
    if (createdWorks.length == 0) return;
    
    uint256 workId = createdWorks[workIdSeed % createdWorks.length];
    
    // Pega qualquer autor da obra
    address[] memory authors = registry.getAuthors(workId);
    if (authors.length == 0) return;
    
    address author = authors[0];
    
    vm.prank(author);
    try registry.registerWork(workId) {
      // Sucesso
    } catch {
      // Falhou
    }
  }
  
  function disputeWork(uint256 workIdSeed, uint256 actorSeed, string memory reason) public {
    if (createdWorks.length == 0) return;
    
    uint256 workId = createdWorks[workIdSeed % createdWorks.length];
    address actor = actors[actorSeed % actors.length];
    
    vm.prank(actor);
    try registry.disputeWork(workId, reason) {
      // Sucesso
    } catch {
      // Falhou
    }
  }
  
  function finalizeWork(uint256 workIdSeed) public {
    if (createdWorks.length == 0) return;
    
    uint256 workId = createdWorks[workIdSeed % createdWorks.length];
    
    // Pega qualquer autor da obra
    address[] memory authors = registry.getAuthors(workId);
    if (authors.length == 0) return;
    
    address author = authors[0];
    
    vm.prank(author);
    try registry.finalizeWork(workId) {
      // Sucesso
    } catch {
      // Falhou
    }
  }
}

// Contrato de Invariant Tests
contract RegisterMusicWorkInvariantTest is StdInvariant, Test {
  RegisterMusicWork public registry;
  Handler public handler;
  
  function setUp() public {
    registry = new RegisterMusicWork();
    handler = new Handler(registry);
    
    // Define o handler como alvo do fuzzer
    targetContract(address(handler));
    
    // Define quais funções podem ser chamadas
    bytes4[] memory selectors = new bytes4[](7);
    selectors[0] = Handler.createWork.selector;
    selectors[1] = Handler.addAuthor.selector;
    selectors[2] = Handler.updateAuthorSplit.selector;
    selectors[3] = Handler.lockSplits.selector;
    selectors[4] = Handler.registerWork.selector;
    selectors[5] = Handler.disputeWork.selector;
    selectors[6] = Handler.finalizeWork.selector;
    
    targetSelector(FuzzSelector({
      addr: address(handler),
      selectors: selectors
    }));
  }
  
  // =============== INVARIANTS ===============
  
  /// @notice totalSplits nunca deve exceder 100
  function invariant_totalSplitsNeverExceeds100() public view {
    uint256 counter = registry.workIdCounter();
    
    for (uint256 i = 0; i < counter; i++) {
      uint256 total = registry.totalSplits(i);
      assertLe(total, 100, "totalSplits exceeded 100");
    }
  }
  
  /// @notice A soma dos splits individuais deve sempre igualar totalSplits
  function invariant_sumOfAuthorSplitsEqualsTotalSplits() public view {
    uint256 counter = registry.workIdCounter();
    
    for (uint256 i = 0; i < counter; i++) {
      address[] memory authors = registry.getAuthors(i);
      uint256 sum = 0;
      
      for (uint256 j = 0; j < authors.length; j++) {
        sum += registry.authorSplits(i, authors[j]);
      }
      
      assertEq(sum, registry.totalSplits(i), "sum of splits != totalSplits");
    }
  }
  
  /// @notice Se splits estão locked, não podem ser modificados
  function invariant_lockedSplitsCannotChange() public view {
    uint256 counter = registry.workIdCounter();
    
    for (uint256 i = 0; i < counter; i++) {
      (,, , , bool locked) = registry.works(i);
      
      if (locked) {
        // Verifica que totalSplits == 100 (requerimento para lock)
        assertEq(registry.totalSplits(i), 100, "locked work must have 100% splits");
      }
    }
  }
  
  /// @notice Obra registrada deve ter splits locked e totalSplits == 100
  function invariant_registeredWorkMustHaveLockedSplits() public view {
    uint256 counter = registry.workIdCounter();
    
    for (uint256 i = 0; i < counter; i++) {
      (,, RegisterMusicWork.WorkState state, , bool locked) = registry.works(i);
      
      if (state == RegisterMusicWork.WorkState.Registered || 
          state == RegisterMusicWork.WorkState.Disputed ||
          state == RegisterMusicWork.WorkState.Finalized) {
        assertTrue(locked, "registered work must be locked");
        assertEq(registry.totalSplits(i), 100, "registered work must have 100% splits");
      }
    }
  }
  
  /// @notice Cada obra deve ter pelo menos um autor
  function invariant_everyWorkHasAtLeastOneAuthor() public view {
    uint256 counter = registry.workIdCounter();
    
    for (uint256 i = 0; i < counter; i++) {
      address[] memory authors = registry.getAuthors(i);
      assertGt(authors.length, 0, "work must have at least one author");
    }
  }
  
  /// @notice O criador deve sempre estar na lista de autores
  function invariant_creatorIsAlwaysAuthor() public view {
    uint256 counter = registry.workIdCounter();
    
    for (uint256 i = 0; i < counter; i++) {
      (address creator,,,,) = registry.works(i);
      assertTrue(registry.isAuthor(i, creator), "creator must be an author");
    }
  }
  
  /// @notice Nenhum autor deve ter 0% de split
  function invariant_noAuthorHasZeroSplit() public view {
    uint256 counter = registry.workIdCounter();
    
    for (uint256 i = 0; i < counter; i++) {
      address[] memory authors = registry.getAuthors(i);
      
      for (uint256 j = 0; j < authors.length; j++) {
        assertGt(registry.authorSplits(i, authors[j]), 0, "author split must be > 0");
      }
    }
  }
  
  /// @notice workIdCounter deve sempre ser >= número de obras criadas
  function invariant_counterConsistency() public view {
    uint256 counter = registry.workIdCounter();
    uint256 created = handler.getCreatedWorksCount();
    
    assertGe(counter, created, "counter should be >= created works");
  }
  
  /// @notice Ghost variable: soma dos splits deve bater com totalSplits do contrato
  function invariant_ghostSumMatchesTotalSplits() public view {
    uint256 count = handler.getCreatedWorksCount();
    
    for (uint256 i = 0; i < count; i++) {
      uint256 workId = handler.createdWorks(i);
      uint256 ghostSum = handler.ghost_sumOfSplits(workId);
      uint256 actualTotal = registry.totalSplits(workId);
      
      assertEq(ghostSum, actualTotal, "ghost sum should match actual totalSplits");
    }
  }
}
