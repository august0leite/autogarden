import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      passwordHash: hashedPassword,
    });

    // Atualizar último login
    await this.usersService.updateLastLogin(user.id);

    const { passwordHash, ...result } = user;
    const token = this.generateToken(user);

    return {
      user: result,
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("INVALID_CREDENTIALS");
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("INVALID_CREDENTIALS");
    }

    // Atualizar último login
    await this.usersService.updateLastLogin(user.id);

    const { passwordHash, ...result } = user;
    const token = this.generateToken(user);

    return {
      user: result,
      access_token: token,
    };
  }

  /**
   * Gera token JWT com informações do usuário
   */
  private generateToken(user: { id: string; email?: string | null }): string {
    const payload: Record<string, any> = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }
}
