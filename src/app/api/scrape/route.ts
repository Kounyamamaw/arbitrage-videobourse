import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

// Rotating user-agents to simulate real browsers
const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function fetchPage(url: string): Promise<string | null> {
  const headers = {
    "User-Agent": randomUA(),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "Referer": "https://www.google.fr/",
  };

  // Add human-like delay
  await sleep(400 + Math.random() * 800);

  try {
    const res = await fetch(url, {
      headers,
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractFees(html: string, brokerName: string) {
  const $ = cheerio.load(html);
  const fields: Record<string, string | number> = {};
  let fieldsFound = 0;

  const textContent = $("body").text().toLowerCase();

  // Fee patterns common across French broker sites
  const patterns = [
    { key: "courtage_fr",   regex: /(?:0[,.]99|1[,.]9[05]|2[,.]9[05]|3[,.][89]|4[,.][89])\s*€/gi },
    { key: "courtage_us",   regex: /(?:5[,.]70|9[,.]90|0[,.]50|1\$|1\.00)\s*(?:€|\$|USD)?/gi },
    { key: "change_fee",    regex: /(?:0[,.]25|0[,.]50|1|1[,.]50)\s*%.*?(?:change|conversion|devise)/gi },
    { key: "custody_fee",   regex: /(?:droits?\s+de\s+garde|frais\s+de\s+tenue|custody).*?(?:gratuit|0\s*€|\d+\s*€)/gi },
    { key: "inactivity",    regex: /(?:inactivité|inactif).*?(?:10|15|20)\s*€?\s*\/?\s*(?:mois|an)/gi },
    { key: "deposit_min",   regex: /(?:dépôt\s+(?:initial|minimum)|versement\s+minimum).*?(\d+)\s*€/gi },
  ];

  patterns.forEach(({ key, regex }) => {
    const matches = textContent.match(regex);
    if (matches && matches.length > 0) {
      fields[key] = matches[0].trim();
      fieldsFound++;
    }
  });

  // Look for score/rating elements
  const pea   = textContent.includes("pea");
  const cto   = textContent.includes("cto") || textContent.includes("compte-titres");
  const av    = textContent.includes("assurance-vie") || textContent.includes("assurance vie");

 if (pea) { (fields as any).has_pea = true; fieldsFound++; }
 if (cto) { (fields as any).has_cto = true; fieldsFound++; }
 if (av)  { (fields as any).has_av  = true; fieldsFound++; }

  // Check for logo URL
  const logoUrl = $('meta[property="og:image"]').attr("content") ||
                  $('link[rel="icon"]').attr("href") ||
                  $('link[rel="shortcut icon"]').attr("href") || "";

  return { fields, fieldsFound, logoUrl };
}

function updateBrokersJson(id: string, scrapedData: Record<string, unknown>) {
  try {
    const filePath = path.join(process.cwd(), "data", "brokers.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const brokers = JSON.parse(raw);

    const idx = brokers.findIndex((b: { id: string }) => b.id === id);
    if (idx !== -1) {
      brokers[idx] = {
        ...brokers[idx],
        ...scrapedData,
        last_scraped: new Date().toISOString(),
      };
      fs.writeFileSync(filePath, JSON.stringify(brokers, null, 2), "utf-8");
    }
  } catch {
    // File write may fail in serverless — acceptable
  }
}

export async function POST(req: NextRequest) {
  const { id, name, url } = await req.json();

  if (!id || !url) {
    return NextResponse.json({ error: "Missing id or url" }, { status: 400 });
  }

  const html = await fetchPage(url);

  if (!html) {
    return NextResponse.json({
      id,
      fields_found: 0,
      logo_found: false,
      message: "Could not fetch page (blocked or timeout)",
    });
  }

  const { fields, fieldsFound, logoUrl } = extractFees(html, name);

  // Persist to JSON
  if (fieldsFound > 0) {
    updateBrokersJson(id, {
      scraped_fees: fields,
      logo_url_scraped: logoUrl || undefined,
    });
  }

  return NextResponse.json({
    id,
    fields_found: fieldsFound,
    logo_found: !!logoUrl,
    fields,
  });
}
