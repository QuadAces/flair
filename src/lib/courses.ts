import { promises as fs } from 'fs';
import path from 'path';

export type ResourceLinks = {
  read?: string[];
  watch?: string[];
  exercices?: string[];
  people?: string[];
};

export type SearchEntry = {
  id: string;
  label: string;
  kind: 'subject' | 'course' | 'module';
  path: string;
  description?: string;
};

export type CatalogTrailItem = {
  id: string;
  label: string;
  pathSegments: string[];
  path: string;
};

export type CatalogChild = {
  id: string;
  label: string;
  title: string;
  deps: string[];
  pathSegments: string[];
  path: string;
};

export type CatalogNode = {
  id: string;
  name: string;
  title: string;
  description: string;
  deps: string[];
  kind: SearchEntry['kind'];
  pathSegments: string[];
  path: string;
  trail: CatalogTrailItem[];
  children: CatalogChild[];
} & ResourceLinks;

export type SubjectSummary = {
  id: string;
  name: string;
  description: string;
  deps: string[];
} & ResourceLinks;

export type SubjectDetail = {
  id: string;
  name: string;
  title: string;
  description: string;
  courses: CourseSummary[];
} & ResourceLinks;

export type CourseSummary = {
  id: string;
  name: string;
  description: string;
  deps: string[];
} & ResourceLinks;

export type CourseModule = {
  id: string;
  title: string;
  description: string;
  deps: string[];
} & ResourceLinks;

export type CourseDetail = {
  id: string;
  name: string;
  title: string;
  description: string;
  modules: CourseModule[];
} & ResourceLinks;

type CatalogNodeIndex = {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  deps?: string[];
  children?: string[];
} & ResourceLinks;

const SUBJECTS_ROOT = path.join(process.cwd(), 'data');
const LEGACY_ROUTE_MARKERS = new Set(['courses', 'modules']);

async function readJsonFile<T>(filePath: string): Promise<T> {
  const fileText = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileText) as T;
}

function getNodeDir(pathSegments: string[]) {
  return path.join(SUBJECTS_ROOT, ...pathSegments);
}

function getNodeIndexPath(pathSegments: string[]) {
  return path.join(getNodeDir(pathSegments), 'index.json');
}

function getDisplayName(node: CatalogNodeIndex) {
  return node.name ?? node.title ?? node.id;
}

function getDisplayTitle(node: CatalogNodeIndex) {
  return node.title ?? node.name ?? node.id;
}

function getDescription(node: CatalogNodeIndex) {
  return node.description ?? '';
}

function getDeps(node: CatalogNodeIndex) {
  return node.deps ?? [];
}

async function readNodeIndex(
  pathSegments: string[]
): Promise<CatalogNodeIndex | null> {
  try {
    return await readJsonFile<CatalogNodeIndex>(getNodeIndexPath(pathSegments));
  } catch {
    return null;
  }
}

async function listChildIds(
  node: CatalogNodeIndex,
  nodeDir: string
): Promise<string[]> {
  if (node.children && node.children.length > 0) {
    return node.children;
  }

  const entries = await fs.readdir(nodeDir, { withFileTypes: true });
  const childIds: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const childIndexPath = path.join(nodeDir, entry.name, 'index.json');

    try {
      await fs.access(childIndexPath);
      childIds.push(entry.name);
    } catch {
      // ignore folders that are not catalog nodes
    }
  }

  return childIds.sort((a, b) => a.localeCompare(b));
}

async function getChildNodes(
  pathSegments: string[]
): Promise<CatalogNodeIndex[]> {
  const node = await readNodeIndex(pathSegments);

  if (!node) {
    return [];
  }

  const nodeDir = getNodeDir(pathSegments);
  const childIds = await listChildIds(node, nodeDir);

  const children = await Promise.all(
    childIds.map((childId) => readNodeIndex([...pathSegments, childId]))
  );

  return children.filter((child): child is CatalogNodeIndex => child !== null);
}

async function collectDescendantNodes(
  pathSegments: string[]
): Promise<CatalogNodeIndex[]> {
  const children = await getChildNodes(pathSegments);
  const descendants: CatalogNodeIndex[] = [...children];

  for (const child of children) {
    const nested = await collectDescendantNodes([...pathSegments, child.id]);
    descendants.push(...nested);
  }

  return descendants;
}

function toSubjectSummary(node: CatalogNodeIndex): SubjectSummary {
  return {
    id: node.id,
    name: getDisplayName(node),
    description: getDescription(node),
    deps: getDeps(node),
    read: node.read,
    watch: node.watch,
    exercices: node.exercices,
    people: node.people,
  };
}

function toCourseSummary(node: CatalogNodeIndex): CourseSummary {
  return {
    id: node.id,
    name: getDisplayName(node),
    description: getDescription(node),
    deps: getDeps(node),
    read: node.read,
    watch: node.watch,
    exercices: node.exercices,
    people: node.people,
  };
}

function toCourseModule(node: CatalogNodeIndex): CourseModule {
  return {
    id: node.id,
    title: getDisplayTitle(node),
    description: getDescription(node),
    deps: getDeps(node),
    read: node.read,
    watch: node.watch,
    exercices: node.exercices,
    people: node.people,
  };
}

export async function getSubjectSummaries(): Promise<SubjectSummary[]> {
  const rootNode = await readNodeIndex([]);

  if (!rootNode) {
    return [];
  }

  const children = await getChildNodes([]);
  return children.map(toSubjectSummary);
}

export async function getCourseSummaries(
  subjectId: string
): Promise<CourseSummary[] | null> {
  const subjectNode = await readNodeIndex([subjectId]);

  if (!subjectNode) {
    return null;
  }

  const children = await getChildNodes([subjectId]);
  return children.map(toCourseSummary);
}

export async function getSubjectDetail(
  subjectId: string
): Promise<SubjectDetail | null> {
  const subjectNode = await readNodeIndex([subjectId]);

  if (!subjectNode) {
    return null;
  }

  const courses = await getCourseSummaries(subjectId);

  if (!courses) {
    return null;
  }

  return {
    id: subjectNode.id,
    name: getDisplayName(subjectNode),
    title: getDisplayTitle(subjectNode),
    description: getDescription(subjectNode),
    read: subjectNode.read,
    watch: subjectNode.watch,
    exercices: subjectNode.exercices,
    people: subjectNode.people,
    courses,
  };
}

export async function getCourseDetail(
  subjectId: string,
  courseId: string
): Promise<CourseDetail | null> {
  const courseNode = await readNodeIndex([subjectId, courseId]);

  if (!courseNode) {
    return null;
  }

  const modules = (await collectDescendantNodes([subjectId, courseId]))
    .map(toCourseModule)
    .sort((a, b) => a.title.localeCompare(b.title));

  return {
    id: courseNode.id,
    name: getDisplayName(courseNode),
    title: getDisplayTitle(courseNode),
    description: getDescription(courseNode),
    read: courseNode.read,
    watch: courseNode.watch,
    exercices: courseNode.exercices,
    people: courseNode.people,
    modules,
  };
}

async function findDescendantById(
  baseSegments: string[],
  targetId: string
): Promise<CatalogNodeIndex | null> {
  const currentNode = await readNodeIndex(baseSegments);

  if (!currentNode) {
    return null;
  }

  if (currentNode.id === targetId) {
    return currentNode;
  }

  const children = await getChildNodes(baseSegments);

  for (const child of children) {
    if (child.id === targetId) {
      return child;
    }

    const nested = await findDescendantById(
      [...baseSegments, child.id],
      targetId
    );
    if (nested) {
      return nested;
    }
  }

  return null;
}

export async function getCourseModuleDetail(
  subjectId: string,
  courseId: string,
  moduleId: string
): Promise<CourseModule | null> {
  const moduleNode = await findDescendantById([subjectId, courseId], moduleId);

  if (!moduleNode) {
    return null;
  }

  return toCourseModule(moduleNode);
}

function getSearchKind(depth: number): SearchEntry['kind'] {
  if (depth <= 1) {
    return 'subject';
  }

  if (depth === 2) {
    return 'course';
  }

  return 'module';
}

export function getSubjectsPath(pathSegments: string[]): string {
  if (pathSegments.length === 0) {
    return '/subjects';
  }

  return `/subjects/${pathSegments.join('/')}`;
}

export function normalizeCatalogRouteSegments(segments: string[]): string[] {
  if (segments.length === 0) {
    return [];
  }

  const normalized = [segments[0]];

  for (let index = 1; index < segments.length; index += 1) {
    const segment = segments[index];

    if (LEGACY_ROUTE_MARKERS.has(segment)) {
      continue;
    }

    normalized.push(segment);
  }

  return normalized;
}

async function getNodeTrail(
  pathSegments: string[]
): Promise<Array<{ node: CatalogNodeIndex; pathSegments: string[] }> | null> {
  const trail: Array<{ node: CatalogNodeIndex; pathSegments: string[] }> = [];

  for (let depth = 1; depth <= pathSegments.length; depth += 1) {
    const currentSegments = pathSegments.slice(0, depth);
    const node = await readNodeIndex(currentSegments);

    if (!node) {
      return null;
    }

    trail.push({ node, pathSegments: currentSegments });
  }

  return trail;
}

export async function resolveCatalogNode(
  pathSegments: string[]
): Promise<CatalogNode | null> {
  if (pathSegments.length === 0) {
    return null;
  }

  const trail = await getNodeTrail(pathSegments);

  if (!trail || trail.length === 0) {
    return null;
  }

  const currentNode = trail[trail.length - 1].node;
  const children = await getChildNodes(pathSegments);

  return {
    id: currentNode.id,
    name: getDisplayName(currentNode),
    title: getDisplayTitle(currentNode),
    description: getDescription(currentNode),
    deps: getDeps(currentNode),
    read: currentNode.read,
    watch: currentNode.watch,
    exercices: currentNode.exercices,
    people: currentNode.people,
    kind: getSearchKind(pathSegments.length),
    pathSegments,
    path: getSubjectsPath(pathSegments),
    trail: trail.map((item) => ({
      id: item.node.id,
      label: getDisplayName(item.node),
      pathSegments: item.pathSegments,
      path: getSubjectsPath(item.pathSegments),
    })),
    children: children.map((child) => {
      const childSegments = [...pathSegments, child.id];

      return {
        id: child.id,
        label: getDisplayName(child),
        title: getDisplayTitle(child),
        deps: getDeps(child),
        pathSegments: childSegments,
        path: getSubjectsPath(childSegments),
      };
    }),
  };
}

function getSearchPath(pathSegments: string[]): string {
  return getSubjectsPath(pathSegments);
}

async function collectSearchEntries(
  pathSegments: string[]
): Promise<Array<SearchEntry & { searchText: string }>> {
  const node = await readNodeIndex(pathSegments);

  if (!node) {
    return [];
  }

  const entries: Array<SearchEntry & { searchText: string }> = [];

  if (pathSegments.length > 0) {
    entries.push({
      id: `${getSearchKind(pathSegments.length)}:${pathSegments.join(':')}`,
      label: getDisplayName(node),
      kind: getSearchKind(pathSegments.length),
      path: getSearchPath(pathSegments),
      description: getDescription(node),
      searchText: buildSearchText([
        node.id,
        node.name,
        node.title,
        node.description,
        node.deps,
        node.read,
        node.watch,
        node.exercices,
        node.people,
      ]),
    });
  }

  const children = await getChildNodes(pathSegments);

  for (const child of children) {
    const nested = await collectSearchEntries([...pathSegments, child.id]);
    entries.push(...nested);
  }

  return entries;
}

function buildSearchText(parts: Array<string | string[] | undefined>): string {
  return parts
    .flatMap((part) => {
      if (!part) {
        return [];
      }

      return Array.isArray(part) ? part : [part];
    })
    .join(' ')
    .toLowerCase();
}

function fuzzyScore(query: string, candidate: string): number | null {
  if (!query || !candidate) {
    return null;
  }

  const directIndex = candidate.indexOf(query);
  if (directIndex >= 0) {
    return directIndex + (candidate.length - query.length) * 0.01;
  }

  let queryIndex = 0;
  let gaps = 0;
  let previousMatch = -1;

  for (let i = 0; i < candidate.length && queryIndex < query.length; i += 1) {
    if (candidate[i] !== query[queryIndex]) {
      continue;
    }

    if (previousMatch >= 0) {
      gaps += i - previousMatch - 1;
    }

    previousMatch = i;
    queryIndex += 1;
  }

  if (queryIndex !== query.length) {
    return null;
  }

  return 100 + gaps + candidate.length * 0.01;
}

export async function searchCatalog(
  rawQuery: string,
  limit = 12
): Promise<SearchEntry[]> {
  const query = rawQuery.trim().toLowerCase();

  if (query.length === 0) {
    return [];
  }

  const entries = await collectSearchEntries([]);

  return entries
    .map((entry) => ({
      entry,
      score: fuzzyScore(query, entry.searchText),
    }))
    .filter(
      (
        item
      ): item is {
        entry: SearchEntry & { searchText: string };
        score: number;
      } => item.score !== null
    )
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(({ entry }) => ({
      id: entry.id,
      label: entry.label,
      kind: entry.kind,
      path: entry.path,
      description: entry.description,
    }));
}
