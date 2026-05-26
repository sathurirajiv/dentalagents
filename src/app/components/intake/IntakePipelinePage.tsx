import { useMemo, useState } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { FunnelSimple } from "@phosphor-icons/react";
import { Info, MoreHorizontal, Plus, Search } from "lucide-react";
import { MainCanvasViewHeader } from "@/app/components/layout/MainCanvasViewHeader";
import { AppDataTable } from "@/app/components/ui/AppDataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
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

type IntakeStatus = "completed" | "in-progress" | "not-started" | "expired";
type SentChannel = "email" | "sms" | "portal";

type IntakeRow = {
  id: string;
  patientName: string;
  patientAge: number;
  avatarUrl?: string;
  provider: string;
  appointmentDate: string;
  sentChannel: SentChannel;
  sentDate: string;
  status: IntakeStatus;
  completionTime?: string;
};

const STATUS_LABEL: Record<IntakeStatus, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  "not-started": "Not started",
  expired: "Expired",
};

const STATUS_CLASS: Record<IntakeStatus, string> = {
  completed: "bg-emerald-50 text-emerald-700",
  "in-progress": "bg-sky-50 text-sky-700",
  "not-started": "bg-amber-50 text-amber-800",
  expired: "bg-slate-100 text-slate-600",
};

const SENT_CHANNEL_LABEL: Record<SentChannel, string> = {
  email: "Email",
  sms: "SMS",
  portal: "Portal",
};

const PIPELINE: IntakeRow[] = [
  { id: "i1",  patientName: "Sarah Mitchell",    patientAge: 40, avatarUrl: "https://i.pravatar.cc/96?img=47", provider: "Dr. Karen Lee",   appointmentDate: "May 28, 2026", sentChannel: "email",  sentDate: "May 21, 2026", status: "completed",   completionTime: "4m 12s" },
  { id: "i2",  patientName: "David Kim",         patientAge: 27, avatarUrl: "https://i.pravatar.cc/96?img=12", provider: "Dr. Karen Lee",   appointmentDate: "May 28, 2026", sentChannel: "sms",    sentDate: "May 21, 2026", status: "in-progress" },
  { id: "i3",  patientName: "Sophia Patel",      patientAge: 33, avatarUrl: "https://i.pravatar.cc/96?img=45", provider: "Dr. Nina Brooks", appointmentDate: "May 29, 2026", sentChannel: "email",  sentDate: "May 22, 2026", status: "completed",   completionTime: "6m 40s" },
  { id: "i4",  patientName: "Elijah Adams",      patientAge: 63, avatarUrl: "https://i.pravatar.cc/96?img=11", provider: "Dr. Marcus",      appointmentDate: "May 29, 2026", sentChannel: "portal", sentDate: "May 22, 2026", status: "not-started" },
  { id: "i5",  patientName: "Ella Mitchell",     patientAge: 26, avatarUrl: "https://i.pravatar.cc/96?img=49", provider: "Dr. Nina Brooks", appointmentDate: "May 30, 2026", sentChannel: "email",  sentDate: "May 23, 2026", status: "completed",   completionTime: "3m 55s" },
  { id: "i6",  patientName: "Chloe Harris",      patientAge: 19, avatarUrl: "https://i.pravatar.cc/96?img=20", provider: "Dr. Karen Lee",   appointmentDate: "May 30, 2026", sentChannel: "sms",    sentDate: "May 23, 2026", status: "in-progress" },
  { id: "i7",  patientName: "Ava Nguyen",        patientAge: 24, avatarUrl: "https://i.pravatar.cc/96?img=13", provider: "Dr. Lin",         appointmentDate: "Jun 2, 2026",  sentChannel: "email",  sentDate: "May 26, 2026", status: "not-started" },
  { id: "i8",  patientName: "Mason Clark",       patientAge: 56, avatarUrl: "https://i.pravatar.cc/96?img=15", provider: "Dr. Alan Park",   appointmentDate: "Jun 2, 2026",  sentChannel: "email",  sentDate: "May 26, 2026", status: "completed",   completionTime: "8m 03s" },
  { id: "i9",  patientName: "Priya Subramanian", patientAge: 35, avatarUrl: "https://i.pravatar.cc/96?img=32", provider: "Dr. Lin",         appointmentDate: "Jun 3, 2026",  sentChannel: "portal", sentDate: "May 27, 2026", status: "completed",   completionTime: "5m 18s" },
  { id: "i10", patientName: "Olivia Bennett",    patientAge: 60, avatarUrl: "https://i.pravatar.cc/96?img=33", provider: "Dr. Marcus",      appointmentDate: "Jun 3, 2026",  sentChannel: "sms",    sentDate: "May 27, 2026", status: "expired" },
  { id: "i11", patientName: "Marcus Hill",       patientAge: 61, avatarUrl: "https://i.pravatar.cc/96?img=8",  provider: "Dr. Marcus",      appointmentDate: "Jun 4, 2026",  sentChannel: "email",  sentDate: "May 28, 2026", status: "not-started" },
  { id: "i12", patientName: "James O'Brien",     patientAge: 51, avatarUrl: "https://i.pravatar.cc/96?img=11", provider: "Dr. Alan Park",   appointmentDate: "Jun 4, 2026",  sentChannel: "email",  sentDate: "May 28, 2026", status: "in-progress" },
];

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function MetricCard({ value, label, tooltip }: { value: string; label: string; tooltip: string }) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-4">
      <span className="text-[24px] font-medium leading-[36px] tracking-[-0.02em] tabular-nums text-foreground">
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

const colHelper = createColumnHelper<IntakeRow>();

export function IntakePipelinePage() {
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);

  const columns = useMemo<ColumnDef<IntakeRow, unknown>[]>(
    () => [
      colHelper.accessor("patientName", {
        id: "patient",
        header: "Patient",
        size: 220,
        meta: { settingsLabel: "Patient" },
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-9 shrink-0">
                {row.avatarUrl ? <AvatarImage src={row.avatarUrl} alt={row.patientName} /> : null}
                <AvatarFallback className="text-[11px]">{initials(row.patientName)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] text-foreground">{row.patientName}</span>
                <span className="text-[12px] text-muted-foreground">{row.patientAge} yrs</span>
              </div>
            </div>
          );
        },
      }),
      colHelper.accessor("provider", {
        id: "provider",
        header: "Provider",
        size: 160,
        meta: { settingsLabel: "Provider" },
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      colHelper.accessor("appointmentDate", {
        id: "appointmentDate",
        header: "Appointment date",
        size: 160,
        meta: { settingsLabel: "Appointment date" },
        cell: (info) => <span className="tabular-nums text-foreground">{info.getValue()}</span>,
      }),
      colHelper.accessor("sentChannel", {
        id: "sentChannel",
        header: "Sent via",
        size: 110,
        meta: { settingsLabel: "Sent via" },
        cell: (info) => (
          <span className="text-[13px] text-foreground">{SENT_CHANNEL_LABEL[info.getValue()]}</span>
        ),
      }),
      colHelper.accessor("sentDate", {
        id: "sentDate",
        header: "Sent on",
        size: 140,
        meta: { settingsLabel: "Sent on" },
        cell: (info) => <span className="tabular-nums text-foreground">{info.getValue()}</span>,
      }),
      colHelper.accessor("status", {
        id: "status",
        header: "Status",
        size: 140,
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
      colHelper.accessor("completionTime", {
        id: "completionTime",
        header: "Completion time",
        size: 150,
        meta: { settingsLabel: "Completion time" },
        cell: (info) => (
          <span className="tabular-nums text-foreground">{info.getValue() ?? "—"}</span>
        ),
      }),
    ],
    [],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MainCanvasViewHeader
        title="Intake pipeline"
        description="Track pre-visit intake forms sent, in progress, and completed ahead of each appointment."
        actions={(
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" aria-label="Search intake">
              <Search className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
            </Button>
            <Button type="button" variant="outline" size="icon" aria-label="Filter">
              <FunnelSimple size={14} weight="regular" />
            </Button>
            <Button type="button" className="h-[var(--button-height)] gap-1.5 rounded-lg text-[13px]">
              <Plus className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
              Send form
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="icon" aria-label="More actions">
                  <MoreHorizontal className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-[13px]">Export</DropdownMenuItem>
                <DropdownMenuItem className="text-[13px]">Bulk send</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[13px]">Print</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      />

      <div className="shrink-0 px-6 pb-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            value="3,820"
            label="Forms sent"
            tooltip="Total pre-visit intake forms dispatched to patients in the last 30 days."
          />
          <MetricCard
            value="74.6%"
            label="Completion rate"
            tooltip="Percentage of sent forms completed by patients before their appointment."
          />
          <MetricCard
            value="5m 24s"
            label="Avg. completion time"
            tooltip="Average time patients take to complete the intake form from opening it."
          />
          <MetricCard
            value="12h 30m"
            label="Front-desk time saved"
            tooltip="Estimated staff time saved by collecting intake data digitally before visits."
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 px-6 pb-6 pt-6">
        <AppDataTable<IntakeRow>
          tableId="intake.pipeline.v1"
          data={PIPELINE}
          columns={columns}
          initialSorting={[{ id: "appointmentDate", desc: false }]}
          getRowId={(row) => row.id}
          className="h-full min-h-0 px-0"
          columnSheetTitle="Pipeline columns"
          hideColumnsButton
          columnSheetOpen={columnSheetOpen}
          onColumnSheetOpenChange={setColumnSheetOpen}
          stickyFirstColumn={false}
          rowDensity="default"
        />
      </div>
    </div>
  );
}
