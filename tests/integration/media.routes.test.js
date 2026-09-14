import fs from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import app from '../../src/app.js';
import { config } from '../../src/config/env.js';

afterAll(() => {
  const dir = path.join(process.cwd(), config.uploadDir);
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('Media API', () => {
  let createdId;

  it('POST /media returns 201 for a valid upload', async () => {
    const res = await request(app)
      .post('/media')
      .field('title', 'Integration Test Image')
      .field('category', 'image')
      .field('tags', 'test,integration')
      .attach('file', Buffer.from('fake image data'), { filename: 'test.png', contentType: 'image/png' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.title).toBe('Integration Test Image');
    expect(res.body.data.tags).toEqual(['test', 'integration']);

    createdId = res.body.data.id;
  });

  it('POST /media returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/media')
      .field('category', 'image')
      .attach('file', Buffer.from('fake image data'), { filename: 'test.png', contentType: 'image/png' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'title' })])
    );
  });

  it('POST /media returns 400 for an unsupported file type', async () => {
    const res = await request(app)
      .post('/media')
      .field('title', 'Bad File')
      .field('category', 'document')
      .attach('file', Buffer.from('not allowed'), { filename: 'test.txt', contentType: 'text/plain' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('GET /media includes pagination metadata', async () => {
    const res = await request(app).get('/media');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.pagination).toEqual(
      expect.objectContaining({
        total: expect.any(Number),
        page: 1,
        limit: 10,
        totalPages: expect.any(Number),
      })
    );
  });

  it('GET /media?category= filters results by category', async () => {
    const res = await request(app).get('/media').query({ category: 'image' });

    expect(res.status).toBe(200);
    expect(res.body.data.results.length).toBeGreaterThan(0);
    expect(res.body.data.results.every((item) => item.category === 'image')).toBe(true);
  });

  it('GET /media?search= finds records by title', async () => {
    const res = await request(app).get('/media').query({ search: 'Integration' });

    expect(res.status).toBe(200);
    expect(res.body.data.results.some((item) => item.id === createdId)).toBe(true);
  });

  it('GET /media/:id returns 200 for a valid id', async () => {
    const res = await request(app).get(`/media/${createdId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdId);
  });

  it('GET /media/:id returns 404 for a missing resource', async () => {
    const res = await request(app).get('/media/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  it('PUT /media/:id returns 200 for a valid update', async () => {
    const res = await request(app).put(`/media/${createdId}`).send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title');
  });

  it('PUT /media/:id returns 400 for an invalid body', async () => {
    const res = await request(app).put(`/media/${createdId}`).send({ category: 'not-a-real-category' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('DELETE /media/:id returns 200 for a successful deletion', async () => {
    const res = await request(app).delete(`/media/${createdId}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });

  it('DELETE /media/:id returns 404 for an id that no longer exists', async () => {
    const res = await request(app).delete(`/media/${createdId}`);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });
});
