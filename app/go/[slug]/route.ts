import { NextRequest, NextResponse } from "next/server";
import brokersData from "@/data/brokers.json";
import { Broker } from "@/lib/brokers";

const brokers = brokersData as Broker[];

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const broker = brokers.find((b) => b.slug === params.slug);

  if (!broker) {
    return NextResponse.redirect(new URL("/courtiers", request.url));
  }

  // TODO: Log the click to Supabase here
  // await supabase.from("affiliate_clicks").insert({
  //   broker_id:   broker.id,
  //   source_page: request.headers.get("referer") || "",
  //   device_type: detectDevice(request),
  //   session_id:  request.cookies.get("session_id")?.value || "",
  // });

  console.log(`[Affiliate] Click → ${broker.name} at ${new Date().toISOString()}`);

  return NextResponse.redirect(broker.affiliate_url);
}
