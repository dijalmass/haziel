import Dexie, { type EntityTable } from 'dexie';
import { SESSION_EXPIRY } from './constants';

interface Session {
  id: number;
  token: string;
  createdAt: number;
}

interface Preferences {
  id: number;
  lastDeviceName?: string;
  preferredCamera?: string;
  preferredQuality?: string;
  pin?: string;
}

class HazielDB extends Dexie {
  session!: EntityTable<Session, 'id'>;
  preferences!: EntityTable<Preferences, 'id'>;

  constructor() {
    super('HazielDB');
    this.version(1).stores({
      session: '++id, token, createdAt',
      preferences: '++id'
    });
  }

  async getSession(): Promise<Session | undefined> {
    const session = await this.session.orderBy('id').last();
    if (!session) return undefined;

    const isExpired = Date.now() - session.createdAt > SESSION_EXPIRY;
    if (isExpired) {
      await this.session.delete(session.id);
      return undefined;
    }

    return session;
  }

  async saveSession(token: string): Promise<void> {
    await this.session.clear();
    await this.session.add({
      token,
      createdAt: Date.now()
    } as Session);
  }

  async clearSession(): Promise<void> {
    await this.session.clear();
  }

  async getPreferences(): Promise<Preferences | undefined> {
    return await this.preferences.get(1);
  }

  async savePreferences(prefs: Partial<Omit<Preferences, 'id'>>): Promise<void> {
    const current = await this.getPreferences();
    if (current) {
      await this.preferences.update(1, prefs);
    } else {
      await this.preferences.add({ id: 1, ...prefs } as Preferences);
    }
  }
}

export const db = new HazielDB();
