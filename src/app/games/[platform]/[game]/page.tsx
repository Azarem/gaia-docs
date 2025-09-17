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
  // Unique combinations of platform+game
  const map = new Map<string, { platform: string; game: string }>();
  for (const e of entries) {
    const key = `${e.platform.slug}::${e.game.slug}`;
    if (!map.has(key)) map.set(key, { platform: e.platform.slug, game: e.game.slug });
  }
  return Array.from(map.values());
}

export default async function GameByPlatformPage({ params }: { params: Promise<{ platform: string; game: string }> }) {
  const { platform, game } = await params;
  const entries = (gameroms as any).entries as Entry[];
  const platformObj = (platforms as any).platforms as Record<string, { name: string; meta?: any }>;
  const platformRecord = platformObj[platform];

  const regions = entries.filter((e) => e.platform.slug === platform && e.game.slug === game);
  const gameName = regions[0]?.game.name ?? decodeURIComponent(game);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{gameName} — {platformRecord?.name ?? decodeURIComponent(platform)}</h1>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Available Regions</h2>
        <ul className="mt-3 list-disc pl-6 text-sm">
          {regions.map((e) => (
            <li key={e.region.slug}>
              <Link className="text-primary hover:underline" href={`/${e.path}`}>{e.region.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


