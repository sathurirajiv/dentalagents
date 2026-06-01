import { useProductVertical } from "@/app/context/ProductVerticalContext";
import { AppShellContentPlaceholder } from "@/app/components/layout/AppShellContentPlaceholder";
import { ResolutionsPage } from "@/app/components/frontdesk/ResolutionsPage";
import { TopQuestionsPage } from "@/app/components/frontdesk/TopQuestionsPage";
import { AppointmentsOverviewPage } from "@/app/components/frontdesk/AppointmentsOverviewPage";
import { WaitlistFilledPage } from "@/app/components/frontdesk/WaitlistFilledPage";
import { IntakesCompletedPage } from "@/app/components/frontdesk/IntakesCompletedPage";
import {
  FRONTDESK_L2_MANAGE_APPOINTMENTS_KEY,
  FRONTDESK_L2_REVIEW_WAITLIST_KEY,
  FRONTDESK_L2_MANAGE_INTAKE_KEY,
  FRONTDESK_L2_FRONTDESK_AGENT_KEY,
  FRONTDESK_L2_APPT_MGMT_AGENT_KEY,
  FRONTDESK_L2_INSURANCE_AGENT_KEY,
  FRONTDESK_L2_WAITLIST_AGENT_KEY,
  FRONTDESK_L2_PREVISIT_AGENT_KEY,
  FRONTDESK_L2_REMINDER_AGENT_KEY,
  FRONTDESK_L2_APPOINTMENTS_OVERVIEW_KEY,
  FRONTDESK_L2_WAITLIST_FILLED_KEY,
  FRONTDESK_L2_INTAKES_COMPLETED_KEY,
  FRONTDESK_L2_KNOWLEDGE_BASE_KEY,
  FRONTDESK_L2_PHONE_NUMBERS_KEY,
  FRONTDESK_L2_WIDGETS_KEY,
  FRONTDESK_L2_PROVIDERS_KEY,
} from "@/app/components/frontdesk/frontdeskL2Nav";

const PLACEHOLDER_KEYS = new Set([
  FRONTDESK_L2_MANAGE_APPOINTMENTS_KEY,
  FRONTDESK_L2_REVIEW_WAITLIST_KEY,
  FRONTDESK_L2_MANAGE_INTAKE_KEY,
  FRONTDESK_L2_FRONTDESK_AGENT_KEY,
  FRONTDESK_L2_APPT_MGMT_AGENT_KEY,
  FRONTDESK_L2_INSURANCE_AGENT_KEY,
  FRONTDESK_L2_WAITLIST_AGENT_KEY,
  FRONTDESK_L2_PREVISIT_AGENT_KEY,
  FRONTDESK_L2_REMINDER_AGENT_KEY,
  FRONTDESK_L2_KNOWLEDGE_BASE_KEY,
  FRONTDESK_L2_PHONE_NUMBERS_KEY,
  FRONTDESK_L2_WIDGETS_KEY,
  FRONTDESK_L2_PROVIDERS_KEY,
]);

export function FrontDeskView({ frontdeskL2ActiveItem }: { frontdeskL2ActiveItem: string }) {
  const { vertical } = useProductVertical();
  if (vertical !== "dental") {
    return <AppShellContentPlaceholder view="healthcare-frontdesk" />;
  }

  // ── Outcomes ──────────────────────────────────────────────────────────────
  if (frontdeskL2ActiveItem === FRONTDESK_L2_APPOINTMENTS_OVERVIEW_KEY) return <AppointmentsOverviewPage />;
  if (frontdeskL2ActiveItem === FRONTDESK_L2_WAITLIST_FILLED_KEY)       return <WaitlistFilledPage />;
  if (frontdeskL2ActiveItem === FRONTDESK_L2_INTAKES_COMPLETED_KEY)     return <IntakesCompletedPage />;

  // ── Legacy outcome keys still wired ────────────────────────────────────────
  // ResolutionsPage and TopQuestionsPage are no longer in the nav but kept
  // in case of direct deep-links or future re-addition.

  // ── Human actions / Agents / Resources → placeholder ─────────────────────
  if (PLACEHOLDER_KEYS.has(frontdeskL2ActiveItem)) {
    return <AppShellContentPlaceholder view="healthcare-frontdesk" />;
  }

  return <AppShellContentPlaceholder view="healthcare-frontdesk" />;
}
