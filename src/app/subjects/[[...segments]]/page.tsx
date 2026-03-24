import { notFound, redirect } from 'next/navigation';

import {
  getSubjectsPath,
  getSubjectSummaries,
  normalizeCatalogRouteSegments,
  resolveCatalogNode,
} from '@/lib/courses';

import ResourceLinks from '@/components/content/ResourceLinks';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import SearchBar from '@/components/navigation/SearchBar';

import GraphNavigator from '@/app/components/GraphNavigator';

type SubjectsPageProps = {
  params: Promise<{ segments?: string[] }>;
};

export default async function SubjectsPage({ params }: SubjectsPageProps) {
  const { segments = [] } = await params;
  const normalizedSegments = normalizeCatalogRouteSegments(segments);

  const isCanonicalPath =
    segments.length === normalizedSegments.length &&
    segments.every((segment, index) => segment === normalizedSegments[index]);

  if (!isCanonicalPath) {
    redirect(getSubjectsPath(normalizedSegments));
  }

  if (normalizedSegments.length === 0) {
    const subjects = await getSubjectSummaries();
    const graphItems = subjects.map((subject) => ({
      id: subject.id,
      label: subject.name,
      deps: subject.deps,
    }));

    return (
      <main>
        <section className='bg-white'>
          <div className='layout min-h-screen py-12'>
            <Breadcrumbs
              items={[{ label: 'Home', href: '/' }, { label: 'Subjects' }]}
            />
            <div className='mt-4 max-w-2xl'>
              <SearchBar />
            </div>

            <h1 className='mt-6 text-3xl font-bold'>Subjects</h1>
            <p className='mt-2 text-gray-600'>
              Browse all available subject areas.
            </p>

            {subjects.length === 0 ? (
              <p className='mt-8'>No subjects found.</p>
            ) : null}
            {subjects.length > 0 ? (
              <div className='mt-8'>
                <GraphNavigator items={graphItems} />
              </div>
            ) : null}
          </div>
        </section>
      </main>
    );
  }

  const node = await resolveCatalogNode(normalizedSegments);

  if (!node) {
    notFound();
  }

  const graphItems = node.children.map((child) => ({
    id: child.id,
    label: child.label,
    deps: child.deps,
  }));

  return (
    <main>
      <section className='bg-white'>
        <div className='layout min-h-screen py-12'>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              ...node.trail.map((trailNode) => ({
                label: trailNode.label,
                href: trailNode.path,
              })),
            ]}
          />
          <div className='mt-4 max-w-2xl'>
            <SearchBar />
          </div>

          <article className='mt-6'>
            <h1 className='text-3xl font-bold'>{node.name}</h1>
            <p className='mt-2 text-lg'>{node.title}</p>
            <p className='mt-3 text-gray-600'>{node.description}</p>
            <ResourceLinks
              read={node.read}
              watch={node.watch}
              exercices={node.exercices}
              people={node.people}
            />

            {graphItems.length > 0 ? (
              <div className='mt-8'>
                <GraphNavigator
                  items={graphItems}
                  baseSegments={node.pathSegments}
                />
              </div>
            ) : null}

            <div className='mt-8 rounded-md border border-gray-200 p-4'>
              <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>
                Node Metadata
              </h2>
              <dl className='mt-3 space-y-2 text-sm'>
                <div>
                  <dt className='font-medium text-gray-700'>ID</dt>
                  <dd className='text-gray-600'>{node.id}</dd>
                </div>
                <div>
                  <dt className='font-medium text-gray-700'>Type</dt>
                  <dd className='text-gray-600'>
                    {node.kind.charAt(0).toUpperCase() + node.kind.slice(1)}
                  </dd>
                </div>
                <div>
                  <dt className='font-medium text-gray-700'>Prerequisites</dt>
                  <dd className='text-gray-600'>
                    {node.deps.length > 0 ? node.deps.join(', ') : 'None'}
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
