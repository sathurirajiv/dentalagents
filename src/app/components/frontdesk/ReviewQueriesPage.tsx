import { useMemo, useState } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { FunnelSimple } from "@phosphor-icons/react";
import { ChevronDown, Info, Mail, MessageSquare, MoreHorizontal, Phone, Search } from "lucide-react";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import { cn } from "@/app/components/ui/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type QueryStatus = "answered" | "routed" | "escalated" | "unresolved";
type QueryChannel = "chat" | "phone" | "email";

type QueryRow = {
  id: string;
  patientName: string;
  channel: QueryChannel;
  aiSummary: string;
  when: string;
  internalNote: string | null;
  status: QueryStatus;
};

type LocationRow = {
  id: string;
  location: string;
  totalQueries: number | null;
  answered: number | null;
  routed: number | null;
  escalated: number | null;
  unresolved: number | null;
};

// ─── Data ────────────────────────────────────────────────────────────────────

const QUERY_ROWS: QueryRow[] = [
  { id: "q1",  patientName: "Michael Johnson", channel: "chat",  aiSummary: "Patient follow-up inquiries are outside AI's scope",         when: "2 weeks ago",   internalNote: "Follow-up needed on blood pressure — monitor closely",      status: "answered"   },
  { id: "q2",  patientName: "Emily Smith",     channel: "phone", aiSummary: "Insurance verification requests are not handled by AI",       when: "5 hours ago",   internalNote: "Request additional tests for fatigue — possible anemia",     status: "answered"   },
  { id: "q3",  patientName: "Joshua Brown",    channel: "chat",  aiSummary: "Lab test results interpretation is beyond AI's capability",   when: "1 month ago",   internalNote: "Patient reports increased anxiety levels — refer to psych",  status: "routed"     },
  { id: "q4",  patientName: "Sophia Garcia",   channel: "email", aiSummary: "Appointment cancellations cannot be processed by AI",         when: "Yesterday",     internalNote: null,                                                         status: "answered"   },
  { id: "q5",  patientName: "Daniel Martinez", channel: "chat",  aiSummary: "Prescription refills are outside AI's functionality",         when: "Last Friday",   internalNote: "Discuss weight management options — dietary referral",        status: "unresolved" },
  { id: "q6",  patientName: "Ava Rodriguez",   channel: "phone", aiSummary: "Medical history updates are not managed by AI",               when: "3 weeks ago",   internalNote: "Patient experiencing joint pain — evaluate for arthritis",    status: "answered"   },
  { id: "q7",  patientName: "James Wilson",    channel: "phone", aiSummary: "Referral requests are beyond AI's capabilities",              when: "2 days ago",    internalNote: null,                                                         status: "escalated"  },
  { id: "q8",  patientName: "Isabella Lee",    channel: "email", aiSummary: "Patient feedback collection is outside AI's scope",           when: "Last Saturday", internalNote: "Review vaccination history — update required for travel",    status: "answered"   },
  { id: "q9",  patientName: "David Harris",    channel: "email", aiSummary: "Surgical scheduling inquiries cannot be handled by AI",       when: "4 hours ago",   internalNote: "Patient asks about sleep issues — consider sleep study",      status: "answered"   },
  { id: "q10", patientName: "Mia Clark",       channel: "chat",  aiSummary: "Clinical trial information requests are not within AI scope", when: "Last year",     internalNote: null,                                                         status: "escalated"  },
];

const LOCATION_ROWS: LocationRow[] = [
  { id: "l1",  location: "San Francisco, CA", totalQueries: 15,   answered: 15,   routed: 5,    escalated: 2,    unresolved: 8    },
  { id: "l2",  location: "Austin, TX",        totalQueries: 7,    answered: 7,    routed: null,  escalated: 3,    unresolved: null  },
  { id: "l3",  location: "New York, NY",      totalQueries: null, answered: null, routed: 12,   escalated: null, unresolved: 3    },
  { id: "l4",  location: "Miami, FL",         totalQueries: 10,   answered: 10,   routed: 7,    escalated: 5,    unresolved: 15   },
  { id: "l5",  location: "Seattle, WA",       totalQueries: 4,    answered: 4,    routed: null,  escalated: 6,    unresolved: null  },
  { id: "l6",  location: "Chicago, IL",       totalQueries: null, answered: null, routed: 8,    escalated: 7,    unresolved: 7    },
  { id: "l7",  location: "Denver, CO",        totalQueries: 9,    answered: 9,    routed: 20,   escalated: null, unresolved: 12   },
  { id: "l8",  location: "Phoenix, AZ",       totalQueries: 3,    answered: 3,    routed: null,  escalated: 9,    unresolved: null  },
  { id: "l9",  location: "Portland, OR",      totalQueries: 12,   answered: 12,   routed: 15,   escalated: 10,   unresolved: 1    },
  { id: "l10", location: "Orlando, FL",       totalQueries: null, answered: null, routed: 3,    escalated: null, unresolved: 4    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<QueryStatus, string> = {
  answered:   "Answered",
  routed:     "Routed",
  escalated:  "Escalated",
  unresolved: "Unresolved",
};

const STATUS_CLASS: Record<QueryStatus, string> = {
  answered:   "bg-emerald-50 text-emerald-700",
  routed:     "bg-sky-50 text-sky-700",
  escalated:  "bg-amber-50 text-amber-800",
  unresolved: "bg-rose-50 text-rose-700",
};

function ChannelIcon({ channel }: { channel: QueryChannel }) {
  if (channel === "phone") return <Phone className="h-4 w-4 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />;
  if (channel === "email") return <Mail className="h-4 w-4 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />;
  return <MessageSquare className="h-4 w-4 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />;
}

function MetricCard({ value, label, tooltip }: { value: string; label: string; tooltip: string }) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-5">
      <span className="text-[28px] font-medium leading-[40px] tracking-[-0.02em] tabular-nums text-foreground">
        {value}
      </span>
      <div className="mt-2 flex items-center gap-1">
        <span className="text-[13px] leading-[18px] text-muted-foreground">{label}</span>
        <TooltipProvider>
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
        </TooltipProvider>
      </div>
    </div>
  );
}

// ─── Column helpers ───────────────────────────────────────────────────────────

const queryColHelper = createColumnHelper<QueryRow>();
const locationColHelper = createColumnHelper<LocationRow>();

function dash(v: number | null) {
  return v == null ? "—" : v;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ReviewQueriesPage() {
  const [activeTab, setActiveTab] = useState<"all" | "by-location">("all");
  const [statusFilter, setStatusFilter] = useState<QueryStatus | null>(null);
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [locationColumnSheetOpen, setLocationColumnSheetOpen] = useState(false);

  const filteredQueryRows = useMemo(
    () => statusFilter ? QUERY_ROWS.filter((r) => r.status === statusFilter) : QUERY_ROWS,
    [statusFilter],
  );

  const queryColumns = useMemo<ColumnDef<QueryRow, unknown>[]>(() => [
    queryColHelper.accessor("patientName", {
      id: "patient",
      header: "Patients",
      size: 200,
      meta: { settingsLabel: "Patients" },
      cell: (info) => <span className="text-[13px] text-foreground">{info.getValue()}</span>,
    }),
    queryColHelper.accessor("channel", {
      id: "channel",
      header: "Channel",
      size: 90,
      meta: { settingsLabel: "Channel" },
      cell: (info) => (
        <div className="flex items-center">
          <ChannelIcon channel={info.getValue()} />
        </div>
      ),
    }),
    queryColHelper.accessor("aiSummary", {
      id: "aiSummary",
      header: "AI summary",
      size: 340,
      meta: { settingsLabel: "AI summary" },
      cell: (info) => (
        <span className="truncate text-[13px] text-muted-foreground">{info.getValue()}</span>
      ),
    }),
    queryColHelper.accessor("when", {
      id: "when",
      header: "When",
      size: 130,
      meta: { settingsLabel: "When" },
      cell: (info) => <span className="text-[13px] text-foreground">{info.getValue()}</span>,
    }),
    queryColHelper.accessor("internalNote", {
      id: "internalNote",
      header: "Internal note",
      size: 300,
      meta: { settingsLabel: "Internal note" },
      cell: (info) => {
        const v = info.getValue();
        return <span className="truncate text-[13px] text-muted-foreground">{v ?? "—"}</span>;
      },
    }),
    queryColHelper.accessor("status", {
      id: "status",
      header: "Status",
      size: 130,
      meta: { settingsLabel: "Status" },
      cell: (info) => {
        const v = info.getValue();
        return (
          <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium", STATUS_CLASS[v])}>
            {STATUS_LABEL[v]}
          </span>
        );
      },
    }),
  ], []);

  const locationColumns = useMemo<ColumnDef<LocationRow, unknown>[]>(() => [
    locationColHelper.accessor("location", {
      id: "location",
      header: "Location",
      size: 220,
      meta: { settingsLabel: "Location" },
      cell: (info) => <span className="text-[13px] text-foreground">{info.getValue()}</span>,
    }),
    locationColHelper.accessor("totalQueries", {
      id: "totalQueries",
      header: "Total queries",
      size: 150,
      meta: { settingsLabel: "Total queries" },
      sortingFn: "alphanumeric",
      cell: (info) => <span className="tabular-nums text-[13px] text-foreground">{dash(info.getValue())}</span>,
    }),
    locationColHelper.accessor("answered", {
      id: "answered",
      header: "Answered",
      size: 140,
      meta: { settingsLabel: "Answered" },
      sortingFn: "alphanumeric",
      cell: (info) => <span className="tabular-nums text-[13px] text-foreground">{dash(info.getValue())}</span>,
    }),
    locationColHelper.accessor("routed", {
      id: "routed",
      header: "Routed",
      size: 130,
      meta: { settingsLabel: "Routed" },
      sortingFn: "alphanumeric",
      cell: (info) => <span className="tabular-nums text-[13px] text-foreground">{dash(info.getValue())}</span>,
    }),
    locationColHelper.accessor("escalated", {
      id: "escalated",
      header: "Escalated",
      size: 130,
      meta: { settingsLabel: "Escalated" },
      sortingFn: "alphanumeric",
      cell: (info) => <span className="tabular-nums text-[13px] text-foreground">{dash(info.getValue())}</span>,
    }),
    locationColHelper.accessor("unresolved", {
      id: "unresolved",
      header: "Unresolved",
      size: 130,
      meta: { settingsLabel: "Unresolved" },
      sortingFn: "alphanumeric",
      cell: (info) => <span className="tabular-nums text-[13px] text-foreground">{dash(info.getValue())}</span>,
    }),
  ], []);

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" size="icon" aria-label="Search queries">
        <Search className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
      </Button>

      {/* Status filter — All tab only */}
      {activeTab === "all" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant={statusFilter ? "default" : "outline"}
              className="h-[var(--button-height)] gap-1.5 rounded-lg text-[13px]"
            >
              {statusFilter ? STATUS_LABEL[statusFilter] : "All status"}
              <ChevronDown className="h-3 w-3 opacity-60" strokeWidth={1.6} absoluteStrokeWidth />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              className="text-[13px]"
              onSelect={() => setStatusFilter(null)}
            >
              All status
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {(["answered", "routed", "escalated", "unresolved"] as const).map((s) => (
              <DropdownMenuItem
                key={s}
                className="text-[13px]"
                onSelect={() => setStatusFilter(s)}
              >
                {STATUS_LABEL[s]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Button type="button" variant="outline" size="icon" aria-label="Filter queries">
        <FunnelSimple size={14} weight="regular" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="icon" aria-label="More actions">
            <MoreHorizontal className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="text-[13px]">Export queries</DropdownMenuItem>
          <DropdownMenuItem className="text-[13px]">Bulk assign</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-[13px]">Print</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MainCanvasViewHeader
        title="Review queries"
        description="Monitor patient queries handled by the front desk agent and team."
        actions={headerActions}
      />

      {/* Summary cards */}
      <div className="shrink-0 px-6 pb-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <MetricCard value="13" label="Queries"    tooltip="Total patient queries received in the selected period." />
          <MetricCard value="6"  label="Answered"   tooltip="Queries fully resolved by the front desk agent without escalation." />
          <MetricCard value="4"  label="Routed"     tooltip="Queries forwarded to the appropriate team member or department." />
          <MetricCard value="1"  label="Escalated"  tooltip="Queries escalated to a senior team member due to complexity." />
          <MetricCard value="1"  label="Unresolved" tooltip="Queries that remain open and have not yet been addressed." />
        </div>
      </div>

      {/* Tab bar */}
      <div className="shrink-0 px-6 pb-4">
        <div className="inline-flex items-center">
          {(["all", "by-location"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab === "all" ? "All" : "By location";
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative flex items-center gap-1 px-4 py-2 text-[13px]",
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

      {/* All tab — queries table */}
      {activeTab === "all" && (
        <div className="min-h-0 flex-1 px-6 pb-6 pt-2">
          <AppDataTable<QueryRow>
            tableId="frontdesk.queries.all.v2"
            data={filteredQueryRows}
            columns={queryColumns}
            initialSorting={[{ id: "status", desc: false }]}
            getRowId={(row) => row.id}
            className="h-full min-h-0 px-0"
            columnSheetTitle="Query columns"
            hideColumnsButton
            columnSheetOpen={columnSheetOpen}
            onColumnSheetOpenChange={setColumnSheetOpen}
            stickyFirstColumn={false}
            rowDensity="medium"
          />
        </div>
      )}

      {/* By location tab — location breakdown table */}
      {activeTab === "by-location" && (
        <div className="min-h-0 flex-1 px-6 pb-6 pt-2">
          <AppDataTable<LocationRow>
            tableId="frontdesk.queries.bylocation.v2"
            data={LOCATION_ROWS}
            columns={locationColumns}
            initialSorting={[{ id: "totalQueries", desc: true }]}
            getRowId={(row) => row.id}
            className="h-full min-h-0 px-0"
            columnSheetTitle="Location columns"
            hideColumnsButton
            columnSheetOpen={locationColumnSheetOpen}
            onColumnSheetOpenChange={setLocationColumnSheetOpen}
            stickyFirstColumn={false}
            rowDensity="medium"
          />
        </div>
      )}
    </div>
  );
}
