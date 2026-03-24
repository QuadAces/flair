import { NextResponse } from 'next/server';

import { getSubjectSummaries } from '@/lib/courses';

export async function GET() {
  const subjects = await getSubjectSummaries();
  return NextResponse.json({ subjects });
}
