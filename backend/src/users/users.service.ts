import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

interface CreateUserData {
  email: string;
  passwordHash: string;
  name?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserData) {
    // Validar que email foi fornecido
    if (!data.email) {
      throw new BadRequestException('EMAIL_REQUIRED');
    }

    // Se forneceu email, precisa de senha
    if (data.email && !data.passwordHash) {
      throw new BadRequestException('PASSWORD_REQUIRED_WITH_EMAIL');
    }

    // Verificar se email já existe
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('EMAIL_ALREADY_EXISTS');
    }

    return this.prisma.user.create({ 
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        lastLoginAt: new Date(),
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    return {
      id: user.id,
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt ?? undefined,
    };
  }

  async updateLastLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async findByWalletAddress(walletAddress: string) {
    return this.prisma.user.findUnique({ where: { walletAddress } });
  }

  /**
   * Vincula uma wallet a um usuário existente
   * Permite que um usuário Web2 conecte sua wallet
   */
  async linkWallet(userId: string, walletAddress: string) {
    // Verificar se a wallet já está vinculada a outro usuário
    const existingWallet = await this.findByWalletAddress(walletAddress);
    
    if (existingWallet && existingWallet.id !== userId) {
      throw new ConflictException('WALLET_ALREADY_LINKED');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { walletAddress },
    });
  }
}
