import { notFound } from 'next/navigation';

import { getSubjectDetail } from '@/lib/courses';

import ResourceLinks from '@/components/content/ResourceLinks';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import SearchBar from '@/components/navigation/SearchBar';

import GraphNavigator from '@/app/components/GraphNavigator';

type SubjectPageProps = {
  params: Promise<{ subjectId: string }>;
};

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subjectId } = await params;
  const subject = await getSubjectDetail(subjectId);

  if (!subject) {
    notFound();
  }

  const graphItems = subject.courses.map((course) => ({
    id: course.id,
    label: course.name,
    deps: course.deps,
  }));

  return (
    <main>
      <section className='bg-white'>
        <div className='layout min-h-screen py-12'>
          <Breadcrumbs
            items={[{ label: 'Home', href: '/' }, { label: subject.name }]}
          />
          <div className='mt-4 max-w-2xl'>
            <SearchBar />
          </div>

          <h1 className='mt-6 text-3xl font-bold'>{subject.name}</h1>
          <p className='mt-2 text-lg'>{subject.title}</p>
          <p className='mt-2 text-gray-600'>{subject.description}</p>
          <ResourceLinks
            read={subject.read}
            watch={subject.watch}
            exercices={subject.exercices}
            people={subject.people}
          />

          {graphItems.length > 0 ? (
            <div className='mt-8'>
              <GraphNavigator
                items={graphItems}
                mode='course'
                subjectId={subject.id}
              />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
