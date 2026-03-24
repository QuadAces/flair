import { NextResponse } from 'next/server';

import { getCourseSummaries } from '@/lib/courses';

type RouteContext = {
  params: Promise<{ subjectId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { subjectId } = await context.params;
  const courses = await getCourseSummaries(subjectId);

  if (!courses) {
    return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
  }

  return NextResponse.json({ courses });
}
