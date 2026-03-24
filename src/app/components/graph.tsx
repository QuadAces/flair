'use client';

import dagre from '@dagrejs/dagre';
import {
  type Connection,
  type Edge,
  type Node,
  addEdge,
  Background,
  BackgroundVariant,
  ConnectionLineType,
  MarkerType,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { type MouseEvent, useCallback, useEffect, useMemo } from 'react';

import '@xyflow/react/dist/style.css';

const LEVEL_GAP = 100;
const NODE_GAP_X = 100;
const NODE_WIDTH = 172;
const NODE_HEIGHT = 36;

type GraphDependencyNode = {
  id: string;
  label: string;
  deps: string[];
};

type GraphProps = {
  items: GraphDependencyNode[];
  onNodeClick?: (id: string) => void;
};

function buildInitialElements(items: GraphDependencyNode[]): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = items.map((item) => ({
    id: item.id,
    data: { label: item.label },
    position: { x: 0, y: 0 },
  }));

  const nodeIds = new Set(items.map((item) => item.id));

  const edges: Edge[] = items.flatMap((item) =>
    item.deps
      .filter((dep) => dep.trim().length > 0 && nodeIds.has(dep))
      .map((dep) => ({
        id: `${dep}->${item.id}`,
        source: dep,
        target: item.id,
      }))
  );

  return { nodes, edges };
}

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } {
  dagreGraph.setGraph({
    rankdir: 'TB',
    ranksep: LEVEL_GAP,
    nodesep: NODE_GAP_X,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes: Node[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    if (!nodeWithPosition) {
      return {
        ...node,
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
      };
    }

    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      // Dagre uses center anchor; ReactFlow expects top-left.
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export default function Graph({ items, onNodeClick }: GraphProps) {
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const initial = buildInitialElements(items);
    return getLayoutedElements(initial.nodes, initial.edges);
  }, [items]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedEdges, layoutedNodes, setEdges, setNodes]);

  const defaultEdgeOptions = {
    type: ConnectionLineType.Bezier,
    markerEnd: { type: MarkerType.ArrowClosed },
  };

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((currentEdges) =>
        addEdge(
          {
            ...params,
            type: ConnectionLineType.SmoothStep,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          currentEdges
        )
      ),
    [setEdges]
  );

  const handleNodeClick = useCallback(
    (_: MouseEvent, node: Node) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  return (
    <div style={{ width: '100%', height: '70vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
      >
        <Background variant={BackgroundVariant.Lines} />
      </ReactFlow>
    </div>
  );
}
