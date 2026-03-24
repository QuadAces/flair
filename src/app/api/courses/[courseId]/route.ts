import { NextResponse } from 'next/server';

import { getCourseDetail } from '@/lib/courses';

type RouteContext = {
  params: Promise<{ courseId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { courseId } = await context.params;
  const course = await getCourseDetail('computer-science', courseId);

  if (!course) {
    return NextResponse.json({ message: 'Course not found' }, { status: 404 });
  }

  return NextResponse.json({ course });
}
