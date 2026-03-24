/**
 * SVGR Support
 * Caveat: No React Props Type.
 *
 * You can override the next-env if the type is important to you
 * @see https://stackoverflow.com/questions/68103844/how-to-override-next-js-svg-module-declaration
 */
import { getSubjectSummaries } from '@/lib/courses';

import SearchBar from '@/components/navigation/SearchBar';

import GraphNavigator from '@/app/components/GraphNavigator';

// !STARTERCONF -> Select !STARTERCONF and CMD + SHIFT + F
// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.

export default async function HomePage() {
  const subjects = await getSubjectSummaries();
  const graphItems = subjects.map((subject) => ({
    id: subject.id,
    label: subject.name,
    deps: subject.deps,
  }));

  return (
    <main>
      <section className='bg-white'>
        <div className='layout relative flex min-h-screen flex-col items-center justify-center py-12 text-center'>
          <div className='mt-6 w-full max-w-2xl'>
            <SearchBar />
          </div>
          {subjects.length === 0 ? <p>No subjects found.</p> : null}
          {subjects.length > 0 ? <GraphNavigator items={graphItems} /> : null}
        </div>
      </section>
    </main>
  );
}
