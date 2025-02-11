import { NextResponse } from 'next/server';
import { settingsRepository } from '@/app/lib/settingsRepository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Try to get a setting to verify database connection
    await settingsRepository.getSetting('enforce_roles');
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({ status: 'error', message: 'Database connection failed' }, { status: 500 });
  }
}
