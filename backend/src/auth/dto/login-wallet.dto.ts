import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginWalletDto {
  @ApiProperty({ description: 'Endereço da carteira Web3' })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({ description: 'Assinatura da mensagem para verificação' })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({ description: 'Mensagem que foi assinada' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
