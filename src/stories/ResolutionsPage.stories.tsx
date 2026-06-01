import type { Meta, StoryObj } from "@storybook/react";
import { ResolutionsPage } from "@/app/components/frontdesk/ResolutionsPage";

const meta: Meta<typeof ResolutionsPage> = {
  title: "App/ResolutionsPage",
  component: ResolutionsPage,
};
export default meta;
type Story = StoryObj<typeof ResolutionsPage>;

export const Default: Story = {};
