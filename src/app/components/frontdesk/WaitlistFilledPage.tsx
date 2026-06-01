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
  fills:  "#6366f1",
  outreach: "#cbd5e1",
  sms:    "#4ade80",
  email:  "#60a5fa",
  voice:  "#fb923c",
  types:  ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8"],
};

// ─── Data ────────────────────────────────────────────────────────────────────

const MONTHLY_DATA = [
  { month: "Dec", filled: 48,  sent: 182 },
  { month: "Jan", filled: 38,  sent: 148 },
  { month: "Feb", filled: 62,  sent: 224 },
  { month: "Mar", filled: 72,  sent: 268 },
  { month: "Apr", filled: 88,  sent: 318 },
  { month: "May", filled: 79,  sent: 292 },
];

const FILL_TIME_DATA = [
  { bucket: "< 1 hr",   count: 124 },
  { bucket: "1–4 hrs",  count: 98  },
  { bucket: "4–24 hrs", count: 72  },
  { bucket: "> 24 hrs", count: 43  },
];

const APPT_TYPE_DATA = [
  { name: "Cleaning",   value: 134 },
  { name: "Exam",       value: 98  },
  { name: "X-ray",      value: 67  },
  { name: "Extraction", value: 52  },
  { name: "Other",      value: 36  },
];

const CHANNEL_DATA = [
  { channel: "SMS",   sent: 824, responded: 468, filled: 242 },
  { channel: "Email", sent: 612, responded: 188, filled: 98  },
  { channel: "Voice", sent: 196, responded: 112, filled: 47  },
];

// ─── Location table ───────────────────────────────────────────────────────────

type WaitlistLocRow = {
  location: string;
  filled: number;
  sent: number;
  fillRate: string;
  avgFill: string;
};

const LOCATION_ROWS: WaitlistLocRow[] = [
  { location: "San Francisco, CA", filled: 88, sent: 312, fillRate: "28.2%", avgFill: "2.4 hrs" },
  { location: "Austin, TX",        filled: 74, sent: 268, fillRate: "27.6%", avgFill: "2.7 hrs" },
  { location: "New York, NY",      filled: 62, sent: 238, fillRate: "26.1%", avgFill: "3.1 hrs" },
  { location: "Miami, FL",         filled: 54, sent: 204, fillRate: "26.5%", avgFill: "2.9 hrs" },
  { location: "Chicago, IL",       filled: 48, sent: 188, fillRate: "25.5%", avgFill: "3.4 hrs" },
  { location: "Seattle, WA",       filled: 42, sent: 168, fillRate: "25.0%", avgFill: "3.2 hrs" },
  { location: "Denver, CO",        filled: 36, sent: 152, fillRate: "23.7%", avgFill: "3.8 hrs" },
  { location: "Phoenix, AZ",       filled: 30, sent: 134, fillRate: "22.4%", avgFill: "4.1 hrs" },
];

const _lch = createColumnHelper<WaitlistLocRow>();
const LOCATION_COLUMNS: ColumnDef<WaitlistLocRow, unknown>[] = [
  _lch.accessor("location", { id: "location", header: "Location",       size: 200, meta: { settingsLabel: "Location"       }, cell: (i) => i.getValue() }),
  _lch.accessor("filled",   { id: "filled",   header: "Slots filled",   size: 110, meta: { settingsLabel: "Slots filled"   }, cell: (i) => <span className="tabular-nums">{i.getValue() as number}</span> }),
  _lch.accessor("sent",     { id: "sent",     header: "Outreach sent",  size: 120, meta: { settingsLabel: "Outreach sent"  }, cell: (i) => <span className="tabular-nums">{i.getValue() as number}</span> }),
  _lch.accessor("fillRate", { id: "fillRate", header: "Fill rate",      size: 100, meta: { settingsLabel: "Fill rate"      }, enableSorting: false, cell: (i) => (
    <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-400">
      {i.getValue() as string}
    </span>
  )}),
  _lch.accessor("avgFill",  { id: "avgFill",  header: "Avg fill time",  size: 120, meta: { settingsLabel: "Avg fill time"  }, enableSorting: false, cell: (i) => <span className="tabular-nums text-muted-foreground">{i.getValue() as string}</span> }),
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

// ─── Channel performance table ────────────────────────────────────────────────

function ChannelTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-2 text-left font-medium text-muted-foreground">Channel</th>
            <th className="pb-2 text-left font-medium text-muted-foreground">Outreach sent</th>
            <th className="pb-2 text-left font-medium text-muted-foreground">Responded</th>
            <th className="pb-2 text-left font-medium text-muted-foreground">Response rate</th>
            <th className="pb-2 text-left font-medium text-muted-foreground">Slots filled</th>
            <th className="pb-2 text-left font-medium text-muted-foreground">Fill rate</th>
          </tr>
        </thead>
        <tbody>
          {CHANNEL_DATA.map((row) => {
            const responseRate = ((row.responded / row.sent) * 100).toFixed(1);
            const fillRate     = ((row.filled    / row.sent) * 100).toFixed(1);
            const dotColor     = row.channel === "SMS" ? C.sms : row.channel === "Email" ? C.email : C.voice;
            return (
              <tr key={row.channel} className="border-b border-border/50 last:border-0">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: dotColor }} />
                    <span className="text-foreground">{row.channel}</span>
                  </div>
                </td>
                <td className="py-3 tabular-nums text-foreground">{row.sent.toLocaleString()}</td>
                <td className="py-3 tabular-nums text-foreground">{row.responded.toLocaleString()}</td>
                <td className="py-3 tabular-nums text-muted-foreground">{responseRate}%</td>
                <td className="py-3 tabular-nums text-foreground">{row.filled.toLocaleString()}</td>
                <td className="py-3">
                  <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-400">
                    {fillRate}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function WaitlistFilledPage() {
  const [dateRange] = useState("Dec 2025 – May 2026");
  const [locColSheetOpen, setLocColSheetOpen] = useState(false);
  const totalApptTypes = APPT_TYPE_DATA.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MainCanvasViewHeader
        title="Waitlist filled"
        description="Cancellation recovery and waitlist slot outcomes driven by the waitlist agent."
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
              <SummaryMetric label="Slots filled"          value="387"    change="+31.2%" positive />
              <SummaryMetric label="Outreach sent"         value="1.63k"  change="+18.4%" positive />
              <SummaryMetric label="Avg fill time"         value="2.8 hrs" change="-22.1%" positive />
              <SummaryMetric label="Fill rate"             value="23.7%"  change="+6.4%"  positive />
              <SummaryMetric label="Revenue recovered"     value="$48.2K" change="+34.8%" positive />
              <SummaryMetric label="Cancellations saved"   value="312"    change="-8.2%"  positive={false} />
            </div>
          </div>
        </section>

        {/* ── Monthly fills trend ── */}
        <section className="mb-6">
          <ChartCard
            title="Waitlist slots filled — monthly trend"
            legend={<Legend items={[
              { label: "Slots filled",  color: C.fills    },
              { label: "Outreach sent", color: C.outreach },
            ]} />}
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="wl-fillsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.fills} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C.fills} stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                <RcTooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="sent"   stroke={C.outreach} strokeWidth={1.5} fill="none" strokeDasharray="4 3" name="Outreach sent" />
                <Area type="monotone" dataKey="filled" stroke={C.fills}    strokeWidth={2}   fill="url(#wl-fillsGradient)" name="Slots filled" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* ── Time-to-fill + Appointment type ── */}
        <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">

          <ChartCard
            title="Time-to-fill distribution"
            legend={<Legend items={[{ label: "Slots filled", color: C.fills }]} />}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={FILL_TIME_DATA} barSize={40} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                <RcTooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill={C.fills} name="Slots filled" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              56% of waitlist slots filled within 4 hours of cancellation
            </p>
          </ChartCard>

          <ChartCard title="Fills by appointment type">
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={APPT_TYPE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={72}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {APPT_TYPE_DATA.map((_, i) => (
                        <Cell key={i} fill={C.types[i % C.types.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[16px] font-semibold tabular-nums text-foreground">{totalApptTypes}</p>
                  <p className="text-[10px] text-muted-foreground">total</p>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {APPT_TYPE_DATA.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: C.types[i % C.types.length] }} />
                      <span className="text-[12px] text-muted-foreground">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium tabular-nums text-foreground">{d.value}</span>
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {((d.value / totalApptTypes) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </section>

        {/* ── Outreach channel performance ── */}
        <section className="mb-6">
          <ChartCard title="Outreach channel performance">
            <ChannelTable />
          </ChartCard>
        </section>

        {/* ── Waitlist by location (AppDataTable) ── */}
        <section className="mb-6">
          <div className="overflow-hidden rounded-lg border border-border bg-background">
            <div className="flex items-center justify-between px-5 py-[14px]">
              <span className="text-[14px] font-medium tracking-[-0.14px] text-foreground">Waitlist by location</span>
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
            <AppDataTable<WaitlistLocRow>
              tableId="frontdesk.waitlist.location"
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
