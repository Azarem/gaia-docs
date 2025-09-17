import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, ExternalLink, Eye, Users } from 'lucide-react';
import projectsJson from '@/generated/projects.json';

type Project = {
  id: string;
  name: string;
  slug: string;
  meta?: any;
  gameId: string;
  baseRomId: string;
  createdAt: string;
  updatedAt: string;
};

export const dynamic = 'force-static';

export default async function ProjectsPage() {
  const projects = (projectsJson as any).projects as Project[];

  function getStatusColor(status: string) {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Published Projects
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Explore completed ROM analyses from the community. Each project represents 
          hours of collaborative research and documentation.
        </p>
      </div>

      {/* Stats */}
      <div className="mx-auto mt-16 max-w-2xl lg:mx-0 lg:max-w-none">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-6 text-center">
            <div className="text-3xl font-bold text-foreground">{projects.length}</div>
            <div className="text-sm text-muted-foreground">Published Projects</div>
          </div>
          <div className="rounded-lg border border-border p-6 text-center">
            <div className="text-3xl font-bold text-foreground">—</div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </div>
          <div className="rounded-lg border border-border p-6 text-center">
            <div className="text-3xl font-bold text-foreground">—</div>
            <div className="text-sm text-muted-foreground">Contributors</div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.id}
            className="flex flex-col items-start rounded-lg border border-border p-6 hover:bg-muted/50 transition-colors"
          >
            {/* Status and Game Title */}
            <div className="flex items-center gap-x-4 text-xs">
              <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">project</Badge>
              <div className="text-muted-foreground">{project.meta?.gameTitle ?? 'Game'}</div>
            </div>

            {/* Project Title and Description */}
            <div className="group relative mt-4">
              <h3 className="text-lg font-semibold leading-6 text-foreground group-hover:text-primary">
                <Link href={`/projects/${project.slug}`}>
                  <span className="absolute inset-0" />
                  {project.name}
                </Link>
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {project.meta?.description ?? 'Published analysis project'}
              </p>
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.isArray(project.meta?.tags)
                ? project.meta.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))
                : null}
            </div>

            {/* Footer */}
            <div className="relative mt-6 flex w-full items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-x-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(project.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  —
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  —
                </div>
              </div>
            </div>

            {/* Author */}
            <div className="mt-2 text-xs text-muted-foreground">
              {project.meta?.author ? `by ${project.meta.author}` : null}
            </div>
          </article>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mx-auto mt-24 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Want to contribute?
        </h2>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Start your own analysis project and share your discoveries with the community.
        </p>
        <div className="mt-10">
          <Button asChild size="lg">
            <Link 
              href="https://scribe.gaialabs.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Start Analyzing
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
