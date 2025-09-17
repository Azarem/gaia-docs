import Link from 'next/link';
import gameroms from '@/generated/gameroms.json';

export const dynamic = 'force-static';

type Entry = {
  platform: { id: string | null; name: string | null; slug: string };
  game: { id: string | null; name: string | null; slug: string };
  region: { id: string | null; name: string | null; slug: string };
  path: string; // games/{platform}/{game}/{region}
  branch: {
    id: string;
    name: string | null;
    version: number | null;
    coplib: any;
    config: any;
    blocks: any;
    fixups: any;
    types: any;
    files: { key: string; crc: number | null; name: string | null }[];
  };
};

export async function generateStaticParams() {
  const entries = (gameroms as any).entries as Entry[];
  return entries.map((e) => ({ platform: e.platform.slug, game: e.game.slug, region: e.region.slug }));
}

function findEntry(platform: string, game: string, region: string) {
  const entries = (gameroms as any).entries as Entry[];
  return entries.find((e) => e.platform.slug === platform && e.game.slug === game && e.region.slug === region);
}

export default async function GameRomPage({ params }: { params: Promise<{ platform: string; game: string; region: string }> }) {
  const { platform, game, region } = await params;
  const entry = findEntry(platform, game, region);
  if (!entry) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-bold">Game ROM not found</h1>
        <div className="mt-6"><Link className="text-primary hover:underline" href="/games">Back to games</Link></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {entry.game.name} — {entry.region.name} ({entry.platform.name})
      </h1>
      <p className="mt-2 text-muted-foreground">Branch: <span className="font-mono">{entry.branch.name ?? '—'}</span> (v{entry.branch.version ?? '—'})</p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href={`/${entry.path}/files`} className="rounded-lg border border-border p-4 hover:bg-muted">Files</Link>
        <Link href={`/${entry.path}/cops`} className="rounded-lg border border-border p-4 hover:bg-muted">Cops</Link>
        <Link href={`/${entry.path}/blocks`} className="rounded-lg border border-border p-4 hover:bg-muted">Blocks</Link>
        <Link href={`/${entry.path}/types/strings`} className="rounded-lg border border-border p-4 hover:bg-muted">Types: Strings</Link>
        <Link href={`/${entry.path}/types/structs`} className="rounded-lg border border-border p-4 hover:bg-muted">Types: Structs</Link>
        <Link href={`/${entry.path}/fixups`} className="rounded-lg border border-border p-4 hover:bg-muted">Fixups</Link>
      </div>
    </div>
  );
}


