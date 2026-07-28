import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';

const testUri = process.env.MONGODB_TEST_URI;
const suite = testUri ? describe : describe.skip;
let app;
let models;

suite('MongoDB-backed API', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = testUri;
    process.env.MONGODB_DB = `portfolio_test_${crypto.randomUUID().replaceAll('-', '')}`;
    models = await import('./db.js');
    await models.connectDatabase();
    ({ app } = await import('./index.js'));
  });

  beforeEach(async () => {
    await models.Session.deleteMany({});
    await models.User.deleteMany({});
    await models.Profile.deleteMany({});
    await models.Skill.deleteMany({});
    await models.Project.deleteMany({});
    await models.Experience.deleteMany({});
    await models.CustomSection.deleteMany({});
    await models.User.create({ email: 'admin@test.dev', passwordHash: await bcrypt.hash('long-test-password', 4) });
    await models.Profile.create({
      identity: 'primary', headline: 'A verified headline',
      biography: 'A biography long enough for validation.', availability: true
    });
  });

  afterAll(async () => {
    if (!models) return;
    await models.User.db.dropDatabase();
    await models.closeDatabase();
  });

  test('rejects a bad password', async () => {
    const response = await request(app).post('/api/auth/login')
      .send({ email: 'admin@test.dev', password: 'incorrect-pass' });
    expect(response.status).toBe(401);
  });

  test('logs in and protects mutations', async () => {
    const login = await request(app).post('/api/auth/login')
      .send({ email: 'ADMIN@test.dev', password: 'long-test-password' });
    expect(login.status).toBe(200);
    expect((await request(app).put('/api/admin/profile').send({})).status).toBe(401);
    const update = await request(app).put('/api/admin/profile').set('Cookie', login.headers['set-cookie'])
      .send({ headline: 'A verified headline', bio: 'A biography long enough for validation.', email: '', available: true });
    expect(update.status).toBe(200);
  });

  test('explicitly rejects expired sessions', async () => {
    const user = await models.User.findOne({ email: 'admin@test.dev' });
    const token = 'expired-session-token';
    await models.Session.create({
      tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
      user: user._id, expiresAt: new Date(Date.now() - 60_000)
    });
    expect((await request(app).get('/api/auth/session').set('Cookie', `sr_session=${token}`)).status).toBe(401);
  });

  test('rejects invalid uploads and reports an unpublished CV', async () => {
    const login = await request(app).post('/api/auth/login')
      .send({ email: 'admin@test.dev', password: 'long-test-password' });
    const upload = await request(app).post('/api/admin/upload/cv').set('Cookie', login.headers['set-cookie'])
      .attach('file', Buffer.from('bad'), 'bad.txt');
    expect(upload.status).toBe(400);
    expect((await request(app).get('/api/cv')).status).toBe(404);
  });

  test('saves editable content sections independently', async () => {
    const login = await request(app).post('/api/auth/login')
      .send({ email: 'admin@test.dev', password: 'long-test-password' });
    const cookie = login.headers['set-cookie'];

    const skills = await request(app).put('/api/admin/skills').set('Cookie', cookie)
      .send({ items: [{ name: 'React', description: 'Accessible interfaces', icon: 'react' }] });
    expect(skills.status).toBe(200);
    expect(skills.body.items).toHaveLength(1);
    expect(skills.body.items[0].icon).toBe('react');

    const projects = await request(app).put('/api/admin/projects').set('Cookie', cookie)
      .send({ items: [{ title: 'Portfolio', summary: 'A personal website', technologies: ['React'], technologyIcons: ['react', 'vercel'], published: true }] });
    expect(projects.status).toBe(200);
    expect(projects.body.items[0].technologyIcons).toEqual(['react', 'vercel']);
    const tooManyProjectImages = await request(app).put('/api/admin/projects').set('Cookie', cookie)
      .send({ items: [{ title: 'Gallery', summary: 'Too many images', images: Array.from({ length: 6 }, (_, index) => `/uploads/project-${index}.webp`) }] });
    expect(tooManyProjectImages.status).toBe(400);

    const experience = await request(app).put('/api/admin/experience').set('Cookie', cookie)
      .send({ items: [{ role: 'Engineer', company: 'Example', period: '2025–Present', summary: 'Built products.' }] });
    expect(experience.status).toBe(200);
    expect((await request(app).put('/api/admin/skills').set('Cookie', cookie).send({ items: [{ name: '' }] })).status).toBe(400);
  });

  test('publishes reusable custom sections with safe unique menu anchors', async () => {
    const login = await request(app).post('/api/auth/login')
      .send({ email: 'admin@test.dev', password: 'long-test-password' });
    const response = await request(app).put('/api/admin/customSections').set('Cookie', login.headers['set-cookie'])
      .send({ items: [
        { title: 'Writing & Talks', intro: 'Ideas shared in public.', presentation: 'page', itemPresentation: 'page', blocks: [{ heading: 'Talk', body: 'A useful presentation.', logo: '/uploads/logo.webp', image: '/uploads/talk.webp', url: 'https://example.com/talk', linkLabel: 'Watch talk' }], published: true },
        { title: 'Writing & Talks', intro: '', blocks: [], published: false }
      ] });
    expect(response.status).toBe(200);
    expect(response.body.items.map(item => item.slug)).toEqual(['writing-talks', 'writing-talks-2']);

    const publicContent = await request(app).get('/api/content');
    expect(publicContent.body.customSections).toHaveLength(1);
    expect(publicContent.body.customSections[0].title).toBe('Writing & Talks');
    expect(publicContent.body.customSections[0].presentation).toBe('page');
    expect(publicContent.body.customSections[0].itemPresentation).toBe('page');
    expect(publicContent.body.customSections[0].blocks[0].slug).toBe('talk');
    expect(publicContent.body.customSections[0].blocks[0].linkLabel).toBe('Watch talk');

    const tooManyImages = await request(app).put('/api/admin/customSections').set('Cookie', login.headers['set-cookie'])
      .send({ items: [{ title: 'Gallery', blocks: Array.from({ length: 6 }, (_, index) => ({ body: `Image ${index}`, image: `/uploads/${index}.webp` })) }] });
    expect(tooManyImages.status).toBe(400);
  });
});
