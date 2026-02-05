import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IndexerService } from './indexer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Indexer')
@Controller('v1/indexer')
export class IndexerController {
  constructor(private readonly indexerService: IndexerService) {}

  @Get('state')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter estado atual do indexador (último bloco processado)' })
  @ApiResponse({ status: 200, description: 'Estado do indexador' })
  async getState() {
    const state = await this.indexerService.getState();
    return {
      lastBlockProcessed: state.lastBlockProcessed.toString(),
      updatedAt: state.updatedAt,
    };
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Forçar sincronização manual (útil para dev/admin)' })
  @ApiResponse({ status: 200, description: 'Sincronização iniciada' })
  async manualSync() {
    return this.indexerService.manualSync();
  }
}
