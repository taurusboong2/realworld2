import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { createHmac } from 'crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

jest.mock('dotenv/config', () => ({}), { virtual: true });

const authCookieName = 'realworld_auth_token';
const jwtExpiresInSeconds = 604800;
const jwtSecret = 'dev-secret-change-me';

type MockDb = {
  user: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
};

// eslint-disable-next-line no-var
var mockDb: MockDb;

jest.mock('@repo/database', () => {
  const db: MockDb = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  mockDb = db;

  return {
    db,
    Prisma: {
      PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
        code?: string;
      },
    },
  };
});

const createAuthCookie = (userId: number) => {
  const header = Buffer.from(
    JSON.stringify({
      alg: 'HS256',
      typ: 'JWT',
    }),
  ).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      exp: Math.floor(Date.now() / 1000) + jwtExpiresInSeconds,
    }),
  ).toString('base64url');
  const signature = createHmac('sha256', jwtSecret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${authCookieName}=${header}.${payload}.${signature}`;
};

describe('DefaultController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect({ message: 'Hello World!' });
  });

  describe('profile settings mock endpoints', () => {
    it('/api/user (GET) returns the current user without password', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'alice@example.com',
        username: 'alice',
        password: 'hashed-password',
        bio: 'API author',
        image: 'https://example.com/alice.png',
      });

      await request(app.getHttpServer())
        .get('/api/user')
        .set('Cookie', [createAuthCookie(1)])
        .expect(200)
        .expect({
          user: {
            id: 1,
            email: 'alice@example.com',
            username: 'alice',
            bio: 'API author',
            image: 'https://example.com/alice.png',
          },
        });

      expect(mockDb.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('/api/user (PUT) updates profile settings', async () => {
      mockDb.user.update.mockResolvedValue({
        id: 1,
        email: 'alice@example.com',
        username: 'alice-updated',
        password: 'hashed-password',
        bio: 'Updated bio',
        image: 'https://example.com/new-alice.png',
      });

      await request(app.getHttpServer())
        .put('/api/user')
        .set('Cookie', [createAuthCookie(1)])
        .send({
          user: {
            username: 'alice-updated',
            bio: 'Updated bio',
            image: 'https://example.com/new-alice.png',
          },
        })
        .expect(200)
        .expect({
          user: {
            id: 1,
            email: 'alice@example.com',
            username: 'alice-updated',
            bio: 'Updated bio',
            image: 'https://example.com/new-alice.png',
          },
        });

      expect(mockDb.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          username: 'alice-updated',
          email: undefined,
          bio: 'Updated bio',
          image: 'https://example.com/new-alice.png',
          password: undefined,
        },
      });
    });
  });

  describe('profile follow mock endpoints', () => {
    const bobProfile = {
      id: 2,
      email: 'bob@example.com',
      username: 'bob',
      password: 'hashed-password',
      bio: 'Writes about Nest',
      image: 'https://example.com/bob.png',
    };

    it('/api/profiles/:username (GET) returns following state', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        ...bobProfile,
        followedBy: [{ id: 1 }],
      });

      await request(app.getHttpServer())
        .get('/api/profiles/bob')
        .set('Cookie', [createAuthCookie(1)])
        .expect(200)
        .expect({
          profile: {
            username: 'bob',
            bio: 'Writes about Nest',
            image: 'https://example.com/bob.png',
            following: true,
          },
        });

      expect(mockDb.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'bob' },
        include: {
          followedBy: { where: { id: 1 } },
        },
      });
    });

    it('/api/profiles/:username/follow (POST) follows a profile', async () => {
      mockDb.user.findUnique.mockResolvedValue(bobProfile);
      mockDb.user.update.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/api/profiles/bob/follow')
        .set('Cookie', [createAuthCookie(1)])
        .expect(201)
        .expect({
          profile: {
            username: 'bob',
            bio: 'Writes about Nest',
            image: 'https://example.com/bob.png',
            following: true,
          },
        });

      expect(mockDb.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          following: {
            connect: { id: 2 },
          },
        },
      });
    });

    it('/api/profiles/:username/follow (DELETE) unfollows a profile', async () => {
      mockDb.user.findUnique.mockResolvedValue(bobProfile);
      mockDb.user.update.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/api/profiles/bob/follow')
        .set('Cookie', [createAuthCookie(1)])
        .expect(200)
        .expect({
          profile: {
            username: 'bob',
            bio: 'Writes about Nest',
            image: 'https://example.com/bob.png',
            following: false,
          },
        });

      expect(mockDb.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          following: {
            disconnect: { id: 2 },
          },
        },
      });
    });

    it('/api/profiles/:username/follow (POST) requires authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/profiles/bob/follow')
        .expect(401);

      expect(mockDb.user.findUnique).not.toHaveBeenCalled();
      expect(mockDb.user.update).not.toHaveBeenCalled();
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
