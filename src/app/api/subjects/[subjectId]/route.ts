import { NextResponse } from 'next/server';

import { getSubjectDetail } from '@/lib/courses';

type RouteContext = {
  params: Promise<{ subjectId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { subjectId } = await context.params;
  const subject = await getSubjectDetail(subjectId);

  if (!subject) {
    return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
  }

  return NextResponse.json({ subject });
}
