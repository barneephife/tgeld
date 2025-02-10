import { NextResponse } from 'next/server';
import { taskRepository } from '@/app/lib/taskRepository';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('Active tasks API called - ' + new Date().toISOString());
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Database URL:', process.env.DATABASE_URL);

  try {
    console.log('Fetching active tasks from repository...');
    const activeTasks = await taskRepository.getActiveTasks();
    console.log('Active tasks fetched:', JSON.stringify(activeTasks, null, 2));
    return NextResponse.json(activeTasks);
  } catch (error) {
    console.error('Failed to fetch active tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch active tasks' }, { status: 500 });
  }
}
