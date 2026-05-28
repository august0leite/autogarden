import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const jwtSecret = configService.get<string>("JWT_SECRET");
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    let user;

    try {
      user = await this.authService.validateUser(payload.sub);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException("INVALID_TOKEN");
      }

      throw error;
    }

    if (!user) {
      throw new UnauthorizedException("INVALID_TOKEN");
    }

    return { userId: payload.sub, email: payload.email };
  }
}
