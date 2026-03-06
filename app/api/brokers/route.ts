import { NextRequest, NextResponse } from "next/server";
import brokersData from "@/data/brokers.json";
import { Broker } from "@/lib/brokers";

// @ts-ignore
const brokers = brokersData as any as Broker[];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category    = searchParams.get("category");
  const accountType = searchParams.get("accountType");

  let filtered = brokers;

  if (category && category !== "all") {
    filtered = filtered.filter((b) => b.category === category);
  }

  if (accountType && accountType !== "all") {
    filtered = filtered.filter((b) => b.accounts.includes(accountType));
  }

  return NextResponse.json({
    data:  filtered,
    total: filtered.length,
  });
}
