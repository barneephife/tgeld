import { NextResponse } from 'next/server';
import { settingsService } from '@/lib/db/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const showGerman = await settingsService.get('show_german_terms');
    return NextResponse.json({ showGerman });
  } catch (error) {
    console.error('Failed to fetch language setting:', error);
    return NextResponse.json({ error: 'Failed to fetch language setting' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { showGerman } = await request.json();
    const result = await settingsService.set('show_german_terms', showGerman.toString());
    return NextResponse.json({ showGerman: result });
  } catch (error) {
    console.error('Failed to update language setting:', error);
    return NextResponse.json({ error: 'Failed to update language setting' }, { status: 500 });
  }
}
