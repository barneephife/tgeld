import { NextResponse } from 'next/server';
import { taskRepository } from '@/app/lib/taskRepository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tasks = await taskRepository.getAll();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const taskData = {
      ...body,
      is_active: true, // Set is_active to true by default
    };
    const task = await taskRepository.create(taskData);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
