'use server'

import { User, Job, Offer, Message } from '@/lib/db';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || 'http://localhost:8080';

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'API request failed');
  }
  const data = await res.json();
  return data === null ? [] : data;
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userData = cookieStore.get('user')?.value;
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as 'client' | 'freelancer';
  const tagsString = formData.get('tags') as string;
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

  const user = await apiFetch('/api/users/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, role, tags }),
  });

  const cookieStore = await cookies();
  cookieStore.set('user', JSON.stringify(user));
  
  redirect('/');
}

export async function loginUser(formData: FormData) {
  const email = formData.get('email') as string;
  
  const user = await apiFetch('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  const cookieStore = await cookies();
  cookieStore.set('user', JSON.stringify(user));
  
  redirect('/');
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('user');
  redirect('/login');
}

export async function postJob(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'client') throw new Error('Unauthorized');

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const budget = Number(formData.get('budget'));
  const tagsString = formData.get('tags') as string;
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

  await apiFetch('/api/jobs', {
    method: 'POST',
    body: JSON.stringify({ title, description, budget, tags, authorId: user.id }),
  });

  revalidatePath('/jobs');
  redirect('/jobs');
}

export async function submitOffer(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'freelancer') throw new Error('Unauthorized');

  const jobId = formData.get('jobId') as string;
  const amount = Number(formData.get('amount'));
  const message = formData.get('message') as string;

  await apiFetch('/api/offers', {
    method: 'POST',
    body: JSON.stringify({ jobId, freelancerId: user.id, amount, message }),
  });

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function sendMessage(offerId: string, text: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  await apiFetch('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ offerId, senderId: user.id, text }),
  });

  revalidatePath(`/messages`);
}

export async function acceptOffer(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'client') throw new Error('Unauthorized');

  const offerId = formData.get('offerId') as string;
  await apiFetch('/api/offers/accept', {
    method: 'POST',
    body: JSON.stringify({ offerId }),
  });

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

// Data fetching helpers for Server Components
export async function getJobs(): Promise<Job[]> {
  return apiFetch('/api/jobs');
}

export async function getJobById(id: string): Promise<Job | null> {
  const jobs: Job[] = await getJobs();
  return jobs.find(j => j.id === id) || null;
}

export async function getOffers(jobId: string): Promise<Offer[]> {
  return apiFetch(`/api/offers?jobId=${jobId}`);
}

export async function getOffersForFreelancer(freelancerId: string): Promise<Offer[]> {
  return apiFetch(`/api/offers?freelancerId=${freelancerId}`);
}

export async function getMessages(offerId: string): Promise<Message[]> {
  return apiFetch(`/api/messages?offerId=${offerId}`);
}
