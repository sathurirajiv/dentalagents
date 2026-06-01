import { useState } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RcTooltip, ResponsiveContainer, PieChart, Pie, Cell,
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
  completed:  "#4ade80",
  attempted:  "#cbd5e1",
  new:        "#6366f1",
  returning:  "#34d399",
  funnel:     ["#6366f1", "#818cf8", "#a78bfa", "#c4b5fd", "#818cf8", "#4ade80"],
  dropoff:    "#f97316",
};

// ─── Data ────────────────────────────────────────────────────────────────────

const MONTHLY_DATA = [
  { month: "Dec", completed: 164, attempted: 198 },
  { month: "Jan", completed: 128, attempted: 162 },
  { month: "Feb", completed: 196, attempted: 234 },
  { month: "Mar", completed: 218, attempted: 258 },
  { month: "Apr", completed: 264, attempted: 308 },
  { month: "May", completed: 238, attempted: 278 },
];

const FUNNEL_STEPS = [
  { name: "Intake link sent", value: 1438, pct: 100  },
  { name: "Link opened",      value: 1284, pct: 89.3 },
  { name: "Form started",     value: 1082, pct: 84.3 },
  { name: "Section 1 done",   value: 948,  pct: 87.6 },
  { name: "Section 2 done",   value: 832,  pct: 87.8 },
  { name: "Submitted",        value: 754,  pct: 90.6 },
];

const PATIENT_TYPE_DATA = [
  { name: "New patient",       value: 428 },
  { name: "Returning patient", value: 326 },
];

const DROPOFF_DATA = [
  { section: "Medical history",   dropoff: 78 },
  { section: "Insurance info",    dropoff: 62 },
  { section: "Consent forms",     dropoff: 48 },
  { section: "Personal info",     dropoff: 24 },
  { section: "Emergency contact", dropoff: 18 },
];

// ─── Location table ───────────────────────────────────────────────────────────

type IntakeLocRow = {
  location: string;
  completed: number;
  attempted: number;
  rate: string;
  avgTime: string;
};

const LOCATION_ROWS: IntakeLocRow[] = [
  { location: "San Francisco, CA", completed: 148, attempted: 184, rate: "80.4%", avgTime: "8.2 min" },
  { location: "Austin, TX",        completed: 124, attempted: 156, rate: "79.5%", avgTime: "8.6 min" },
  { location: "New York, NY",      completed: 106, attempted: 136, rate: "77.9%", avgTime: "9.1 min" },
  { location: "Miami, FL",         completed: 96,  attempted: 122, rate: "78.7%", avgTime: "8.8 min" },
  { location: "Chicago, IL",       completed: 88,  attempted: 114, rate: "77.2%", avgTime: "9.4 min" },
  { location: "Seattle, WA",       completed: 78,  attempted: 102, rate: "76.5%", avgTime: "9.7 min" },
  { location: "Denver, CO",        completed: 66,  attempted: 88,  rate: "75.0%", avgTime: "10.2 min" },
  { location: "Phoenix, AZ",       completed: 48,  attempted: 66,  rate: "72.7%", avgTime: "10.8 min" },
];

const _lch = createColumnHelper<IntakeLocRow>();
const LOCATION_COLUMNS: ColumnDef<IntakeLocRow, unknown>[] = [
  _lch.accessor("location",  { id: "location",  header: "Location",         size: 200, meta: { settingsLabel: "Location"         }, cell: (i) => i.getValue() }),
  _lch.accessor("completed", { id: "completed", header: "Completed",        size: 110, meta: { settingsLabel: "Completed"        }, cell: (i) => <span className="tabular-nums">{i.getValue() as number}</span> }),
  _lch.accessor("attempted", { id: "attempted", header: "Attempted",        size: 110, meta: { settingsLabel: "Attempted"        }, cell: (i) => <span className="tabular-nums">{i.getValue() as number}</span> }),
  _lch.accessor("rate",      { id: "rate",      header: "Completion rate",  size: 130, meta: { settingsLabel: "Completion rate"  }, enableSorting: false, cell: (i) => (
    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
      {i.getValue() as string}
    </span>
  )}),
  _lch.accessor("avgTime",   { id: "avgTime",   header: "Avg time",         size: 100, meta: { settingsLabel: "Avg time"         }, enableSorting: false, cell: (i) => <span className="tabular-nums text-muted-foreground">{i.getValue() as string}</span> }),
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

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; fill: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md">
      <p className="mb-1.5 text-[12px] font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ background: p.fill ?? p.color }} />
          <span className="capitalize">{p.name}:</span>
          <span className="font-medium text-foreground">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Intake funnel ────────────────────────────────────────────────────────────

function IntakeFunnel() {
  const max = FUNNEL_STEPS[0].value;
  return (
    <div className="space-y-2">
      {FUNNEL_STEPS.map((step, i) => {
        const widthPct = (step.value / max) * 100;
        const convRate = i === 0 ? "—" : `${step.pct}%`;
        return (
          <div key={step.name} className="flex items-center gap-3">
            <div className="w-36 shrink-0 text-right text-[12px] text-muted-foreground">{step.name}</div>
            <div className="h-8 flex-1 overflow-hidden rounded-sm bg-muted/40">
              <div
                className="flex h-full items-center justify-end rounded-sm pr-3 text-[12px] font-medium text-white transition-all"
                style={{ width: `${widthPct}%`, background: C.funnel[i] }}
              >
                {step.value.toLocaleString()}
              </div>
            </div>
            <div className="w-12 text-right text-[12px] tabular-nums text-muted-foreground">{convRate}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function IntakesCompletedPage() {
  const [dateRange] = useState("Dec 2025 – May 2026");
  const [locColSheetOpen, setLocColSheetOpen] = useState(false);
  const totalPatients = PATIENT_TYPE_DATA.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MainCanvasViewHeader
        title="Intakes completed"
        description="Patient intake form completion rates and drop-off analysis driven by the pre-visit agent."
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
              <SummaryMetric label="Intakes attempted"     value="1.44k"   change="+24.2%" positive />
              <SummaryMetric label="Intakes completed"     value="754"     change="+18.6%" positive />
              <SummaryMetric label="Completion rate"       value="52.4%"   change="+4.2%"  positive />
              <SummaryMetric label="Avg completion time"   value="8.9 min" change="-11.4%" positive />
              <SummaryMetric label="Auto-populated fields" value="68%"     change="+9.1%"  positive />
              <SummaryMetric label="Pending review"        value="124"     change="+6.8%"  positive={false} />
            </div>
          </div>
        </section>

        {/* ── Completion funnel ── */}
        <section className="mb-6">
          <ChartCard title="Intake completion funnel">
            <IntakeFunnel />
            <p className="mt-4 text-[11px] text-muted-foreground">
              Largest drop-off between link sent and form start (16%). Medical history section has the highest per-section abandonment.
            </p>
          </ChartCard>
        </section>

        {/* ── Monthly trend + Patient type ── */}
        <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">

          <ChartCard
            title="Monthly intake completion trend"
            legend={<Legend items={[
              { label: "Completed", color: C.completed },
              { label: "Attempted", color: C.attempted },
            ]} />}
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ic-completedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.completed} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C.completed} stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                <RcTooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="attempted" stroke={C.attempted} strokeWidth={1.5} fill="none" strokeDasharray="4 3" name="Attempted" />
                <Area type="monotone" dataKey="completed" stroke={C.completed} strokeWidth={2}   fill="url(#ic-completedGrad)" name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Completions by patient type">
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={PATIENT_TYPE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={72}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      <Cell fill={C.new} />
                      <Cell fill={C.returning} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[16px] font-semibold tabular-nums text-foreground">{totalPatients}</p>
                  <p className="text-[10px] text-muted-foreground">total</p>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                {PATIENT_TYPE_DATA.map((d, i) => {
                  const color = i === 0 ? C.new : C.returning;
                  return (
                    <div key={d.name}>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                          <span className="text-[12px] text-muted-foreground">{d.name}</span>
                        </div>
                        <span className="text-[12px] font-medium tabular-nums text-foreground">{d.value}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(d.value / totalPatients) * 100}%`, background: color }}
                        />
                      </div>
                      <p className="mt-0.5 text-right text-[11px] tabular-nums text-muted-foreground">
                        {((d.value / totalPatients) * 100).toFixed(0)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </ChartCard>
        </section>

        {/* ── Drop-off by form section ── */}
        <section className="mb-6">
          <ChartCard
            title="Drop-off by form section"
            legend={<Legend items={[{ label: "Abandoned forms", color: C.dropoff }]} />}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={DROPOFF_DATA}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 120, bottom: 0 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="section"
                  tick={{ fontSize: 11, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                  width={120}
                />
                <RcTooltip content={<ChartTooltip />} />
                <Bar dataKey="dropoff" fill={C.dropoff} name="Drop-offs" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Medical history and insurance sections account for 62% of all form abandonment
            </p>
          </ChartCard>
        </section>

        {/* ── Intakes by location (AppDataTable) ── */}
        <section className="mb-6">
          <div className="overflow-hidden rounded-lg border border-border bg-background">
            <div className="flex items-center justify-between px-5 py-[14px]">
              <span className="text-[14px] font-medium tracking-[-0.14px] text-foreground">Intakes by location</span>
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
            <AppDataTable<IntakeLocRow>
              tableId="frontdesk.intakes.location"
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
