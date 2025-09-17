import Link from 'next/link';
import gameroms from '@/generated/gameroms.json';
import platforms from '@/generated/platforms.json';

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

export default async function PlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const entries = (gameroms as any).entries as Entry[];
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
  const games = Array.from(new Map(entries.filter((e) => e.platform.slug === platform).map((e) => [e.game.slug, e.game])).values());

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{platformRecord?.name ?? decodeURIComponent(platform)}</h1>
      
      <div className="space-y-6 mt-8">
        {/* Current Branch Card */}
        {platformRecord?.activeBranch && (
          <div className="rounded-lg border border-border p-4">
            <h2 className="text-lg font-semibold text-foreground">Current Branch</h2>
            <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
              <div>Branch: <span className="font-mono">{platformRecord.activeBranch.name ?? '—'}</span> (v{platformRecord.activeBranch.version ?? '—'})</div>
              <div className="text-xs text-muted-foreground">
                Created: {new Date(platformRecord.activeBranch.createdAt).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Updated: {new Date(platformRecord.activeBranch.updatedAt).toLocaleString()}
              </div>
              {platformRecord.activeBranch.notes && platformRecord.activeBranch.notes.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-medium text-muted-foreground">Notes:</div>
                  <ul className="text-xs text-muted-foreground list-disc pl-4">
                    {platformRecord.activeBranch.notes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assembly Information Card */}
        {platformRecord?.activeBranch && (platformRecord.activeBranch.addressingModes || platformRecord.activeBranch.instructionSet || platformRecord.activeBranch.vectors) && (
          <div className="rounded-lg border border-border p-4">
            <h2 className="text-lg font-semibold text-foreground">Assembly Information</h2>
            <div className="mt-4">
              <Link 
                href={`/assembly/${platform}`}
                className="text-primary hover:underline font-medium"
              >
                View Complete Assembly Documentation
              </Link>
              <div className="text-xs text-muted-foreground mt-1">
                Addressing modes, instruction set, and interrupt vectors for {platformRecord.name}
              </div>
            </div>
          </div>
        )}

        {/* Platform Metadata */}
        {platformRecord?.meta && (
          <div className="rounded-lg border border-border p-4">
            <h2 className="text-lg font-semibold text-foreground">Platform Metadata</h2>
            <pre className="mt-2 overflow-x-auto rounded bg-muted p-3 text-xs text-foreground">{JSON.stringify(platformRecord.meta, null, 2)}</pre>
          </div>
        )}

        {/* Games List */}
        <div className="rounded-lg border border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Games</h2>
          <ul className="mt-3 space-y-2">
            {games.map((g) => (
              <li key={g.slug}>
                <Link 
                  className="text-primary hover:underline" 
                  href={`/games/${platform}/${g.slug}`}
                >
                  {g.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}


