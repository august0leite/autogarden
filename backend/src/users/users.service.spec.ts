import { Test, TestingModule } from "@nestjs/testing";
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { PrismaService } from "../database/prisma.service";

describe("UsersService", () => {
  let service: UsersService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUser = {
    id: "123",
    email: "test@example.com",
    passwordHash: "hashedpassword",
    name: "Test User",
    createdAt: new Date(),
    lastLoginAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should successfully create a user with email and password", async () => {
      const createData = {
        email: "test@example.com",
        passwordHash: "hashedpassword",
        name: "Test User",
      };

      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createData);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createData.email },
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: createData.email,
          passwordHash: createData.passwordHash,
          name: createData.name,
        }),
      });
      expect(result).toEqual(mockUser);
    });

    it("should throw BadRequestException if email is not provided", async () => {
      const createData = {
        email: "",
        passwordHash: "hashedpassword",
      };

      await expect(service.create(createData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException if email is provided but password is not", async () => {
      const createData = {
        email: "test@example.com",
        passwordHash: "",
      };

      await expect(service.create(createData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw ConflictException if email already exists", async () => {
      const createData = {
        email: "test@example.com",
        passwordHash: "hashedpassword",
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(createData)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("findByEmail", () => {
    it("should return user when found", async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail("test@example.com");

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail("notfound@example.com");

      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return user data when found", async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById("123");

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: "123" },
      });
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("email");
    });

    it("should throw NotFoundException when user not found", async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById("999")).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateLastLogin", () => {
    it("should update user last login timestamp", async () => {
      const updatedUser = { ...mockUser, lastLoginAt: new Date() };
      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateLastLogin("123");

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: "123" },
        data: { lastLoginAt: expect.any(Date) },
      });
      expect(result).toEqual(updatedUser);
    });
  });
});
