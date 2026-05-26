import type { Meta, StoryObj } from "@storybook/react";
import { AllPatientsPage } from "@/app/components/patients/AllPatientsPage";

const meta: Meta<typeof AllPatientsPage> = {
  title: "App/AllPatientsPage",
  component: AllPatientsPage,
};
export default meta;
type Story = StoryObj<typeof AllPatientsPage>;

export const Default: Story = {};
