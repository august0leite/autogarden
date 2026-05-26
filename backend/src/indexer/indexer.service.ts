import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ethers } from 'ethers';
import { PrismaService } from '../database/prisma.service';
import { MUSIC_CONTRACT_ABI } from './contract.abi';

interface BlockchainEvent {
  workId: bigint;
  creator: string;
  title: string;
  metadataHash: string;
  blockNumber: bigint;
  transactionHash: string;
}

@Injectable()
export class IndexerService {
  private readonly logger = new Logger(IndexerService.name);
  private isRunning = false;
  private provider: ethers.AlchemyProvider;
  private contract: ethers.Contract;
  private contractAddress: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // Inicializa provider Alchemy
    const alchemyApiKey = this.configService.get<string>('ALCHEMY_API_KEY');
    const chainId = this.configService.get<string>('CHAIN_ID');
    const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');

    if (!alchemyApiKey) {
      throw new Error('ALCHEMY_API_KEY is not defined in environment variables');
    }
    if (!chainId) {
      throw new Error('CHAIN_ID is not defined in environment variables');
    }
    if (!contractAddress) {
      throw new Error('CONTRACT_ADDRESS is not defined in environment variables');
    }

    this.contractAddress = contractAddress;

    // Determina network baseado no chainId
    const network = this.getNetworkFromChainId(chainId);
    
    this.provider = new ethers.AlchemyProvider(network, alchemyApiKey);
    this.contract = new ethers.Contract(
      this.contractAddress,
      MUSIC_CONTRACT_ABI,
      this.provider,
    );

    this.logger.log(`🔗 Indexador conectado: ${network} (${chainId})`);
    this.logger.log(`📝 Contrato: ${this.contractAddress}`);
  }

  /**
   * Mapeia chainId para nome da network do ethers
   */
  private getNetworkFromChainId(chainId: string): string {
    const networks: Record<string, string> = {
      '1': 'mainnet',
      '11155111': 'sepolia',
      '5': 'goerli',
      '137': 'matic',
      '80001': 'maticmum',
    };
    return networks[chainId] || 'sepolia'; // default para sepolia
  }

  /**
   * Cron job que sincroniza eventos da blockchain
   * Roda a cada 30 segundos
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async syncEvents() {
    // Evita execuções concorrentes
    if (this.isRunning) {
      this.logger.debug('Sync já em andamento, pulando...');
      return;
    }

    try {
      this.isRunning = true;
      await this.processNewBlocks();
    } catch (error) {
      this.logger.error('Erro ao sincronizar eventos:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Processa novos blocos desde o último processado
   */
  private async processNewBlocks() {
    // 1. Lê último bloco processado
    const state = await this.getOrCreateIndexerState();
    const lastBlock = state.lastBlockProcessed;

    this.logger.debug(`Último bloco processado: ${lastBlock}`);

    // 2. Busca eventos novos (fromBlock = lastBlock + 1, toBlock = latest)
    const events = await this.fetchNewEvents(lastBlock);

    if (events.length === 0) {
      this.logger.debug('Nenhum evento novo');
      return;
    }

    this.logger.log(`Processando ${events.length} eventos novos`);

    // 3. Processa evento por evento
    let newLastBlock = lastBlock;
    for (const event of events) {
      await this.processEvent(event);
      newLastBlock = event.blockNumber;
    }

    // 4. Persiste progresso
    await this.updateLastBlock(newLastBlock);
    this.logger.log(`Indexador atualizado até bloco ${newLastBlock}`);
  }

  /**
   * Busca eventos novos da blockchain de forma DETERMINÍSTICA
   * 
   * Princípios:
   * ✅ Determinístico - sempre retorna os mesmos eventos para o mesmo range
   * ✅ Reexecutável - pode crashar e rodar novamente sem problemas
   * ✅ Sem estado escondido - tudo vem do lastBlockProcessed
   */
  private async fetchNewEvents(fromBlock: bigint): Promise<BlockchainEvent[]> {
    try {
      const fromBlockNum = Number(fromBlock) + 1;
      const latestBlock = await this.provider.getBlockNumber();

      // Se já estamos no último bloco, não há nada para buscar
      if (fromBlockNum > latestBlock) {
        this.logger.debug(`Já no último bloco: ${latestBlock}`);
        return [];
      }

      // Limita range para evitar timeouts
      // Alchemy free tier: max 10 blocos por request
      // Alchemy PAYG: pode usar ranges maiores (10000+)
      const configuredBlockRange = this.configService.get<string>('INDEXER_BLOCK_RANGE');
      const blockRange = configuredBlockRange ? Number(configuredBlockRange) : 10;
      // Subtrai 1 porque o range é inclusivo em ambos os lados: [from, to]
      const toBlockNum = Math.min(fromBlockNum + blockRange - 1, latestBlock);

      this.logger.debug(
        `Buscando eventos: blocos ${fromBlockNum} → ${toBlockNum} (latest: ${latestBlock})`,
      );

      // Busca eventos WorkRegistered deterministicamente
      const filter = this.contract.filters.WorkRegistered();
      const events = await this.contract.queryFilter(
        filter,
        fromBlockNum,
        toBlockNum,
      );

      // Mapeia eventos para formato interno
      // IMPORTANTE: ordenar por blockNumber para processamento determinístico
      const mappedEvents: BlockchainEvent[] = events
        .map((event) => {
          const log = event as ethers.EventLog;
          return {
            workId: BigInt(log.args.workId.toString()),
            creator: log.args.creator.toLowerCase(), // Normaliza endereço
            title: log.args.title,
            metadataHash: log.args.metadataHash,
            blockNumber: BigInt(log.blockNumber),
            transactionHash: log.transactionHash,
          };
        })
        .sort((a, b) => {
          // Ordena por bloco, depois por workId (determinístico)
          if (a.blockNumber < b.blockNumber) return -1;
          if (a.blockNumber > b.blockNumber) return 1;
          if (a.workId < b.workId) return -1;
          if (a.workId > b.workId) return 1;
          return 0;
        });

      if (mappedEvents.length > 0) {
        this.logger.log(
          `✅ ${mappedEvents.length} eventos encontrados (blocos ${fromBlockNum}-${toBlockNum})`,
        );
      }

      return mappedEvents;
    } catch (error) {
      // Em caso de erro, loga mas não quebra - próxima execução tentará novamente
      this.logger.error(`Erro ao buscar eventos:`, error);
      return [];
    }
  }

  /**
   * Processa um evento individual de forma idempotente
   */
  private async processEvent(event: BlockchainEvent) {
    // Idempotência: verifica se evento já foi processado
    const existing = await this.prisma.track.findUnique({
      where: { workId: event.workId },
    });

    if (existing) {
      this.logger.debug(`Track ${event.workId} já existe, pulando...`);
      return;
    }

    // Encontra ou cria usuário pela wallet
    let user = await this.prisma.user.findUnique({
      where: { walletAddress: event.creator },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          walletAddress: event.creator,
        },
      });
      this.logger.log(`Novo usuário criado: ${event.creator}`);
    }

    // Cria track
    await this.prisma.track.create({
      data: {
        workId: event.workId,
        creatorWallet: event.creator,
        userId: user.id,
        title: event.title,
        metadataHash: event.metadataHash,
        state: 'Registered',
      },
    });

    this.logger.log(`Track ${event.workId} indexado: ${event.title}`);
  }

  /**
   * Obtém ou cria estado do indexador
   */
  private async getOrCreateIndexerState() {
    let state = await this.prisma.indexerState.findUnique({
      where: { id: 'singleton' },
    });

    if (!state) {
      state = await this.prisma.indexerState.create({
        data: {
          id: 'singleton',
          lastBlockProcessed: BigInt(0),
        },
      });
    }

    return state;
  }

  /**
   * Atualiza último bloco processado
   */
  private async updateLastBlock(blockNumber: bigint) {
    await this.prisma.indexerState.update({
      where: { id: 'singleton' },
      data: { lastBlockProcessed: blockNumber },
    });
  }

  /**
   * Sincronização manual (útil para testes/admin)
   */
  async manualSync() {
    this.logger.log('Sincronização manual iniciada');
    await this.processNewBlocks();
    return { success: true, message: 'Sincronização concluída' };
  }

  /**
   * Retorna estado atual do indexador
   */
  async getState() {
    return this.getOrCreateIndexerState();
  }

  /**
   * Reset do indexador (APENAS DESENVOLVIMENTO)
   */
  async reset(startBlock: bigint = BigInt(0)) {
    this.logger.warn(`⚠️  Resetando indexador para bloco ${startBlock}`);
    await this.prisma.indexerState.update({
      where: { id: 'singleton' },
      data: { lastBlockProcessed: startBlock },
    });
    return { success: true, resetTo: startBlock };
  }
}
