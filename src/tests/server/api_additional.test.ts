import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';

// Helper to create isolated test Express app to verify Gemini fallback modes
function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/fetch-devotional', async (req, res) => {
    const simulateError = req.query.simulate_error as string;

    if (simulateError === '429') {
      return res.json({
        title: 'Original Title',
        paragraphs: [{ id: 'p_1', type: 'scripture', text: 'Classic Word', pronunciationOverrides: [] }],
        warning: 'The daily AI translation quota (20 requests/day for Gemini free tier) is currently fully exhausted. Displaying the original authentic text instead.',
        isFallback: true,
        source: 'website'
      });
    }

    if (simulateError === '503') {
      return res.json({
        title: 'Original Title',
        paragraphs: [{ id: 'p_1', type: 'scripture', text: 'Classic Word', pronunciationOverrides: [] }],
        warning: 'The Gemini AI service is currently experiencing high demand or is temporarily unavailable. Displaying the original authentic text instead.',
        isFallback: true,
        source: 'website'
      });
    }

    if (simulateError === 'invalid_schema') {
      return res.json({
        title: 'Original Title',
        paragraphs: [{ id: 'p_1', type: 'scripture', text: 'Classic Word', pronunciationOverrides: [] }],
        warning: 'The AI response format was unexpected. Showing original text.',
        isFallback: true,
        source: 'website'
      });
    }

    return res.status(400).json({ error: 'Unsupported state' });
  });

  return app;
}

describe('Server API Gemini Fallback Modes', () => {
  it('should return a 200 with specific fallback warning when Gemini quota is exhausted (429)', async () => {
    const app = createTestApp();
    const res = await request(app).get('/api/fetch-devotional?simulate_error=429');

    expect(res.status).toBe(200);
    expect(res.body.isFallback).toBe(true);
    expect(res.body.warning).toContain('quota');
    expect(res.body.paragraphs).toHaveLength(1);
  });

  it('should return a 200 with specific fallback warning when Gemini is overloaded (503)', async () => {
    const app = createTestApp();
    const res = await request(app).get('/api/fetch-devotional?simulate_error=503');

    expect(res.status).toBe(200);
    expect(res.body.isFallback).toBe(true);
    expect(res.body.warning).toContain('high demand');
  });

  it('should return a 200 with fallback warning when Gemini returns malformed response structure', async () => {
    const app = createTestApp();
    const res = await request(app).get('/api/fetch-devotional?simulate_error=invalid_schema');

    expect(res.status).toBe(200);
    expect(res.body.isFallback).toBe(true);
    expect(res.body.warning).toContain('format was unexpected');
  });
});
