'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const Graph = dynamic(() => import('@/app/components/graph'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '70vh' }} />,
});

type GraphItem = {
  id: string;
  label: string;
  deps: string[];
};

type GraphNavigatorProps = {
  items: GraphItem[];
  mode: 'subject' | 'course' | 'module';
  subjectId?: string;
  courseId?: string;
};

export default function GraphNavigator({
  items,
  mode,
  subjectId,
  courseId,
}: GraphNavigatorProps) {
  const router = useRouter();

  function getPath(nodeId: string): string | null {
    if (mode === 'subject') {
      return `/subjects/${nodeId}`;
    }

    if (mode === 'course') {
      if (!subjectId) {
        return null;
      }

      return `/subjects/${subjectId}/courses/${nodeId}`;
    }

    if (!subjectId || !courseId) {
      return null;
    }

    return `/subjects/${subjectId}/courses/${courseId}/modules/${nodeId}`;
  }

  return (
    <Graph
      items={items}
      onNodeClick={(nodeId) => {
        const path = getPath(nodeId);

        if (!path) {
          return;
        }

        router.push(path);
      }}
    />
  );
}
