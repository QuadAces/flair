'use client';

import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();

  React.useEffect(() => {
    router.replace(`/subjects/computer-science/courses/${params.courseId}`);
  }, [params.courseId, router]);

  return (
    <main>
      <section className='bg-white'>
        <div className='layout min-h-screen py-12'>
          <p>Redirecting to the new subject-scoped course page...</p>
        </div>
      </section>
    </main>
  );
}
