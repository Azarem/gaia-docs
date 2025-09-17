import Link from 'next/link';
import { notFound } from 'next/navigation';
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
          'module-slug': module.slug
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

  const module = project.activeBranch?.modules?.find((m) => m.slug === moduleSlug);

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
            <div className="mt-4 space-y-3">
              {group.options.map((option, optionIndex) => (
                <div 
                  key={optionIndex} 
                  className={`p-3 rounded-md border ${
                    option.default 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border bg-background'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">
                      {option.name}
                      {option.default && (
                        <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          default
                        </span>
                      )}
                    </h3>
                    {option.module && (
                      <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                        {option.module}
                      </span>
                    )}
                  </div>
                  {option.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
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
