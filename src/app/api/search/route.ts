import { NextResponse } from 'next/server';

import { searchCatalog } from '@/lib/courses';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  const limit = Number(searchParams.get('limit') ?? '12');

  const results = await searchCatalog(
    query,
    Number.isFinite(limit) ? limit : 12
  );

  return NextResponse.json({ results });
}
