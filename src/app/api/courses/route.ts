import { NextResponse } from 'next/server';

import { getCourseSummaries } from '@/lib/courses';

export async function GET() {
  const courses = await getCourseSummaries('computer-science');

  if (!courses) {
    return NextResponse.json(
      { message: 'Computer Science subject not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ courses });
}
