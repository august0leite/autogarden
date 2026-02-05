import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateTrackDto {
  @ApiProperty({ description: 'ID da obra no contrato on-chain' })
  @IsNotEmpty()
  @IsNumber()
  workId: bigint;

  @ApiProperty({ description: 'ID do usuário criador' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Endereço da carteira do criador (reflete o contrato)' })
  @IsNotEmpty()
  @IsString()
  creatorWallet: string;

  @ApiProperty({ description: 'Título da obra musical' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Hash dos metadados (IPFS ou similar)' })
  @IsNotEmpty()
  @IsString()
  metadataHash: string;
}
