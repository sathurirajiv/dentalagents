import type { Meta, StoryObj } from "@storybook/react";
import { WaitlistFilledPage } from "@/app/components/frontdesk/WaitlistFilledPage";

const meta: Meta<typeof WaitlistFilledPage> = {
  title: "App/WaitlistFilledPage",
  component: WaitlistFilledPage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof WaitlistFilledPage>;

export const Default: Story = {};
