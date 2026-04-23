'use server'

import { getDb, saveDb, User, Job, Offer, Message } from '@/lib/db';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return null;
  const db = await getDb();
  return db.users.find(u => u.id === userId) || null;
}

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as 'client' | 'freelancer';
  const tagsString = formData.get('tags') as string;
  
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

  const db = await getDb();
  if (db.users.find(u => u.email === email)) {
    throw new Error('User already exists. Please login.');
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    email,
    role,
    tags: role === 'freelancer' ? tags : undefined
  };

  db.users.push(newUser);
  await saveDb(db);

  const cookieStore = await cookies();
  cookieStore.set('userId', newUser.id);
  
  redirect('/');
}

export async function loginUser(formData: FormData) {
  const email = formData.get('email') as string;
  const db = await getDb();
  const user = db.users.find(u => u.email === email);
  if (!user) {
    throw new Error('User not found. Please register.');
  }

  const cookieStore = await cookies();
  cookieStore.set('userId', user.id);
  
  redirect('/');
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  redirect('/login');
}

export async function postJob(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  if (user.role !== 'client') throw new Error('Only clients can post jobs');

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const budget = Number(formData.get('budget'));
  const tagsString = formData.get('tags') as string;
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

  const newJob: Job = {
    id: crypto.randomUUID(),
    title,
    description,
    budget,
    tags,
    authorId: user.id,
    status: 'open'
  };

  const db = await getDb();
  db.jobs.push(newJob);
  await saveDb(db);

  revalidatePath('/jobs');
  redirect('/jobs');
}

export async function submitOffer(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  if (user.role !== 'freelancer') throw new Error('Only freelancers can submit offers');

  const jobId = formData.get('jobId') as string;
  const amount = Number(formData.get('amount'));
  const message = formData.get('message') as string;

  const db = await getDb();
  
  const existingOffer = db.offers.find(o => o.jobId === jobId && o.freelancerId === user.id);
  if (existingOffer) {
    throw new Error('You have already submitted an offer for this job.');
  }

  const newOffer: Offer = {
    id: crypto.randomUUID(),
    jobId,
    freelancerId: user.id,
    amount,
    message,
    status: 'pending'
  };

  db.offers.push(newOffer);

  const initialMessage: Message = {
    id: crypto.randomUUID(),
    offerId: newOffer.id,
    senderId: user.id,
    text: message,
    createdAt: Date.now()
  };
  db.messages.push(initialMessage);

  await saveDb(db);

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function acceptOffer(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  if (user.role !== 'client') throw new Error('Only clients can accept offers');

  const offerId = formData.get('offerId') as string;
  const db = await getDb();
  
  const offer = db.offers.find(o => o.id === offerId);
  if (!offer) throw new Error('Offer not found');
  
  const job = db.jobs.find(j => j.id === offer.jobId);
  if (!job || job.authorId !== user.id) throw new Error('Unauthorized');

  offer.status = 'accepted';
  job.status = 'in_progress';

  // Reject all other offers for this job
  db.offers.forEach(o => {
    if (o.jobId === job.id && o.id !== offer.id) {
      o.status = 'rejected';
    }
  });

  await saveDb(db);

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function sendMessage(offerId: string, text: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const db = await getDb();
  const newMessage: Message = {
    id: crypto.randomUUID(),
    offerId,
    senderId: user.id,
    text,
    createdAt: Date.now()
  };

  db.messages.push(newMessage);
  await saveDb(db);

  revalidatePath(`/messages`);
}
