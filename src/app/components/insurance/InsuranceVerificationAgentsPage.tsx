import {
  AppointmentAgentTypePage,
  type PageConfig,
  type AgentRow,
} from "@/app/components/appointments/AppointmentAgentTypePages";

const fmt = {
  count: (v: number) => (v === 0 ? "—" : v.toLocaleString()),
  pct: (v: number) => (v === 0 ? "—" : `${v}%`),
};

const VERIFICATION_ROWS: AgentRow[] = [
  { id: "iv-northwest", name: "Insurance verification agent — Northwest",     status: "running", locations: 600, timeSavedMinutes: 370, kpi1: 320, kpi2: 94 },
  { id: "iv-pacific",   name: "Insurance verification agent — Pacific",       status: "running", locations: 400, timeSavedMinutes: 300, kpi1: 275, kpi2: 91 },
  { id: "iv-southeast", name: "Insurance verification agent — Southeast",     status: "paused",  locations: 200, timeSavedMinutes: 125, kpi1: 112, kpi2: 83 },
  { id: "iv-northeast", name: "Insurance verification agent — Northeast",     status: "running", locations: 520, timeSavedMinutes: 318, kpi1: 298, kpi2: 93 },
  { id: "iv-mountain",  name: "Insurance verification agent — Mountain West", status: "running", locations: 380, timeSavedMinutes: 264, kpi1: 241, kpi2: 90 },
  { id: "iv-central",   name: "Insurance verification agent — Central",       status: "running", locations: 310, timeSavedMinutes: 198, kpi1: 194, kpi2: 88 },
  { id: "iv-southwest", name: "Insurance verification agent — Southwest",     status: "draft",   locations: 240, timeSavedMinutes:   0, kpi1:   0, kpi2:  0 },
];

const VERIFICATION_CONFIG: PageConfig = {
  pageTitle: "Insurance verification agents",
  tableId: "insurance.verification-agents.v1",
  kpi1Header: "Insurances verified",
  kpi2Header: "Verification rate",
  kpi1Tooltip: "Total insurance policies verified autonomously by this agent in the selected period.",
  kpi2Tooltip: "Percentage of insurance verification requests that were successfully completed.",
  formatKpi1: fmt.count,
  formatKpi2: fmt.pct,
  summaryKpis: [
    { title: "Insurances verified",      value: "1,440",  delta: "+4.1%", tooltip: "Total insurance policies verified across all active verification agents." },
    { title: "Avg. verification rate",   value: "91.8%",  delta: "+2.0%", tooltip: "Average percentage of verification requests successfully completed." },
    { title: "Avg. verification time",   value: "1m 12s", delta: "-0.8%", tooltip: "Average time taken per policy to complete the verification check." },
    { title: "Time saved",               value: "21h 55m",delta: "+1.3%", tooltip: "Cumulative staff time saved by automated insurance verification this period." },
  ],
  rows: VERIFICATION_ROWS,
};

export function InsuranceVerificationAgentsPage() {
  return <AppointmentAgentTypePage config={VERIFICATION_CONFIG} />;
}
