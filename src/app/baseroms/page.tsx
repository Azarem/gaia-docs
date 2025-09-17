import Link from 'next/link';
import baseRomsJson from '@/generated/baseroms.json';

export const dynamic = 'force-static';

type BaseRom = {
  id: string;
  name: string;
  slug: string;
  gameId: string;
  gameRomId: string;
  createdAt: string;
  updatedAt: string;
  activeBranch?: { id: string; name: string | null; version: number | null; fileCount?: number } | null;
};

export default function BaseRomsPage() {
  const baseRomsObj = (baseRomsJson as any).baseRoms as Record<string, BaseRom>;
  const baseRoms = Object.values(baseRomsObj);
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Base ROMs</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">Browse BaseROMs with active branches.</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
        {baseRoms.map((b) => (
          <div key={b.id} className="rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold">
              <Link href={`/baseroms/${b.slug}`} className="hover:underline">{b.name}</Link>
            </h3>
            <div className="mt-2 text-sm text-muted-foreground">Updated {new Date(b.updatedAt).toLocaleDateString()}</div>
            {b.activeBranch && (
              <div className="mt-3 text-sm">Active Branch: <span className="font-mono">{b.activeBranch.name ?? '—'}</span> (v{b.activeBranch.version ?? '—'})</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


