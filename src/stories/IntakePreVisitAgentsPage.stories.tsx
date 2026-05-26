import type { Meta, StoryObj } from "@storybook/react";
import { IntakePreVisitAgentsPage } from "@/app/components/intake/IntakePreVisitAgentsPage";

const meta: Meta<typeof IntakePreVisitAgentsPage> = {
  title: "App/IntakePreVisitAgentsPage",
  component: IntakePreVisitAgentsPage,
};
export default meta;
type Story = StoryObj<typeof IntakePreVisitAgentsPage>;

export const Default: Story = {};
