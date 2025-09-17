import Link from 'next/link';
import gameroms from '@/generated/gameroms.json';

export const dynamic = 'force-static';

type Entry = {
  platform: { slug: string; name: string | null };
  game: { slug: string; name: string | null };
  region: { slug: string; name: string | null };
  path: string;
  branch: { types: { strings?: any } };
};

export async function generateStaticParams() {
  const entries = (gameroms as any).entries as Entry[];
  return entries.map((e) => ({ platform: e.platform.slug, game: e.game.slug, region: e.region.slug }));
}

function getEntry(platform: string, game: string, region: string) {
  const entries = (gameroms as any).entries as Entry[];
  return entries.find((e) => e.platform.slug === platform && e.game.slug === game && e.region.slug === region);
}

export default async function TypesStringsPage({ params }: { params: Promise<{ platform: string; game: string; region: string }> }) {
  const { platform, game, region } = await params;
  const entry = getEntry(platform, game, region);
  if (!entry) return null;
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Types — Strings — {entry.game.name} / {entry.region.name}</h1>
      <pre className="mt-6 overflow-x-auto rounded bg-muted p-3 text-xs text-foreground">{JSON.stringify(entry.branch.types?.strings ?? null, null, 2)}</pre>
      <div className="mt-6"><Link className="text-primary hover:underline" href={`/${entry.path}`}>Back</Link></div>
    </div>
  );
}


