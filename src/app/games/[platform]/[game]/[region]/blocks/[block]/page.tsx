import Link from 'next/link';
import gameroms from '@/generated/gameroms.json';

export const dynamic = 'force-static';

type Entry = {
  platform: { slug: string; name: string | null };
  game: { slug: string; name: string | null };
  region: { slug: string; name: string | null };
  path: string;
  branch: { blocks: Record<string, any> };
};

export async function generateStaticParams() {
  const entries = (gameroms as any).entries as Entry[];
  const params: { platform: string; game: string; region: string; block: string }[] = [];
  for (const e of entries) {
    const blocks = Object.keys(e.branch.blocks || {});
    for (const b of blocks) params.push({ platform: e.platform.slug, game: e.game.slug, region: e.region.slug, block: encodeURIComponent(b) });
  }
  return params;
}

function getEntryAndBlock(platform: string, game: string, region: string, blockSlug: string) {
  const entries = (gameroms as any).entries as Entry[];
  const entry = entries.find((e) => e.platform.slug === platform && e.game.slug === game && e.region.slug === region);
  if (!entry) return { entry: null, blockName: null, parts: [] };
  const blockName = decodeURIComponent(blockSlug);
  const raw = entry.branch.blocks?.[blockName];
  const partsEntries = raw?.parts ? Object.entries(raw.parts) : [];
  const sorted = partsEntries.sort((a: any, b: any) => {
    const orderA = a[1].order ?? 0;
    const orderB = b[1].order ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return (a[1].location ?? 0) - (b[1].location ?? 0);
  });
  return { entry, blockName, parts: sorted };
}

function toHex(n: number | null | undefined) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return '0x' + Number(n).toString(16).toUpperCase();
}

export default async function BlockDetailPage({ params }: { params: Promise<{ platform: string; game: string; region: string; block: string }> }) {
  const { platform, game, region, block } = await params;
  const { entry, blockName, parts } = getEntryAndBlock(platform, game, region, block);
  if (!entry || !blockName) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-bold">Block not found</h1>
        <div className="mt-6"><Link className="text-primary hover:underline" href={`/games/${platform}/${game}/${region}/blocks`}>Back to blocks</Link></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{blockName}</h1>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-2 pl-4 pr-4">Part</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Start</th>
              <th className="py-2 pr-4">End</th>
            </tr>
          </thead>
          <tbody>
            {parts.map(([name, p]: any) => {
              const start = p.location;
              const end = Number.isFinite(Number(p.size)) ? (p.location + Math.max(0, p.size - 1)) : null;
              return (
                <tr key={name} className="border-t border-border/50">
                  <td className="py-2 pl-4 pr-4 font-mono">{name}</td>
                  <td className="py-2 pr-4">{p.type ?? '—'}</td>
                  <td className="py-2 pr-4 font-mono">{toHex(start)}</td>
                  <td className="py-2 pr-4 font-mono">{toHex(end)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6"><Link className="text-primary hover:underline" href={`/${entry.path}/blocks`}>Back</Link></div>
    </div>
  );
}


