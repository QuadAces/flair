type ResourceLinksProps = {
  read?: string[];
  watch?: string[];
  exercices?: string[];
  people?: string[];
  className?: string;
};

function LinkList({ title, links }: { title: string; links: string[] }) {
  if (links.length === 0) {
    return null;
  }

  return (
    <section>
      <h3 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>
        {title}
      </h3>
      <ul className='mt-2 list-disc space-y-1 pl-5'>
        {links.map((url) => (
          <li key={url}>
            <a
              href={url}
              target='_blank'
              rel='noreferrer'
              className='text-primary-600 break-all hover:underline'
            >
              {url}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ResourceLinks({
  read,
  watch,
  exercices,
  people,
  className = '',
}: ResourceLinksProps) {
  const readLinks = read ?? [];
  const watchLinks = watch ?? [];
  const exercicesLinks = exercices ?? [];
  const peopleLinks = people ?? [];

  if (
    readLinks.length === 0 &&
    watchLinks.length === 0 &&
    exercicesLinks.length === 0 &&
    peopleLinks.length === 0
  ) {
    return null;
  }

  return (
    <div
      className={`mt-8 space-y-4 rounded-md border border-gray-200 p-4 ${className}`}
    >
      <h2 className='text-base font-semibold text-gray-900'>
        Learning Resources
      </h2>
      <LinkList title='People' links={peopleLinks} />
      <LinkList title='Read' links={readLinks} />
      <LinkList title='Watch' links={watchLinks} />
      <LinkList title='Exercises' links={exercicesLinks} />
    </div>
  );
}
