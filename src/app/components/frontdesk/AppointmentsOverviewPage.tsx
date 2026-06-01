import { useState } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RcTooltip, ResponsiveContainer,
  ComposedChart, Line, AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import { CalendarDays, ChevronDown, MoreHorizontal, SlidersHorizontal } from "lucide-react";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { Button } from "@/app/components/ui/button";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { cn } from "@/app/components/ui/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

// ─── Palette ─────────────────────────────────────────────────────────────────

const C = {
  booked:     "#4ade80",
  rescheduled:"#60a5fa",
  cancelled:  "#fb923c",
  noshowPrev: "#a78bfa",
  insurance:  "#34d399",
  funnel:     ["#6366f1", "#818cf8", "#4ade80", "#34d399", "#10b981"],
  agent:      "#6366f1",
  human:      "#94a3b8",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtK(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(2)}k`;
  return String(v);
}

// ─── Data ────────────────────────────────────────────────────────────────────

const MONTHS_DATA = [
  { month: "Dec", booked: 280, rescheduled: 68, cancelled: 52, noshowPrev: 38, insVerified: 168 },
  { month: "Jan", booked: 195, rescheduled: 42, cancelled: 38, noshowPrev: 29, insVerified: 124 },
  { month: "Feb", booked: 310, rescheduled: 72, cancelled: 58, noshowPrev: 44, insVerified: 204 },
  { month: "Mar", booked: 340, rescheduled: 76, cancelled: 52, noshowPrev: 48, insVerified: 222 },
  { month: "Apr", booked: 412, rescheduled: 88, cancelled: 68, noshowPrev: 58, insVerified: 280 },
  { month: "May", booked: 305, rescheduled: 72, cancelled: 44, noshowPrev: 58, insVerified: 206 },
];

const REVENUE_DATA = [
  { month: "Dec", agent: 96,  human: 38  },
  { month: "Jan", agent: 62,  human: 30  },
  { month: "Feb", agent: 104, human: 46  },
  { month: "Mar", agent: 114, human: 50  },
  { month: "Apr", agent: 138, human: 60  },
  { month: "May", agent: 102, human: 44  },
];

const REV_SPLIT = [
  { name: "Agent-driven", value: 616 },
  { name: "Human-driven", value: 268 },
];

const FUNNEL_STEPS = [
  { name: "Total inquiries",    value: 3842 },
  { name: "Agent contacted",    value: 3624 },
  { name: "Appointment booked", value: 2847 },
  { name: "Confirmed",          value: 2572 },
  { name: "Attended",           value: 2297 },
];

// ─── Location table ───────────────────────────────────────────────────────────

type LocationRow = {
  location: string;
  booked: number;
  rescheduled: number;
  cancelled: number;
  noshowPrev: number;
  insVerified: number;
};

const LOCATION_ROWS: LocationRow[] = [
  { location: "San Francisco, CA", booked: 312, rescheduled: 72, cancelled: 48, noshowPrev: 44, insVerified: 198 },
  { location: "Austin, TX",        booked: 268, rescheduled: 58, cancelled: 38, noshowPrev: 38, insVerified: 172 },
  { location: "New York, NY",      booked: 224, rescheduled: 52, cancelled: 44, noshowPrev: 32, insVerified: 148 },
  { location: "Miami, FL",         booked: 198, rescheduled: 46, cancelled: 32, noshowPrev: 28, insVerified: 132 },
  { location: "Chicago, IL",       booked: 184, rescheduled: 40, cancelled: 28, noshowPrev: 24, insVerified: 118 },
  { location: "Seattle, WA",       booked: 168, rescheduled: 38, cancelled: 24, noshowPrev: 22, insVerified: 104 },
  { location: "Denver, CO",        booked: 152, rescheduled: 34, cancelled: 22, noshowPrev: 18, insVerified: 96  },
  { location: "Phoenix, AZ",       booked: 136, rescheduled: 30, cancelled: 18, noshowPrev: 16, insVerified: 88  },
];

const _lch = createColumnHelper<LocationRow>();
const LOCATION_COLUMNS: ColumnDef<LocationRow, unknown>[] = [
  _lch.accessor("location",    { id: "location",    header: "Location",            size: 200, meta: { settingsLabel: "Location"           }, cell: (i) => i.getValue() }),
  _lch.accessor("booked",      { id: "booked",      header: "Booked",              size: 96,  meta: { settingsLabel: "Booked"             }, cell: (i) => <span className="tabular-nums">{i.getValue() as number}</span> }),
  _lch.accessor("rescheduled", { id: "rescheduled", header: "Rescheduled",         size: 116, meta: { settingsLabel: "Rescheduled"        }, cell: (i) => <span className="tabular-nums">{i.getValue() as number}</span> }),
  _lch.accessor("cancelled",   { id: "cancelled",   header: "Cancelled",           size: 100, meta: { settingsLabel: "Cancelled"          }, cell: (i) => <span className="tabular-nums">{i.getValue() as number}</span> }),
  _lch.accessor("noshowPrev",  { id: "noshowPrev",  header: "No-shows prevented",  size: 160, meta: { settingsLabel: "No-shows prevented" }, cell: (i) => <span className="tabular-nums">{i.getValue() as number}</span> }),
  _lch.accessor("insVerified", { id: "insVerified", header: "Ins. verified",       size: 110, meta: { settingsLabel: "Ins. verified"      }, cell: (i) => <span className="tabular-nums">{i.getValue() as number}</span> }),
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryMetric({ label, value, change, positive }: {
  label: string; value: string; change: string; positive: boolean;
}) {
  return (
    <div className="flex min-w-[120px] flex-col">
      <div className="flex items-baseline gap-1.5">
        <p className="text-[24px] font-medium tabular-nums tracking-[-0.48px] leading-[36px] text-foreground">
          {value}
        </p>
        <p className={cn("text-[12px] font-medium", positive ? "text-emerald-600" : "text-red-500")}>
          {change}
        </p>
      </div>
      <p className="mt-0.5 text-[13px] leading-[18px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
          <span className="text-[11px] text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, legend, children, headerRight }: {
  title: string; legend?: React.ReactNode; children: React.ReactNode; headerRight?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className={cn("flex items-center justify-between", legend ? "mb-2" : "mb-4")}>
        <span className="text-[14px] font-medium tracking-[-0.14px] text-foreground">{title}</span>
        <div className="flex items-center gap-2">
          {headerRight}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
                <MoreHorizontal className="h-4 w-4" strokeWidth={1.6} absoluteStrokeWidth />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem className="text-[13px]">Download CSV</DropdownMenuItem>
              <DropdownMenuItem className="text-[13px]">Download PNG</DropdownMenuItem>
              <DropdownMenuItem className="text-[13px]">View full screen</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {legend ? <div className="mb-4">{legend}</div> : null}
      {children}
    </div>
  );
}

function ChartTooltip({ active, payload, label, fmtValue }: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string; color: string }[];
  label?: string;
  fmtValue?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const fmt = fmtValue ?? ((v: number) => v.toLocaleString());
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md">
      <p className="mb-1.5 text-[12px] font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ background: p.fill ?? p.color }} />
          <span className="capitalize">{p.name}:</span>
          <span className="font-medium text-foreground">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Booking funnel ───────────────────────────────────────────────────────────

function BookingFunnel() {
  const max = FUNNEL_STEPS[0].value;
  return (
    <div className="space-y-2">
      {FUNNEL_STEPS.map((step, i) => {
        const pct = (step.value / max) * 100;
        const convRate = i === 0 ? null : ((step.value / FUNNEL_STEPS[i - 1].value) * 100).toFixed(1);
        return (
          <div key={step.name} className="flex items-center gap-3">
            <div className="w-40 shrink-0 text-right text-[12px] text-muted-foreground">{step.name}</div>
            <div className="h-9 flex-1 overflow-hidden rounded-sm bg-muted/40">
              <div
                className="flex h-full items-center justify-end rounded-sm pr-3 text-[12px] font-medium text-white transition-all"
                style={{ width: `${pct}%`, background: C.funnel[i] }}
              >
                {step.value.toLocaleString()}
              </div>
            </div>
            <div className="w-14 text-right text-[12px] tabular-nums text-muted-foreground">
              {convRate == null ? "100%" : `${convRate}%`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function AppointmentsOverviewPage() {
  const [dateRange] = useState("Dec 2025 – May 2026");
  const [locColSheetOpen, setLocColSheetOpen] = useState(false);
  const revTotal = REV_SPLIT.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MainCanvasViewHeader
        title="Appointments overview"
        description="Agent-driven appointment outcomes across all channels and locations."
        actions={(
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="inline-flex h-[var(--button-height)] items-center gap-2 rounded-lg border border-border bg-background px-3 text-[13px] text-foreground hover:bg-muted">
                  <CalendarDays className="h-[14px] w-[14px] text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
                  {dateRange}
                  <ChevronDown className="h-3 w-3 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-[13px]">Last 30 days</DropdownMenuItem>
                <DropdownMenuItem className="text-[13px]">Last 90 days</DropdownMenuItem>
                <DropdownMenuItem className="text-[13px]">Last 6 months</DropdownMenuItem>
                <DropdownMenuItem className="text-[13px]">Custom range…</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button type="button" variant="outline" size="icon" aria-label="Filters">
              <SlidersHorizontal className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
            </Button>
          </div>
        )}
      />

      <div className="flex-1 overflow-y-auto px-6 pb-8 pt-2">

        {/* ── Summary ── */}
        <section className="mb-6">
          <div className="rounded-lg border border-border bg-background px-6 py-5">
            <p className="mb-5 text-[13px] font-medium text-foreground">Summary</p>
            <div className="flex flex-wrap gap-x-10 gap-y-5">
              <SummaryMetric label="Total appointments"  value={fmtK(2847)} change="+22.4%" positive />
              <SummaryMetric label="Booked by agent"     value={fmtK(1842)} change="+36.4%" positive />
              <SummaryMetric label="Rescheduled"         value="418"        change="+12.1%" positive />
              <SummaryMetric label="Cancelled"           value="312"        change="-8.2%"  positive={false} />
              <SummaryMetric label="No-shows prevented"  value="275"        change="+28.4%" positive />
              <SummaryMetric label="Insurances verified" value={fmtK(1204)} change="+44.1%" positive />
            </div>
          </div>
        </section>

        {/* ── Appointments breakdown ── */}
        <section className="mb-6">
          <ChartCard
            title="Appointments breakdown over time"
            legend={<Legend items={[
              { label: "Booked",      color: C.booked      },
              { label: "Rescheduled", color: C.rescheduled },
              { label: "Cancelled",   color: C.cancelled   },
            ]} />}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={MONTHS_DATA} barSize={28} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                <RcTooltip content={<ChartTooltip />} />
                <Bar dataKey="booked"      stackId="a" fill={C.booked}      name="Booked"      radius={[0, 0, 0, 0]} />
                <Bar dataKey="rescheduled" stackId="a" fill={C.rescheduled} name="Rescheduled" radius={[0, 0, 0, 0]} />
                <Bar dataKey="cancelled"   stackId="a" fill={C.cancelled}   name="Cancelled"   radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* ── Booking funnel ── */}
        <section className="mb-6">
          <ChartCard title="Booking funnel — agent performance">
            <BookingFunnel />
            <p className="mt-4 text-[11px] text-muted-foreground">
              Conversion from initial inquiry to attended appointment, showing where the agent adds value.
            </p>
          </ChartCard>
        </section>

        {/* ── Revenue ── */}
        <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-[3fr_2fr]">

          {/* Revenue by booking source */}
          <ChartCard
            title="Revenue by booking source"
            legend={<Legend items={[
              { label: `Agent-driven ($616K)`, color: C.agent },
              { label: `Human-driven ($268K)`, color: C.human },
            ]} />}
          >
            <div className="mb-4 flex flex-wrap gap-x-8 gap-y-2 border-b border-border pb-4">
              <div>
                <p className="text-[22px] font-semibold tabular-nums tracking-tight text-foreground">$884K</p>
                <p className="text-[11px] text-muted-foreground">Total revenue</p>
              </div>
              <div>
                <p className="text-[22px] font-semibold tabular-nums tracking-tight text-emerald-600">+34.2%</p>
                <p className="text-[11px] text-muted-foreground">vs prior period</p>
              </div>
              <div>
                <p className="text-[22px] font-semibold tabular-nums tracking-tight text-foreground">$311</p>
                <p className="text-[11px] text-muted-foreground">Avg per appointment</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={REVENUE_DATA} barSize={28} margin={{ top: 4, right: 4, left: -4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}K`} />
                <RcTooltip content={<ChartTooltip fmtValue={(v) => `$${v}K`} />} />
                <Bar dataKey="agent" stackId="r" fill={C.agent} name="Agent-driven" radius={[0, 0, 0, 0]} />
                <Bar dataKey="human" stackId="r" fill={C.human} name="Human-driven" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Revenue split donut */}
          <ChartCard title="Revenue split">
            <div className="flex flex-col items-center gap-4 py-1">
              <div className="relative w-full">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={REV_SPLIT}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={76}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      <Cell fill={C.agent} />
                      <Cell fill={C.human} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[18px] font-semibold tabular-nums text-foreground">$884K</p>
                  <p className="text-[10px] text-muted-foreground">total</p>
                </div>
              </div>

              <div className="w-full space-y-3">
                {REV_SPLIT.map((d, i) => {
                  const pct = ((d.value / revTotal) * 100).toFixed(1);
                  const color = i === 0 ? C.agent : C.human;
                  return (
                    <div key={d.name}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                          <span className="text-[12px] text-muted-foreground">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-medium tabular-nums text-foreground">${d.value}K</span>
                          <span className="text-[11px] tabular-nums text-muted-foreground">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-center text-[11px] text-muted-foreground">
                Agent booking drives <span className="font-medium text-foreground">69.7%</span> of total revenue
              </p>
            </div>
          </ChartCard>
        </section>

        {/* ── No-shows prevented + Insurances verified ── */}
        <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">

          <ChartCard
            title="No-shows prevented"
            legend={<Legend items={[{ label: "No-shows prevented", color: C.noshowPrev }]} />}
          >
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={MONTHS_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                <RcTooltip content={<ChartTooltip />} />
                <Bar dataKey="noshowPrev" fill={C.noshowPrev} name="No-shows prevented" barSize={28} radius={[3, 3, 0, 0]} />
                <Line type="monotone" dataKey="noshowPrev" stroke={C.noshowPrev} strokeWidth={2} dot={false} strokeOpacity={0.5} />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-3 flex items-center gap-6">
              <div>
                <p className="text-[20px] font-semibold tracking-tight text-foreground">275</p>
                <p className="text-[11px] text-muted-foreground">Total prevented</p>
              </div>
              <div>
                <p className="text-[20px] font-semibold tracking-tight text-foreground">9.7%</p>
                <p className="text-[11px] text-muted-foreground">No-show rate (↓ from 14.2%)</p>
              </div>
            </div>
          </ChartCard>

          <ChartCard
            title="Insurances verified"
            legend={<Legend items={[{ label: "Verified", color: C.insurance }]} />}
          >
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={MONTHS_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="insGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.insurance} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C.insurance} stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                <RcTooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="insVerified" stroke={C.insurance} strokeWidth={2} fill="url(#insGradient)" name="Verified" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-3 flex items-center gap-6">
              <div>
                <p className="text-[20px] font-semibold tracking-tight text-foreground">{fmtK(1204)}</p>
                <p className="text-[11px] text-muted-foreground">Total verified</p>
              </div>
              <div>
                <p className="text-[20px] font-semibold tracking-tight text-foreground">94.2%</p>
                <p className="text-[11px] text-muted-foreground">Verification rate</p>
              </div>
            </div>
          </ChartCard>
        </section>

        {/* ── Appointments by location (AppDataTable) ── */}
        <section className="mb-6">
          <div className="overflow-hidden rounded-lg border border-border bg-background">
            <div className="flex items-center justify-between px-5 py-[14px]">
              <span className="text-[14px] font-medium tracking-[-0.14px] text-foreground">Appointments by location</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
                    <MoreHorizontal className="h-4 w-4" strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem className="text-[13px]">Download CSV</DropdownMenuItem>
                  <DropdownMenuItem className="text-[13px]">Download PNG</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <AppDataTable<LocationRow>
              tableId="frontdesk.appts-overview.location"
              data={LOCATION_ROWS}
              columns={LOCATION_COLUMNS}
              className="px-0"
              hideColumnsButton
              columnSheetOpen={locColSheetOpen}
              onColumnSheetOpenChange={setLocColSheetOpen}
              rowDensity="default"
            />
          </div>
        </section>

      </div>
    </div>
  );
}
