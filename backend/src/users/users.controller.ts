import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { UserResponseDto } from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("Users")
@Controller("v1/users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @ApiOperation({ summary: "Obter informações do usuário autenticado" })
  @ApiResponse({
    status: 200,
    description: "Informações do usuário retornadas com sucesso",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: "Não autorizado" })
  @ApiResponse({ status: 404, description: "Usuário não encontrado" })
  async getMe(@CurrentUser("userId") userId: string): Promise<UserResponseDto> {
    return this.usersService.findById(userId);
  }
}
