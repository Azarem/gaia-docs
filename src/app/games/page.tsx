import Link from 'next/link';
import gameroms from '@/generated/gameroms.json';

export const dynamic = 'force-static';

type Entry = {
  platform: { name: string | null; slug: string };
  game: { name: string | null; slug: string };
  region: { name: string | null; slug: string };
  path: string;
  branch: { name: string | null; version: number | null };
};

export default function GamesPage() {
  const entries = (gameroms as any).entries as Entry[];
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Games</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">Browse games with active branch summaries.</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
        {entries.map((e) => (
          <div key={e.game.slug + '/' + e.region.slug} className="rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold">
              <Link href={`/${e.path}`} className="hover:underline">{e.game.name} — {e.region.name} ({e.platform.name})</Link>
            </h3>
            <div className="mt-2 text-sm text-muted-foreground">Branch: <span className="font-mono">{e.branch.name ?? '—'}</span> (v{e.branch.version ?? '—'})</div>
          </div>
        ))}
      </div>
    </div>
  );
}
