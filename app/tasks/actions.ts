'use server';

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createTask(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const title = formData.get('title') as string;
  const description = formData.get('description') as string | null;
  const assignedToId = formData.get('assignedToId') as string;

  await prisma.task.create({
    data: {
      title,
      description,
      assignedToId: assignedToId || null,
      clubId: session.user.clubId,
      createdById: session.user.id
    }
  });

  revalidatePath('/tasks');
  revalidatePath('/dashboard');
}

export async function toggleTask(taskId: string, isCompleted: boolean) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  await prisma.task.update({
    where: { id: taskId, clubId: session.user.clubId },
    data: { isCompleted }
  });

  revalidatePath('/tasks');
  revalidatePath('/dashboard');
}
