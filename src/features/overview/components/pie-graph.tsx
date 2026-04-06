'use client';
import * as React from 'react';
import { Pie, PieChart, Cell, Label } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const COLORS = ['#4F7BE8', '#2E9E6E', '#E8893F', '#8B5CF6', '#E85D8A', '#14B8A6'];

export function PieGraph({ data }: { data: { category: string; count: number }[] }) {
  const total = React.useMemo(() => data.reduce((acc, cur) => acc + cur.count, 0), [data]);
  const chartConfig = Object.fromEntries(data.map((d, i) => [d.category, { label: d.category, color: COLORS[i % COLORS.length] }]));
  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Répartition par catégorie</CardTitle>
        <CardDescription>Acteurs financiers référencés</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer config={chartConfig} className='mx-auto aspect-square max-h-[250px]'>
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={data} dataKey='count' nameKey='category' innerRadius={60} strokeWidth={5}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              <Label content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                      <tspan x={viewBox.cx} y={viewBox.cy} className='fill-foreground text-3xl font-bold'>{total}</tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className='fill-muted-foreground text-sm'>acteurs</tspan>
                    </text>
                  );
                }
              }} />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
