import { Button } from '@/components/ui/Button';
import { ArrowRight, Book, Code, Database, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              GaiaLabs
              <span className="text-primary"> Documentation</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Comprehensive documentation for ROM analysis, data structure editing, 
              and assembly generation tools. Explore the technical depths of retro game development.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/getting-started">
                <Button size="lg">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/api">
                <Button variant="outline" size="lg">
                  API Reference
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Powerful ROM analysis tools
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              From data extraction to assembly generation, our comprehensive suite of tools
              makes ROM analysis accessible and powerful.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-foreground">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <Database className="h-6 w-6 text-primary-foreground" />
                  </div>
                  Data Structure Analysis
                </dt>
                <dd className="mt-2 text-base leading-7 text-muted-foreground">
                  Analyze and document complex ROM data structures with our intuitive tools.
                  Extract, visualize, and understand the data that drives classic games.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-foreground">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <Code className="h-6 w-6 text-primary-foreground" />
                  </div>
                  Assembly Generation
                </dt>
                <dd className="mt-2 text-base leading-7 text-muted-foreground">
                  Generate clean, documented assembly code from ROM analysis.
                  Export your findings as buildable source code projects.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-foreground">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                  Real-time Collaboration
                </dt>
                <dd className="mt-2 text-base leading-7 text-muted-foreground">
                  Work together with other researchers and developers. Share findings,
                  collaborate on analysis, and build knowledge collectively.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-foreground">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <Book className="h-6 w-6 text-primary-foreground" />
                  </div>
                  Comprehensive Documentation
                </dt>
                <dd className="mt-2 text-base leading-7 text-muted-foreground">
                  From beginner guides to advanced technical references.
                  Everything you need to master ROM analysis and development.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to start analyzing?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Jump into our getting started guide or explore the API documentation
              to begin your ROM analysis journey.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/getting-started">
                <Button size="lg">
                  View Documentation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/projects" className="text-sm font-semibold leading-6 text-foreground">
                Browse Projects <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
