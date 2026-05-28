import type { Meta, StoryObj } from "@storybook/react";
import { FrontDeskAgentPage } from "@/app/components/frontdesk/FrontDeskAgentPage";

const meta: Meta<typeof FrontDeskAgentPage> = {
  title: "App/FrontDeskAgentPage",
  component: FrontDeskAgentPage,
};
export default meta;
type Story = StoryObj<typeof FrontDeskAgentPage>;

export const Default: Story = {};
