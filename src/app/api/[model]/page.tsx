import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
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

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const models = (schema as any).models as ModelDoc[];
  return models.map((m) => ({ model: m.name }));
}

function renderTypeCell(field: FieldDoc) {
  const text = field.type + (field.isList ? '[]' : '') + (field.isOptional ? '?' : '');
  if (field.isRelationType) {
    return (
      <Link className="text-primary hover:underline" href={`/api/${field.type}`}>{text}</Link>
    );
  }
  return text;
}

export default async function ModelPage({ params }: { params: Promise<{ model: string }> }) {
  const { model } = await params;
  const models = (schema as any).models as ModelDoc[];
  const m = models.find((x) => x.name === model);
  if (!m) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-bold">Model not found</h1>
        <p className="mt-2 text-muted-foreground">No model named &quot;{model}&quot; in generated schema.</p>
      </div>
    );
  }

  const endpoint = `https://adwobxutnpmjbmhdxrzx.supabase.co/rest/v1/${m.name}`;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{m.name}</h1>
      <p className="mt-2 text-muted-foreground">
        REST endpoint: <code className="font-mono">{endpoint}</code>
      </p>

      <div className="mt-10 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-2 pl-4 pr-4">Field</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2">Attributes</th>
            </tr>
          </thead>
          <tbody>
            {m.fields.map((f) => (
              <tr key={f.name} className="border-t border-border/50">
                <td className="py-2 pl-4 pr-4 font-mono">{f.name}</td>
                <td className="py-2 pr-4 font-mono text-muted-foreground">{renderTypeCell(f)}</td>
                <td className="py-2">
                  <div className="flex flex-wrap gap-1">
                    {f.attributes?.isId && (
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">@id</Badge>
                    )}
                    {f.attributes?.isUnique && (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">@unique</Badge>
                    )}
                    {f.attributes?.isUpdatedAt && (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">@updatedAt</Badge>
                    )}
                    {f.attributes?.relation && (
                      <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300">@relation</Badge>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground">cURL Example</h2>
        <div className="mt-3 rounded-lg bg-muted p-4">
          <code className="text-sm text-foreground">
            curl &quot;{endpoint}?select=*&quot; \<br />
            &nbsp;&nbsp;-H &quot;apikey: sb_publishable_uBZdKmgGql5sDNGpj1DVMQ_opZ2V4kV&quot; \<br />
            &nbsp;&nbsp;-H &quot;Authorization: Bearer sb_publishable_uBZdKmgGql5sDNGpj1DVMQ_opZ2V4kV&quot;
          </code>
        </div>
      </div>
    </div>
  );
}


