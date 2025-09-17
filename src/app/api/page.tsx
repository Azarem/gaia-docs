import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import schema from '@/generated/schema.json';

type FieldDoc = {
  name: string;
  type: string;
  isOptional?: boolean;
  isList?: boolean;
  isRelationType?: boolean;
  attributes?: {
    isId?: boolean;
    isUnique?: boolean;
    isUpdatedAt?: boolean;
    defaultValue?: string | null;
    relation?: {
      name: string | null;
      fields: string[];
      references: string[];
    } | null;
  };
};

type ModelDoc = {
  name: string;
  fields: FieldDoc[];
  uniques?: { fields: string[] }[];
  indexes?: { fields: string[] }[];
};

function renderTypeCell(field: FieldDoc) {
  const text = field.type + (field.isList ? '[]' : '') + (field.isOptional ? '?' : '');
  if (field.isRelationType) {
    return (
      <Link className="text-primary hover:underline" href={`/api/${field.type}`}>{text}</Link>
    );
  }
  return text;
}

export const dynamic = 'force-static';

export default function APIReferencePage() {
  const models = (schema as any).models as ModelDoc[];
  const supabaseBase = 'https://adwobxutnpmjbmhdxrzx.supabase.co/rest/v1';

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Public API & Schema
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          This site documents the public Supabase REST API and the underlying Prisma schema
          used by GaiaLabs. All endpoints are powered by PostgREST with Row Level Security.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-3xl">
        <div className="rounded-lg border border-border p-8">
          <h2 className="text-xl font-semibold text-foreground">Base URL</h2>
          <div className="mt-2 rounded-lg bg-muted p-4">
            <code className="text-sm text-foreground">
              {supabaseBase}
            </code>
          </div>
          <h3 className="mt-6 text-lg font-semibold text-foreground">Authentication</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the publishable anon key in both <code>apikey</code> and <code>Authorization</code> headers.
          </p>
          <div className="mt-3 rounded-lg bg-muted p-4">
            <code className="text-sm text-foreground">
              curl &quot;{supabaseBase}/Project&quot; \<br />
              &nbsp;&nbsp;-H &quot;apikey: sb_publishable_uBZdKmgGql5sDNGpj1DVMQ_opZ2V4kV&quot; \<br />
              &nbsp;&nbsp;-H &quot;Authorization: Bearer sb_publishable_uBZdKmgGql5sDNGpj1DVMQ_opZ2V4kV&quot;
            </code>
          </div>
          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link href={`https://adwobxutnpmjbmhdxrzx.supabase.co/rest/v1/Project?apikey=sb_publishable_uBZdKmgGql5sDNGpj1DVMQ_opZ2V4kV`} target="_blank" rel="noopener noreferrer">
                Open Example Response
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-7xl">
        <h2 className="text-2xl font-bold text-foreground">Schema Models</h2>
        <p className="mt-2 text-muted-foreground">Generated from the canonical Prisma schema at build-time.</p>
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {models.map((m) => (
            <div key={m.name} className="rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{m.name}</h3>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/api/${m.name}`}>View</Link>
                </Button>
              </div>
              <div className="mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-1 pr-4">Field</th>
                      <th className="py-1 pr-4">Type</th>
                      <th className="py-1">Attributes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.fields.slice(0, 6).map((f) => (
                      <tr key={f.name} className="border-t border-border/50">
                        <td className="py-1 pr-4 font-mono">{f.name}</td>
                        <td className="py-1 pr-4 font-mono text-muted-foreground">{renderTypeCell(f)}</td>
                        <td className="py-1">
                          <div className="flex flex-wrap gap-1">
                            {f.attributes?.isId && <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">@id</Badge>}
                            {f.attributes?.isUnique && <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">@unique</Badge>}
                            {f.attributes?.isUpdatedAt && <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">@updatedAt</Badge>}
                            {f.attributes?.relation && <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300">@relation</Badge>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-3xl">
        <div className="rounded-lg border border-border p-8">
          <h2 className="text-xl font-semibold text-foreground">Filtering & Embedding</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Endpoints support PostgREST filtering (e.g. <code>?select=*,Game(*)</code>, <code>?name=eq.Illusion%20of%20Gaia%3A%20Retranslated</code>), ordering (<code>&order=updatedAt.desc</code>), and pagination (<code>&limit=20&offset=0</code>).
          </p>
          <div className="mt-3 rounded-lg bg-muted p-4">
            <code className="text-sm text-foreground">
              curl &quot;{supabaseBase}/Project?select=*&order=updatedAt.desc&quot; \<br />
              &nbsp;&nbsp;-H &quot;apikey: sb_publishable_uBZdKmgGql5sDNGpj1DVMQ_opZ2V4kV&quot; \<br />
              &nbsp;&nbsp;-H &quot;Authorization: Bearer sb_publishable_uBZdKmgGql5sDNGpj1DVMQ_opZ2V4kV&quot;
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
