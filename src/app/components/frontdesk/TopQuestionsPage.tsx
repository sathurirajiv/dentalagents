import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RcTooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  CalendarDays, ChevronDown, MoreHorizontal, SlidersHorizontal,
  TrendingUp, TrendingDown,
} from "lucide-react";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Badge } from "@/app/components/ui/badge";

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORY_DATA = [
  { category: "Appointment",        count: 342 },
  { category: "Insurance",          count: 289 },
  { category: "Billing",            count: 224 },
  { category: "Prescription",       count: 198 },
  { category: "Lab Results",        count: 176 },
  { category: "Office Hours",       count: 154 },
  { category: "Referral",           count: 132 },
  { category: "Medication",         count: 108 },
];

const BAR_COLORS = [
  "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd",
  "#818cf8", "#6366f1", "#4f46e5", "#7c3aed",
];

const TOP_QUESTIONS = [
  {
    id: "q1",
    question: "How do I reschedule my appointment?",
    category: "Appointment",
    frequency: 228,
    autoAnswered: true,
    avgTime: "< 1 min",
    trend: "up" as const,
  },
  {
    id: "q2",
    question: "What insurance plans do you accept?",
    category: "Insurance",
    frequency: 196,
    autoAnswered: true,
    avgTime: "< 1 min",
    trend: "up" as const,
  },
  {
    id: "q3",
    question: "How can I view my lab results online?",
    category: "Lab Results",
    frequency: 173,
    autoAnswered: true,
    avgTime: "2 min",
    trend: "stable" as const,
  },
  {
    id: "q4",
    question: "Can I get a referral to a specialist?",
    category: "Referral",
    frequency: 152,
    autoAnswered: false,
    avgTime: "8 min",
    trend: "down" as const,
  },
  {
    id: "q5",
    question: "What are your office hours?",
    category: "Office Hours",
    frequency: 148,
    autoAnswered: true,
    avgTime: "< 1 min",
    trend: "stable" as const,
  },
  {
    id: "q6",
    question: "How do I request a prescription refill?",
    category: "Prescription",
    frequency: 142,
    autoAnswered: false,
    avgTime: "12 min",
    trend: "up" as const,
  },
  {
    id: "q7",
    question: "What's the cost for a teeth cleaning?",
    category: "Billing",
    frequency: 134,
    autoAnswered: true,
    avgTime: "< 1 min",
    trend: "stable" as const,
  },
  {
    id: "q8",
    question: "Do you offer emergency dental services?",
    category: "Appointment",
    frequency: 127,
    autoAnswered: false,
    avgTime: "5 min",
    trend: "up" as const,
  },
  {
    id: "q9",
    question: "How do I check my outstanding balance?",
    category: "Billing",
    frequency: 119,
    autoAnswered: true,
    avgTime: "2 min",
    trend: "down" as const,
  },
  {
    id: "q10",
    question: "Is my procedure covered by insurance?",
    category: "Insurance",
    frequency: 114,
    autoAnswered: false,
    avgTime: "15 min",
    trend: "stable" as const,
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  label, value, change, positive,
}: {
  label: string; value: string; change: string; positive: boolean;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline gap-1.5">
        <p className="text-[24px] font-medium tabular-nums tracking-[-0.48px] leading-[36px] text-foreground">
          {value}
        </p>
        <p className={cn("text-[12px] font-medium", positive ? "text-emerald-600" : "text-red-500")}>
          {change}
        </p>
      </div>
      <p className="mt-1 text-[13px] leading-[18px] text-muted-foreground">{label}</p>
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

function TrendBadge({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up")     return <TrendingUp className="h-3.5 w-3.5 text-green-500" strokeWidth={1.6} absoluteStrokeWidth />;
  if (trend === "down")   return <TrendingDown className="h-3.5 w-3.5 text-red-500" strokeWidth={1.6} absoluteStrokeWidth />;
  return <span className="text-[11px] text-muted-foreground">—</span>;
}

function CategoryBarTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md">
      <p className="mb-1 text-[12px] font-medium text-foreground">{label}</p>
      <p className="text-[12px] text-muted-foreground">Questions: <span className="font-medium text-foreground">{payload[0]?.value}</span></p>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function TopQuestionsPage() {
  const [dateRange] = useState("Mar 28, 2026 – Apr 24, 2026");
  const [searchFilter, setSearchFilter] = useState<string | null>(null);

  const filteredQuestions = searchFilter
    ? TOP_QUESTIONS.filter((q) => q.category === searchFilter)
    : TOP_QUESTIONS;

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MainCanvasViewHeader
        title="Top questions"
        description="Most frequent patient queries handled by the front desk agent."
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

      <div className="flex-1 overflow-y-auto px-6 pb-8 pt-2">

        {/* ── KPIs ── */}
        <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Total questions"   value="1,618" change="+22%" positive />
          <KpiCard label="Auto-answered"     value="68%"   change="+8%"  positive />
          <KpiCard label="Avg resolution"    value="4.2m"  change="-18%" positive />
          <KpiCard label="Recurring queries" value="312"   change="+5%"  positive />
        </section>

        {/* ── Questions by category ── */}
        <section className="mb-6">
          <ChartCard title="Questions by category">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={CATEGORY_DATA}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 80, bottom: 0 }}
                barSize={18}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fontSize: 11, fill: "#888" }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <RcTooltip content={<CategoryBarTooltip />} />
                <Bar dataKey="count" name="Questions" radius={[0, 3, 3, 0]}>
                  {CATEGORY_DATA.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* ── Top questions table ── */}
        <section className="mb-6">
          <ChartCard
            title="Top questions"
            headerRight={(
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background px-2 text-[12px] text-muted-foreground hover:bg-muted"
                  >
                    {searchFilter ?? "All categories"}
                    <ChevronDown className="h-3 w-3" strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem className="text-[13px]" onClick={() => setSearchFilter(null)}>All categories</DropdownMenuItem>
                  {[...new Set(TOP_QUESTIONS.map((q) => q.category))].map((cat) => (
                    <DropdownMenuItem key={cat} className="text-[13px]" onClick={() => setSearchFilter(cat)}>
                      {cat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">Question</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">Category</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Frequency</th>
                    <th className="pb-2 text-center font-medium text-muted-foreground">Auto-answered</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Avg time</th>
                    <th className="pb-2 text-center font-medium text-muted-foreground">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map((q) => (
                    <tr key={q.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 text-foreground">{q.question}</td>
                      <td className="py-3">
                        <Badge variant="outline" className="text-[11px] font-normal">{q.category}</Badge>
                      </td>
                      <td className="py-3 text-right tabular-nums text-foreground">{q.frequency}</td>
                      <td className="py-3 text-center">
                        <span className={cn(
                          "inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
                          q.autoAnswered
                            ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
                        )}>
                          {q.autoAnswered ? "Yes" : "Manual"}
                        </span>
                      </td>
                      <td className="py-3 text-right tabular-nums text-muted-foreground">{q.avgTime}</td>
                      <td className="py-3 text-center">
                        <TrendBadge trend={q.trend} />
                      </td>
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
