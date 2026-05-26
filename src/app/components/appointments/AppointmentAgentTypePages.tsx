import { useMemo, useState } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  Filter,
  Info,
  LayoutGrid,
  List,
  MoreVertical,
  Search,
} from "lucide-react";
import { useProductVertical } from "@/app/context/ProductVerticalContext";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { AppointmentWorkflowCanvas } from "@/app/components/appointments/AppointmentWorkflowCanvas";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { SegmentedToggle } from "@/app/components/ui/segmented-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { cn } from "@/app/components/ui/utils";

// ─── Shared types ─────────────────────────────────────────────────────────────

export type AgentStatus = "running" | "paused" | "draft" | "failed";

export type AgentRow = {
  id: string;
  name: string;
  status: AgentStatus;
  locations: number;
  timeSavedMinutes: number;
  kpi1: number;
  kpi2: number;
};

export interface SummaryKpi {
  title: string;
  value: string;
  delta: string;
  tooltip: string;
}

export interface PageConfig {
  pageTitle: string;
  tableId: string;
  kpi1Header: string;
  kpi2Header: string;
  kpi1Tooltip: string;
  kpi2Tooltip: string;
  formatKpi1: (v: number) => string;
  formatKpi2: (v: number) => string;
  summaryKpis: [SummaryKpi, SummaryKpi, SummaryKpi, SummaryKpi];
  rows: AgentRow[];
  configurationCanvas?: React.ComponentType<{ agentName: string }>;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function statusBadgeClasses(status: AgentStatus): string {
  if (status === "running") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "paused") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "failed") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-muted text-muted-foreground border-border";
}

function statusLabel(status: AgentStatus): string {
  if (status === "running") return "Running";
  if (status === "paused") return "Paused";
  if (status === "failed") return "Failed";
  return "Draft";
}

function formatTimeSaved(minutes: number): string {
  if (minutes === 0) return "—";
  const d = Math.floor(minutes / (60 * 24));
  const h = Math.floor((minutes % (60 * 24)) / 60);
  const m = minutes % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || parts.length === 0) parts.push(`${m}m`);
  return parts.join(" ");
}

function MetricCard({ title, value, delta, tooltip }: SummaryKpi) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline gap-1">
        <p className="font-medium tabular-nums tracking-[-0.48px] text-[24px] leading-[36px] text-foreground">
          {value}
        </p>
        <p className="font-medium text-[12px] leading-[18px] text-emerald-600">{delta}</p>
      </div>
      <div className="mt-2 flex items-center gap-1">
        <p className="text-[13px] leading-[18px] text-muted-foreground">{title}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="flex items-center text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4 shrink-0" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px] text-left text-balance">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function RowActions({ status }: { status: AgentStatus }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Row actions"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-primary"
        >
          <MoreVertical className="h-4 w-4" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem className="text-[13px]">Edit</DropdownMenuItem>
        {status === "running" ? (
          <DropdownMenuItem className="text-[13px]">Pause</DropdownMenuItem>
        ) : null}
        <DropdownMenuItem className="text-[13px]">Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-[13px]">Outcomes</DropdownMenuItem>
        <DropdownMenuItem className="text-[13px]">Logs</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-[13px]">
          View reports
          <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-70" strokeWidth={1.6} absoluteStrokeWidth />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-[13px] text-destructive focus:text-destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Detail view ──────────────────────────────────────────────────────────────

function AgentDetailView({
  agent,
  config,
  onBack,
}: {
  agent: AgentRow;
  config: PageConfig;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"outcomes" | "configuration" | "logs">("outcomes");
  const tabs = [
    { key: "outcomes" as const, label: "Outcomes" },
    { key: "configuration" as const, label: "Configuration" },
    { key: "logs" as const, label: "Logs" },
    { key: "reports" as const, label: "Reports", external: true },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MainCanvasViewHeader
        title={(
          <span className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.6} absoluteStrokeWidth />
            </button>
            <span className="min-w-0 truncate">{agent.name}</span>
            <Badge variant="outline" className={cn("capitalize shrink-0", statusBadgeClasses(agent.status))}>
              {statusLabel(agent.status)}
            </Badge>
          </span>
        )}
        actions={(
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="h-[var(--button-height)] gap-1 rounded-lg text-[13px]">
                Actions
                <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.6} absoluteStrokeWidth />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="text-[13px]" onSelect={() => setActiveTab("configuration")}>Edit</DropdownMenuItem>
              {agent.status === "running" ? (
                <DropdownMenuItem className="text-[13px]">Pause</DropdownMenuItem>
              ) : null}
              <DropdownMenuItem className="text-[13px]">Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[13px] text-destructive focus:text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <div className="shrink-0 px-6 pb-6">
        <div className="inline-flex items-center border-b border-border">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => tab.key !== "reports" && setActiveTab(tab.key)}
                className={cn(
                  "relative flex items-center gap-1 px-4 py-2 text-sm",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
                {tab.external ? <ExternalLink className="h-3 w-3 opacity-70" strokeWidth={1.6} absoluteStrokeWidth /> : null}
                {isActive ? <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "outcomes" ? (
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <div className="flex flex-col rounded-lg border border-border bg-card p-4">
              <p className="font-medium tabular-nums text-[24px] leading-[36px] text-foreground">
                {config.formatKpi1(agent.kpi1)}
              </p>
              <p className="mt-2 text-[13px] text-muted-foreground">{config.kpi1Header}</p>
            </div>
            <div className="flex flex-col rounded-lg border border-border bg-card p-4">
              <p className="font-medium tabular-nums text-[24px] leading-[36px] text-foreground">
                {config.formatKpi2(agent.kpi2)}
              </p>
              <p className="mt-2 text-[13px] text-muted-foreground">{config.kpi2Header}</p>
            </div>
            <div className="flex flex-col rounded-lg border border-border bg-card p-4">
              <p className="font-medium tabular-nums text-[24px] leading-[36px] text-foreground">
                {agent.locations}
              </p>
              <p className="mt-2 text-[13px] text-muted-foreground">Locations covered</p>
            </div>
            <div className="flex flex-col rounded-lg border border-border bg-card p-4">
              <p className="font-medium tabular-nums text-[24px] leading-[36px] text-foreground">
                {formatTimeSaved(agent.timeSavedMinutes)}
              </p>
              <p className="mt-2 text-[13px] text-muted-foreground">Time saved</p>
            </div>
          </div>
          <p className="text-[13px] text-muted-foreground">
            Location-level breakdown is not available in this prototype.
          </p>
        </div>
      ) : null}
      {activeTab === "configuration" ? (
        config.configurationCanvas ? (
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <config.configurationCanvas agentName={agent.name} />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center text-[13px] text-muted-foreground">
            Configuration not available
          </div>
        )
      ) : null}
      {activeTab === "logs" ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 pb-6 text-sm text-muted-foreground">
          Interaction logs are not available in this prototype.
        </div>
      ) : null}
    </div>
  );
}

// ─── Agent library templates ─────────────────────────────────────────────────

type LibraryViewMode = "grid" | "list";

type AgentLibraryTemplate = {
  id: string;
  title: string;
  description: string;
};

const AGENT_LIBRARY_TEMPLATES: AgentLibraryTemplate[] = [
  {
    id: "autonomous",
    title: "Autonomous agent",
    description: "Runs fully autonomously using AI — identifies the right action and executes it without any human approval step.",
  },
  {
    id: "approval-workflow",
    title: "Approval workflow agent",
    description: "Generates the next best action and holds for a human to review and approve before executing.",
  },
  {
    id: "template-based",
    title: "Template-based agent",
    description: "Follows pre-defined rules and message templates, giving you predictable, consistent outputs every time.",
  },
  {
    id: "escalation-rules",
    title: "Escalation rules agent",
    description: "Runs autonomously but applies smart escalation rules — complex or high-risk cases are automatically routed to a human.",
  },
];

function AgentLibraryTemplateCard({ template }: { template: AgentLibraryTemplate }) {
  return (
    <article
      className={cn(
        "group flex h-[196px] flex-col gap-2 overflow-hidden rounded-lg border border-border bg-card p-5",
        "transition-[background-color,border-color] duration-150",
        "hover:border-primary/30 hover:bg-primary/[0.07] dark:hover:bg-primary/15",
      )}
    >
      <h3 className="line-clamp-2 shrink-0 text-[14px] font-medium leading-snug tracking-tight text-foreground">
        {template.title}
      </h3>
      <div className="min-h-0 flex-1 overflow-hidden">
        <p className="line-clamp-4 text-[14px] font-normal leading-relaxed text-muted-foreground group-hover:line-clamp-2">
          {template.description}
        </p>
      </div>
      <div className="flex h-8 shrink-0 items-end">
        <Button
          type="button"
          variant="default"
          size="sm"
          className={cn(
            "pointer-events-none h-8 rounded-md px-3 text-xs font-medium opacity-0 shadow-none",
            "transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100",
          )}
        >
          Use agent
        </Button>
      </div>
    </article>
  );
}

// ─── Generic list page ────────────────────────────────────────────────────────

const colHelper = createColumnHelper<AgentRow>();

export function AppointmentAgentTypePage({ config }: { config: PageConfig }) {
  const { vertical } = useProductVertical();
  const isDental = vertical === "dental";

  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentRow | null>(null);
  const [activeTab, setActiveTab] = useState<"agents" | "library">("agents");
  const [libraryViewMode, setLibraryViewMode] = useState<LibraryViewMode>("grid");

  const columns = useMemo<ColumnDef<AgentRow, unknown>[]>(() => [
    colHelper.accessor("name", {
      id: "agentName",
      header: "Agent name",
      size: 340,
      meta: { settingsLabel: "Agent name" },
      cell: (info) => (
        <button
          type="button"
          onClick={() => setSelectedAgent(info.row.original)}
          className="text-left text-foreground hover:text-primary hover:underline group-hover/table-row:text-primary group-hover/table-row:underline"
        >
          {info.getValue()}
        </button>
      ),
    }),
    colHelper.accessor("status", {
      id: "status",
      header: "Status",
      size: 130,
      meta: { settingsLabel: "Status" },
      cell: (info) => (
        <Badge variant="outline" className={cn("capitalize", statusBadgeClasses(info.getValue()))}>
          {statusLabel(info.getValue())}
        </Badge>
      ),
    }),
    colHelper.accessor("kpi1", {
      id: "kpi1",
      header: config.kpi1Header,
      size: 200,
      meta: { settingsLabel: config.kpi1Header },
      sortingFn: "alphanumeric",
      cell: (info) => (
        <span className="tabular-nums text-foreground">
          {config.formatKpi1(info.getValue())}
        </span>
      ),
    }),
    colHelper.accessor("kpi2", {
      id: "kpi2",
      header: config.kpi2Header,
      size: 190,
      meta: { settingsLabel: config.kpi2Header },
      sortingFn: "alphanumeric",
      cell: (info) => (
        <span className="tabular-nums text-foreground">
          {config.formatKpi2(info.getValue())}
        </span>
      ),
    }),
    colHelper.accessor("locations", {
      id: "locations",
      header: "Locations",
      size: 130,
      meta: { settingsLabel: "Locations" },
      cell: (info) => (
        <button type="button" className="inline-flex items-center gap-1 tabular-nums text-foreground hover:text-primary">
          {info.getValue()}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
      ),
    }),
    colHelper.accessor("timeSavedMinutes", {
      id: "timeSaved",
      header: "Time saved",
      size: 140,
      meta: { settingsLabel: "Time saved" },
      cell: (info) => (
        <span className="tabular-nums text-foreground">{formatTimeSaved(info.getValue())}</span>
      ),
    }),
    colHelper.display({
      id: "rowActions",
      header: "",
      enableSorting: false,
      enableResizing: false,
      size: 72,
      meta: { settingsLabel: "Actions" },
      cell: (info) => (
        <div className="flex w-full justify-end pr-4">
          <RowActions status={info.row.original.status} />
        </div>
      ),
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [config.kpi1Header, config.kpi2Header]);

  if (selectedAgent) {
    return (
      <AgentDetailView
        agent={selectedAgent}
        config={config}
        onBack={() => setSelectedAgent(null)}
      />
    );
  }

  const headerActions = isDental && activeTab === "library" ? (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" size="icon" aria-label="Search library">
        <Search className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
      </Button>
      <SegmentedToggle<LibraryViewMode>
        iconOnly
        ariaLabel="Library view"
        value={libraryViewMode}
        onChange={setLibraryViewMode}
        className="border border-border"
        items={[
          {
            value: "grid",
            label: "Grid view",
            icon: <LayoutGrid className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />,
          },
          {
            value: "list",
            label: "List view",
            icon: <List className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />,
          },
        ]}
      />
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" size="icon" aria-label="Search agents">
        <Search className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
      </Button>
      <Button type="button" className="h-[var(--button-height)] rounded-lg text-[13px]">Create agent</Button>
      <Button type="button" variant="outline" size="icon" aria-label="Filter agents">
        <Filter className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
      </Button>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MainCanvasViewHeader title={config.pageTitle} actions={headerActions} />

      {/* Agents / Library tab bar — dental only */}
      {isDental && (
        <div className="shrink-0 px-6 pb-6">
          <div className="inline-flex items-center border-b border-border">
            {(["agents", "library"] as const).map((tab) => {
              const isActive = activeTab === tab;
              const label = tab === "agents" ? "Agents" : "Library";
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "relative px-4 py-2 text-sm",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                  {isActive && (
                    <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI cards — always shown in non-dental; shown only when Agents tab active in dental */}
      {(!isDental || activeTab === "agents") && (
        <div className="shrink-0 px-6 pb-4 pt-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {config.summaryKpis.map((kpi) => (
              <MetricCard key={kpi.title} {...kpi} />
            ))}
          </div>
        </div>
      )}

      {/* Agent table */}
      {(!isDental || activeTab === "agents") && (
        <div className="min-h-0 flex-1 px-6 pb-6 pt-6">
          <AppDataTable<AgentRow>
            tableId={config.tableId}
            data={config.rows}
            columns={columns}
            initialSorting={[{ id: "kpi1", desc: true }]}
            getRowId={(row) => row.id}
            className="h-full min-h-0 px-0"
            columnSheetTitle="Agent columns"
            hideColumnsButton
            columnSheetOpen={columnSheetOpen}
            onColumnSheetOpenChange={setColumnSheetOpen}
            stickyFirstColumn={false}
            rowDensity="default"
          />
        </div>
      )}

      {/* Library grid — dental only, shown when Library tab active */}
      {isDental && activeTab === "library" && (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-0">
          <div className={cn(
            "gap-3",
            libraryViewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col",
          )}>
            {AGENT_LIBRARY_TEMPLATES.map((template) => (
              <AgentLibraryTemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Workflow canvas wrappers ─────────────────────────────────────────────────

function RecallWorkflowCanvas({ agentName }: { agentName: string }) {
  return <AppointmentWorkflowCanvas agentType="recall" agentName={agentName} />;
}

function TreatmentPlanWorkflowCanvas({ agentName }: { agentName: string }) {
  return <AppointmentWorkflowCanvas agentType="treatment-plan" agentName={agentName} />;
}

function RevenueWorkflowCanvas({ agentName }: { agentName: string }) {
  return <AppointmentWorkflowCanvas agentType="revenue" agentName={agentName} />;
}

// ─── Page data ────────────────────────────────────────────────────────────────

const fmt = {
  count: (v: number) => String(v),
  pct: (v: number) => `${v}%`,
  usd: (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v}`,
};

// ── Scheduling agents ──────────────────────────────────────────────────────────

const SCHEDULING_ROWS: AgentRow[] = [
  { id: "sa-north",     name: "Scheduling agent — North region",  status: "running", locations: 148, timeSavedMinutes: 260, kpi1: 112, kpi2: 96 },
  { id: "sa-east",      name: "Scheduling agent — East region",   status: "running", locations: 143, timeSavedMinutes: 232, kpi1:  98, kpi2: 94 },
  { id: "sa-south",     name: "Scheduling agent — South region",  status: "running", locations: 140, timeSavedMinutes: 221, kpi1:  87, kpi2: 97 },
  { id: "sa-west",      name: "Scheduling agent — West region",   status: "running", locations: 136, timeSavedMinutes: 198, kpi1:  84, kpi2: 93 },
  { id: "sa-midwest",   name: "Scheduling agent — Midwest",       status: "paused",  locations: 128, timeSavedMinutes: 175, kpi1:  76, kpi2: 91 },
  { id: "sa-pacific",   name: "Scheduling agent — Pacific",       status: "running", locations: 122, timeSavedMinutes: 158, kpi1:  71, kpi2: 95 },
  { id: "sa-southwest", name: "Scheduling agent — Southwest",     status: "draft",   locations: 115, timeSavedMinutes:   0, kpi1:  62, kpi2: 89 },
];

const SCHEDULING_CONFIG: PageConfig = {
  pageTitle: "Scheduling agents",
  tableId: "appointments.scheduling-agents.v1",
  kpi1Header: "Appointments scheduled",
  kpi2Header: "Schedule rate",
  kpi1Tooltip: "Total appointments booked autonomously by this agent in the selected period.",
  kpi2Tooltip: "Percentage of incoming scheduling requests successfully converted to confirmed bookings.",
  formatKpi1: fmt.count,
  formatKpi2: fmt.pct,
  summaryKpis: [
    { title: "Appointments scheduled", value: "590",   delta: "+4.1%", tooltip: "Total appointments booked across all active scheduling agents." },
    { title: "Avg. schedule rate",     value: "93.6%", delta: "+1.2%", tooltip: "Average booking conversion rate across all scheduling agents." },
    { title: "Time saved",             value: "22h 4m",delta: "+3.8%", tooltip: "Cumulative staff time saved by automated scheduling this period." },
    { title: "Locations covered",      value: "932",   delta: "+2.0%", tooltip: "Total location-agent combinations actively running." },
  ],
  rows: SCHEDULING_ROWS,
};

export function SchedulingAgentsPage() {
  return <AppointmentAgentTypePage config={SCHEDULING_CONFIG} />;
}

// ── Rescheduling agents ────────────────────────────────────────────────────────

const RESCHEDULING_ROWS: AgentRow[] = [
  { id: "rsa-north",   name: "Rescheduling agent — North region", status: "running", locations: 148, timeSavedMinutes: 165, kpi1: 64, kpi2: 91 },
  { id: "rsa-south",   name: "Rescheduling agent — South region", status: "running", locations: 143, timeSavedMinutes: 148, kpi1: 58, kpi2: 89 },
  { id: "rsa-east",    name: "Rescheduling agent — East region",  status: "running", locations: 140, timeSavedMinutes: 131, kpi1: 52, kpi2: 93 },
  { id: "rsa-west",    name: "Rescheduling agent — West region",  status: "running", locations: 136, timeSavedMinutes: 118, kpi1: 47, kpi2: 88 },
  { id: "rsa-midwest", name: "Rescheduling agent — Midwest",      status: "paused",  locations: 128, timeSavedMinutes: 104, kpi1: 43, kpi2: 86 },
  { id: "rsa-pacific", name: "Rescheduling agent — Pacific",      status: "running", locations: 122, timeSavedMinutes:  91, kpi1: 38, kpi2: 90 },
];

const RESCHEDULING_CONFIG: PageConfig = {
  pageTitle: "Rescheduling agents",
  tableId: "appointments.rescheduling-agents.v1",
  kpi1Header: "Appointments rescheduled",
  kpi2Header: "Completion rate",
  kpi1Tooltip: "Number of appointment changes successfully handled by this agent.",
  kpi2Tooltip: "Percentage of reschedule requests resolved without human escalation.",
  formatKpi1: fmt.count,
  formatKpi2: fmt.pct,
  summaryKpis: [
    { title: "Appointments rescheduled", value: "302",   delta: "+3.5%", tooltip: "Total reschedules handled autonomously across all agents." },
    { title: "Avg. completion rate",     value: "89.5%", delta: "+0.9%", tooltip: "Average rate of reschedules completed without escalation." },
    { title: "Time saved",               value: "10h 57m", delta: "+2.6%", tooltip: "Cumulative staff time saved by automated rescheduling." },
    { title: "Locations covered",        value: "817",   delta: "+1.8%", tooltip: "Total location-agent combinations active for rescheduling." },
  ],
  rows: RESCHEDULING_ROWS,
};

export function ReschedulingAgentsPage() {
  return <AppointmentAgentTypePage config={RESCHEDULING_CONFIG} />;
}

// ── Reminder agents ────────────────────────────────────────────────────────────

const REMINDER_ROWS: AgentRow[] = [
  { id: "ra-north",     name: "Reminder agent — North region", status: "running", locations: 148, timeSavedMinutes: 374, kpi1: 348, kpi2: 87 },
  { id: "ra-south",     name: "Reminder agent — South region", status: "running", locations: 143, timeSavedMinutes: 338, kpi1: 312, kpi2: 84 },
  { id: "ra-east",      name: "Reminder agent — East region",  status: "running", locations: 140, timeSavedMinutes: 322, kpi1: 298, kpi2: 89 },
  { id: "ra-west",      name: "Reminder agent — West region",  status: "running", locations: 136, timeSavedMinutes: 292, kpi1: 271, kpi2: 82 },
  { id: "ra-midwest",   name: "Reminder agent — Midwest",      status: "running", locations: 128, timeSavedMinutes: 264, kpi1: 244, kpi2: 85 },
  { id: "ra-pacific",   name: "Reminder agent — Pacific",      status: "paused",  locations: 122, timeSavedMinutes: 238, kpi1: 219, kpi2: 88 },
  { id: "ra-southwest", name: "Reminder agent — Southwest",    status: "draft",   locations: 115, timeSavedMinutes:   0, kpi1: 187, kpi2: 80 },
];

const REMINDER_CONFIG: PageConfig = {
  pageTitle: "Reminder agents",
  tableId: "appointments.reminder-agents.v1",
  kpi1Header: "Reminders sent",
  kpi2Header: "Appointment show rate",
  kpi1Tooltip: "Total reminder messages dispatched by this agent across all channels.",
  kpi2Tooltip: "Percentage of patients who attended their appointment after receiving a reminder.",
  formatKpi1: fmt.count,
  formatKpi2: fmt.pct,
  summaryKpis: [
    { title: "Reminders sent",          value: "1,879",  delta: "+6.2%", tooltip: "Total reminders dispatched across all active reminder agents." },
    { title: "Avg. show rate",          value: "85.0%",  delta: "+1.4%", tooltip: "Average appointment show rate across agents." },
    { title: "No-shows prevented (est.)", value: "283",  delta: "+5.8%", tooltip: "Estimated appointments salvaged through automated reminders." },
    { title: "Time saved",              value: "28h 8m", delta: "+4.2%", tooltip: "Cumulative staff time saved by automated reminder dispatch." },
  ],
  rows: REMINDER_ROWS,
};

export function ReminderAgentsPage() {
  return <AppointmentAgentTypePage config={REMINDER_CONFIG} />;
}

// ── Pre-visit agents ───────────────────────────────────────────────────────────

const PRE_VISIT_ROWS: AgentRow[] = [
  { id: "pv-northwest", name: "Pre-visit agent — Northwest",    status: "running", locations: 148, timeSavedMinutes: 218, kpi1: 742, kpi2: 81 },
  { id: "pv-pacific",   name: "Pre-visit agent — Pacific",      status: "running", locations: 143, timeSavedMinutes: 196, kpi1: 698, kpi2: 79 },
  { id: "pv-southeast", name: "Pre-visit agent — Southeast",    status: "running", locations: 136, timeSavedMinutes: 183, kpi1: 651, kpi2: 80 },
  { id: "pv-northeast", name: "Pre-visit agent — Northeast",    status: "running", locations: 128, timeSavedMinutes: 171, kpi1: 623, kpi2: 77 },
  { id: "pv-mountain",  name: "Pre-visit agent — Mountain West",status: "paused",  locations: 140, timeSavedMinutes: 142, kpi1: 591, kpi2: 74 },
  { id: "pv-central",   name: "Pre-visit agent — Central",      status: "running", locations: 122, timeSavedMinutes: 158, kpi1: 515, kpi2: 76 },
  { id: "pv-southwest", name: "Pre-visit agent — Southwest",    status: "draft",   locations: 115, timeSavedMinutes:   0, kpi1:   0, kpi2:  0 },
];

const PRE_VISIT_CONFIG: PageConfig = {
  pageTitle: "Pre-visit agents",
  tableId: "appointments.pre-visit-agents.v1",
  kpi1Header: "Forms sent",
  kpi2Header: "Completion rate",
  kpi1Tooltip: "Pre-visit intake forms dispatched to patients ahead of their appointment.",
  kpi2Tooltip: "Percentage of patients who completed their pre-visit forms before arrival.",
  formatKpi1: fmt.count,
  formatKpi2: fmt.pct,
  summaryKpis: [
    { title: "Forms sent",            value: "3,820",  delta: "+8.4%",  tooltip: "Total pre-visit forms dispatched across all active pre-visit agents." },
    { title: "Avg. completion rate",  value: "77.8%",  delta: "+2.1%",  tooltip: "Average rate of patients completing intake forms before their visit." },
    { title: "Front-desk time saved", value: "17h 48m",delta: "+7.6%",  tooltip: "Staff time saved by eliminating in-office form collection and re-entry." },
    { title: "Locations covered",     value: "832",    delta: "+1.5%",  tooltip: "Total location-agent combinations actively running pre-visit workflows." },
  ],
  rows: PRE_VISIT_ROWS,
};

export function PreVisitAgentsPage() {
  return <AppointmentAgentTypePage config={PRE_VISIT_CONFIG} />;
}

// ── Waitlist agents ────────────────────────────────────────────────────────────

const WAITLIST_ROWS: AgentRow[] = [
  { id: "wa-north",   name: "Waitlist agent — North region", status: "running", locations: 148, timeSavedMinutes: 102, kpi1: 38, kpi2: 79 },
  { id: "wa-south",   name: "Waitlist agent — South region", status: "running", locations: 143, timeSavedMinutes:  92, kpi1: 34, kpi2: 76 },
  { id: "wa-east",    name: "Waitlist agent — East region",  status: "running", locations: 140, timeSavedMinutes:  78, kpi1: 29, kpi2: 81 },
  { id: "wa-west",    name: "Waitlist agent — West region",  status: "running", locations: 136, timeSavedMinutes:  68, kpi1: 26, kpi2: 74 },
  { id: "wa-midwest", name: "Waitlist agent — Midwest",      status: "paused",  locations: 128, timeSavedMinutes:  58, kpi1: 22, kpi2: 72 },
  { id: "wa-pacific", name: "Waitlist agent — Pacific",      status: "running", locations: 122, timeSavedMinutes:  48, kpi1: 18, kpi2: 77 },
];

const WAITLIST_CONFIG: PageConfig = {
  pageTitle: "Waitlist agents",
  tableId: "appointments.waitlist-agents.v1",
  kpi1Header: "Waitlist slots filled",
  kpi2Header: "Fill rate",
  kpi1Tooltip: "Cancelled slots successfully filled from the waitlist by this agent.",
  kpi2Tooltip: "Percentage of available waitlist slots converted to booked appointments.",
  formatKpi1: fmt.count,
  formatKpi2: fmt.pct,
  summaryKpis: [
    { title: "Slots filled",        value: "167",   delta: "+5.0%", tooltip: "Total waitlist slots filled across all active waitlist agents." },
    { title: "Avg. fill rate",      value: "76.5%", delta: "+1.6%", tooltip: "Average waitlist-to-booking conversion rate." },
    { title: "Time saved",          value: "7h 26m", delta: "+3.1%", tooltip: "Estimated staff time saved by automated waitlist management." },
    { title: "Locations covered",   value: "797",   delta: "+1.4%", tooltip: "Total active location-agent pairs for waitlist management." },
  ],
  rows: WAITLIST_ROWS,
};

export function WaitlistAgentsPage() {
  return <AppointmentAgentTypePage config={WAITLIST_CONFIG} />;
}

// ── Cancellation agents ────────────────────────────────────────────────────────

const CANCELLATION_ROWS: AgentRow[] = [
  { id: "ca-north",   name: "Cancellation agent — North region", status: "running", locations: 148, timeSavedMinutes: 128, kpi1: 52, kpi2: 68 },
  { id: "ca-south",   name: "Cancellation agent — South region", status: "running", locations: 143, timeSavedMinutes: 114, kpi1: 47, kpi2: 65 },
  { id: "ca-east",    name: "Cancellation agent — East region",  status: "running", locations: 140, timeSavedMinutes: 104, kpi1: 43, kpi2: 71 },
  { id: "ca-west",    name: "Cancellation agent — West region",  status: "running", locations: 136, timeSavedMinutes:  94, kpi1: 39, kpi2: 63 },
  { id: "ca-midwest", name: "Cancellation agent — Midwest",      status: "paused",  locations: 128, timeSavedMinutes:  82, kpi1: 34, kpi2: 62 },
  { id: "ca-pacific", name: "Cancellation agent — Pacific",      status: "running", locations: 122, timeSavedMinutes:  68, kpi1: 28, kpi2: 66 },
];

const CANCELLATION_CONFIG: PageConfig = {
  pageTitle: "Cancellation agents",
  tableId: "appointments.cancellation-agents.v1",
  kpi1Header: "Cancellations handled",
  kpi2Header: "Slot recovery rate",
  kpi1Tooltip: "Total cancellations processed autonomously by this agent.",
  kpi2Tooltip: "Percentage of cancelled slots that were successfully re-filled or re-allocated.",
  formatKpi1: fmt.count,
  formatKpi2: fmt.pct,
  summaryKpis: [
    { title: "Cancellations handled", value: "243",   delta: "+3.8%", tooltip: "Total cancellations processed across all agents." },
    { title: "Avg. slot recovery rate", value: "65.8%", delta: "+2.1%", tooltip: "Average rate at which cancelled slots were recovered." },
    { title: "Time saved",             value: "8h 10m", delta: "+2.9%", tooltip: "Estimated time saved by automating cancellation handling." },
    { title: "Locations covered",      value: "797",   delta: "+1.4%", tooltip: "Total active location-agent pairs for cancellation management." },
  ],
  rows: CANCELLATION_ROWS,
};

export function CancellationAgentsPage() {
  return <AppointmentAgentTypePage config={CANCELLATION_CONFIG} />;
}

// ── Recall agents ──────────────────────────────────────────────────────────────

const RECALL_ROWS: AgentRow[] = [
  { id: "rca-north",   name: "Recall agent — North region", status: "running", locations: 148, timeSavedMinutes: 204, kpi1: 186, kpi2: 28 },
  { id: "rca-south",   name: "Recall agent — South region", status: "running", locations: 143, timeSavedMinutes: 182, kpi1: 164, kpi2: 25 },
  { id: "rca-east",    name: "Recall agent — East region",  status: "running", locations: 140, timeSavedMinutes: 164, kpi1: 148, kpi2: 31 },
  { id: "rca-west",    name: "Recall agent — West region",  status: "running", locations: 136, timeSavedMinutes: 148, kpi1: 132, kpi2: 24 },
  { id: "rca-midwest", name: "Recall agent — Midwest",      status: "paused",  locations: 128, timeSavedMinutes: 134, kpi1: 119, kpi2: 23 },
  { id: "rca-pacific", name: "Recall agent — Pacific",      status: "running", locations: 122, timeSavedMinutes: 118, kpi1: 104, kpi2: 27 },
];

const RECALL_CONFIG: PageConfig = {
  pageTitle: "Recall agents",
  tableId: "appointments.recall-agents.v1",
  kpi1Header: "Recall messages sent",
  kpi2Header: "Booking conversion rate",
  kpi1Tooltip: "Total recall outreach messages dispatched to lapsed or due-for-care patients.",
  kpi2Tooltip: "Percentage of recalled patients who booked a new appointment.",
  formatKpi1: fmt.count,
  formatKpi2: fmt.pct,
  summaryKpis: [
    { title: "Recall messages sent",    value: "853",   delta: "+7.4%", tooltip: "Total recall messages dispatched across all agents." },
    { title: "Avg. conversion rate",    value: "26.3%", delta: "+1.8%", tooltip: "Average booking conversion rate from recall campaigns." },
    { title: "Bookings generated",      value: "224",   delta: "+6.9%", tooltip: "Estimated appointments booked directly from recall outreach." },
    { title: "Time saved",              value: "15h 50m", delta: "+5.1%", tooltip: "Cumulative time saved by automating recall campaigns." },
  ],
  rows: RECALL_ROWS,
  configurationCanvas: RecallWorkflowCanvas,
};

export function RecallAgentsPage() {
  return <AppointmentAgentTypePage config={RECALL_CONFIG} />;
}

// ── Treatment plan agents ──────────────────────────────────────────────────────

const TREATMENT_PLAN_ROWS: AgentRow[] = [
  { id: "tpa-north",   name: "Treatment plan agent — North region", status: "running", locations: 148, timeSavedMinutes: 178, kpi1: 97, kpi2: 64 },
  { id: "tpa-south",   name: "Treatment plan agent — South region", status: "running", locations: 143, timeSavedMinutes: 158, kpi1: 84, kpi2: 61 },
  { id: "tpa-east",    name: "Treatment plan agent — East region",  status: "running", locations: 140, timeSavedMinutes: 142, kpi1: 78, kpi2: 66 },
  { id: "tpa-west",    name: "Treatment plan agent — West region",  status: "running", locations: 136, timeSavedMinutes: 126, kpi1: 71, kpi2: 59 },
  { id: "tpa-midwest", name: "Treatment plan agent — Midwest",      status: "paused",  locations: 128, timeSavedMinutes: 108, kpi1: 64, kpi2: 58 },
  { id: "tpa-pacific", name: "Treatment plan agent — Pacific",      status: "running", locations: 122, timeSavedMinutes:  94, kpi1: 57, kpi2: 62 },
];

const TREATMENT_PLAN_CONFIG: PageConfig = {
  pageTitle: "Treatment plan agents",
  tableId: "appointments.treatment-plan-agents.v1",
  kpi1Header: "Plans dispatched",
  kpi2Header: "Acceptance rate",
  kpi1Tooltip: "Total treatment plans sent to patients by this agent for review and scheduling.",
  kpi2Tooltip: "Percentage of treatment plans accepted and converted to booked appointments.",
  formatKpi1: fmt.count,
  formatKpi2: fmt.pct,
  summaryKpis: [
    { title: "Plans dispatched",    value: "451",   delta: "+4.6%", tooltip: "Total treatment plans sent across all active agents." },
    { title: "Avg. acceptance rate", value: "61.7%", delta: "+1.3%", tooltip: "Average rate at which dispatched plans were accepted." },
    { title: "Treatments scheduled", value: "278",  delta: "+4.1%", tooltip: "Appointments booked from accepted treatment plans." },
    { title: "Time saved",           value: "13h 26m", delta: "+3.4%", tooltip: "Estimated time saved by automating treatment plan follow-up." },
  ],
  rows: TREATMENT_PLAN_ROWS,
  configurationCanvas: TreatmentPlanWorkflowCanvas,
};

export function TreatmentPlanAgentsPage() {
  return <AppointmentAgentTypePage config={TREATMENT_PLAN_CONFIG} />;
}

// ── Revenue agents ─────────────────────────────────────────────────────────────

const REVENUE_ROWS: AgentRow[] = [
  { id: "rev-north",   name: "Revenue agent — North region", status: "running", locations: 148, timeSavedMinutes: 108, kpi1: 42000, kpi2: 28400 },
  { id: "rev-south",   name: "Revenue agent — South region", status: "running", locations: 143, timeSavedMinutes:  94, kpi1: 38200, kpi2: 24100 },
  { id: "rev-east",    name: "Revenue agent — East region",  status: "running", locations: 140, timeSavedMinutes:  82, kpi1: 34800, kpi2: 21900 },
  { id: "rev-west",    name: "Revenue agent — West region",  status: "running", locations: 136, timeSavedMinutes:  72, kpi1: 31400, kpi2: 19200 },
  { id: "rev-midwest", name: "Revenue agent — Midwest",      status: "paused",  locations: 128, timeSavedMinutes:  58, kpi1: 27600, kpi2: 16400 },
  { id: "rev-pacific", name: "Revenue agent — Pacific",      status: "running", locations: 122, timeSavedMinutes:  48, kpi1: 24100, kpi2: 14200 },
];

const REVENUE_CONFIG: PageConfig = {
  pageTitle: "Revenue agents",
  tableId: "appointments.revenue-agents.v1",
  kpi1Header: "Revenue identified",
  kpi2Header: "Revenue recovered",
  kpi1Tooltip: "Total potential revenue surfaced by this agent from lapsed, pending, or unscheduled treatments.",
  kpi2Tooltip: "Revenue successfully recovered through bookings driven by this agent.",
  formatKpi1: fmt.usd,
  formatKpi2: fmt.usd,
  summaryKpis: [
    { title: "Revenue identified", value: "$198.1K", delta: "+8.2%", tooltip: "Total revenue opportunities identified across all agents." },
    { title: "Revenue recovered",  value: "$124.2K", delta: "+7.4%", tooltip: "Revenue successfully recovered through agent-driven bookings." },
    { title: "Recovery rate",      value: "62.7%",   delta: "+0.8%", tooltip: "Percentage of identified revenue that was successfully recovered." },
    { title: "Time saved",         value: "7h 42m",  delta: "+2.8%", tooltip: "Estimated staff time saved by automating revenue tracking and follow-up." },
  ],
  rows: REVENUE_ROWS,
  configurationCanvas: RevenueWorkflowCanvas,
};

export function RevenueAgentsPage() {
  return <AppointmentAgentTypePage config={REVENUE_CONFIG} />;
}
