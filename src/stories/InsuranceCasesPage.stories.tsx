import type { Meta, StoryObj } from "@storybook/react";
import { InsuranceCasesPage } from "@/app/components/insurance/InsuranceCasesPage";

const meta: Meta<typeof InsuranceCasesPage> = {
  title: "App/InsuranceCasesPage",
  component: InsuranceCasesPage,
};
export default meta;
type Story = StoryObj<typeof InsuranceCasesPage>;

export const Default: Story = {};
