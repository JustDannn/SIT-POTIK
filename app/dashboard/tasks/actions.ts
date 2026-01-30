'use server'

import { db } from '@/db'
import { tasks, prokers, users } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

// 1. AMBIL DATA TASKS (Berdasarkan Divisi)
export async function getDivisionTasks(divisionId: number) {
  // Kita perlu join manual atau query relational
  // Di sini kita ambil task yang proker-nya ada di divisi ini
  const result = await db.select({
    id: tasks.id,
    title: tasks.title,
    description: tasks.description,
    status: tasks.status,
    deadline: tasks.deadline,
    createdAt: tasks.createdAt,
    prokerTitle: prokers.title,
    assigneeName: users.name,
    assigneeId: users.id,
  })
  .from(tasks)
  .leftJoin(prokers, eq(tasks.prokerId, prokers.id))
  .leftJoin(users, eq(tasks.assignedUserId, users.id))
  .where(eq(prokers.divisionId, divisionId))
  .orderBy(desc(tasks.createdAt));

  return result;
}

// 2. AMBIL OPSI PROKER & ANGGOTA (Buat Form Create)
export async function getFormOptions(divisionId: number) {
  const divisionProkers = await db.query.prokers.findMany({
    where: eq(prokers.divisionId, divisionId),
    columns: { id: true, title: true }
  });

  const divisionMembers = await db.query.users.findMany({
    where: eq(users.divisionId, divisionId),
    columns: { id: true, name: true }
  });

  return { prokers: divisionProkers, members: divisionMembers };
}

// 3. CREATE TASK
export async function createTask(data: {
  title: string;
  description: string;
  prokerId: number;
  assignedUserId: string;
  deadline: Date;
}) {
  try {
    await db.insert(tasks).values({
      ...data,
      status: 'todo', // Default
    });
    revalidatePath('/dashboard/tasks');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Gagal membuat tugas' };
  }
}

// 4. UPDATE STATUS (Drag & Drop Logic)
export async function updateTaskStatus(taskId: number, newStatus: 'todo' | 'ongoing' | 'done') {
  try {
    await db.update(tasks)
      .set({ status: newStatus })
      .where(eq(tasks.id, taskId));
    revalidatePath('/dashboard/tasks');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal update status' };
  }
}

// 5. DELETE TASK
export async function deleteTask(taskId: number) {
  try {
    await db.delete(tasks).where(eq(tasks.id, taskId));
    revalidatePath('/dashboard/tasks');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal menghapus tugas' };
  }
}