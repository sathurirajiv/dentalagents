export {
  ApptCard,
  AppointmentsView as AppointmentsCalendarView,
  type AppointmentsViewProps,
} from "./AppointmentsView.v1";

import {
  AppointmentsView as AppointmentsCalendarView,
  type AppointmentsViewProps,
} from "./AppointmentsView.v1";
import { AppointmentsManagementAgentsPage } from "@/app/components/appointments/AppointmentsManagementAgentsPage";
import { AppointmentsReviewPage } from "@/app/components/appointments/AppointmentsReviewPage";
import { AppointmentsWaitlistPage } from "@/app/components/appointments/AppointmentsWaitlistPage";
import {
  SchedulingAgentsPage,
  ReschedulingAgentsPage,
  ReminderAgentsPage,
  PreVisitAgentsPage,
  WaitlistAgentsPage,
  CancellationAgentsPage,
  RecallAgentsPage,
  TreatmentPlanAgentsPage,
  RevenueAgentsPage,
} from "@/app/components/appointments/AppointmentAgentTypePages";
import {
  APPOINTMENTS_L2_APPOINTMENT_AGENT_KEY,
  APPOINTMENTS_L2_REVIEW_KEY,
  APPOINTMENTS_L2_WAITLIST_KEY,
  APPOINTMENTS_L2_SCHEDULING_AGENTS_KEY,
  APPOINTMENTS_L2_RESCHEDULING_AGENTS_KEY,
  APPOINTMENTS_L2_REMINDER_AGENTS_KEY,
  APPOINTMENTS_L2_PRE_VISIT_AGENTS_KEY,
  APPOINTMENTS_L2_WAITLIST_AGENTS_KEY,
  APPOINTMENTS_L2_CANCELLATION_AGENTS_KEY,
  APPOINTMENTS_L2_RECALL_AGENTS_KEY,
  APPOINTMENTS_L2_TREATMENT_PLAN_AGENTS_KEY,
  APPOINTMENTS_L2_REVENUE_AGENTS_KEY,
  appointmentsL2PlaceholderProductLabel,
  appointmentsL2ShowsCalendarCanvas,
} from "@/app/components/appointmentsL2Nav";
import { AppShellContentPlaceholder } from "@/app/components/layout/AppShellContentPlaceholder";

export type AppointmentsViewRouterProps = AppointmentsViewProps & {
  appointmentsL2ActiveItem?: string;
};

export function AppointmentsView({
  appointmentsL2ActiveItem,
  ...calendarProps
}: AppointmentsViewRouterProps = {}) {
  if (
    appointmentsL2ActiveItem === APPOINTMENTS_L2_APPOINTMENT_AGENT_KEY ||
    appointmentsL2ActiveItem === APPOINTMENTS_L2_SCHEDULING_AGENTS_KEY
  ) {
    return <SchedulingAgentsPage />;
  }

  if (appointmentsL2ActiveItem === APPOINTMENTS_L2_RESCHEDULING_AGENTS_KEY) {
    return <ReschedulingAgentsPage />;
  }

  if (appointmentsL2ActiveItem === APPOINTMENTS_L2_REMINDER_AGENTS_KEY) {
    return <ReminderAgentsPage />;
  }

  if (appointmentsL2ActiveItem === APPOINTMENTS_L2_PRE_VISIT_AGENTS_KEY) {
    return <PreVisitAgentsPage />;
  }

  if (appointmentsL2ActiveItem === APPOINTMENTS_L2_WAITLIST_AGENTS_KEY) {
    return <WaitlistAgentsPage />;
  }

  if (appointmentsL2ActiveItem === APPOINTMENTS_L2_CANCELLATION_AGENTS_KEY) {
    return <CancellationAgentsPage />;
  }

  if (appointmentsL2ActiveItem === APPOINTMENTS_L2_RECALL_AGENTS_KEY) {
    return <RecallAgentsPage />;
  }

  if (appointmentsL2ActiveItem === APPOINTMENTS_L2_TREATMENT_PLAN_AGENTS_KEY) {
    return <TreatmentPlanAgentsPage />;
  }

  if (appointmentsL2ActiveItem === APPOINTMENTS_L2_REVENUE_AGENTS_KEY) {
    return <RevenueAgentsPage />;
  }

  if (appointmentsL2ActiveItem === APPOINTMENTS_L2_REVIEW_KEY) {
    return <AppointmentsReviewPage />;
  }

  if (appointmentsL2ActiveItem === APPOINTMENTS_L2_WAITLIST_KEY) {
    return <AppointmentsWaitlistPage />;
  }

  if (appointmentsL2ActiveItem && !appointmentsL2ShowsCalendarCanvas(appointmentsL2ActiveItem)) {
    return (
      <AppShellContentPlaceholder
        view="appointments"
        productLabel={appointmentsL2PlaceholderProductLabel(appointmentsL2ActiveItem)}
      />
    );
  }

  return <AppointmentsCalendarView {...calendarProps} />;
}
