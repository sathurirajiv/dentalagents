import type { Meta, StoryObj } from "@storybook/react";
import { IntakePipelinePage } from "@/app/components/intake/IntakePipelinePage";

const meta: Meta<typeof IntakePipelinePage> = {
  title: "App/IntakePipelinePage",
  component: IntakePipelinePage,
};
export default meta;
type Story = StoryObj<typeof IntakePipelinePage>;

export const Default: Story = {};
