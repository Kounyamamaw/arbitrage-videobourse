'use client';
import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function BarGraph({ data }: { data: { name: string; score: number; frais: number }[] }) {
  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Classement des courtiers</CardTitle>
        <CardDescription>Score global et score frais</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={250}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke='var(--border)' />
            <XAxis dataKey='name' tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <YAxis domain={[0, 10]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number, n: string) => [v.toFixed(1), n === 'score' ? 'Score global' : 'Score frais']} />
            <Bar dataKey='score' fill='var(--primary)' radius={[4,4,0,0]} name='score' />
            <Bar dataKey='frais' fill='#2E9E6E' radius={[4,4,0,0]} name='frais' />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
