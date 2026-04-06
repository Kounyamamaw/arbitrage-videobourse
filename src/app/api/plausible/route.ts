import { NextResponse } from 'next/server';

const BASE = 'https://api.umami.is/v1';

export async function GET() {
  const key       = process.env.UMAMI_API_KEY;
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  if (!key || !websiteId) {
    return NextResponse.json(
      { error: 'UMAMI_API_KEY ou NEXT_PUBLIC_UMAMI_WEBSITE_ID non configurés' },
      { status: 500 }
    );
  }

  const headers = { 'x-umami-api-key': key };

  const now          = Date.now();
  const startOfDay   = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);

  const qs = (start: number, end: number) =>
    `startAt=${start}&endAt=${end}`;

  try {
    const [statsDay, statsMonth, pages, sources] = await Promise.all([
      fetch(`${BASE}/websites/${websiteId}/stats?${qs(startOfDay.getTime(), now)}`,   { headers }).then(r => r.json()),
      fetch(`${BASE}/websites/${websiteId}/stats?${qs(startOfMonth.getTime(), now)}`, { headers }).then(r => r.json()),
      fetch(`${BASE}/websites/${websiteId}/metrics?${qs(startOfMonth.getTime(), now)}&type=url&limit=8`,      { headers }).then(r => r.json()),
      fetch(`${BASE}/websites/${websiteId}/metrics?${qs(startOfMonth.getTime(), now)}&type=referrer&limit=8`, { headers }).then(r => r.json()),
    ]);

    // Umami /stats response shape: { visitors: { value }, pageviews: { value }, sessions: { value }, bounces: { value }, totaltime: { value } }
    return NextResponse.json({
      visitors:       statsDay.visitors?.value    ?? statsDay.visitors    ?? 0,
      pageviews:      statsDay.pageviews?.value   ?? statsDay.pageviews   ?? 0,
      sessions:       statsDay.sessions?.value    ?? statsDay.sessions    ?? 0,
      visitorsMonth:  statsMonth.visitors?.value  ?? statsMonth.visitors  ?? 0,
      pageviewsMonth: statsMonth.pageviews?.value ?? statsMonth.pageviews ?? 0,
      sessionsMonth:  statsMonth.sessions?.value  ?? statsMonth.sessions  ?? 0,
      bounceRate:     statsMonth.bounces?.value   ?? statsMonth.bounces   ?? 0,
      visitDuration:  Math.round((statsMonth.totaltime?.value ?? statsMonth.totaltime ?? 0) / Math.max(statsMonth.sessions?.value ?? statsMonth.sessions ?? 1, 1)),
      // /metrics returns array of { x: string, y: number }
      topPages:   (Array.isArray(pages)   ? pages   : []).map((r: any) => ({ page: r.x, visitors: r.y })),
      topSources: (Array.isArray(sources) ? sources : []).map((r: any) => ({ source: r.x || 'Direct', visitors: r.y })),
    });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur Umami API' }, { status: 500 });
  }
}