import { NextResponse } from 'next/server';
import { getDatabaseSummary } from '@/lib/database-summary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = await getDatabaseSummary();

    return NextResponse.json({
      ok: true,
      ...summary,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : 'Unable to read SQLite data.',
      },
      { status: 500 },
    );
  }
}
