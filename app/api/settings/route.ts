import { NextResponse } from 'next/server';
import { settingsRepository } from '@/app/lib/settingsRepository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await settingsRepository.getAllSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { key, value } = await request.json();
    
    if (!key) {
      return NextResponse.json({ error: 'Setting key is required' }, { status: 400 });
    }

    await settingsRepository.updateSetting(key, value);
    return NextResponse.json({ message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Error updating setting:', error);
    const message = error instanceof Error ? error.message : 'Failed to update setting';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
