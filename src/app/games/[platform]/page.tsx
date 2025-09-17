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
  const platformObj = (platforms as any).platforms as Record<string, { name: string; meta?: any }>;
  const platformRecord = platformObj[platform];
  const games = Array.from(new Map(entries.filter((e) => e.platform.slug === platform).map((e) => [e.game.slug, e.game])).values());

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{platformRecord?.name ?? decodeURIComponent(platform)}</h1>
      {platformRecord?.meta && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-foreground">Metadata</h2>
          <pre className="mt-2 overflow-x-auto rounded bg-muted p-3 text-xs text-foreground">{JSON.stringify(platformRecord.meta, null, 2)}</pre>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Games</h2>
        <ul className="mt-3 list-disc pl-6 text-sm">
          {games.map((g) => (
            <li key={g.slug}>
              <Link className="text-primary hover:underline" href={`/games/${platform}/${g.slug}`}>{g.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


