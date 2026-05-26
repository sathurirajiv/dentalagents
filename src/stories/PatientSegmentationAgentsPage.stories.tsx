import type { Meta, StoryObj } from "@storybook/react";
import { PatientSegmentationAgentsPage } from "@/app/components/patients/PatientSegmentationAgentsPage";

const meta: Meta<typeof PatientSegmentationAgentsPage> = {
  title: "App/PatientSegmentationAgentsPage",
  component: PatientSegmentationAgentsPage,
};
export default meta;
type Story = StoryObj<typeof PatientSegmentationAgentsPage>;

export const Default: Story = {};
