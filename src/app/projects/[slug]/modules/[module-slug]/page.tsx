import Link from 'next/link';
import { notFound } from 'next/navigation';
import projectsJson from '@/generated/projects.json';
// Import slugify function locally since module path is too complex
function slugify(value) {
  const normalized = String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const hyphenated = normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

  return hyphenated;
}

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
  groups: ModuleGroup[];
};

type BranchSummary = {
  modules?: Module[];
};

type Project = {
  id: string;
  name: string;
  slug: string;
  activeBranch?: BranchSummary | null;
};

export async function generateStaticParams() {
  const data = projectsJson as any;
  const params: { slug: string; 'module-slug': string }[] = [];
  
  for (const project of data.projects as Project[]) {
    if (project.activeBranch?.modules) {
      for (const module of project.activeBranch.modules) {
        params.push({
          slug: project.slug,
          'module-slug': slugify(module.name)
        });
      }
    }
  }
  
  return params;
}

export default async function ModulePage({ 
  params 
}: { 
  params: Promise<{ slug: string; 'module-slug': string }> 
}) {
  const { slug, 'module-slug': moduleSlug } = await params;
  const data = projectsJson as any;
  const project = (data.projects as Project[]).find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  const module = project.activeBranch?.modules?.find((m) => slugify(m.name) === moduleSlug);

  if (!module) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-6">
        <Link 
          href={`/projects/${project.slug}`} 
          className="text-sm text-primary hover:underline"
        >
          ← Back to {project.name}
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground">{module.name}</h1>
      <p className="mt-2 text-muted-foreground">Module configuration options</p>

      <div className="mt-8 space-y-6">
        {module.groups.map((group, groupIndex) => (
          <div key={groupIndex} className="rounded-lg border border-border p-4">
            <h2 className="text-lg font-semibold text-foreground">
              {group.name || `Configuration Group ${groupIndex + 1}`}
            </h2>
          </div>
        ))}
      </div>

      {/* Module Dependencies and Meta */}
      <div className="mt-8 rounded-lg border border-border p-4">
        <h2 className="text-lg font-semibold text-foreground">Module Information</h2>
        <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
          <div>Total Option Groups: {module.groups.length}</div>
          <div>Total Options: {module.groups.reduce((sum, group) => sum + group.options.length, 0)}</div>
          <div>Default Options: {module.groups.reduce((sum, group) => sum + group.options.filter(opt => opt.default).length, 0)}</div>
          <div>
            Modules Referenced: {
              Array.from(new Set(
                module.groups.flatMap(group => 
                  group.options.filter(opt => opt.module).map(opt => opt.module)
                )
              )).length
            }
          </div>
        </div>
      </div>
    </div>
  );
}
