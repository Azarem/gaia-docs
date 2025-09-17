import Link from 'next/link';
import gameroms from '@/generated/gameroms.json';

export const dynamic = 'force-static';

type Entry = {
  platform: { slug: string; name: string | null };
  game: { slug: string; name: string | null };
  region: { slug: string; name: string | null };
  path: string;
  branch: { files: { key: string; crc: number | null; name: string | null }[] };
};

export async function generateStaticParams() {
  const entries = (gameroms as any).entries as Entry[];
  const params: { platform: string; game: string; region: string; fileKey: string }[] = [];
  for (const e of entries) {
    for (const f of e.branch.files) {
      params.push({ platform: e.platform.slug, game: e.game.slug, region: e.region.slug, fileKey: encodeURIComponent(f.key) });
    }
  }
  return params;
}

function getEntryAndFile(platform: string, game: string, region: string, fileKey: string) {
  const entries = (gameroms as any).entries as Entry[];
  const entry = entries.find((e) => e.platform.slug === platform && e.game.slug === game && e.region.slug === region);
  if (!entry) return { entry: null, file: null };
  const decodedKey = decodeURIComponent(fileKey);
  const file = entry.branch.files.find((f) => f.key === decodedKey) ?? null;
  return { entry, file };
}

export default async function FileDetailPage({ params }: { params: Promise<{ platform: string; game: string; region: string; fileKey: string }> }) {
  const { platform, game, region, fileKey } = await params;
  const { entry, file } = getEntryAndFile(platform, game, region, fileKey);
  if (!entry || !file) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-bold">File not found</h1>
        <div className="mt-6"><Link className="text-primary hover:underline" href={`/games/${platform}/${game}/${region}/files`}>Back to files</Link></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{file.key}</h1>
      <div className="mt-2 text-sm text-muted-foreground">CRC: <span className="font-mono">{file.crc ?? '—'}</span></div>
      <div className="mt-1 text-sm text-muted-foreground">Name: {file.name ?? '—'}</div>

      <div className="mt-6"><Link className="text-primary hover:underline" href={`/${entry.path}/files`}>Back to files</Link></div>
    </div>
  );
}


