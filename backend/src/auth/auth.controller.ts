import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginWalletDto } from './dto/login-wallet.dto';
import { Public } from './decorators/public.decorator';

@ApiTags('Authentication')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário com email e senha (Web2)' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return { data: result };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login com email e senha (Web2)' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return { data: result };
  }

  @Public()
  @Post('wallet/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login com carteira Web3' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Assinatura inválida' })
  async loginWithWallet(@Body() loginWalletDto: LoginWalletDto) {
    // TODO: Implementar verificação de assinatura
    // Por enquanto, apenas aceita a wallet (desenvolvimento)
    const result = await this.authService.loginWithWallet(loginWalletDto.walletAddress);
    return { data: result };
  }
}
