'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

type SearchResult = {
  id: string;
  label: string;
  kind: 'subject' | 'course' | 'module';
  path: string;
  description?: string;
};

type SearchBarProps = {
  placeholder?: string;
  className?: string;
};

const RESULT_KIND_LABEL: Record<SearchResult['kind'], string> = {
  subject: 'Subject',
  course: 'Course',
  module: 'Module',
};

export default function SearchBar({
  placeholder = 'Search subjects, courses, modules, resources...',
  className = '',
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  React.useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmedQuery)}&limit=10`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Search request failed');
        }

        const data = (await response.json()) as { results: SearchResult[] };
        setResults(data.results);
        setIsOpen(true);
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 220);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [query]);

  function navigateTo(path: string) {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    router.push(path);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && results.length > 0) {
      navigateTo(results[0].path);
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <input
        type='search'
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          if (results.length > 0) {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className='w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-100'
      />

      {isOpen && (results.length > 0 || loading) ? (
        <div className='absolute z-40 mt-2 max-h-96 w-full overflow-auto rounded-md border border-gray-200 bg-white p-1 shadow-lg'>
          {loading ? (
            <p className='px-3 py-2 text-sm text-gray-500'>Searching...</p>
          ) : null}
          {!loading
            ? results.map((result) => (
                <button
                  key={result.id}
                  type='button'
                  onClick={() => navigateTo(result.path)}
                  className='w-full rounded-sm px-3 py-2 text-left hover:bg-gray-50'
                >
                  <p className='text-xs font-medium uppercase tracking-wide text-gray-500'>
                    {RESULT_KIND_LABEL[result.kind]}
                  </p>
                  <p className='text-sm font-semibold text-gray-900'>
                    {result.label}
                  </p>
                  {result.description ? (
                    <p className='line-clamp-2 text-xs text-gray-600'>
                      {result.description}
                    </p>
                  ) : null}
                </button>
              ))
            : null}
        </div>
      ) : null}
    </div>
  );
}
