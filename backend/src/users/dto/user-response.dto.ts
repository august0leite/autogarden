import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'ID único do usuário' })
  id: string;

  @ApiProperty({ description: 'Email do usuário (Web2)', required: false })
  email?: string;

  @ApiProperty({ description: 'Nome do usuário', required: false })
  name?: string;

  @ApiProperty({ description: 'Endereço da carteira do usuário (Web3)', required: false })
  walletAddress?: string;

  @ApiProperty({ description: 'Data de criação da conta' })
  createdAt: Date;

  @ApiProperty({ description: 'Data do último login', required: false })
  lastLoginAt?: Date;
}
