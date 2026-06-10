/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from 'src/common/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { ZodValidationPipe } from 'nestjs-zod';
import cookieParser from 'cookie-parser';
import { AppModule } from 'src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      companyCode: 'testcomp',
      companyName: 'Test Company',
    };

    let userId: string;

    beforeAll(async () => {
      // Cleanup
      await prisma.sessions.deleteMany({});
      await prisma.attendances.deleteMany({});
      await prisma.attendanceRequests.deleteMany({});
      await prisma.scheduleDays.deleteMany({});
      await prisma.specialDates.deleteMany({});
      await prisma.users.deleteMany({});
      await prisma.departments.deleteMany({});
      await prisma.offices.deleteMany({});
      await prisma.schedules.deleteMany({});
      await prisma.companies.deleteMany({});

      // Create company and user
      const company = await prisma.companies.create({
        data: {
          name: testUser.companyName,
          code: testUser.companyCode,
        },
      });

      const user = await prisma.users.create({
        data: {
          companyId: company.id,
          username: testUser.username,
          email: testUser.email,
          password: await bcrypt.hash(testUser.password, 10),
          fullName: testUser.fullName,
          role: 'STAFF',
          joinedAt: new Date(),
        },
      });
      userId = user.id;
    });

    it('should login without rememberMe (default 7 days)', async () => {
      const response = await request(app.getHttpServer() as App)
        .post('/auth/login')
        .set('User-Agent', 'test-agent')
        .send({
          username: `${testUser.username}@${testUser.companyCode}`,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.refreshTokenExpiresIn).toBe(
        7 * 24 * 60 * 60 * 1000
      );

      const session = await prisma.sessions.findFirst({
        where: { userId },
      });
      expect(session?.isRememberMe).toBe(false);

      const diff = session!.expiresAt.getTime() - Date.now();
      expect(diff).toBeGreaterThan(6 * 24 * 60 * 60 * 1000);
      expect(diff).toBeLessThan(8 * 24 * 60 * 60 * 1000);
    });

    it('should login with rememberMe (30 days)', async () => {
      await prisma.sessions.deleteMany({});

      const response = await request(app.getHttpServer() as App)
        .post('/auth/login')
        .set('User-Agent', 'test-agent')
        .send({
          username: `${testUser.username}@${testUser.companyCode}`,
          password: testUser.password,
          rememberMe: true,
        })
        .expect(200);

      expect(response.body.data.refreshTokenExpiresIn).toBe(
        30 * 24 * 60 * 60 * 1000
      );

      const session = await prisma.sessions.findFirst({
        where: { userId },
      });
      expect(session?.isRememberMe).toBe(true);

      const diff = session!.expiresAt.getTime() - Date.now();
      expect(diff).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
      expect(diff).toBeLessThan(31 * 24 * 60 * 60 * 1000);
    });

    it('should preserve 30-day duration during refresh', async () => {
      // 1. Login with rememberMe
      const loginResponse = await request(app.getHttpServer() as App)
        .post('/auth/login')
        .set('User-Agent', 'test-agent')
        .send({
          username: `${testUser.username}@${testUser.companyCode}`,
          password: testUser.password,
          rememberMe: true,
        })
        .expect(200);

      const refreshToken = loginResponse.body.data.refreshToken;

      // 2. Refresh
      const refreshResponse = await request(app.getHttpServer() as App)
        .post('/auth/refresh')
        .set('User-Agent', 'test-agent')
        .set('Cookie', [`refresh_token=${refreshToken}`])
        .expect(200);

      expect(refreshResponse.body.data.refreshTokenExpiresIn).toBe(
        30 * 24 * 60 * 60 * 1000
      );

      const session = await prisma.sessions.findFirst({
        where: { userId },
      });
      expect(session?.isRememberMe).toBe(true);

      const diff = session!.expiresAt.getTime() - Date.now();
      expect(diff).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
    });
  });
});
