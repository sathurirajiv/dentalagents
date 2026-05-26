import {
  AppointmentAgentTypePage,
  type PageConfig,
  type AgentRow,
} from "@/app/components/appointments/AppointmentAgentTypePages";

const fmt = {
  count: (v: number) => (v === 0 ? "—" : v.toLocaleString()),
  pct: (v: number) => (v === 0 ? "—" : `${v}%`),
};

const PRE_VISIT_ROWS: AgentRow[] = [
  { id: "pv-northwest", name: "Pre-visit agent — Northwest",     status: "running", locations: 480, timeSavedMinutes: 825, kpi1: 521, kpi2: 91 },
  { id: "pv-pacific",   name: "Pre-visit agent — Pacific",       status: "running", locations: 320, timeSavedMinutes: 620, kpi1: 418, kpi2: 88 },
  { id: "pv-southeast", name: "Pre-visit agent — Southeast",     status: "paused",  locations: 160, timeSavedMinutes: 345, kpi1: 265, kpi2: 81 },
  { id: "pv-northeast", name: "Pre-visit agent — Northeast",     status: "running", locations: 310, timeSavedMinutes: 580, kpi1: 392, kpi2: 87 },
  { id: "pv-mountain",  name: "Pre-visit agent — Mountain West", status: "running", locations: 280, timeSavedMinutes: 490, kpi1: 341, kpi2: 89 },
  { id: "pv-central",   name: "Pre-visit agent — Central",       status: "running", locations: 240, timeSavedMinutes: 412, kpi1: 287, kpi2: 85 },
  { id: "pv-southwest", name: "Pre-visit agent — Southwest",     status: "draft",   locations: 195, timeSavedMinutes:   0, kpi1:   0, kpi2:  0 },
];

const PRE_VISIT_CONFIG: PageConfig = {
  pageTitle: "Pre-visit agents",
  tableId: "intake.pre-visit-agents.v1",
  kpi1Header: "Forms completed",
  kpi2Header: "Completion rate",
  kpi1Tooltip: "Total pre-visit intake forms completed by patients through this agent's outreach.",
  kpi2Tooltip: "Percentage of forms dispatched by this agent that were completed before the appointment.",
  formatKpi1: fmt.count,
  formatKpi2: fmt.pct,
  summaryKpis: [
    { title: "Forms completed",          value: "2,224",  delta: "+5.2%", tooltip: "Total intake forms completed by patients across all active pre-visit agents." },
    { title: "Avg. completion rate",     value: "87.2%",  delta: "+3.1%", tooltip: "Average completion rate across all running pre-visit agents." },
    { title: "Avg. completion time",     value: "5m 24s", delta: "-0.8%", tooltip: "Average time a patient takes to complete the intake form after opening it." },
    { title: "Front-desk time saved",    value: "40h 52m",delta: "+4.6%", tooltip: "Estimated staff time saved by collecting intake data digitally before visits." },
  ],
  rows: PRE_VISIT_ROWS,
};

export function IntakePreVisitAgentsPage() {
  return <AppointmentAgentTypePage config={PRE_VISIT_CONFIG} />;
}
