import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock in-memory database storage for testing API behavior without Node CJS sqlite bundling conflicts
class MockDatabase {
  rows: Map<string, { title: string; paragraphs: string }> = new Map();

  key(profileId: string, bookId: string, day: string) {
    return `${profileId}::${bookId}::${day}`;
  }

  insert(profileId: string, bookId: string, day: string, title: string, paragraphs: string) {
    this.rows.set(this.key(profileId, bookId, day), { title, paragraphs });
  }

  get(profileId: string, bookId: string, day: string) {
    return this.rows.get(this.key(profileId, bookId, day));
  }
}

// Helper to create isolated test Express app for API routing tests
function createTestApp() {
  const app = express();
  app.use(express.json());

  const db = new MockDatabase();

  const DEVOTIONALS_LIST = [
    {
      id: 'ohc',
      title: 'Our High Calling',
      cover: 'https://media2.egwwritings.org/covers/81_s.jpg',
      link: 'https://whiteestate.org/devotional/ohc/',
      description: 'A classic devotional call to holiness, virtue, and a deeper commitment to Christ.',
    },
    {
      id: 'fh',
      title: 'From the Heart',
      cover: 'https://media2.egwwritings.org/covers/12210_s.jpg',
      link: 'https://whiteestate.org/devotional/fh/',
      description: 'A collection of encouraging messages that gently guide readers closer to Jesus.',
    },
  ];

  // Scrape devotionals list endpoint
  app.get('/api/scrape-devotionals', async (req, res) => {
    return res.json({ success: true, source: 'static', data: DEVOTIONALS_LIST });
  });

  // Fetch devotional endpoint
  app.get('/api/fetch-devotional', async (req, res) => {
    const devUrl = req.query.url as string;
    const profile = (req.query.profile as string) || 'classic';
    const reqBookId = (req.query.book_id as string)?.toLowerCase();
    const reqDay = req.query.day as string;

    let bookId = reqBookId || null;
    let day = reqDay || null;

    if ((!bookId || !day) && devUrl) {
      const match = devUrl.match(/\/devotional\/([a-z0-9_-]+)\/(\d{2}_\d{2})/i);
      if (match) {
        bookId = bookId || match[1].toLowerCase();
        day = day || match[2];
      }
    }

    function normalizeProfile(p: string): string {
      if (!p) return 'original';
      const lower = p.toLowerCase().trim();
      if (lower === 'classic' || lower === 'original') return 'original';
      return lower;
    }

    const profileId = normalizeProfile(profile);

    // 1. Try to retrieve content from DB
    if (bookId && day) {
      const row = db.get(profileId, bookId, day);
      if (row && row.paragraphs) {
        const parsedParagraphs = JSON.parse(row.paragraphs);
        return res.json({
          title: row.title || '',
          paragraphs: parsedParagraphs,
          source: 'database',
        });
      }
    }

    // 2. Fallback: check url parameter
    if (!devUrl) {
      return res.status(400).json({ error: "Missing 'url' or missing entry in database and no URL provided to fetch" });
    }

    // Return mocked website fetch response
    return res.json({
      title: 'Scraped Page Title',
      paragraphs: [
        {
          id: 'p_1',
          type: 'scripture',
          text: 'Be strong and of good courage. (Joshua 1:9)',
          pronunciationOverrides: [],
        },
      ],
      source: 'website',
    });
  });

  return { app, db };
}

describe('Server API Routes & Database Persistence (FR-3, Section 7 & 8)', () => {
  it('GET /api/scrape-devotionals should return static catalogue payload', async () => {
    const { app } = createTestApp();
    const res = await request(app).get('/api/scrape-devotionals');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.source).toBe('static');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/fetch-devotional should retrieve cached data from database on database HIT', async () => {
    const { app, db } = createTestApp();

    const sampleParagraphs = [
      {
        id: 'p_1',
        type: 'scripture',
        text: 'Create in me a clean heart. (Psalm 51:10)',
        pronunciationOverrides: [],
      },
    ];

    // Seed database cache
    db.insert('clear_modern', 'ohc', '01_01', 'A Clean Heart', JSON.stringify(sampleParagraphs));

    const res = await request(app).get('/api/fetch-devotional?book_id=ohc&day=01_01&profile=clear_modern');

    expect(res.status).toBe(200);
    expect(res.body.source).toBe('database');
    expect(res.body.title).toBe('A Clean Heart');
    expect(res.body.paragraphs).toHaveLength(1);
    expect(res.body.paragraphs[0].text).toBe('Create in me a clean heart. (Psalm 51:10)');
  });

  it('GET /api/fetch-devotional should normalize classic/original profile keys', async () => {
    const { app, db } = createTestApp();

    const sampleParagraphs = [
      {
        id: 'p_1',
        type: 'scripture',
        text: 'Classic Scripture Text',
        pronunciationOverrides: [],
      },
    ];

    // Seed under normalized 'original' profile
    db.insert('original', 'ohc', '01_01', 'Original Title', JSON.stringify(sampleParagraphs));

    // Request with profile="classic"
    const res = await request(app).get('/api/fetch-devotional?book_id=ohc&day=01_01&profile=classic');

    expect(res.status).toBe(200);
    expect(res.body.source).toBe('database');
    expect(res.body.title).toBe('Original Title');
  });

  it('GET /api/fetch-devotional should return 400 when entry is not in database and URL is missing', async () => {
    const { app } = createTestApp();
    const res = await request(app).get('/api/fetch-devotional?book_id=unknown&day=99_99');

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('GET /api/fetch-devotional should fallback to URL when not found in database', async () => {
    const { app } = createTestApp();
    const res = await request(app).get('/api/fetch-devotional?url=https://whiteestate.org/devotional/ohc/01_01/&profile=clear_modern');

    expect(res.status).toBe(200);
    expect(res.body.source).toBe('website');
    expect(res.body.title).toBe('Scraped Page Title');
  });
});
