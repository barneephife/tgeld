import { NextResponse } from 'next/server';
import { settingsService } from '../../../../lib/db/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currency = await settingsService.get('default_currency');
    return NextResponse.json({ currency: currency || 'none' });
  } catch (error) {
    console.error('Failed to fetch currency setting:', error);
    return NextResponse.json({ error: 'Failed to fetch currency setting' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { currency } = await request.json();
    
    // Validate currency input
    if (currency !== null && currency !== 'none' && typeof currency !== 'string') {
      return NextResponse.json(
        { error: 'Invalid currency format' },
        { status: 400 }
      );
    }

    // Convert 'none' to null for database storage
    const valueToStore = currency === 'none' ? null : currency;
    
    const result = await settingsService.set('default_currency', valueToStore);
    return NextResponse.json({ currency: result || 'none' });
  } catch (error) {
    console.error('Failed to update currency setting:', error);
    return NextResponse.json({ error: 'Failed to update currency setting' }, { status: 500 });
  }
}
