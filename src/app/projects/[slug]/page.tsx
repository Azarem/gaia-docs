import Link from 'next/link';
import projectsJson from '@/generated/projects.json';

export const dynamic = 'force-static';

type BranchSummary = {
  id: string;
  name: string | null;
  version: number | null;
  modules?: any[];
  fileCount?: number;
  createdAt?: string;
  updatedAt?: string;
  baseRomBranch?: { id: string; name: string | null; version: number | null; fileCount?: number } | null;
  gameRomBranch?: { id: string; name: string | null; version: number | null; game?: { id: string; name: string }; region?: { id: string; name: string } } | null;
  platformBranch?: { id: string; name: string | null; version: number | null; platform?: { id: string; name: string } } | null;
};

type Project = {
  id: string;
  name: string;
  slug: string;
  meta?: any;
  gameId: string;
  baseRomId: string;
  createdAt: string;
  updatedAt: string;
  activeBranch?: BranchSummary | null;
};

export async function generateStaticParams() {
  const data = projectsJson as any;
  // projects remains an array; keep behavior
  return (data.projects as Project[]).map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = projectsJson as any;
  const project = (data.projects as Project[]).find((p) => p.slug === slug);

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <p className="mt-2 text-muted-foreground">No project with slug &quot;{slug}&quot;</p>
        <div className="mt-6">
          <Link className="text-primary hover:underline" href="/projects">Back to projects</Link>
        </div>
      </div>
    );
  }

  const branch = project.activeBranch;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{project.name}</h1>
      <p className="mt-2 text-muted-foreground">Updated {new Date(project.updatedAt).toLocaleString()}</p>

      {project.meta?.currentVersion && (
        <div className="mt-4 text-sm text-muted-foreground">Current Version: {project.meta.currentVersion}</div>
      )}

      <div className="mt-8 rounded-lg border border-border p-4">
        <div className="text-sm">Project ID: <span className="font-mono">{project.id}</span></div>
        <div className="text-sm">Game ID: <span className="font-mono">{project.gameId}</span></div>
        <div className="text-sm">Base ROM ID: <span className="font-mono">{project.baseRomId}</span></div>
      </div>

      {branch && (
        <div className="mt-8 rounded-lg border border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Active Branch</h2>
          <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
            <div>Branch: <span className="font-mono">{branch.name ?? '—'}</span> (v{branch.version ?? '—'})</div>
            <div>Files: {branch.fileCount ?? '—'}</div>
            {branch.gameRomBranch?.game && (
              <div>Game: {branch.gameRomBranch.game.name}</div>
            )}
            {branch.gameRomBranch?.region && (
              <div>Region: {branch.gameRomBranch.region.name}</div>
            )}
            {branch.platformBranch?.platform && (
              <div>Platform: {branch.platformBranch.platform.name}</div>
            )}
          </div>

          {Array.isArray(branch.modules) && branch.modules.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium">Modules</h3>
              <div className="mt-2 text-sm text-muted-foreground">
                {branch.modules.length} configurable module group(s)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
