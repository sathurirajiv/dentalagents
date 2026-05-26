import {
  AppointmentAgentTypePage,
  type PageConfig,
  type AgentRow,
} from "@/app/components/appointments/AppointmentAgentTypePages";

const fmt = {
  count: (v: number) => (v === 0 ? "—" : v.toLocaleString()),
  pct: (v: number) => (v === 0 ? "—" : `${v}%`),
};

const SEGMENTATION_ROWS: AgentRow[] = [
  { id: "seg-northwest", name: "Segmentation agent — Northwest",    status: "running", locations: 148, timeSavedMinutes: 194, kpi1: 1842, kpi2: 38 },
  { id: "seg-pacific",   name: "Segmentation agent — Pacific",      status: "running", locations: 143, timeSavedMinutes: 177, kpi1: 1714, kpi2: 41 },
  { id: "seg-southeast", name: "Segmentation agent — Southeast",    status: "running", locations: 136, timeSavedMinutes: 161, kpi1: 1593, kpi2: 36 },
  { id: "seg-northeast", name: "Segmentation agent — Northeast",    status: "running", locations: 128, timeSavedMinutes: 148, kpi1: 1480, kpi2: 39 },
  { id: "seg-mountain",  name: "Segmentation agent — Mountain West",status: "paused",  locations: 140, timeSavedMinutes: 132, kpi1: 1201, kpi2: 34 },
  { id: "seg-central",   name: "Segmentation agent — Central",      status: "running", locations: 122, timeSavedMinutes: 119, kpi1: 1138, kpi2: 37 },
  { id: "seg-southwest", name: "Segmentation agent — Southwest",    status: "draft",   locations: 115, timeSavedMinutes:   0, kpi1:    0, kpi2:  0 },
];

const SEGMENTATION_CONFIG: PageConfig = {
  pageTitle: "Patient segmentation agents",
  tableId: "patients.segmentation-agents.v1",
  kpi1Header: "Patients segmented",
  kpi2Header: "Engagement rate",
  kpi1Tooltip: "Total patients categorised into actionable segments by this agent in the selected period.",
  kpi2Tooltip: "Percentage of segmented patients who responded to at least one targeted outreach message.",
  formatKpi1: fmt.count,
  formatKpi2: fmt.pct,
  summaryKpis: [
    { title: "Patients segmented",   value: "8,968",  delta: "+6.2%", tooltip: "Total patients segmented across all active segmentation agents." },
    { title: "Avg. engagement rate", value: "37.8%",  delta: "+2.4%", tooltip: "Average percentage of segmented patients who engaged with outreach." },
    { title: "Time saved",           value: "15h 31m",delta: "+5.1%", tooltip: "Cumulative staff time saved by automated segmentation and routing this period." },
    { title: "Locations covered",    value: "932",    delta: "+1.5%", tooltip: "Total location-agent combinations actively running segmentation workflows." },
  ],
  rows: SEGMENTATION_ROWS,
};

export function PatientSegmentationAgentsPage() {
  return <AppointmentAgentTypePage config={SEGMENTATION_CONFIG} />;
}
