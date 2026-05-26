import type { Meta, StoryObj } from "@storybook/react";
import { AppointmentWorkflowCanvas } from "@/app/components/appointments/AppointmentWorkflowCanvas";

const meta: Meta<typeof AppointmentWorkflowCanvas> = {
  title: "App/AppointmentWorkflowCanvas",
  component: AppointmentWorkflowCanvas,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AppointmentWorkflowCanvas>;

export const Default: Story = {
  args: {
    agentType: "recall",
    agentName: "North Recall agent",
    locationCount: 500,
  },
};

export const TreatmentPlan: Story = {
  args: {
    agentType: "treatment-plan",
    agentName: "Treatment plan follow-up agent",
    locationCount: 500,
  },
};

export const Revenue: Story = {
  args: {
    agentType: "revenue",
    agentName: "Revenue recovery agent",
    locationCount: 500,
  },
};
