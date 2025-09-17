import Link from 'next/link';
import projectsJson from '@/generated/projects.json';

export const dynamic = 'force-static';

type ModuleOption = {
  name: string;
  module: string | null;
  default?: boolean;
  description?: string;
};

type ModuleGroup = {
  name: string | null;
  options: ModuleOption[];
};

type Module = {
  name: string;
  slug: string;
  groups: ModuleGroup[];
};

type BranchSummary = {
  id: string;
  name: string | null;
  version: number | null;
  modules?: Module[];
  fileCount?: number;
  createdAt?: string;
  updatedAt?: string;
  baseRomBranch?: { 
    id: string; 
    name: string | null; 
    version: number | null; 
    fileCount?: number; 
    createdAt?: string; 
    updatedAt?: string;
    baseRom?: { id: string; name: string; slug: string; gameId: string } | null; 
  } | null;
  gameRomBranch?: { 
    id: string; 
    name: string | null; 
    version: number | null; 
    game?: { id: string; name: string; slug: string }; 
    region?: { id: string; name: string; slug: string } 
  } | null;
  platformBranch?: { 
    id: string; 
    name: string | null; 
    version: number | null; 
    notes?: any; 
    createdAt?: string; 
    updatedAt?: string;
    platform?: { id: string; name: string; slug: string; meta?: any } | null; 
  } | null;
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
        <div className="space-y-6 mt-8">
          {/* Project Branch Card */}
          <div className="rounded-lg border border-border p-4">
            <h2 className="text-lg font-semibold text-foreground">Project Branch</h2>
            <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
              <div>Branch: <span className="font-mono">{branch.name ?? '—'}</span> (v{branch.version ?? '—'})</div>
              <div>Files: {branch.fileCount ?? '—'}</div>
              <div className="text-xs text-muted-foreground">
                Created: {branch.createdAt ? new Date(branch.createdAt).toLocaleString() : '—'}
              </div>
              <div className="text-xs text-muted-foreground">
                Updated: {branch.updatedAt ? new Date(branch.updatedAt).toLocaleString() : '—'}
              </div>
            </div>
          </div>

          {/* Modules Card */}
          {Array.isArray(branch.modules) && branch.modules.length > 0 && (
            <div className="rounded-lg border border-border p-4">
              <h2 className="text-lg font-semibold text-foreground">Modules</h2>
              <div className="mt-4 space-y-4">
                {branch.modules.map((module, moduleIndex) => (
                  <div key={moduleIndex} className="border-l-2 border-muted-foreground/20 pl-4">
                    <h3 className="font-medium text-foreground">
                      <Link 
                        href={`/projects/${project.slug}/modules/${module.slug}`}
                        className="hover:underline text-primary"
                      >
                        {module.name}
                      </Link>
                    </h3>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {module.groups.length} group{module.groups.length !== 1 ? 's' : ''}, {module.groups.reduce((sum, group) => sum + group.options.length, 0)} option{module.groups.reduce((sum, group) => sum + group.options.length, 0) !== 1 ? 's' : ''}
                    </div>
                    <div className="mt-2 space-y-1">
                      {module.groups?.map((group, groupIndex) => (
                        <div key={groupIndex} className="text-xs text-muted-foreground">
                          {group.name || `Group ${groupIndex + 1}`}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BaseRom Branch Card */}
          {branch.baseRomBranch && (
            <div className="rounded-lg border border-border p-4">
              <h2 className="text-lg font-semibold text-foreground">BaseRom Branch</h2>
              <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
                {branch.baseRomBranch.baseRom && (
                  <div>BaseRom: 
                    <Link 
                      href={`/baseroms/${branch.baseRomBranch.baseRom.slug}`}
                      className="ml-1 font-mono text-primary hover:underline"
                    >
                      {branch.baseRomBranch.baseRom.name}
                    </Link>
                  </div>
                )}
                <div>Branch: <span className="font-mono">{branch.baseRomBranch.name ?? '—'}</span> (v{branch.baseRomBranch.version ?? '—'})</div>
                <div>Files: {branch.baseRomBranch.fileCount ?? '—'}</div>
                {branch.gameRomBranch?.game && (
                  <div>Game: 
                    <Link 
                      href={`/games/${branch.platformBranch?.platform?.slug}/${branch.gameRomBranch.game.slug}`}
                      className="ml-1 text-primary hover:underline"
                    >
                      {branch.gameRomBranch.game.name}
                    </Link>
                  </div>
                )}
                {branch.gameRomBranch?.region && branch.gameRomBranch?.game && branch.platformBranch?.platform && (
                  <div>Region: 
                    <Link 
                      href={`/games/${branch.platformBranch.platform.slug}/${branch.gameRomBranch.game.slug}/${branch.gameRomBranch.region.slug}`}
                      className="ml-1 text-primary hover:underline"
                    >
                      {branch.gameRomBranch.region.name}
                    </Link>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Created: {branch.baseRomBranch.createdAt ? new Date(branch.baseRomBranch.createdAt).toLocaleString() : '—'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Updated: {branch.baseRomBranch.updatedAt ? new Date(branch.baseRomBranch.updatedAt).toLocaleString() : '—'}
                </div>
              </div>
            </div>
          )}

          {/* Platform Branch Card */}
          {branch.platformBranch && (
            <div className="rounded-lg border border-border p-4">
              <h2 className="text-lg font-semibold text-foreground">Platform Branch</h2>
              <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
                {branch.platformBranch.platform && (
                  <div>Platform: 
                    <Link 
                      href={`/games/${branch.platformBranch.platform.slug}`}
                      className="ml-1 font-mono text-primary hover:underline"
                    >
                      {branch.platformBranch.platform.name}
                    </Link>
                  </div>
                )}
                <div>Branch: <span className="font-mono">{branch.platformBranch.name ?? '—'}</span> (v{branch.platformBranch.version ?? '—'})</div>
                <div className="text-xs text-muted-foreground">
                  Created: {branch.platformBranch.createdAt ? new Date(branch.platformBranch.createdAt).toLocaleString() : '—'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Updated: {branch.platformBranch.updatedAt ? new Date(branch.platformBranch.updatedAt).toLocaleString() : '—'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
