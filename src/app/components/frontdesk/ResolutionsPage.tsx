import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RcTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  CalendarDays, ChevronDown, MoreHorizontal, SlidersHorizontal,
  TrendingDown, TrendingUp,
} from "lucide-react";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

// ─── Chart palette ───────────────────────────────────────────────────────────

const C = {
  resolved:   "#4ade80",
  escalated:  "#fb923c",
  unresponded:"#f87171",
  sms:        "#6366f1",
  email:      "#ec4899",
  call:       "#fbbf24",
  routed:     "#a78bfa",
  // Sankey node colours
  chCalls:    "#d946ef",
  chSMS:      "#6366f1",
  chEmail:    "#38bdf8",
  agSarah:    "#86efac",
  agMike:     "#fde68a",
  agLisa:     "#67e8f9",
  agAdam:     "#c4b5fd",
  stResolved: "#4ade80",
  stRouted:   "#fbbf24",
  stUnresolved:"#f87171",
};

// ─── Data ────────────────────────────────────────────────────────────────────

const BAR_DATA = [
  { month: "Dec 2023", resolved: 380, escalated: 32, unresponded: 22 },
  { month: "Jan 2024", resolved: 200, escalated: 20, unresponded: 14 },
  { month: "Feb",      resolved: 360, escalated: 35, unresponded: 17 },
  { month: "Mar",      resolved: 340, escalated: 42, unresponded: 16 },
  { month: "Apr",      resolved: 165, escalated: 22, unresponded: 11 },
  { month: "May",      resolved: 320, escalated: 40, unresponded: 18 },
];

const CHANNEL_PIE = [
  { name: "SMS",   value: 5000 },
  { name: "Email", value: 1500 },
  { name: "Call",  value: 1400 },
];
const CHANNEL_COLORS = [C.sms, C.email, C.call];

const RESOLUTION_PIE = [
  { name: "Resolved",   value: 72 },
  { name: "Routed",     value: 17.8 },
  { name: "Unresolved", value: 9.8 },
];
const RESOLUTION_COLORS = [C.resolved, C.routed, C.unresponded];

const LOCATION_ROWS = [
  { location: "Atlanta, GA",  resolved: 15, stable: 12, trendDown: 2  },
  { location: "Dallas, TX",   resolved: 22, stable: 23, trendDown: 4  },
  { location: "Chicago, IL",  resolved: 4,  stable: 18, trendDown: 22 },
  { location: "Miami, FL",    resolved: 27, stable: 2,  trendDown: 4  },
  { location: "Phoenix, AZ",  resolved: 19, stable: 9,  trendDown: 10 },
  { location: "Austin, TX",   resolved: 25, stable: 11, trendDown: 12 },
  { location: "Denver, CO",   resolved: 30, stable: 13, trendDown: 14 },
  { location: "Seattle, WA",  resolved: 21, stable: 15, trendDown: 16 },
];

// ─── Sankey (custom SVG) data ─────────────────────────────────────────────────

const SANKEY_TOTAL = 7000;

const CH_NODES = [
  { name: "Calls",  total: 3000, color: C.chCalls },
  { name: "SMS",    total: 2500, color: C.chSMS   },
  { name: "Email",  total: 1500, color: C.chEmail  },
];
const AG_NODES = [
  { name: "Agent Sarah", total: 2400, color: C.agSarah },
  { name: "Agent Mike",  total: 2000, color: C.agMike  },
  { name: "Agent Lisa",  total: 1400, color: C.agLisa  },
  { name: "Agent Adam",  total: 1200, color: C.agAdam  },
];
const ST_NODES = [
  { name: "Resolved",   total: 5200, color: C.stResolved   },
  { name: "Routed",     total: 1200, color: C.stRouted     },
  { name: "Unresolved", total: 600,  color: C.stUnresolved },
];

// [ch][ag] flow values
const CH_TO_AG = [
  [1200, 1000,  800,    0], // Calls
  [ 800, 1000,    0,  700], // SMS
  [ 400,    0,  600,  500], // Email
];

// [ag][st] flow values
const AG_TO_ST = [
  [1800, 400, 200], // Sarah
  [1500, 400, 100], // Mike
  [1000, 200, 200], // Lisa
  [ 900, 200, 100], // Adam
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  label, value, change, positive,
}: {
  label: string; value: string; change: string; positive: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-background p-4">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-[28px] font-semibold tracking-tight text-foreground">{value}</span>
        <span
          className={cn(
            "flex items-center gap-0.5 text-[12px] font-medium",
            positive ? "text-green-600 dark:text-green-400" : "text-red-500",
          )}
        >
          {positive
            ? <TrendingUp className="h-3 w-3" strokeWidth={1.6} absoluteStrokeWidth />
            : <TrendingDown className="h-3 w-3" strokeWidth={1.6} absoluteStrokeWidth />
          }
          {change}
        </span>
      </div>
    </div>
  );
}

function ChartMenuButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem className="text-[13px]">Download CSV</DropdownMenuItem>
        <DropdownMenuItem className="text-[13px]">Download PNG</DropdownMenuItem>
        <DropdownMenuItem className="text-[13px]">View full screen</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ChartCard({
  title, children, headerRight,
}: {
  title: string; children: React.ReactNode; headerRight?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[14px] font-medium tracking-[-0.14px] text-foreground">{title}</span>
        <div className="flex items-center gap-2">
          {headerRight}
          <ChartMenuButton />
        </div>
      </div>
      {children}
    </div>
  );
}

function BarTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; fill: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md">
      <p className="mb-1.5 text-[12px] font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />
          <span className="capitalize">{p.name}:</span>
          <span className="font-medium text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Custom SVG Sankey ────────────────────────────────────────────────────────

type SankeyNode = { name: string; total: number; color: string };

function SankeyDiagram() {
  const SVG_H = 280;
  const SVG_W = 820;
  const PAD = 10;
  const NODE_W = 10;

  function buildLayout(nodes: SankeyNode[]) {
    const gaps = (nodes.length - 1) * PAD;
    const usable = SVG_H - gaps;
    let y = 0;
    return nodes.map((n) => {
      const h = (n.total / SANKEY_TOTAL) * usable;
      const out = { ...n, y, h };
      y += h + PAD;
      return out;
    });
  }

  type LN = ReturnType<typeof buildLayout>[0];

  const ch = buildLayout(CH_NODES);
  const ag = buildLayout(AG_NODES);
  const st = buildLayout(ST_NODES);

  const X1 = 90;  // channel bars
  const X2 = 370; // agent bars
  const X3 = 650; // status bars

  function buildPaths(
    src: LN[], tgt: LN[], flows: number[][], x1: number, x2: number,
  ) {
    const srcUsed = src.map(() => 0);
    const tgtUsed = tgt.map(() => 0);
    const paths: { d: string; color: string }[] = [];
    const cx = (x1 + x2) / 2;

    for (let si = 0; si < src.length; si++) {
      for (let ti = 0; ti < tgt.length; ti++) {
        const v = flows[si][ti];
        if (!v) continue;

        const sh = src[si].h > 0 ? (v / src[si].total) * src[si].h : 0;
        const th = tgt[ti].h > 0 ? (v / tgt[ti].total) * tgt[ti].h : 0;

        const y0 = src[si].y + srcUsed[si];
        const y1 = y0 + sh;
        const y2 = tgt[ti].y + tgtUsed[ti];
        const y3 = y2 + th;

        srcUsed[si] += sh;
        tgtUsed[ti] += th;

        const d = [
          `M ${x1} ${y0}`,
          `C ${cx} ${y0}, ${cx} ${y2}, ${x2} ${y2}`,
          `L ${x2} ${y3}`,
          `C ${cx} ${y3}, ${cx} ${y1}, ${x1} ${y1}`,
          "Z",
        ].join(" ");

        paths.push({ d, color: src[si].color });
      }
    }
    return paths;
  }

  const paths1 = buildPaths(ch, ag, CH_TO_AG, X1 + NODE_W, X2);
  const paths2 = buildPaths(ag, st, AG_TO_ST, X2 + NODE_W, X3);

  const labelStyle: React.SVGProps<SVGTextElement> = {
    fontSize: 11,
    fill: "#888",
    dominantBaseline: "middle",
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H + 28}`}
        style={{ width: "100%", minWidth: 580, height: SVG_H + 28 }}
      >
        {/* Flow paths */}
        {paths1.map((p, i) => (
          <path key={`p1-${i}`} d={p.d} fill={p.color} fillOpacity={0.28} />
        ))}
        {paths2.map((p, i) => (
          <path key={`p2-${i}`} d={p.d} fill={p.color} fillOpacity={0.28} />
        ))}

        {/* Channel nodes + labels */}
        {ch.map((n, i) => (
          <g key={`ch-${i}`}>
            <rect x={X1} y={n.y} width={NODE_W} height={n.h} fill={n.color} rx={2} />
            <text x={X1 - 8} y={n.y + n.h / 2} textAnchor="end" {...labelStyle}>
              {n.name}
            </text>
          </g>
        ))}

        {/* Agent nodes + labels */}
        {ag.map((n, i) => (
          <g key={`ag-${i}`}>
            <rect x={X2} y={n.y} width={NODE_W} height={n.h} fill={n.color} rx={2} />
            <text x={X2 + NODE_W + 6} y={n.y + n.h / 2} textAnchor="start" {...labelStyle}>
              {n.name}
            </text>
          </g>
        ))}

        {/* Status nodes + labels */}
        {st.map((n, i) => (
          <g key={`st-${i}`}>
            <rect x={X3} y={n.y} width={NODE_W} height={n.h} fill={n.color} rx={2} />
            <text x={X3 + NODE_W + 6} y={n.y + n.h / 2} textAnchor="start" {...labelStyle}>
              {n.name}
            </text>
          </g>
        ))}

        {/* Column headers */}
        <text x={X1 + NODE_W / 2} y={SVG_H + 18} textAnchor="middle" fontSize={11} fill="#aaa">Channel</text>
        <text x={X2 + NODE_W / 2} y={SVG_H + 18} textAnchor="middle" fontSize={11} fill="#aaa">Agents</text>
        <text x={X3 + NODE_W / 2} y={SVG_H + 18} textAnchor="middle" fontSize={11} fill="#aaa">Status</text>
      </svg>
    </div>
  );
}

// ─── Donut centre label ───────────────────────────────────────────────────────

function DonutLabel({ value, label }: { value: string; label: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-[22px] font-semibold tracking-tight text-foreground">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function ResolutionsPage() {
  const [dateRange] = useState("Mar 28, 2026 – Apr 24, 2026");

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MainCanvasViewHeader
        title="Resolution"
        actions={(
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-[var(--button-height)] items-center gap-2 rounded-lg border border-border bg-background px-3 text-[13px] text-foreground hover:bg-muted"
                >
                  <CalendarDays className="h-[14px] w-[14px] text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
                  {dateRange}
                  <ChevronDown className="h-3 w-3 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-[13px]">Last 7 days</DropdownMenuItem>
                <DropdownMenuItem className="text-[13px]">Last 30 days</DropdownMenuItem>
                <DropdownMenuItem className="text-[13px]">Last 90 days</DropdownMenuItem>
                <DropdownMenuItem className="text-[13px]">Custom range…</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button type="button" variant="outline" size="icon" aria-label="Filters">
              <SlidersHorizontal className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
            </Button>
          </div>
        )}
      />

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 pb-8 pt-2">

        {/* ── Resolution summary KPIs ── */}
        <section className="mb-6">
          <p className="mb-3 text-[13px] font-medium text-muted-foreground">Resolution summary</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard label="Total Conversations" value="7.9K" change="+36.6%" positive />
            <KpiCard label="Resolution Rate"     value="72%"  change="-40%"  positive={false} />
            <KpiCard label="Routing Rate"        value="17.8%" change="+20%" positive />
            <KpiCard label="Unresolved"          value="9.8%"  change="-10%" positive />
          </div>
        </section>

        {/* ── Conversations overtime ── */}
        <section className="mb-6">
          <ChartCard title="Conversations overtime">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={BAR_DATA} barSize={32} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                />
                <RcTooltip content={<BarTooltip />} />
                <Bar dataKey="resolved"    stackId="a" fill={C.resolved}    name="Resolved"    radius={[0, 0, 0, 0]} />
                <Bar dataKey="escalated"   stackId="a" fill={C.escalated}   name="Escalated"   radius={[0, 0, 0, 0]} />
                <Bar dataKey="unresponded" stackId="a" fill={C.unresponded} name="Unresponded" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="mt-3 flex items-center justify-center gap-6">
              {[
                { label: "Resolved",    color: C.resolved    },
                { label: "Escalated",   color: C.escalated   },
                { label: "Unresponded", color: C.unresponded },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-[11px] text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </section>

        {/* ── Donut charts row ── */}
        <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Conversation by channel */}
          <ChartCard
            title="Conversation by channel"
            headerRight={(
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background px-2 text-[12px] text-muted-foreground hover:bg-muted"
                  >
                    Monthly
                    <ChevronDown className="h-3 w-3" strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem className="text-[13px]">Daily</DropdownMenuItem>
                  <DropdownMenuItem className="text-[13px]">Weekly</DropdownMenuItem>
                  <DropdownMenuItem className="text-[13px]">Monthly</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          >
            {/* Stats row */}
            <div className="mb-4 flex gap-6">
              <div>
                <p className="text-[18px] font-semibold text-foreground">7.9k<span className="ml-1 text-[12px] font-medium text-green-500">+1.3%</span></p>
                <p className="text-[11px] text-muted-foreground">Total conversations</p>
              </div>
              <div>
                <p className="text-[18px] font-semibold text-foreground">5K<span className="ml-1 text-[12px] font-medium text-green-500">+1.3%</span></p>
                <p className="text-[11px] text-muted-foreground">SMS</p>
              </div>
              <div>
                <p className="text-[18px] font-semibold text-foreground">1.5K<span className="ml-1 text-[12px] font-medium text-green-500">+1.3%</span></p>
                <p className="text-[11px] text-muted-foreground">Email</p>
              </div>
              <div>
                <p className="text-[18px] font-semibold text-foreground">1.4k<span className="ml-1 text-[12px] font-medium text-green-500">+1.3%</span></p>
                <p className="text-[11px] text-muted-foreground">Call</p>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="relative">
                <PieChart width={220} height={220}>
                  <Pie
                    data={CHANNEL_PIE}
                    cx={105}
                    cy={105}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {CHANNEL_PIE.map((_, i) => (
                      <Cell key={i} fill={CHANNEL_COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
                <DonutLabel value="7.9k" label="Total conversations" />
              </div>
              {/* Legend */}
              <div className="ml-6 flex flex-col gap-2">
                {CHANNEL_PIE.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: CHANNEL_COLORS[i] }} />
                    <span className="text-[12px] text-muted-foreground">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          {/* Resolution rate */}
          <ChartCard
            title="Resolution rate"
            headerRight={(
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background px-2 text-[12px] text-muted-foreground hover:bg-muted"
                  >
                    Monthly
                    <ChevronDown className="h-3 w-3" strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem className="text-[13px]">Daily</DropdownMenuItem>
                  <DropdownMenuItem className="text-[13px]">Weekly</DropdownMenuItem>
                  <DropdownMenuItem className="text-[13px]">Monthly</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          >
            {/* Stats row */}
            <div className="mb-4 flex gap-6">
              <div>
                <p className="text-[18px] font-semibold text-foreground">72%<span className="ml-1 text-[12px] font-medium text-green-500">+1.3%</span></p>
                <p className="text-[11px] text-muted-foreground">Resolved</p>
              </div>
              <div>
                <p className="text-[18px] font-semibold text-foreground">17.8%<span className="ml-1 text-[12px] font-medium text-green-500">+1.3%</span></p>
                <p className="text-[11px] text-muted-foreground">Routed</p>
              </div>
              <div>
                <p className="text-[18px] font-semibold text-foreground">9.8%</p>
                <p className="text-[11px] text-muted-foreground">Unresolved</p>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="relative">
                <PieChart width={220} height={220}>
                  <Pie
                    data={RESOLUTION_PIE}
                    cx={105}
                    cy={105}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {RESOLUTION_PIE.map((_, i) => (
                      <Cell key={i} fill={RESOLUTION_COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
                <DonutLabel value="72%" label="Resolution rate" />
              </div>
              <div className="ml-6 flex flex-col gap-2">
                {RESOLUTION_PIE.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: RESOLUTION_COLORS[i] }} />
                    <span className="text-[12px] text-muted-foreground">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </section>

        {/* ── Conversation flow across channel ── */}
        <section className="mb-6">
          <ChartCard title="Conversation flow across channel">
            <SankeyDiagram />
          </ChartCard>
        </section>

        {/* ── Conversation across locations ── */}
        <section className="mb-6">
          <ChartCard title="Conversation across locations">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">
                      <button type="button" className="inline-flex items-center gap-1 hover:text-foreground">
                        Location <ChevronDown className="h-3 w-3" strokeWidth={1.6} absoluteStrokeWidth />
                      </button>
                    </th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">
                      <button type="button" className="inline-flex items-center gap-1 hover:text-foreground">
                        Resolved <ChevronDown className="h-3 w-3" strokeWidth={1.6} absoluteStrokeWidth />
                      </button>
                    </th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">
                      <button type="button" className="inline-flex items-center gap-1 hover:text-foreground">
                        Stable <ChevronDown className="h-3 w-3" strokeWidth={1.6} absoluteStrokeWidth />
                      </button>
                    </th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">
                      <button type="button" className="inline-flex items-center gap-1 hover:text-foreground">
                        Trending down <ChevronDown className="h-3 w-3" strokeWidth={1.6} absoluteStrokeWidth />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {LOCATION_ROWS.map((row) => (
                    <tr key={row.location} className="border-b border-border/50 last:border-0">
                      <td className="py-3 text-foreground">{row.location}</td>
                      <td className="py-3 text-right tabular-nums text-foreground">{row.resolved}</td>
                      <td className="py-3 text-right tabular-nums text-foreground">{row.stable}</td>
                      <td className="py-3 text-right tabular-nums text-foreground">{row.trendDown}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </section>

      </div>
    </div>
  );
}
