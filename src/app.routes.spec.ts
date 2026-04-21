import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from './app.module';
import { PrismaService } from './db/prisma.service';
import { SUPABASE_CLIENT } from './common/supabase/supabase.constants';

type StoredUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

const createPrismaMock = () => {
  const users = new Map<string, StoredUser>();

  return {
    users,
    client: {
      user: {
        findMany: jest.fn(async () => [...users.values()]),
        findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
          return users.get(where.id) ?? null;
        }),
        create: jest.fn(async ({ data }: { data: StoredUser }) => {
          users.set(data.id, data);
          return data;
        }),
        updateMany: jest.fn(
          async ({
            where,
            data,
          }: {
            where: { id: string };
            data: Partial<StoredUser>;
          }) => {
            const user = users.get(where.id);

            if (!user) {
              return { count: 0 };
            }

            users.set(where.id, {
              ...user,
              ...data,
            });

            return { count: 1 };
          },
        ),
        deleteMany: jest.fn(async ({ where }: { where: { id: string } }) => {
          const deleted = users.delete(where.id);

          return { count: deleted ? 1 : 0 };
        }),
      },
      $disconnect: jest.fn(),
    },
  };
};

describe('API routes', () => {
  let app: INestApplication;
  let prismaMock: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const supabaseMock = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          limit: jest.fn(async () => ({ error: null })),
        })),
      })),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock.client)
      .overrideProvider(SUPABASE_CLIENT)
      .useValue(supabaseMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.setGlobalPrefix('api');

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/health returns the API status', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      service: 'nestjs-api',
      timestamp: expect.any(String),
    });
  });

  it('GET /api/supabase/health returns the Supabase status', async () => {
    await request(app.getHttpServer())
      .get('/api/supabase/health')
      .expect(200)
      .expect({
        ok: true,
        error: null,
      });
  });

  it('GET /api/users returns an empty user list', async () => {
    await request(app.getHttpServer()).get('/api/users').expect(200).expect([]);
  });

  it('POST /api/users creates a user', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        id: 'user-001',
        name: 'Equipe Sumo',
        email: 'sumo@example.com',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/users/user-001')
      .expect(200);

    expect(response.body).toEqual({
      id: 'user-001',
      name: 'Equipe Sumo',
      email: 'sumo@example.com',
      createdAt: expect.any(String),
    });
  });

  it('GET /api/users/:id returns 404 when the user does not exist', async () => {
    await request(app.getHttpServer()).get('/api/users/unknown').expect(404);
  });

  it('POST /api/users rejects invalid payloads', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        id: 'bad',
        name: 'AB',
        email: 'not-an-email',
      })
      .expect(400);
  });

  it('PUT /api/users/:id edits a user', async () => {
    prismaMock.users.set('user-002', {
      id: 'user-002',
      name: 'Old Team',
      email: 'old@example.com',
      createdAt: new Date('2026-01-01T10:00:00.000Z'),
    });

    await request(app.getHttpServer())
      .put('/api/users/user-002')
      .send({
        name: 'Suivi Ligne',
        email: 'ligne@example.com',
      })
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/api/users/user-002')
      .expect(200);

    expect(response.body).toMatchObject({
      id: 'user-002',
      name: 'Suivi Ligne',
      email: 'ligne@example.com',
    });
  });

  it('DELETE /api/users/:id deletes a user', async () => {
    prismaMock.users.set('user-003', {
      id: 'user-003',
      name: 'Design Team',
      email: 'design@example.com',
      createdAt: new Date('2026-01-01T10:00:00.000Z'),
    });

    await request(app.getHttpServer()).delete('/api/users/user-003').expect(200);
    await request(app.getHttpServer()).get('/api/users/user-003').expect(404);
  });
});
