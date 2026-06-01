import type { Meta, StoryObj } from "@storybook/react";
import { IntakesCompletedPage } from "@/app/components/frontdesk/IntakesCompletedPage";

const meta: Meta<typeof IntakesCompletedPage> = {
  title: "App/IntakesCompletedPage",
  component: IntakesCompletedPage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof IntakesCompletedPage>;

export const Default: Story = {};
