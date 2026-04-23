"use client";

import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, Target, Calculator, ArrowUpRight } from "lucide-react";
import { Broker } from "@/lib/brokers";

type Props = {
  broker: Broker;
};

function formatEur(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M€`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k€`;
  return `${n.toFixed(0)}€`;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: number }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      backgroundColor: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "12px 14px", fontSize: 12, minWidth: 180,
    }}>
      <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>An {label}</p>
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
          <span style={{ color: "var(--text-faint)" }}>{p.name}</span>
          <span style={{ fontWeight: 600, color: p.color }}>{formatEur(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function FireDCACalculator({ broker }: Props) {
  const [monthlyAmount, setMonthlyAmount] = useState(300);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [years, setYears] = useState(20);
  const [initialCapital, setInitialCapital] = useState(0);

  // Disclaimer : style spécifique pour Pepperstone
  const isPepperstone = broker.slug === 'pepperstone';
  const disclaimerFontSize = isPepperstone ? 13 : 11;
  const disclaimerColor = isPepperstone ? "var(--text)" : "var(--text-faint)";

  // Estimate annual brokerage cost for this broker
  const estimatedAnnualFees = useMemo(() => {
    const fees = broker.fees?.FR;
    if (!fees) return 0;
    const tier = fees.find((f) => monthlyAmount >= f.min && (f.max === null || monthlyAmount <= f.max));
    if (!tier) return 0;
    const perOrder = tier.type === "flat" ? tier.amount : (monthlyAmount * tier.amount) / 100;
    return perOrder * 12 + (broker.custody_fee || 0);
  }, [broker, monthlyAmount]);

  // Projection data
  const projectionData = useMemo(() => {
    const monthlyRate = annualReturn / 100 / 12;
    const data = [];

    for (let year = 0; year <= years; year++) {
      // With fees
      let capitalWithFees = initialCapital;
      let totalInvested = initialCapital;
      const monthlyFee = estimatedAnnualFees / 12;
      for (let m = 0; m < year * 12; m++) {
        capitalWithFees = capitalWithFees * (1 + monthlyRate) + (monthlyAmount - monthlyFee);
        totalInvested += monthlyAmount;
      }

      // Without fees (benchmark)
      let capitalNoFees = initialCapital;
      for (let m = 0; m < year * 12; m++) {
        capitalNoFees = capitalNoFees * (1 + monthlyRate) + monthlyAmount;
      }

      data.push({
        year,
        "Avec frais": Math.max(0, Math.round(capitalWithFees)),
        "Sans frais": Math.round(capitalNoFees),
        "Capital investi": Math.round(totalInvested),
      });
    }
    return data;
  }, [monthlyAmount, annualReturn, years, initialCapital, estimatedAnnualFees]);

  const finalCapital = projectionData[projectionData.length - 1]?.["Avec frais"] || 0;
  const finalInvested = projectionData[projectionData.length - 1]?.["Capital investi"] || 0;
  const totalGain = finalCapital - finalInvested;
  const feesImpact = (projectionData[projectionData.length - 1]?.["Sans frais"] || 0) - finalCapital;
  const totalFeesOverPeriod = estimatedAnnualFees * years;

  return (
    <div style={{
      backgroundColor: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "24px",
      marginTop: 16,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            backgroundColor: "var(--accent-light)",
            border: "1px solid var(--accent-mid)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Calculator size={18} color="var(--accent)" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
              Simulateur DCA & FIRE
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-faint)" }}>
              Avec les frais réels de {broker.name}
            </p>
          </div>
        </div>
        <a
          href={broker.affiliate_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ padding: "8px 18px", fontSize: 13, gap: 6 }}
        >
          Ouvrir un compte
          <ArrowUpRight size={13} />
        </a>
      </div>

      {/* Sliders */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 20, marginBottom: 24 }}>
        {[
          {
            label: "Versement mensuel",
            value: monthlyAmount,
            setter: setMonthlyAmount,
            min: 50, max: 2000, step: 50,
            format: (v: number) => `${v.toLocaleString("fr-FR")}€`,
            color: "var(--accent)",
          },
          {
            label: "Capital de départ",
            value: initialCapital,
            setter: setInitialCapital,
            min: 0, max: 50000, step: 1000,
            format: (v: number) => v === 0 ? "0€" : `${v.toLocaleString("fr-FR")}€`,
            color: "var(--accent)",
          },
          {
            label: "Rendement annuel estimé",
            value: annualReturn,
            setter: setAnnualReturn,
            min: 1, max: 15, step: 0.5,
            format: (v: number) => `${v}%`,
            color: "var(--positive)",
          },
          {
            label: "Durée de l'investissement",
            value: years,
            setter: setYears,
            min: 1, max: 40, step: 1,
            format: (v: number) => `${v} ans`,
            color: "var(--accent)",
          },
        ].map(({ label, value, setter, min, max, step, format, color }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)" }}>
                {label}
              </span>
              <span style={{ fontSize: 16, fontWeight: 800, color, fontFamily: "var(--font-sora)" }}>
                {format(value)}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => setter(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-faint)", marginTop: 4 }}>
              <span>{format(min)}</span>
              <span>{format(max)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Result cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))", gap: 10, marginBottom: 24 }}>
        {[
          {
            icon: Target,
            label: "Capital final",
            value: formatEur(finalCapital),
            sub: `après ${years} ans`,
            color: "var(--accent)",
            bg: "var(--accent-light)",
            border: "var(--accent-mid)",
          },
          {
            icon: TrendingUp,
            label: "Gain total",
            value: formatEur(totalGain),
            sub: `${((totalGain / Math.max(finalInvested, 1)) * 100).toFixed(0)}% de plus-value`,
            color: "var(--positive)",
            bg: "var(--positive-bg)",
            border: "var(--positive-bg)",
          },
          {
            icon: Calculator,
            label: "Capital investi",
            value: formatEur(finalInvested),
            sub: `${monthlyAmount}€ × ${years * 12} mois`,
            color: "var(--text-muted)",
            bg: "var(--bg)",
            border: "var(--border)",
          },
          {
            icon: ArrowUpRight,
            label: "Impact des frais",
            value: `-${formatEur(feesImpact)}`,
            sub: `${formatEur(totalFeesOverPeriod)} de frais sur ${years} ans`,
            color: "var(--negative)",
            bg: "var(--negative-bg)",
            border: "var(--negative-bg)",
          },
        ].map(({ icon: Icon, label, value, sub, color, bg, border }) => (
          <div key={label} style={{
            padding: "14px 16px", borderRadius: 12,
            backgroundColor: bg, border: `1px solid ${border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Icon size={13} color={color} />
              <span style={{ fontSize: 10, color: "var(--text-faint)" }}>{label}</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "var(--font-sora)", lineHeight: 1 }}>
              {value}
            </p>
            <p style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 4, lineHeight: 1.4 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)", marginBottom: 12 }}>
          Projection de capital
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={projectionData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gradFees" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F7BE8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4F7BE8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradNoFees" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--positive)" stopOpacity={0.1} />
                <stop offset="95%" stopColor="var(--positive)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--border)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="var(--border)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border-light)" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 10, fill: "var(--text-faint)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}a`}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--text-faint)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatEur(v)}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="Capital investi"
              stroke="var(--accent-mid)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="url(#gradInvested)"
            />
            <Area
              type="monotone"
              dataKey="Sans frais"
              stroke="var(--positive)"
              strokeWidth={1.5}
              fill="url(#gradNoFees)"
            />
            <Area
              type="monotone"
              dataKey="Avec frais"
              stroke="#4F7BE8"
              strokeWidth={2.5}
              fill="url(#gradFees)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 10 }}>
          {[
            { color: "#4F7BE8", label: `Avec frais ${broker.name}`, dash: false },
            { color: "var(--positive)", label: "Sans frais (benchmark)", dash: false },
            { color: "var(--accent-mid)", label: "Capital investi", dash: true },
          ].map(({ color, label, dash }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 20, height: 2,
                backgroundColor: color,
                borderRadius: 1,
                backgroundImage: dash ? `repeating-linear-gradient(90deg, ${color} 0, ${color} 4px, transparent 4px, transparent 8px)` : "none",
              }} />
              <span style={{ fontSize: 10, color: "var(--text-faint)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        padding: "10px 14px", borderRadius: 9,
        backgroundColor: "var(--bg)", border: "1px solid var(--border)",
        fontSize: disclaimerFontSize, color: disclaimerColor, lineHeight: 1.55,
      }}>
        Simulation indicative basée sur un taux de rendement constant. Les performances passées ne préjugent pas des performances futures. Les frais utilisés sont ceux de {broker.name} sur le marché français.
      </div>
    </div>
  );
}