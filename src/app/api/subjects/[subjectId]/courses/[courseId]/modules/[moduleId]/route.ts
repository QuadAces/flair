import { NextResponse } from 'next/server';

import { getCourseModuleDetail } from '@/lib/courses';

type RouteContext = {
  params: Promise<{ subjectId: string; courseId: string; moduleId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { subjectId, courseId, moduleId } = await context.params;
  const moduleDetail = await getCourseModuleDetail(
    subjectId,
    courseId,
    moduleId
  );

  if (!moduleDetail) {
    return NextResponse.json({ message: 'Module not found' }, { status: 404 });
  }

  return NextResponse.json({ module: moduleDetail });
}
