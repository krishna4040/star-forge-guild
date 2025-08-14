import { openDB, type IDBPDatabase } from 'idb';
import type { CacheData } from '@/types/github';

const DB_NAME = 'github-star-organizer';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

export class CacheManager {
  private db: IDBPDatabase | null = null;

  async init(): Promise<void> {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }

  private ensureDB(): IDBPDatabase {
    if (!this.db) {
      throw new Error('Cache not initialized. Call init() first.');
    }
    return this.db;
  }

  async set<T>(key: string, data: T, ttl: number = 30 * 60 * 1000): Promise<void> {
    const db = this.ensureDB();
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    await db.put(STORE_NAME, cacheData, key);
  }

  async get<T>(key: string): Promise<T | null> {
    const db = this.ensureDB();
    const cacheData: CacheData<T> | undefined = await db.get(STORE_NAME, key);
    
    if (!cacheData) {
      return null;
    }

    // Check if data has expired
    if (Date.now() - cacheData.timestamp > cacheData.ttl) {
      await this.delete(key);
      return null;
    }

    return cacheData.data;
  }

  async delete(key: string): Promise<void> {
    const db = this.ensureDB();
    await db.delete(STORE_NAME, key);
  }

  async clear(): Promise<void> {
    const db = this.ensureDB();
    await db.clear(STORE_NAME);
  }

  async getLastUpdated(key: string): Promise<Date | null> {
    const db = this.ensureDB();
    const cacheData: CacheData<any> | undefined = await db.get(STORE_NAME, key);
    
    if (!cacheData) {
      return null;
    }

    return new Date(cacheData.timestamp);
  }

  async isExpired(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data === null;
  }
}

export const cacheManager = new CacheManager();