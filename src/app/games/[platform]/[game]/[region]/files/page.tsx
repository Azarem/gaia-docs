import Link from 'next/link';
import gameroms from '@/generated/gameroms.json';

export const dynamic = 'force-static';

type Entry = {
  platform: { slug: string; name: string | null };
  game: { slug: string; name: string | null };
  region: { slug: string; name: string | null };
  path: string;
  branch: { files: { key: string; startHex: string | null; endHex: string | null; type: string | null }[] };
};

export async function generateStaticParams() {
  const entries = (gameroms as any).entries as Entry[];
  return entries.map((e) => ({ platform: e.platform.slug, game: e.game.slug, region: e.region.slug }));
}

function getEntry(platform: string, game: string, region: string) {
  const entries = (gameroms as any).entries as Entry[];
  return entries.find((e) => e.platform.slug === platform && e.game.slug === game && e.region.slug === region);
}

export default async function FilesPage({ params }: { params: Promise<{ platform: string; game: string; region: string }> }) {
  const { platform, game, region } = await params;
  const entry = getEntry(platform, game, region);
  if (!entry) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-bold">Files not found</h1>
        <div className="mt-6"><Link className="text-primary hover:underline" href="/games">Back to games</Link></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Files — {entry.game.name} / {entry.region.name}</h1>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-2 pl-4 pr-4">Key</th>
              <th className="py-2 pr-4">Start</th>
              <th className="py-2 pr-4">End</th>
              <th className="py-2 pr-4">Type</th>
            </tr>
          </thead>
          <tbody>
            {entry.branch.files.map((f) => (
              <tr key={f.key} className="border-t border-border/50">
                <td className="py-2 pl-4 pr-4 font-mono">
                  <Link className="text-primary hover:underline" href={`/${entry.path}/files/${encodeURIComponent(f.key)}`}>{f.key}</Link>
                </td>
                <td className="py-2 pr-4 font-mono">{f.startHex ?? '—'}</td>
                <td className="py-2 pr-4 font-mono">{f.endHex ?? '—'}</td>
                <td className="py-2 pr-4">{f.type ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


