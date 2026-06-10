/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PinoLogger } from 'nestjs-pino';
import { CacheService } from 'src/common/cache/cache.service';
import { PrismaService } from 'src/common/database/prisma.service';
import { AuthService } from 'src/module/auth/auth.service';
import { LoginDto } from 'src/module/auth/dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    users: {
      findFirst: jest.fn(),
    },
    sessions: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockCacheService = {
    set: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue({
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
    }),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('test-token'),
  };

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PinoLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      username: 'admin@merpy',
      password: 'password123',
    };

    it('should create a 7-day session by default', async () => {
      const mockUser = {
        id: 'user-id',
        companyId: 'company-id',
        username: 'admin',
        email: 'admin@merpy.com',
        password: await bcrypt.hash('password123', 10),
      };

      (prismaService.users.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.sessions.create as jest.Mock).mockResolvedValue({});

      const result = await service.login(loginDto, 'ua', 'ip');

      expect(result.refreshTokenExpiresIn).toBe(7 * 24 * 60 * 60 * 1000);
      expect(prismaService.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isRememberMe: false,
          }),
        })
      );
    });

    it('should create a 30-day session when rememberMe is true', async () => {
      const mockUser = {
        id: 'user-id',
        companyId: 'company-id',
        username: 'admin',
        email: 'admin@merpy.com',
        password: await bcrypt.hash('password123', 10),
      };

      (prismaService.users.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.sessions.create as jest.Mock).mockResolvedValue({});

      const result = await service.login(
        { ...loginDto, rememberMe: true },
        'ua',
        'ip'
      );

      expect(result.refreshTokenExpiresIn).toBe(30 * 24 * 60 * 60 * 1000);
      expect(prismaService.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isRememberMe: true,
          }),
        })
      );
    });
  });

  describe('refresh', () => {
    const payload = {
      sub: 'user-id',
      companyId: 'company-id',
      username: 'admin',
      email: 'admin@merpy.com',
      deviceId: 'device-id',
      type: 'refresh' as const,
    };

    it('should preserve 30-day duration if isRememberMe is true', async () => {
      (prismaService.sessions.findUnique as jest.Mock).mockResolvedValue({
        isRememberMe: true,
      });

      const result = await service.refresh(payload, 'ua', 'ip');

      expect(result.refreshTokenExpiresIn).toBe(30 * 24 * 60 * 60 * 1000);
      expect(prismaService.sessions.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            expiresAt: expect.any(Date),
          }),
        })
      );
    });

    it('should use 7-day duration if isRememberMe is false', async () => {
      (prismaService.sessions.findUnique as jest.Mock).mockResolvedValue({
        isRememberMe: false,
      });

      const result = await service.refresh(payload, 'ua', 'ip');

      expect(result.refreshTokenExpiresIn).toBe(7 * 24 * 60 * 60 * 1000);
    });
  });
});
