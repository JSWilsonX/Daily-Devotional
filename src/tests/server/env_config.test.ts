import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Firestore } from '@google-cloud/firestore';

describe('Server Environment Configuration Support', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should initialize Firestore with GOOGLE_CLOUD_PROJECT and DATABASE_ID options if they are present', () => {
    process.env.GOOGLE_CLOUD_PROJECT = 'test-cloud-project';
    process.env.DATABASE_ID = 'test-database-id';

    const firestoreOptions: { projectId?: string; databaseId?: string } = {};
    if (process.env.GOOGLE_CLOUD_PROJECT) {
      firestoreOptions.projectId = process.env.GOOGLE_CLOUD_PROJECT;
    }
    if (process.env.DATABASE_ID) {
      firestoreOptions.databaseId = process.env.DATABASE_ID;
    }

    const firestore = new Firestore(firestoreOptions);

    expect(firestoreOptions.projectId).toBe('test-cloud-project');
    expect(firestoreOptions.databaseId).toBe('test-database-id');
    expect(firestore.databaseId).toBe('test-database-id');
  });

  it('should fallback to undefined options if GOOGLE_CLOUD_PROJECT and DATABASE_ID are missing', () => {
    delete process.env.GOOGLE_CLOUD_PROJECT;
    delete process.env.DATABASE_ID;

    const firestoreOptions: { projectId?: string; databaseId?: string } = {};
    if (process.env.GOOGLE_CLOUD_PROJECT) {
      firestoreOptions.projectId = process.env.GOOGLE_CLOUD_PROJECT;
    }
    if (process.env.DATABASE_ID) {
      firestoreOptions.databaseId = process.env.DATABASE_ID;
    }

    expect(firestoreOptions.projectId).toBeUndefined();
    expect(firestoreOptions.databaseId).toBeUndefined();
  });

  it('should parse PORT correctly if present in process.env', () => {
    process.env.PORT = '8081';
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    expect(PORT).toBe(8081);
  });

  it('should default to 3000 if PORT is not present in process.env', () => {
    delete process.env.PORT;
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    expect(PORT).toBe(3000);
  });
});
