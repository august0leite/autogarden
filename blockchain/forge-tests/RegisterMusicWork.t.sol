// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { RegisterMusicWork } from "./RegisterMusicWork.sol";


import {Test} from "forge-std/Test.sol";

contract RegisterMusicWorkTest is Test {
  RegisterMusicWork registry;
  address user1 = address(0x1);
  address user2 = address(0x2);

  // Eventos que esperamos que sejam emitidos
  event WorkCreated(uint256 indexed workId, address indexed creator, string title);
  event WorkRegistered(uint256 indexed workId, address indexed registrant);
  event AuthorAdded(uint256 indexed workId, address indexed author, uint8 percent);
  event AuthorSplitUpdated(uint256 indexed workId, address indexed author, uint8 percent);
  event SplitsLocked(uint256 indexed workId);
  event WorkDisputed(uint256 indexed workId, address indexed challenger, string reason);
  event WorkFinalized(uint256 indexed workId, address indexed finalizer);
  event VersionCreated(uint256 indexed workId, uint256 indexed rootWorkId, address indexed creator);

  function setUp() public {
    registry = new RegisterMusicWork();
  }

  function test_ContractExists() public view {
    // Verifica se o contrato foi criado corretamente
    require(address(registry) != address(0), "Contract should exist");
  }
  
  function test_WorkIdCounterInitialized() public view {
    // Verifica se o workIdCounter foi inicializado em 0
    require(registry.workIdCounter() == 0, "WorkIdCounter should be initialized to 0");
  }

  function test_CreateWork() public {
    // Testa se um usuário consegue criar uma obra
    vm.prank(user1);
    uint256 workId = registry.createWork("My First Song", "QmHash123");
    
    require(workId == 0, "First work should have ID 0");
    require(registry.workIdCounter() == 1, "Counter should increment to 1");
  }

  function test_CreateWorkInDraftState() public {
    // Testa se a obra é criada em estado Draft
    vm.prank(user1);
    uint256 workId = registry.createWork("My Song", "QmHash");
    
    // Verifica que o estado é Draft (enum value 0)
    (,, RegisterMusicWork.WorkState state,,) = registry.works(workId);
    require(state == RegisterMusicWork.WorkState.Draft, "Work should be in Draft state");
  }

  function test_CreateWorkEmitsEvent() public {
    // Testa se a criação emite o evento WorkCreated
    vm.prank(user1);
    vm.expectEmit(true, true, false, true);
    emit WorkCreated(0, user1, "My Song");
    
    registry.createWork("My Song", "QmHash");
  }

  function test_CreatorIsAutomaticallyAuthor() public {
    // Testa se o criador é automaticamente incluído como autor
    vm.prank(user1);
    uint256 workId = registry.createWork("My Song", "QmHash");
    
    (address creator,,,,) = registry.works(workId);
    require(creator == user1, "Creator should be user1");
  }

  function test_CreateMultipleWorks() public {
    // Testa criação de múltiplas obras
    vm.prank(user1);
    uint256 workId1 = registry.createWork("Song 1", "Hash1");
    
    vm.prank(user2);
    uint256 workId2 = registry.createWork("Song 2", "Hash2");
    
    require(workId1 == 0, "First work should be 0");
    require(workId2 == 1, "Second work should be 1");
    require(registry.workIdCounter() == 2, "Counter should be 2");
  }

  function test_WorkStoresMetadata() public {
    // Testa se a obra armazena os metadados corretamente
    vm.prank(user1);
    uint256 workId = registry.createWork("My Song Title", "QmMetadataHash");
    
    (,string memory title,, string memory metadataHash,) = registry.works(workId);
    require(
      keccak256(abi.encodePacked(title)) == keccak256(abi.encodePacked("My Song Title")),
      "Title should match"
    );
    require(
      keccak256(abi.encodePacked(metadataHash)) == keccak256(abi.encodePacked("QmMetadataHash")),
      "Metadata hash should match"
    );
  }

  function test_RegisterWorkHappyPath() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    registry.lockSplits(workId);

    vm.expectEmit(true, true, false, true);
    emit WorkRegistered(workId, user1);

    vm.prank(user1);
    registry.registerWork(workId);

    (,, RegisterMusicWork.WorkState state,,) = registry.works(workId);
    require(state == RegisterMusicWork.WorkState.Registered, "State should be Registered");
  }

  function test_RegisterRequiresLockedSplits() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    vm.expectRevert(bytes("splits not locked"));
    registry.registerWork(workId);
  }

  function test_RegisterOnlyAuthor() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    registry.lockSplits(workId);

    vm.prank(user2);
    vm.expectRevert(bytes("only author"));
    registry.registerWork(workId);
  }

  function test_LockSplitsRequiresSum100() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    // Reduz o split do criador para 50, total ficará 50
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 50);

    vm.prank(user1);
    vm.expectRevert(bytes("splits must equal 100"));
    registry.lockSplits(workId);
  }

  function test_LockSplitsHappyPathEmitsEvent() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.expectEmit(true, false, false, true);
    emit SplitsLocked(workId);

    vm.prank(user1);
    registry.lockSplits(workId);

    (,,, , bool locked) = registry.works(workId);
    require(locked == true, "splits should be locked");
  }

  function test_LockSplitsOnlyAuthor() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user2);
    vm.expectRevert(bytes("only author"));
    registry.lockSplits(workId);
  }

  function test_AddAuthorHappyPath() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    // Rebalance criador para 60
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 60);

    vm.expectEmit(true, true, false, true);
    emit AuthorAdded(workId, user2, 40);

    vm.prank(user1);
    registry.addAuthor(workId, user2, 40);

    address[] memory authors = registry.getAuthors(workId);
    require(authors.length == 2, "should have two authors");
    require(authors[1] == user2, "second author should be user2");
    require(registry.authorSplits(workId, user2) == 40, "split should be 40");
    require(registry.totalSplits(workId) == 100, "total should be 100");
  }

  function test_AddAuthorOnlyCreator() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user2);
    vm.expectRevert(bytes("only creator can add author"));
    registry.addAuthor(workId, user2, 10);
  }

  function test_AddAuthorDuplicateReverts() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    vm.expectRevert(bytes("author exists"));
    registry.addAuthor(workId, user1, 10);
  }

  // -----------------
  // Validações gerais
  // -----------------

  function test_CannotFinalizeFromDraft() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    vm.expectRevert(bytes("work not registered"));
    registry.finalizeWork(workId);
  }

  function test_AddAuthorAfterRegisterFails() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");
    vm.prank(user1);
    registry.lockSplits(workId);
    vm.prank(user1);
    registry.registerWork(workId);

    vm.prank(user1);
    vm.expectRevert(bytes("work not in draft"));
    registry.addAuthor(workId, user2, 1);
  }

  function test_UpdateAuthorAfterRegisterFails() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");
    vm.prank(user1);
    registry.lockSplits(workId);
    vm.prank(user1);
    registry.registerWork(workId);

    vm.prank(user1);
    vm.expectRevert(bytes("work not in draft"));
    registry.updateAuthorSplit(workId, user1, 90);
  }

  function test_RegisterAfterFinalizedFails() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");
    vm.prank(user1);
    registry.lockSplits(workId);
    vm.prank(user1);
    registry.registerWork(workId);
    vm.prank(user1);
    registry.finalizeWork(workId);

    vm.prank(user1);
    vm.expectRevert(bytes("work not in draft"));
    registry.registerWork(workId);
  }

  function test_DisputeHappyPath() public {
    // Cria, bloqueia splits e registra
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");
    vm.prank(user1);
    registry.lockSplits(workId);
    vm.prank(user1);
    registry.registerWork(workId);

    vm.expectEmit(true, true, false, true);
    emit WorkDisputed(workId, user2, "inaccurate data");

    vm.prank(user2);
    registry.disputeWork(workId, "inaccurate data");

    (,, RegisterMusicWork.WorkState state,,) = registry.works(workId);
    require(state == RegisterMusicWork.WorkState.Disputed, "State should be Disputed");
    require(
      keccak256(bytes(registry.disputeReasons(workId))) == keccak256(bytes("inaccurate data")),
      "Reason should be stored"
    );
  }

  function test_DisputeRequiresRegistered() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user2);
    vm.expectRevert(bytes("work not registered"));
    registry.disputeWork(workId, "reason");
  }

  function test_DisputeRequiresReason() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");
    vm.prank(user1);
    registry.lockSplits(workId);
    vm.prank(user1);
    registry.registerWork(workId);

    vm.prank(user2);
    vm.expectRevert(bytes("reason required"));
    registry.disputeWork(workId, "");
  }

  function test_FinalizeHappyPath() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");
    vm.prank(user1);
    registry.lockSplits(workId);
    vm.prank(user1);
    registry.registerWork(workId);

    vm.expectEmit(true, true, false, true);
    emit WorkFinalized(workId, user1);

    vm.prank(user1);
    registry.finalizeWork(workId);

    (,, RegisterMusicWork.WorkState state,,) = registry.works(workId);
    require(state == RegisterMusicWork.WorkState.Finalized, "State should be Finalized");
  }

  function test_FinalizeOnlyAuthor() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");
    vm.prank(user1);
    registry.lockSplits(workId);
    vm.prank(user1);
    registry.registerWork(workId);

    vm.prank(user2);
    vm.expectRevert(bytes("only author"));
    registry.finalizeWork(workId);
  }

  function test_FinalizeRequiresRegistered() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    vm.expectRevert(bytes("work not registered"));
    registry.finalizeWork(workId);
  }

  function test_FinalizeAfterDisputeBlocked() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");
    vm.prank(user1);
    registry.lockSplits(workId);
    vm.prank(user1);
    registry.registerWork(workId);

    vm.prank(user2);
    registry.disputeWork(workId, "reason");

    vm.prank(user1);
    vm.expectRevert(bytes("work not registered"));
    registry.finalizeWork(workId);
  }

  function test_CreateVersionHappyPath() public {
    // Cria, registra e finaliza obra raiz
    vm.prank(user1);
    uint256 rootId = registry.createWork("Root", "HashRoot");
    vm.prank(user1);
    registry.lockSplits(rootId);
    vm.prank(user1);
    registry.registerWork(rootId);

    vm.expectEmit(true, true, true, true);
    emit VersionCreated(1, rootId, user2);

    vm.prank(user2);
    uint256 versionId = registry.createVersion(rootId, "Root v2", "HashV2");

    require(versionId == 1, "version id should be 1");
    require(registry.rootOf(versionId) == rootId, "root should match");

    (,, RegisterMusicWork.WorkState state,, bool locked) = registry.works(versionId);
    require(state == RegisterMusicWork.WorkState.Draft, "version starts Draft");
    require(locked == true, "splits should be locked in version");

    // autores e splits herdados
    address[] memory authors = registry.getAuthors(versionId);
    require(authors.length == 1, "should keep 1 author");
    require(authors[0] == user1, "author should be root creator");
    require(registry.authorSplits(versionId, user1) == 100, "split should be 100");
    require(registry.totalSplits(versionId) == 100, "total should be 100");
  }

  function test_CreateVersionRequiresRootStable() public {
    vm.prank(user1);
    uint256 rootId = registry.createWork("Root", "HashRoot");

    vm.prank(user2);
    vm.expectRevert(bytes("root not stable"));
    registry.createVersion(rootId, "v2", "HashV2");
  }

  function test_VersionInheritsLockedSplitsCannotUpdate() public {
    vm.prank(user1);
    uint256 rootId = registry.createWork("Root", "HashRoot");
    vm.prank(user1);
    registry.lockSplits(rootId);
    vm.prank(user1);
    registry.registerWork(rootId);

    vm.prank(user2);
    uint256 versionId = registry.createVersion(rootId, "v2", "HashV2");

    vm.prank(user2);
    vm.expectRevert(bytes("splits locked"));
    registry.updateAuthorSplit(versionId, user1, 90);
  }

  function test_VersionChainClonesFromRoot() public {
    // Cria raiz com user1 100%
    vm.prank(user1);
    uint256 rootId = registry.createWork("Root", "HashRoot");
    vm.prank(user1);
    registry.lockSplits(rootId);
    vm.prank(user1);
    registry.registerWork(rootId);

    // user2 cria versão v2 da raiz (herda user1 como autor)
    vm.prank(user2);
    uint256 v2Id = registry.createVersion(rootId, "v2", "HashV2");

    // user1 (autor herdado) registra v2
    vm.prank(user1);
    registry.registerWork(v2Id);

    // outro usuário cria versão v3 de v2 (versão de versão)
    vm.prank(user2);
    uint256 v3Id = registry.createVersion(v2Id, "v3", "HashV3");

    // Verifica que v3 aponta para a raiz original
    require(registry.rootOf(v3Id) == rootId, "v3 should point to original root");

    // Verifica que v3 herdou splits da raiz original (user1 100%), não de v2
    address[] memory authorsV3 = registry.getAuthors(v3Id);
    require(authorsV3.length == 1, "v3 should have 1 author from root");
    require(authorsV3[0] == user1, "v3 should inherit user1 from root");
    require(registry.authorSplits(v3Id, user1) == 100, "v3 should have user1 at 100%");
    require(registry.totalSplits(v3Id) == 100, "v3 total should be 100");
  }

  function test_AddAuthorExceeds100Reverts() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    // Criador ainda tem 100, adicionar +1 estoura
    vm.prank(user1);
    vm.expectRevert(bytes("splits exceed 100"));
    registry.addAuthor(workId, user2, 1);
  }

  function test_UpdateAuthorSplitHappyPath() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 70);

    vm.expectEmit(true, true, false, true);
    emit AuthorSplitUpdated(workId, user1, 50);

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 50);

    require(registry.authorSplits(workId, user1) == 50, "split should be 50");
    require(registry.totalSplits(workId) == 50, "total should be 50");
  }

  function test_UpdateAuthorSplitOnlyCreator() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user2);
    vm.expectRevert(bytes("only creator can update"));
    registry.updateAuthorSplit(workId, user1, 90);
  }

  function test_UpdateAuthorSplitNonAuthorReverts() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    vm.expectRevert(bytes("author not found"));
    registry.updateAuthorSplit(workId, user2, 10);
  }

  function test_AddOrUpdateAfterLockReverts() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    registry.lockSplits(workId);

    vm.prank(user1);
    vm.expectRevert(bytes("splits locked"));
    registry.addAuthor(workId, user2, 1);

    vm.prank(user1);
    vm.expectRevert(bytes("splits locked"));
    registry.updateAuthorSplit(workId, user1, 99);
  }

  // ========================================
  // TESTES AVANÇADOS: AuthorAdded
  // ========================================

  function test_AddAuthor_MultipleAuthorsSequentially() public {
    // Cenário: adicionar 3 autores sequencialmente com splits balanceados
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    // Ajusta criador para 40%
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 40);

    // Adiciona user2 com 30%
    vm.prank(user1);
    registry.addAuthor(workId, user2, 30);

    // Adiciona terceiro autor com 30%
    address user3 = address(0x3);
    vm.prank(user1);
    registry.addAuthor(workId, user3, 30);

    // Verificações
    address[] memory authors = registry.getAuthors(workId);
    require(authors.length == 3, "should have 3 authors");
    require(registry.authorSplits(workId, user1) == 40, "user1 should have 40%");
    require(registry.authorSplits(workId, user2) == 30, "user2 should have 30%");
    require(registry.authorSplits(workId, user3) == 30, "user3 should have 30%");
    require(registry.totalSplits(workId) == 100, "total should be 100%");
  }

  function test_AddAuthor_EventEmittedWithCorrectData() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 60);

    // Verifica evento com dados exatos
    vm.expectEmit(true, true, false, true);
    emit AuthorAdded(workId, user2, 40);

    vm.prank(user1);
    registry.addAuthor(workId, user2, 40);
  }

  function test_AddAuthor_WithMinimumSplit() public {
    // Testa adicionar autor com apenas 1%
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 99);

    vm.prank(user1);
    registry.addAuthor(workId, user2, 1);

    require(registry.authorSplits(workId, user2) == 1, "should have 1%");
    require(registry.totalSplits(workId) == 100, "total should be 100%");
  }

  function test_AddAuthor_CannotAddWithZeroSplit() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    vm.expectRevert(bytes("percent must be > 0"));
    registry.addAuthor(workId, user2, 0);
  }

  function test_AddAuthor_CannotAddZeroAddress() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 50);

    vm.prank(user1);
    vm.expectRevert(bytes("invalid author"));
    registry.addAuthor(workId, address(0), 50);
  }

  function test_AddAuthor_TotalSplitsUpdatedCorrectly() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    require(registry.totalSplits(workId) == 100, "initial total should be 100");

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 70);
    require(registry.totalSplits(workId) == 70, "total after update should be 70");

    vm.prank(user1);
    registry.addAuthor(workId, user2, 30);
    require(registry.totalSplits(workId) == 100, "total after add should be 100");
  }

  function test_AddAuthor_ExactlyAt100Limit() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    // Criador reduz para 50
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 50);

    // Adiciona exatamente 50 para fechar em 100
    vm.prank(user1);
    registry.addAuthor(workId, user2, 50);

    require(registry.totalSplits(workId) == 100, "should be exactly 100");
  }

  function test_AddAuthor_MultipleAuthorsOrderPreserved() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 25);

    address user3 = address(0x3);
    address user4 = address(0x4);

    vm.prank(user1);
    registry.addAuthor(workId, user2, 25);

    vm.prank(user1);
    registry.addAuthor(workId, user3, 25);

    vm.prank(user1);
    registry.addAuthor(workId, user4, 25);

    address[] memory authors = registry.getAuthors(workId);
    require(authors[0] == user1, "first should be user1");
    require(authors[1] == user2, "second should be user2");
    require(authors[2] == user3, "third should be user3");
    require(authors[3] == user4, "fourth should be user4");
  }

  function test_AddAuthor_CannotExceedBy1Percent() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    // Criador com 99%, tentar adicionar 2%
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 99);

    vm.prank(user1);
    vm.expectRevert(bytes("splits exceed 100"));
    registry.addAuthor(workId, user2, 2);
  }

  // ========================================
  // TESTES AVANÇADOS: AuthorSplitUpdated
  // ========================================

  function test_UpdateAuthorSplit_ReduceToMinimum() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 1);

    require(registry.authorSplits(workId, user1) == 1, "should be 1%");
    require(registry.totalSplits(workId) == 1, "total should be 1");
  }

  function test_UpdateAuthorSplit_CannotSetToZero() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    vm.expectRevert(bytes("percent must be > 0"));
    registry.updateAuthorSplit(workId, user1, 0);
  }

  function test_UpdateAuthorSplit_EventEmittedWithNewValue() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.expectEmit(true, true, false, true);
    emit AuthorSplitUpdated(workId, user1, 75);

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 75);
  }

  function test_UpdateAuthorSplit_MultipleUpdatesOnSameAuthor() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 80);
    require(registry.authorSplits(workId, user1) == 80, "should be 80");

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 60);
    require(registry.authorSplits(workId, user1) == 60, "should be 60");

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 40);
    require(registry.authorSplits(workId, user1) == 40, "should be 40");

    require(registry.totalSplits(workId) == 40, "total should track changes");
  }

  function test_UpdateAuthorSplit_TotalSplitsRecalculated() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 60);
    require(registry.totalSplits(workId) == 60, "total should be 60");

    vm.prank(user1);
    registry.addAuthor(workId, user2, 30);
    require(registry.totalSplits(workId) == 90, "total should be 90");

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 70);
    require(registry.totalSplits(workId) == 100, "total should be 100");
  }

  function test_UpdateAuthorSplit_CannotExceed100() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 50);

    vm.prank(user1);
    registry.addAuthor(workId, user2, 30);

    // Total é 80, tentar aumentar user1 para 71 daria 101
    vm.prank(user1);
    vm.expectRevert(bytes("splits exceed 100"));
    registry.updateAuthorSplit(workId, user1, 71);
  }

  function test_UpdateAuthorSplit_IncreaseToMaximum() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 50);

    // Aumentar de volta para 100
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 100);

    require(registry.authorSplits(workId, user1) == 100, "should be 100");
    require(registry.totalSplits(workId) == 100, "total should be 100");
  }

  // ========================================
  // TESTES COMPLEXOS: Cenários Combinados
  // ========================================

  function test_Complex_AddAndUpdateMultipleAuthorsToBalance() public {
    // Cenário complexo: criar obra, adicionar 3 autores, ajustar todos para 25% cada
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    // Criador começa com 100
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 25);

    address user3 = address(0x3);
    address user4 = address(0x4);

    vm.prank(user1);
    registry.addAuthor(workId, user2, 25);

    vm.prank(user1);
    registry.addAuthor(workId, user3, 25);

    vm.prank(user1);
    registry.addAuthor(workId, user4, 25);

    // Verificar balanceamento
    require(registry.authorSplits(workId, user1) == 25, "user1 should be 25");
    require(registry.authorSplits(workId, user2) == 25, "user2 should be 25");
    require(registry.authorSplits(workId, user3) == 25, "user3 should be 25");
    require(registry.authorSplits(workId, user4) == 25, "user4 should be 25");
    require(registry.totalSplits(workId) == 100, "total should be 100");

    // Agora rebalancear: user1 fica com 40, outros com 20 cada
    // Primeiro reduz os outros para não exceder 100
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user2, 20);

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user3, 20);

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user4, 20);

    // Agora aumenta user1 para 40
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 40);

    require(registry.authorSplits(workId, user1) == 40, "user1 should be 40");
    require(registry.totalSplits(workId) == 100, "total should still be 100");
  }

  function test_Complex_SequentialUpdatesToReachExact100() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    // Reduz criador
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 30);

    // Adiciona autores com splits que não fecham 100
    address user3 = address(0x3);
    vm.prank(user1);
    registry.addAuthor(workId, user2, 30);
    require(registry.totalSplits(workId) == 60, "total should be 60");

    vm.prank(user1);
    registry.addAuthor(workId, user3, 30);
    require(registry.totalSplits(workId) == 90, "total should be 90");

    // Ajusta um dos autores para fechar em 100
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user2, 40);
    require(registry.totalSplits(workId) == 100, "total should be 100");

    // Tenta travar
    vm.prank(user1);
    registry.lockSplits(workId);

    (,,, , bool locked) = registry.works(workId);
    require(locked == true, "splits should be locked");
  }

  function test_Complex_AddAuthorsThenUpdateAllSplits() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    // Adiciona 2 autores
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 50);

    vm.prank(user1);
    registry.addAuthor(workId, user2, 30);

    address user3 = address(0x3);
    vm.prank(user1);
    registry.addAuthor(workId, user3, 20);

    require(registry.totalSplits(workId) == 100, "total should be 100");

    // Agora reajusta todos - primeiro reduz, depois aumenta
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user2, 25);

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user3, 15);

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 60);

    require(registry.authorSplits(workId, user1) == 60, "user1 should be 60");
    require(registry.authorSplits(workId, user2) == 25, "user2 should be 25");
    require(registry.authorSplits(workId, user3) == 15, "user3 should be 15");
    require(registry.totalSplits(workId) == 100, "total should be 100");
  }

  function test_Complex_EdgeCaseNearLimits() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    // user1 fica com 1%
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 1);

    // adiciona user2 com 99%
    vm.prank(user1);
    registry.addAuthor(workId, user2, 99);

    require(registry.totalSplits(workId) == 100, "total should be 100");

    // Inverte: user1 para 99%, user2 para 1%
    // Primeiro reduz user2, depois aumenta user1
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user2, 1);

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 99);

    require(registry.authorSplits(workId, user1) == 99, "user1 should be 99");
    require(registry.authorSplits(workId, user2) == 1, "user2 should be 1");
    require(registry.totalSplits(workId) == 100, "total should be 100");
  }

  function test_Complex_CannotLockUnless100() public {
    vm.prank(user1);
    uint256 workId = registry.createWork("Song", "Hash");

    // Reduz para 90
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 90);

    vm.prank(user1);
    vm.expectRevert(bytes("splits must equal 100"));
    registry.lockSplits(workId);

    // Completa para 100
    vm.prank(user1);
    registry.addAuthor(workId, user2, 10);

    // Agora pode travar
    vm.prank(user1);
    registry.lockSplits(workId);

    (,,, , bool locked) = registry.works(workId);
    require(locked == true, "should be locked");
  }

  function test_Complex_WorkflowFullCycle() public {
    // Workflow completo: criar, adicionar autores, ajustar, travar, registrar
    vm.prank(user1);
    uint256 workId = registry.createWork("Complete Song", "Hash");

    // Adiciona coautores
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 50);

    vm.prank(user1);
    registry.addAuthor(workId, user2, 50);

    // Reajusta - primeiro reduz user2, depois aumenta user1
    vm.prank(user1);
    registry.updateAuthorSplit(workId, user2, 40);

    vm.prank(user1);
    registry.updateAuthorSplit(workId, user1, 60);

    // Trava
    vm.prank(user1);
    registry.lockSplits(workId);

    // Registra
    vm.prank(user1);
    registry.registerWork(workId);

    // Verifica estado final
    (,, RegisterMusicWork.WorkState state,, bool locked) = registry.works(workId);
    require(state == RegisterMusicWork.WorkState.Registered, "should be registered");
    require(locked == true, "should be locked");
    require(registry.totalSplits(workId) == 100, "splits should be 100");

    // Não pode mais adicionar ou atualizar
    vm.prank(user1);
    vm.expectRevert(bytes("work not in draft"));
    registry.addAuthor(workId, address(0x3), 1);
  }
}
