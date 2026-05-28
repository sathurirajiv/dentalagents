import { AppointmentAgentTypePage, type PageConfig, type AgentRow } from "@/app/components/appointments/AppointmentAgentTypePages";

const ROWS: AgentRow[] = [
  { id: "fd-north",    name: "Front desk agent — North region",    status: "running", locations: 147, timeSavedMinutes: 2 * 24 * 60 + 14 * 60 + 30, kpi1: 320, kpi2: 94 },
  { id: "fd-east",     name: "Front desk agent — East region",     status: "running", locations: 145, timeSavedMinutes: 2 * 24 * 60 + 6 * 60 + 12,  kpi1: 275, kpi2: 91 },
  { id: "fd-south",    name: "Front desk agent — South region",    status: "running", locations: 142, timeSavedMinutes: 1 * 24 * 60 + 22 * 60 + 48, kpi1: 241, kpi2: 88 },
  { id: "fd-west",     name: "Front desk agent — West region",     status: "running", locations: 138, timeSavedMinutes: 1 * 24 * 60 + 18 * 60 + 5,  kpi1: 198, kpi2: 86 },
  { id: "fd-central",  name: "Front desk agent — Central region",  status: "paused",  locations: 131, timeSavedMinutes: 1 * 24 * 60 + 4 * 60 + 20,  kpi1: 160, kpi2: 83 },
  { id: "fd-midwest",  name: "Front desk agent — Midwest region",  status: "running", locations: 120, timeSavedMinutes: 0 * 24 * 60 + 19 * 60 + 55, kpi1: 112, kpi2: 79 },
  { id: "fd-pacific",  name: "Front desk agent — Pacific region",  status: "draft",   locations: 108, timeSavedMinutes: 0,                            kpi1: 0,   kpi2: 0  },
];

const CONFIG: PageConfig = {
  pageTitle: "Front desk agent",
  tableId: "frontdesk.agents.v1",
  kpi1Header: "Queries resolved",
  kpi2Header: "Resolution rate",
  kpi1Tooltip: "Total patient queries resolved by this agent in the selected period.",
  kpi2Tooltip: "Percentage of queries fully resolved without human escalation.",
  formatKpi1: (v) => v.toLocaleString(),
  formatKpi2: (v) => `${v}%`,
  summaryKpis: [
    { title: "Queries resolved",  value: "1,306", delta: "+4.1%", tooltip: "Total queries resolved by all front desk agents." },
    { title: "Resolution rate",   value: "88.3%", delta: "+1.2%", tooltip: "Percentage of queries handled without escalation." },
    { title: "Avg. response time", value: "1m 24s", delta: "-0.8%", tooltip: "Average time for the agent to respond to a patient query." },
    { title: "Escalations",       value: "152",   delta: "-3.4%", tooltip: "Total queries escalated to a human team member." },
  ],
  rows: ROWS,
};

export function FrontDeskAgentPage() {
  return <AppointmentAgentTypePage config={CONFIG} />;
}
