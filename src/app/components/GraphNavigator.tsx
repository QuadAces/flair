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
  baseSegments?: string[];
};

export default function GraphNavigator({
  items,
  baseSegments = [],
}: GraphNavigatorProps) {
  const router = useRouter();

  function getPath(nodeId: string): string {
    return `/subjects/${[...baseSegments, nodeId].join('/')}`;
  }

  return (
    <Graph
      items={items}
      onNodeClick={(nodeId) => {
        const path = getPath(nodeId);
        router.push(path);
      }}
    />
  );
}
