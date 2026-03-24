import Link from 'next/link';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export default function Breadcrumbs({
  items,
  className = '',
}: BreadcrumbsProps) {
  return (
    <nav aria-label='Breadcrumb' className={className}>
      <ol className='flex flex-wrap items-center gap-2 text-sm text-gray-600'>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className='flex items-center gap-2'
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className='text-primary-600 hover:underline'
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'font-medium text-gray-900' : undefined}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? <span className='text-gray-400'>/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
