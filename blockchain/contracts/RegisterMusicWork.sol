// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract RegisterMusicWork {
  // Estados possíveis de uma obra
  enum WorkState {
    Draft,      // 0 - Rascunho, pode ser editado
    Registered, // 1 - Registrado, splits travados
    Disputed,   // 2 - Em disputa
    Finalized   // 3 - Finalizado, imutável
  }

  // Estrutura que representa uma obra musical
  struct Work {
    address creator;        // Criador da obra
    string title;           // Título da obra
    WorkState state;        // Estado atual da obra
    string metadataHash;    // Hash IPFS ou similar dos metadados
    bool splitsLocked;      // Se os splits estão travados
  }

  // Identificador único para cada obra
  uint256 public workIdCounter;
  
  // Mapping de workId para Work
  mapping(uint256 => Work) public works;

  // Autores e splits
  mapping(uint256 => address[]) private workAuthors; // lista de autores por obra
  mapping(uint256 => mapping(address => uint8)) public authorSplits; // percentual por autor
  mapping(uint256 => mapping(address => bool)) public isAuthor; // controle de existência
  mapping(uint256 => uint256) public totalSplits; // soma dos percentuais
  mapping(uint256 => string) public disputeReasons; // motivo de contestação
  mapping(uint256 => uint256) public rootOf; // obra raiz (para versões)

  // Eventos
  event WorkCreated(uint256 indexed workId, address indexed creator, string title);
  event SplitsLocked(uint256 indexed workId);
  event WorkRegistered(uint256 indexed workId, address indexed registrant);
  event AuthorAdded(uint256 indexed workId, address indexed author, uint8 percent);
  event AuthorSplitUpdated(uint256 indexed workId, address indexed author, uint8 percent);
  event WorkDisputed(uint256 indexed workId, address indexed challenger, string reason);
  event WorkFinalized(uint256 indexed workId, address indexed finalizer);
  event VersionCreated(uint256 indexed workId, uint256 indexed rootWorkId, address indexed creator);

  constructor() {
    workIdCounter = 0;
  }

  // Função para criar uma nova obra
  function createWork(string memory _title, string memory _metadataHash) public returns (uint256) {
    uint256 newWorkId = workIdCounter;
    
    works[newWorkId] = Work({
      creator: msg.sender,
      title: _title,
      state: WorkState.Draft,
      metadataHash: _metadataHash,
      splitsLocked: false
    });

    // Criador é automaticamente autor com 100% inicialmente
    _addAuthor(newWorkId, msg.sender, 100);

    // Obra raiz aponta para si mesma
    rootOf[newWorkId] = newWorkId;

    workIdCounter++;

    emit WorkCreated(newWorkId, msg.sender, _title);

    return newWorkId;
  }

  // Adiciona novo autor enquanto obra está em Draft e splits não travados
  function addAuthor(uint256 workId, address author, uint8 percent) external {
    Work storage work = _getWork(workId);
    require(work.state == WorkState.Draft, "work not in draft");
    require(!work.splitsLocked, "splits locked");
    require(msg.sender == work.creator, "only creator can add author");

    _addAuthor(workId, author, percent);
  }

  // Atualiza percentual de um autor existente
  function updateAuthorSplit(uint256 workId, address author, uint8 newPercent) external {
    Work storage work = _getWork(workId);
    require(work.state == WorkState.Draft, "work not in draft");
    require(!work.splitsLocked, "splits locked");
    require(msg.sender == work.creator, "only creator can update");
    require(isAuthor[workId][author], "author not found");
    require(newPercent > 0, "percent must be > 0");

    uint256 previous = authorSplits[workId][author];
    uint256 newTotal = totalSplits[workId] - previous + newPercent;
    require(newTotal <= 100, "splits exceed 100");

    authorSplits[workId][author] = newPercent;
    totalSplits[workId] = newTotal;

    emit AuthorSplitUpdated(workId, author, newPercent);
  }

  // Trava splits, impedindo alterações
  function lockSplits(uint256 workId) external {
    Work storage work = _getWork(workId);
    require(work.state == WorkState.Draft, "work not in draft");
    require(!work.splitsLocked, "splits locked");
    require(isAuthor[workId][msg.sender], "only author");
    require(totalSplits[workId] == 100, "splits must equal 100");

    work.splitsLocked = true;
    emit SplitsLocked(workId);
  }

  // Registra a obra
  function registerWork(uint256 workId) external {
    Work storage work = _getWork(workId);
    require(work.state == WorkState.Draft, "work not in draft");
    require(work.splitsLocked, "splits not locked");
    require(totalSplits[workId] == 100, "splits must equal 100");
    require(isAuthor[workId][msg.sender], "only author");

    work.state = WorkState.Registered;
    emit WorkRegistered(workId, msg.sender);
  }

  // Qualquer endereço pode contestar uma obra registrada
  function disputeWork(uint256 workId, string memory reason) external {
    Work storage work = _getWork(workId);
    require(work.state == WorkState.Registered, "work not registered");
    require(bytes(reason).length > 0, "reason required");

    work.state = WorkState.Disputed;
    disputeReasons[workId] = reason;

    emit WorkDisputed(workId, msg.sender, reason);
  }

  // Cria uma versão da obra, herdando splits da raiz
  function createVersion(uint256 rootWorkId, string memory _title, string memory _metadataHash) external returns (uint256) {
    _requireWorkExists(rootWorkId);
    uint256 rootId = rootOf[rootWorkId];
    // Se rootWorkId é a própria raiz, rootOf[rootWorkId] == rootWorkId
    // Se rootWorkId é uma versão, rootOf[rootWorkId] aponta para a raiz original
    // rootId já está correto em ambos os casos, não precisa fallback

    Work storage root = works[rootWorkId];
    require(
      root.state == WorkState.Registered || root.state == WorkState.Finalized,
      "root not stable"
    );

    uint256 newWorkId = workIdCounter;

    works[newWorkId] = Work({
      creator: msg.sender,
      title: _title,
      state: WorkState.Draft,
      metadataHash: _metadataHash,
      splitsLocked: true // herda splits já travados
    });

    rootOf[newWorkId] = rootId;

    // Clona splits da raiz original (autores e percentuais)
    _cloneSplits(rootId, newWorkId);

    workIdCounter++;

    emit VersionCreated(newWorkId, rootId, msg.sender);

    return newWorkId;
  }

  // Finaliza a obra, tornando-a imutável
  function finalizeWork(uint256 workId) external {
    Work storage work = _getWork(workId);
    require(work.state == WorkState.Registered, "work not registered");
    require(isAuthor[workId][msg.sender], "only author");

    work.state = WorkState.Finalized;
    emit WorkFinalized(workId, msg.sender);
  }

  // Retorna autores da obra
  function getAuthors(uint256 workId) external view returns (address[] memory) {
    _requireWorkExists(workId);
    return workAuthors[workId];
  }

  // Helpers internos
  function _addAuthor(uint256 workId, address author, uint8 percent) internal {
    require(author != address(0), "invalid author");
    require(percent > 0, "percent must be > 0");
    require(!isAuthor[workId][author], "author exists");
    require(totalSplits[workId] + percent <= 100, "splits exceed 100");

    isAuthor[workId][author] = true;
    authorSplits[workId][author] = percent;
    totalSplits[workId] += percent;
    workAuthors[workId].push(author);

    emit AuthorAdded(workId, author, percent);
  }

  function _getWork(uint256 workId) internal view returns (Work storage) {
    _requireWorkExists(workId);
    return works[workId];
  }

  function _requireWorkExists(uint256 workId) internal view {
    require(workId < workIdCounter, "work not found");
  }

  function _cloneSplits(uint256 fromWorkId, uint256 toWorkId) internal {
    address[] storage authors = workAuthors[fromWorkId];
    for (uint256 i = 0; i < authors.length; i++) {
      address author = authors[i];
      uint8 percent = authorSplits[fromWorkId][author];
      _addAuthor(toWorkId, author, percent);
    }
  }
}