import { notFound } from 'next/navigation';

import {
  getCourseDetail,
  getCourseModuleDetail,
  getSubjectDetail,
} from '@/lib/courses';

import ResourceLinks from '@/components/content/ResourceLinks';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import SearchBar from '@/components/navigation/SearchBar';

type ModulePageProps = {
  params: Promise<{ subjectId: string; courseId: string; moduleId: string }>;
};

export default async function ModuleDetailPage({ params }: ModulePageProps) {
  const { subjectId, courseId, moduleId } = await params;
  const [subject, course, moduleItem] = await Promise.all([
    getSubjectDetail(subjectId),
    getCourseDetail(subjectId, courseId),
    getCourseModuleDetail(subjectId, courseId, moduleId),
  ]);

  if (!subject || !course || !moduleItem) {
    notFound();
  }

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
              {
                label: course.name,
                href: `/subjects/${subjectId}/courses/${courseId}`,
              },
              { label: moduleItem.title },
            ]}
          />
          <div className='mt-4 max-w-2xl'>
            <SearchBar />
          </div>

          <article className='mt-6 max-w-3xl'>
            <h1 className='text-3xl font-bold'>{moduleItem.title}</h1>
            <p className='mt-3 text-gray-600'>{moduleItem.description}</p>
            <ResourceLinks
              read={moduleItem.read}
              watch={moduleItem.watch}
              exercices={moduleItem.exercices}
              people={moduleItem.people}
            />

            <div className='mt-8 rounded-md border border-gray-200 p-4'>
              <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>
                Module Metadata
              </h2>
              <dl className='mt-3 space-y-2 text-sm'>
                <div>
                  <dt className='font-medium text-gray-700'>ID</dt>
                  <dd className='text-gray-600'>{moduleItem.id}</dd>
                </div>
                <div>
                  <dt className='font-medium text-gray-700'>Prerequisites</dt>
                  <dd className='text-gray-600'>
                    {moduleItem.deps.length > 0
                      ? moduleItem.deps.join(', ')
                      : 'None'}
                  </dd>
                </div>
              </dl>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
