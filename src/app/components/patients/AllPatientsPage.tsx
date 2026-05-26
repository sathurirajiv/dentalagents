import { useMemo, useState } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { FunnelSimple } from "@phosphor-icons/react";
import { Info, MoreHorizontal, Search } from "lucide-react";
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

type InsuranceStatus = "verified" | "unverified" | "pending" | "expired";
type IntakeStatus = "complete" | "incomplete" | "not-started";

type PatientRow = {
  id: string;
  name: string;
  age: number;
  avatarUrl?: string;
  provider: string;
  insuranceStatus: InsuranceStatus;
  intakeStatus: IntakeStatus;
  lastVisit: string;
  outstandingBalance: number;
};

const INSURANCE_LABEL: Record<InsuranceStatus, string> = {
  verified: "Verified",
  unverified: "Unverified",
  pending: "Pending",
  expired: "Expired",
};

const INSURANCE_CLASS: Record<InsuranceStatus, string> = {
  verified: "bg-emerald-50 text-emerald-700",
  unverified: "bg-rose-50 text-rose-700",
  pending: "bg-amber-50 text-amber-800",
  expired: "bg-slate-100 text-slate-600",
};

const INTAKE_LABEL: Record<IntakeStatus, string> = {
  complete: "Complete",
  incomplete: "Incomplete",
  "not-started": "Not started",
};

const INTAKE_CLASS: Record<IntakeStatus, string> = {
  complete: "bg-emerald-50 text-emerald-700",
  incomplete: "bg-amber-50 text-amber-800",
  "not-started": "bg-slate-100 text-slate-600",
};

const PATIENTS: PatientRow[] = [
  { id: "p1",  name: "Sarah Mitchell",      age: 40, avatarUrl: "https://i.pravatar.cc/96?img=47", provider: "Dr. Karen Lee",    insuranceStatus: "verified",   intakeStatus: "complete",    lastVisit: "May 12, 2026", outstandingBalance: 0 },
  { id: "p2",  name: "David Kim",           age: 27, avatarUrl: "https://i.pravatar.cc/96?img=12", provider: "Dr. Karen Lee",    insuranceStatus: "pending",    intakeStatus: "incomplete",  lastVisit: "Apr 28, 2026", outstandingBalance: 145 },
  { id: "p3",  name: "Sophia Patel",        age: 33, avatarUrl: "https://i.pravatar.cc/96?img=45", provider: "Dr. Nina Brooks",  insuranceStatus: "verified",   intakeStatus: "complete",    lastVisit: "May 8, 2026",  outstandingBalance: 0 },
  { id: "p4",  name: "Ella Mitchell",       age: 26, avatarUrl: "https://i.pravatar.cc/96?img=49", provider: "Dr. Nina Brooks",  insuranceStatus: "unverified", intakeStatus: "not-started", lastVisit: "Mar 14, 2026", outstandingBalance: 320 },
  { id: "p5",  name: "James O'Brien",       age: 51, avatarUrl: "https://i.pravatar.cc/96?img=11", provider: "Dr. Alan Park",    insuranceStatus: "verified",   intakeStatus: "complete",    lastVisit: "May 5, 2026",  outstandingBalance: 0 },
  { id: "p6",  name: "Priya Subramanian",   age: 35, avatarUrl: "https://i.pravatar.cc/96?img=32", provider: "Dr. Lin",          insuranceStatus: "expired",    intakeStatus: "incomplete",  lastVisit: "Feb 19, 2026", outstandingBalance: 780 },
  { id: "p7",  name: "Olivia Bennett",      age: 60, avatarUrl: "https://i.pravatar.cc/96?img=33", provider: "Dr. Marcus",       insuranceStatus: "verified",   intakeStatus: "complete",    lastVisit: "May 14, 2026", outstandingBalance: 0 },
  { id: "p8",  name: "Ava Nguyen",          age: 24, avatarUrl: "https://i.pravatar.cc/96?img=13", provider: "Dr. Lin",          insuranceStatus: "pending",    intakeStatus: "not-started", lastVisit: "Apr 3, 2026",  outstandingBalance: 95 },
  { id: "p9",  name: "Marcus Hill",         age: 61, avatarUrl: "https://i.pravatar.cc/96?img=8",  provider: "Dr. Marcus",       insuranceStatus: "verified",   intakeStatus: "complete",    lastVisit: "May 10, 2026", outstandingBalance: 0 },
  { id: "p10", name: "Chloe Harris",        age: 19, avatarUrl: "https://i.pravatar.cc/96?img=20", provider: "Dr. Karen Lee",    insuranceStatus: "unverified", intakeStatus: "not-started", lastVisit: "Jan 7, 2026",  outstandingBalance: 0 },
  { id: "p11", name: "Elijah Adams",        age: 63, avatarUrl: "https://i.pravatar.cc/96?img=15", provider: "Dr. Marcus",       insuranceStatus: "verified",   intakeStatus: "complete",    lastVisit: "May 3, 2026",  outstandingBalance: 250 },
  { id: "p12", name: "Mason Clark",         age: 56, avatarUrl: "https://i.pravatar.cc/96?img=14", provider: "Dr. Alan Park",    insuranceStatus: "verified",   intakeStatus: "complete",    lastVisit: "Apr 22, 2026", outstandingBalance: 0 },
  { id: "p13", name: "Scarlett Roberts",    age: 38, avatarUrl: "https://i.pravatar.cc/96?img=41", provider: "Dr. Nina Brooks",  insuranceStatus: "pending",    intakeStatus: "incomplete",  lastVisit: "Mar 30, 2026", outstandingBalance: 420 },
  { id: "p14", name: "Sebastian Hill",      age: 44, avatarUrl: "https://i.pravatar.cc/96?img=12", provider: "Dr. Marcus",       insuranceStatus: "verified",   intakeStatus: "complete",    lastVisit: "Apr 15, 2026", outstandingBalance: 0 },
  { id: "p15", name: "Isabella Martinez",   age: 29, avatarUrl: "https://i.pravatar.cc/96?img=48", provider: "Dr. Lin",          insuranceStatus: "verified",   intakeStatus: "complete",    lastVisit: "May 6, 2026",  outstandingBalance: 60 },
];

function initials(name: string): string {
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

const columnHelper = createColumnHelper<PatientRow>();

export function AllPatientsPage() {
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);

  const columns = useMemo<ColumnDef<PatientRow, unknown>[]>(
    () => [
      columnHelper.accessor("name", {
        id: "patient",
        header: "Patient",
        size: 240,
        meta: { settingsLabel: "Patient" },
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-9 shrink-0">
                {row.avatarUrl ? <AvatarImage src={row.avatarUrl} alt={row.name} /> : null}
                <AvatarFallback className="text-[11px]">{initials(row.name)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] text-foreground">{row.name}</span>
                <span className="text-[12px] text-muted-foreground">{row.age} yrs</span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("provider", {
        id: "provider",
        header: "Provider",
        size: 160,
        meta: { settingsLabel: "Provider" },
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("insuranceStatus", {
        id: "insuranceStatus",
        header: "Insurance",
        size: 150,
        meta: { settingsLabel: "Insurance" },
        cell: (info) => {
          const v = info.getValue();
          return (
            <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium", INSURANCE_CLASS[v])}>
              {INSURANCE_LABEL[v]}
            </span>
          );
        },
      }),
      columnHelper.accessor("intakeStatus", {
        id: "intakeStatus",
        header: "Intake",
        size: 150,
        meta: { settingsLabel: "Intake" },
        cell: (info) => {
          const v = info.getValue();
          return (
            <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium", INTAKE_CLASS[v])}>
              {INTAKE_LABEL[v]}
            </span>
          );
        },
      }),
      columnHelper.accessor("lastVisit", {
        id: "lastVisit",
        header: "Last visit",
        size: 160,
        meta: { settingsLabel: "Last visit" },
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("outstandingBalance", {
        id: "balance",
        header: "Outstanding balance",
        size: 180,
        meta: { settingsLabel: "Outstanding balance" },
        sortingFn: "alphanumeric",
        cell: (info) => {
          const v = info.getValue();
          return (
            <span className={cn("tabular-nums", v > 0 ? "text-rose-600 font-medium" : "text-muted-foreground")}>
              {v > 0 ? `$${v.toLocaleString()}` : "—"}
            </span>
          );
        },
      }),
    ],
    [],
  );

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" size="icon" aria-label="Search patients">
        <Search className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
      </Button>
      <Button type="button" variant="outline" size="icon" aria-label="Filter patients">
        <FunnelSimple size={14} weight="regular" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="icon" aria-label="More actions">
            <MoreHorizontal className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="text-[13px]">Export patients</DropdownMenuItem>
          <DropdownMenuItem className="text-[13px]">Bulk message</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-[13px]">Import patients</DropdownMenuItem>
          <DropdownMenuItem className="text-[13px]">Print</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MainCanvasViewHeader
        title="All patients"
        description="View and manage your patient roster, insurance status, and intake completion."
        actions={headerActions}
      />

      <div className="shrink-0 px-6 pb-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            value="2,847"
            label="Active patients"
            tooltip="Total patients with at least one visit in the past 12 months."
          />
          <MetricCard
            value="78.3%"
            label="Insurance verified"
            tooltip="Percentage of active patients with verified insurance on file."
          />
          <MetricCard
            value="64.1%"
            label="Intake completion"
            tooltip="Percentage of active patients who have completed their intake forms."
          />
          <MetricCard
            value="$127.4K"
            label="Outstanding balance"
            tooltip="Total unpaid patient balances across all active patients."
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 px-6 pb-6 pt-6">
        <AppDataTable<PatientRow>
          tableId="patients.all.v1"
          data={PATIENTS}
          columns={columns}
          initialSorting={[{ id: "lastVisit", desc: true }]}
          getRowId={(row) => row.id}
          className="h-full min-h-0 px-0"
          columnSheetTitle="Patient columns"
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
