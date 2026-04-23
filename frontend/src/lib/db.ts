import fs from 'fs/promises';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'freelancer';
  tags?: string[];
}

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  tags: string[];
  authorId: string;
  status: 'open' | 'in_progress' | 'completed';
}

export interface Offer {
  id: string;
  jobId: string;
  freelancerId: string;
  amount: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Message {
  id: string;
  offerId: string;
  senderId: string;
  text: string;
  createdAt: number;
}

export interface Database {
  users: User[];
  jobs: Job[];
  offers: Offer[];
  messages: Message[];
}

const dbPath = path.join(process.cwd(), 'data', 'db.json');

export async function getDb(): Promise<Database> {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [], jobs: [], offers: [], messages: [] };
  }
}

export async function saveDb(db: Database): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
}
