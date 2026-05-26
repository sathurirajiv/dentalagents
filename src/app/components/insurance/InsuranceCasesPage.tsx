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

type CoverageStatus = "active" | "pending" | "needs-review" | "lapsed";
type PlanType = "PPO" | "HMO" | "EPO" | "DHMO";

type InsuranceCaseRow = {
  id: string;
  patientName: string;
  patientAge: number;
  avatarUrl?: string;
  provider: string;
  plan: string;
  planType: PlanType;
  coverageStatus: CoverageStatus;
  verifiedOn?: string;
  copay: number;
  remainingBenefit: number;
};

const COVERAGE_LABEL: Record<CoverageStatus, string> = {
  active: "Active",
  pending: "Pending",
  "needs-review": "Needs review",
  lapsed: "Lapsed",
};

const COVERAGE_CLASS: Record<CoverageStatus, string> = {
  active: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-800",
  "needs-review": "bg-sky-50 text-sky-700",
  lapsed: "bg-rose-50 text-rose-700",
};

const CASES: InsuranceCaseRow[] = [
  { id: "c1",  patientName: "Sarah Mitchell",    patientAge: 40, avatarUrl: "https://i.pravatar.cc/96?img=47", provider: "Delta Dental",   plan: "Delta Premier PPO",      planType: "PPO",  coverageStatus: "active",       verifiedOn: "May 20, 2026", copay: 20,  remainingBenefit: 1200 },
  { id: "c2",  patientName: "David Kim",         patientAge: 27, avatarUrl: "https://i.pravatar.cc/96?img=12", provider: "Cigna",          plan: "Cigna DPPO Advantage",   planType: "PPO",  coverageStatus: "pending",                                  copay: 25,  remainingBenefit: 1500 },
  { id: "c3",  patientName: "Sophia Patel",      patientAge: 33, avatarUrl: "https://i.pravatar.cc/96?img=45", provider: "Aetna",          plan: "Aetna DMO",              planType: "HMO",  coverageStatus: "active",       verifiedOn: "May 18, 2026", copay: 15,  remainingBenefit: 800  },
  { id: "c4",  patientName: "Elijah Adams",      patientAge: 63, avatarUrl: "https://i.pravatar.cc/96?img=11", provider: "MetLife",        plan: "MetLife TakeCare PPO",   planType: "PPO",  coverageStatus: "needs-review",                             copay: 30,  remainingBenefit: 650  },
  { id: "c5",  patientName: "Ella Mitchell",     patientAge: 26, avatarUrl: "https://i.pravatar.cc/96?img=49", provider: "Guardian",       plan: "DentalGuard Preferred",  planType: "PPO",  coverageStatus: "active",       verifiedOn: "May 21, 2026", copay: 20,  remainingBenefit: 1000 },
  { id: "c6",  patientName: "Chloe Harris",      patientAge: 19, avatarUrl: "https://i.pravatar.cc/96?img=20", provider: "Humana",         plan: "Humana Dental Value",    planType: "DHMO", coverageStatus: "active",       verifiedOn: "May 19, 2026", copay: 10,  remainingBenefit: 1500 },
  { id: "c7",  patientName: "Ava Nguyen",        patientAge: 24, avatarUrl: "https://i.pravatar.cc/96?img=13", provider: "United Concordia", plan: "UC Dental Alliance PPO", planType: "PPO",  coverageStatus: "lapsed",                                   copay: 25,  remainingBenefit: 0    },
  { id: "c8",  patientName: "Mason Clark",       patientAge: 56, avatarUrl: "https://i.pravatar.cc/96?img=15", provider: "Delta Dental",   plan: "Delta Care HMO",         planType: "HMO",  coverageStatus: "active",       verifiedOn: "May 22, 2026", copay: 15,  remainingBenefit: 900  },
  { id: "c9",  patientName: "Priya Subramanian", patientAge: 35, avatarUrl: "https://i.pravatar.cc/96?img=32", provider: "Cigna",          plan: "Cigna Dental 1000",      planType: "PPO",  coverageStatus: "needs-review",                             copay: 20,  remainingBenefit: 420  },
  { id: "c10", patientName: "Olivia Bennett",    patientAge: 60, avatarUrl: "https://i.pravatar.cc/96?img=33", provider: "Anthem",         plan: "Anthem Blue Dental PPO", planType: "PPO",  coverageStatus: "active",       verifiedOn: "May 17, 2026", copay: 30,  remainingBenefit: 1400 },
  { id: "c11", patientName: "Marcus Hill",       patientAge: 61, avatarUrl: "https://i.pravatar.cc/96?img=8",  provider: "Aetna",          plan: "Aetna Vital Savings",    planType: "EPO",  coverageStatus: "pending",                                  copay: 20,  remainingBenefit: 750  },
  { id: "c12", patientName: "James O'Brien",     patientAge: 51, avatarUrl: "https://i.pravatar.cc/96?img=11", provider: "MetLife",        plan: "MetLife Preferred Dentist",planType:"PPO",  coverageStatus: "active",       verifiedOn: "May 23, 2026", copay: 25,  remainingBenefit: 1100 },
  { id: "c13", patientName: "Scarlett Roberts",  patientAge: 38, avatarUrl: "https://i.pravatar.cc/96?img=41", provider: "Guardian",       plan: "DentalGuard Choice Plus",planType: "PPO",  coverageStatus: "lapsed",                                   copay: 20,  remainingBenefit: 0    },
  { id: "c14", patientName: "Sebastian Hill",    patientAge: 44, avatarUrl: "https://i.pravatar.cc/96?img=12", provider: "Delta Dental",   plan: "Delta Premier PPO",      planType: "PPO",  coverageStatus: "active",       verifiedOn: "May 24, 2026", copay: 20,  remainingBenefit: 1350 },
  { id: "c15", patientName: "Isabella Martinez", patientAge: 29, avatarUrl: "https://i.pravatar.cc/96?img=48", provider: "Cigna",          plan: "Cigna DPPO Advantage",   planType: "PPO",  coverageStatus: "needs-review",                             copay: 25,  remainingBenefit: 600  },
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

const colHelper = createColumnHelper<InsuranceCaseRow>();

export function InsuranceCasesPage() {
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);

  const columns = useMemo<ColumnDef<InsuranceCaseRow, unknown>[]>(
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
        header: "Insurance provider",
        size: 180,
        meta: { settingsLabel: "Insurance provider" },
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      colHelper.accessor("plan", {
        id: "plan",
        header: "Plan",
        size: 200,
        meta: { settingsLabel: "Plan" },
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      colHelper.accessor("planType", {
        id: "planType",
        header: "Type",
        size: 80,
        meta: { settingsLabel: "Plan type" },
        cell: (info) => (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      colHelper.accessor("coverageStatus", {
        id: "coverageStatus",
        header: "Coverage",
        size: 150,
        meta: { settingsLabel: "Coverage" },
        cell: (info) => {
          const v = info.getValue();
          return (
            <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium", COVERAGE_CLASS[v])}>
              {COVERAGE_LABEL[v]}
            </span>
          );
        },
      }),
      colHelper.accessor("verifiedOn", {
        id: "verifiedOn",
        header: "Verified on",
        size: 150,
        meta: { settingsLabel: "Verified on" },
        cell: (info) => (
          <span className="tabular-nums text-foreground">{info.getValue() ?? "—"}</span>
        ),
      }),
      colHelper.accessor("copay", {
        id: "copay",
        header: "Co-pay",
        size: 100,
        meta: { settingsLabel: "Co-pay" },
        sortingFn: "alphanumeric",
        cell: (info) => (
          <span className="tabular-nums text-foreground">${info.getValue()}</span>
        ),
      }),
      colHelper.accessor("remainingBenefit", {
        id: "remainingBenefit",
        header: "Remaining benefit",
        size: 160,
        meta: { settingsLabel: "Remaining benefit" },
        sortingFn: "alphanumeric",
        cell: (info) => {
          const v = info.getValue();
          return (
            <span className={cn("tabular-nums", v === 0 ? "text-muted-foreground" : "text-foreground")}>
              {v === 0 ? "—" : `$${v.toLocaleString()}`}
            </span>
          );
        },
      }),
    ],
    [],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <MainCanvasViewHeader
        title="Insurance cases"
        description="Review patient insurance coverage, verification status, and benefit balances."
        actions={(
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" aria-label="Search cases">
              <Search className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
            </Button>
            <Button type="button" variant="outline" size="icon" aria-label="Filter cases">
              <FunnelSimple size={14} weight="regular" />
            </Button>
            <Button type="button" className="h-[var(--button-height)] gap-1.5 rounded-lg text-[13px]">
              <Plus className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
              Add case
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="icon" aria-label="More actions">
                  <MoreHorizontal className="h-[14px] w-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-[13px]">Export cases</DropdownMenuItem>
                <DropdownMenuItem className="text-[13px]">Bulk verify</DropdownMenuItem>
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
            value="1,247"
            label="Total cases"
            tooltip="Total active insurance cases across all patients in the current period."
          />
          <MetricCard
            value="84.2%"
            label="Verified"
            tooltip="Percentage of insurance cases with confirmed active coverage on file."
          />
          <MetricCard
            value="112"
            label="Pending review"
            tooltip="Cases flagged for manual review due to missing or conflicting information."
          />
          <MetricCard
            value="1m 18s"
            label="Avg. verification time"
            tooltip="Average time taken per case to complete the insurance verification process."
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 px-6 pb-6 pt-6">
        <AppDataTable<InsuranceCaseRow>
          tableId="insurance.cases.v1"
          data={CASES}
          columns={columns}
          initialSorting={[{ id: "coverageStatus", desc: false }]}
          getRowId={(row) => row.id}
          className="h-full min-h-0 px-0"
          columnSheetTitle="Case columns"
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
