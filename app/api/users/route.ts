import { NextResponse } from 'next/server';
import { userRepository } from '@/app/lib/userRepository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await userRepository.getAll();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name } = data;

    // Check for existing user with same name
    const existingUser = await userRepository.findByName(name);

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this name already exists' }, { status: 409 });
    }

    // If no duplicate, proceed with user creation
    const newUser = await userRepository.createUser(data);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updatedUser } = await request.json();
    const user = await userRepository.update(id, updatedUser);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    await userRepository.deleteUser(parseInt(userId, 10));
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
