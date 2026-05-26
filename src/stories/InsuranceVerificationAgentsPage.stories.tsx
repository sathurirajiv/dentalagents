import type { Meta, StoryObj } from "@storybook/react";
import { InsuranceVerificationAgentsPage } from "@/app/components/insurance/InsuranceVerificationAgentsPage";

const meta: Meta<typeof InsuranceVerificationAgentsPage> = {
  title: "App/InsuranceVerificationAgentsPage",
  component: InsuranceVerificationAgentsPage,
};
export default meta;
type Story = StoryObj<typeof InsuranceVerificationAgentsPage>;

export const Default: Story = {};
