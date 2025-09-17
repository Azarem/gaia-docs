import Link from 'next/link';
import { notFound } from 'next/navigation';
import platforms from '@/generated/platforms.json';
import gameroms from '@/generated/gameroms.json';

export const dynamic = 'force-static';

type Entry = {
  platform: { slug: string; name: string | null };
  game: { slug: string; name: string | null };
  region: { slug: string; name: string | null };
  path: string;
};

export async function generateStaticParams() {
  const entries = (gameroms as any).entries as Entry[];
  const slugs = Array.from(new Set(entries.map((e) => e.platform.slug)));
  return slugs.map((platform) => ({ platform }));
}

export default async function AssemblyPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const platformObj = (platforms as any).platforms as Record<string, { 
    name: string; 
    meta?: any; 
    activeBranch?: {
      id: string;
      name: string | null;
      version: number | null;
      notes: string[];
      addressingModes?: any;
      instructionSet?: any;
      vectors?: any;
      createdAt: string;
      updatedAt: string;
    } | null;
  }>;
  
  const platformRecord = platformObj[platform];
  
  if (!platformRecord) {
    notFound();
  }

  const branch = platformRecord.activeBranch;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-6">
        <Link 
          href={`/games/${platform}`} 
          className="text-sm text-primary hover:underline"
        >
          ← Back to {platformRecord.name}
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {platformRecord.name} Assembly Information
      </h1>
      <p className="mt-2 text-muted-foreground">
        Complete technical documentation for {platformRecord.name} assembly programming
      </p>

      {!branch && (
        <div className="mt-8 rounded-lg border border-border p-6 bg-muted/30">
          <p className="text-muted-foreground">No active branch found for this platform.</p>
        </div>
      )}

      {branch && (
        <div className="space-y-8 mt-8">
          {/* Branch Information */}
          <div className="rounded-lg border border-border p-4 bg-muted/20">
            <h2 className="text-lg font-semibold text-foreground mb-2">Branch Information</h2>
            <div className="text-sm text-muted-foreground">
              <span className="font-mono">{branch.name ?? '—'}</span> (v{branch.version ?? '—'}) • 
              Updated {new Date(branch.updatedAt).toLocaleString()}
            </div>
          </div>

          {/* Addressing Modes */}
          {branch.addressingModes && (
            <div className="rounded-lg border border-border p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Addressing Modes</h2>
              <p className="text-muted-foreground mb-6">
                CPU addressing modes define how operands are specified and accessed in instructions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(branch.addressingModes).map(([mode, details]: [string, any]) => (
                  <div key={mode} className="border border-border/50 rounded-lg p-4 bg-muted/10">
                    <h3 className="font-semibold text-foreground">{mode}</h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="text-muted-foreground">
                        <span className="font-medium">Size:</span> {details.size} byte{details.size !== 1 ? 's' : ''}
                      </div>
                      <div className="text-muted-foreground">
                        <span className="font-medium">Shorthand:</span> <span className="font-mono">{details.shorthand}</span>
                      </div>
                      {details.formatString && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">Format:</span> <span className="font-mono text-xs">{details.formatString}</span>
                        </div>
                      )}
                      {details.parseRegex && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">Pattern:</span> <span className="font-mono text-xs break-all">{details.parseRegex}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instruction Set */}
          {branch.instructionSet && (
            <div className="rounded-lg border border-border p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Instruction Set</h2>
              <p className="text-muted-foreground mb-6">
                Complete instruction set with opcodes for each addressing mode combination.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {Object.entries(branch.instructionSet).map(([instruction, modes]: [string, any]) => (
                  <div key={instruction} className="border border-border/50 rounded-lg p-4 bg-muted/10">
                    <h3 className="font-semibold text-foreground font-mono text-lg">{instruction}</h3>
                    <div className="mt-3 space-y-2">
                      {Object.entries(modes).map(([mode, opcode]: [string, any]) => (
                        <div key={mode} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{mode}</span>
                          <span className="font-mono text-foreground bg-background px-2 py-1 rounded border">
                            ${opcode.toString(16).toUpperCase().padStart(2, '0')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vectors */}
          {branch.vectors && Object.keys(branch.vectors).length > 0 && (
            <div className="rounded-lg border border-border p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Interrupt Vectors</h2>
              <p className="text-muted-foreground mb-6">
                Interrupt and exception vector definitions for the {platformRecord.name} architecture.
              </p>
              
              <div className="space-y-3">
                {Object.entries(branch.vectors).map(([vector, details]: [string, any]) => (
                  <div key={vector} className="border border-border/50 rounded-lg p-4 bg-muted/10">
                    <h3 className="font-semibold text-foreground">{vector}</h3>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <pre className="font-mono text-xs overflow-x-auto">{JSON.stringify(details, null, 2)}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {branch.vectors && Object.keys(branch.vectors).length === 0 && (
            <div className="rounded-lg border border-border p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Interrupt Vectors</h2>
              <p className="text-muted-foreground">
                No interrupt vectors defined for this platform branch.
              </p>
            </div>
          )}

          {/* Show message if no technical data */}
          {!branch.addressingModes && !branch.instructionSet && (!branch.vectors || Object.keys(branch.vectors).length === 0) && (
            <div className="rounded-lg border border-border p-6 bg-muted/30">
              <h2 className="text-lg font-semibold text-foreground mb-2">No Technical Data</h2>
              <p className="text-muted-foreground">
                No addressing modes, instruction set, or vectors data available for this platform branch.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
