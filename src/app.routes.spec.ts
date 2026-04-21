import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from './app.module';
import { SUPABASE_CLIENT } from './common/supabase/supabase.constants';

describe('API routes', () => {
  let app: INestApplication;
  let supabaseMock: any;
  const users = new Map<string, any>();

  beforeEach(async () => {
    users.clear();

    supabaseMock = {
      from: jest.fn((table: string) => ({
        select: jest.fn((columns: string) => ({
          limit: jest.fn(async () => ({ data: [], error: null })),
          eq: jest.fn((col: string, val: string) => ({
            single: jest.fn(async () => {
              const user = users.get(val);
              if (!user) return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
              return { data: user, error: null };
            }),
          })),
        })),
        insert: jest.fn(async (data: any) => {
          users.set(data.id, { ...data, createdAt: new Date(data.createdAt || Date.now()) });
          return { data, error: null };
        }),
        update: jest.fn((data: any) => ({
          eq: jest.fn((col: string, val: string) => {
            const user = users.get(val);
            if (user) {
              users.set(val, { ...user, ...data });
            }
            return { error: null };
          }),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn((col: string, val: string) => {
            users.delete(val);
            return { error: null };
          }),
        })),
      })),
    };

    // Special case for getAll() - mock .from('users').select('*')
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn((col: string, val: string) => ({
              single: jest.fn(async () => {
                const user = users.get(val);
                if (!user) return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
                return { data: user, error: null };
              }),
            })),
            then: (callback: any) => callback({ data: [...users.values()], error: null }),
          })),
          insert: jest.fn(async (data: any) => {
            users.set(data.id, { ...data, createdAt: new Date(data.createdAt || Date.now()) });
            return { data, error: null };
          }),
          update: jest.fn((data: any) => ({
            eq: jest.fn((col: string, val: string) => {
              const user = users.get(val);
              if (user) {
                users.set(val, { ...user, ...data });
              }
              return { error: null };
            }),
          })),
          delete: jest.fn(() => ({
            eq: jest.fn((col: string, val: string) => {
              users.delete(val);
              return { error: null };
            }),
          })),
        };
      }
      return {
        select: jest.fn(() => ({
          limit: jest.fn(async () => ({ data: [], error: null })),
        })),
      };
    });

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
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

  it('PUT /api/users/:id edits a user', async () => {
    users.set('user-002', {
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
    users.set('user-003', {
      id: 'user-003',
      name: 'Design Team',
      email: 'design@example.com',
      createdAt: new Date('2026-01-01T10:00:00.000Z'),
    });

    await request(app.getHttpServer()).delete('/api/users/user-003').expect(200);
    await request(app.getHttpServer()).get('/api/users/user-003').expect(404);
  });
});
