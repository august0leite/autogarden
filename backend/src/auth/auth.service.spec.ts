import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

// Mock do bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from "bcrypt";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: "123",
    email: "test@example.com",
    passwordHash: "hashedpassword",
    name: "Test User",
    createdAt: new Date(),
    lastLoginAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    const mockUsersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      updateLastLogin: jest.fn(),
      findById: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue("mock-jwt-token"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    it("should successfully register a new user", async () => {
      const registerDto: RegisterDto = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      const createdUser = { ...mockUser };
      usersService.create.mockResolvedValue(createdUser);
      usersService.updateLastLogin.mockResolvedValue(createdUser);

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");

      const result = await service.register(registerDto);

      expect(usersService.create).toHaveBeenCalledWith({
        name: registerDto.name,
        email: registerDto.email,
        passwordHash: "hashedpassword",
      });
      expect(usersService.updateLastLogin).toHaveBeenCalledWith(createdUser.id);
      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("access_token");
      expect(result.user).not.toHaveProperty("passwordHash");
      expect(result.access_token).toBe("mock-jwt-token");
    });

    it("should hash password before creating user", async () => {
      const registerDto: RegisterDto = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      usersService.create.mockResolvedValue(mockUser);
      usersService.updateLastLogin.mockResolvedValue(mockUser);

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    });
  });

  describe("login", () => {
    it("should successfully login with valid credentials", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password123",
      };

      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.updateLastLogin.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(usersService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("access_token");
      expect(result.user).not.toHaveProperty("passwordHash");
    });

    it("should throw UnauthorizedException if user not found", async () => {
      const loginDto: LoginDto = {
        email: "notfound@example.com",
        password: "password123",
      };

      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if password is invalid", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      usersService.findByEmail.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if user has no password hash", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password123",
      };

      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        passwordHash: null as any,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("validateUser", () => {
    it("should return user when valid userId is provided", async () => {
      const userId = "123";
      usersService.findById.mockResolvedValue({
        id: userId,
        email: "test@example.com",
        name: "Test User",
        createdAt: new Date(),
      });

      const result = await service.validateUser(userId);

      expect(usersService.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeDefined();
    });
  });
});
