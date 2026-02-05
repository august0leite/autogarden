import { ApiProperty } from '@nestjs/swagger';

export enum TrackState {
  Draft = 'Draft',
  Registered = 'Registered',
  Disputed = 'Disputed',
  Finalized = 'Finalized',
}

export class TrackResponseDto {
  @ApiProperty({ description: 'ID único do track no backend' })
  id: string;

  @ApiProperty({ description: 'ID da obra no contrato on-chain' })
  workId: string;

  @ApiProperty({ description: 'ID do usuário criador' })
  userId: string;

  @ApiProperty({ description: 'Endereço da carteira do criador (reflete o contrato on-chain)' })
  creatorWallet: string;

  @ApiProperty({ description: 'Título da obra musical' })
  title: string;

  @ApiProperty({ description: 'Hash dos metadados (IPFS ou similar)' })
  metadataHash: string;

  @ApiProperty({
    description: 'Estado atual da obra',
    enum: TrackState,
  })
  state: TrackState;

  @ApiProperty({ description: 'Data de criação do registro' })
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  updatedAt: Date;
}
