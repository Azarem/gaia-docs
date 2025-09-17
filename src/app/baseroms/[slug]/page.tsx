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

export async function generateStaticParams() {
  const baseRomsObj = (baseRomsJson as any).baseRoms as Record<string, BaseRom>;
  return Object.keys(baseRomsObj).map((slug) => ({ slug }));
}

export default async function BaseRomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const baseRomsObj = (baseRomsJson as any).baseRoms as Record<string, BaseRom>;
  const baseRom = baseRomsObj[slug];

  if (!baseRom) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-bold">Base ROM not found</h1>
        <div className="mt-6"><Link className="text-primary hover:underline" href="/baseroms">Back to base ROMs</Link></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{baseRom.name}</h1>
      <p className="mt-2 text-muted-foreground">Updated {new Date(baseRom.updatedAt).toLocaleString()}</p>

      <div className="mt-6 rounded-lg border border-border p-4">
        <div className="text-sm">BaseRom ID: <span className="font-mono">{baseRom.id}</span></div>
        <div className="text-sm">Game ID: <span className="font-mono">{baseRom.gameId}</span></div>
        <div className="text-sm">GameRom ID: <span className="font-mono">{baseRom.gameRomId}</span></div>
      </div>

      {baseRom.activeBranch && (
        <div className="mt-6 rounded-lg border border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Active Branch</h2>
          <div className="mt-2 text-sm">Branch: <span className="font-mono">{baseRom.activeBranch.name ?? '—'}</span> (v{baseRom.activeBranch.version ?? '—'})</div>
          <div className="mt-1 text-sm">Files: {baseRom.activeBranch.fileCount ?? '—'}</div>
        </div>
      )}
    </div>
  );
}
