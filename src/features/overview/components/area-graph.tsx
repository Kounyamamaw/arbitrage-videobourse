'use client';
import * as React from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AreaGraph({ data }: { data: { subject: string; value: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Qualité des données</CardTitle>
        <CardDescription>Complétude moyenne par critère — tous intermédiaires</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={250}>
          <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke='var(--border)' />
            <PolarAngleAxis dataKey='subject' tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [`${v}%`, 'Complétude']} />
            <Radar dataKey='value' stroke='var(--primary)' fill='var(--primary)' fillOpacity={0.15} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
