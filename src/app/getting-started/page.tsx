import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Download, ExternalLink } from 'lucide-react';

export default function GettingStartedPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Getting Started
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Welcome to GaiaLabs! This guide will help you get up and running with ROM analysis,
          data structure editing, and assembly generation.
        </p>
      </div>

      {/* Quick Start */}
      <div className="mx-auto mt-16 max-w-3xl">
        <div className="rounded-lg border border-border p-8">
          <h2 className="text-2xl font-bold text-foreground">Quick Start</h2>
          <p className="mt-4 text-muted-foreground">
            The fastest way to start analyzing ROMs is through our web-based editor.
          </p>
          <div className="mt-6">
            <Button asChild size="lg">
              <Link 
                href="https://scribe.gaialabs.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                Open GaiaScribe Editor
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="mx-auto mt-16 max-w-3xl">
        <div className="space-y-12">
          {/* Step 1 */}
          <div>
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                1
              </div>
              <h3 className="ml-4 text-xl font-semibold text-foreground">Upload Your ROM</h3>
            </div>
            <div className="ml-12 mt-4">
              <p className="text-muted-foreground">
                Start by uploading your ROM file to the GaiaScribe editor. The system will
                automatically validate the ROM and prepare it for analysis.
              </p>
              <div className="mt-4 rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Supported formats:</strong> SNES ROMs (.smc, .sfc), unheadered and headered
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                2
              </div>
              <h3 className="ml-4 text-xl font-semibold text-foreground">Explore Data Structures</h3>
            </div>
            <div className="ml-12 mt-4">
              <p className="text-muted-foreground">
                Browse the automatically detected data structures, including graphics, tilemaps,
                sprites, and game logic. Use the resource tree to navigate between different
                data types.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Graphics and sprite data</li>
                <li>• Tilemaps and tilesets</li>
                <li>• Sound and music data</li>
                <li>• Game scripts and dialogue</li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                3
              </div>
              <h3 className="ml-4 text-xl font-semibold text-foreground">Edit and Collaborate</h3>
            </div>
            <div className="ml-12 mt-4">
              <p className="text-muted-foreground">
                Make changes to the data structures in real-time. Collaborate with other researchers
                and see their changes live. Document your findings and share knowledge.
              </p>
              <div className="mt-4 rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Pro tip:</strong> Create an account to save your work and collaborate with others!
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div>
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                4
              </div>
              <h3 className="ml-4 text-xl font-semibold text-foreground">Generate Assembly</h3>
            </div>
            <div className="ml-12 mt-4">
              <p className="text-muted-foreground">
                Export your analysis as clean, documented assembly code. Generate buildable
                source projects that preserve all your research and modifications.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• 65816 assembly with full documentation</li>
                <li>• Organized file structure</li>
                <li>• Build scripts and makefiles</li>
                <li>• Patch generation for modifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mx-auto mt-16 max-w-3xl">
        <div className="rounded-lg border border-border p-8">
          <h2 className="text-2xl font-bold text-foreground">Next Steps</h2>
          <p className="mt-4 text-muted-foreground">
            Ready to dive deeper? Here are some recommended next steps:
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link 
              href="/api"
              className="group rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold text-foreground group-hover:text-primary">
                API Reference
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Explore the complete API documentation for advanced usage.
              </p>
            </Link>
            <Link 
              href="/projects"
              className="group rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold text-foreground group-hover:text-primary">
                Browse Projects
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                See what others have analyzed and published.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
