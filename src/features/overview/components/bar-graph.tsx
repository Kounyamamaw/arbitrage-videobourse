'use client';
import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

type BrokerBar = { name: string; slug: string; score: number; frais: number };

export function BarGraph({ data }: { data: BrokerBar[] }) {
  const router = useRouter();

  const handleClick = (entry: unknown) => {
    const d = entry as { activePayload?: { payload?: BrokerBar }[] };
    const slug = d?.activePayload?.[0]?.payload?.slug;
    if (slug) router.push(`/dashboard/courtiers/${slug}`);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="shrink-0 pb-2">
        <CardTitle>Classement général</CardTitle>
        <CardDescription>Score global et score frais — cliquez pour voir la fiche</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
          >
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              domain={[0, 10]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            />
            <Tooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number, n: string) => [
                v.toFixed(1),
                n === 'score' ? 'Score global' : 'Score frais',
              ]}
            />
            <Bar dataKey="score" fill="var(--primary)" radius={[4, 4, 0, 0]} name="score">
              {data.map((entry) => (
                <Cell key={entry.slug} fill="var(--primary)" style={{ cursor: 'pointer' }} />
              ))}
            </Bar>
            <Bar dataKey="frais" fill="#2E9E6E" radius={[4, 4, 0, 0]} name="frais">
              {data.map((entry) => (
                <Cell key={entry.slug} fill="#2E9E6E" style={{ cursor: 'pointer' }} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
