import { NextResponse } from 'next/server';

import { getCourseDetail } from '@/lib/courses';

type RouteContext = {
  params: Promise<{ subjectId: string; courseId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { subjectId, courseId } = await context.params;
  const course = await getCourseDetail(subjectId, courseId);

  if (!course) {
    return NextResponse.json({ message: 'Course not found' }, { status: 404 });
  }

  return NextResponse.json({ course });
}
