import type { Meta, StoryObj } from "@storybook/react";
import { AppointmentsOverviewPage } from "@/app/components/frontdesk/AppointmentsOverviewPage";

const meta: Meta<typeof AppointmentsOverviewPage> = {
  title: "App/AppointmentsOverviewPage",
  component: AppointmentsOverviewPage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof AppointmentsOverviewPage>;

export const Default: Story = {};
