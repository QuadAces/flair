import { notFound } from 'next/navigation';

import { getCourseDetail, getSubjectDetail } from '@/lib/courses';

import ResourceLinks from '@/components/content/ResourceLinks';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import SearchBar from '@/components/navigation/SearchBar';

import GraphNavigator from '@/app/components/GraphNavigator';

type CoursePageProps = {
  params: Promise<{ subjectId: string; courseId: string }>;
};

export default async function SubjectCourseDetailPage({
  params,
}: CoursePageProps) {
  const { subjectId, courseId } = await params;
  const [subject, course] = await Promise.all([
    getSubjectDetail(subjectId),
    getCourseDetail(subjectId, courseId),
  ]);

  if (!subject || !course) {
    notFound();
  }

  const graphItems = course.modules.map((moduleItem) => ({
    id: moduleItem.id,
    label: moduleItem.title,
    deps: moduleItem.deps,
  }));

  return (
    <main>
      <section className='bg-white'>
        <div className='layout min-h-screen py-12'>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              {
                label: subject.name,
                href: `/subjects/${subjectId}`,
              },
              { label: course.name },
            ]}
          />
          <div className='mt-4 max-w-2xl'>
            <SearchBar />
          </div>

          <h1 className='mt-6 text-3xl font-bold'>{course.name}</h1>
          <p className='mt-2 text-lg'>{course.title}</p>
          <p className='mt-2 text-gray-600'>{course.description}</p>
          <ResourceLinks
            read={course.read}
            watch={course.watch}
            exercices={course.exercices}
            people={course.people}
          />

          {graphItems.length > 0 ? (
            <div className='mt-8'>
              <GraphNavigator
                items={graphItems}
                mode='module'
                subjectId={subjectId}
                courseId={courseId}
              />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
