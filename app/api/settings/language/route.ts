import { NextResponse } from 'next/server';
import { settingsService } from '@/lib/db/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const showGerman = await settingsService.get('show_german_terms');
    return NextResponse.json({ showGerman: showGerman === 'true' });
  } catch (error) {
    console.error('Failed to fetch language setting:', error);
    return NextResponse.json({ error: 'Failed to fetch language setting' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { showGerman } = await request.json();
    
    // Convert to string 'true' or 'false'
    const valueToStore = String(showGerman === true);
    
    // Store in database
    await settingsService.set('show_german_terms', valueToStore);
    
    // Return the new state
    return NextResponse.json({ showGerman: valueToStore === 'true' });
  } catch (error) {
    console.error('Failed to update language setting:', error);
    return NextResponse.json({ error: 'Failed to update language setting' }, { status: 500 });
  }
}
