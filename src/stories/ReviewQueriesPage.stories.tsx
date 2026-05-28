import type { Meta, StoryObj } from "@storybook/react";
import { ReviewQueriesPage } from "@/app/components/frontdesk/ReviewQueriesPage";

const meta: Meta<typeof ReviewQueriesPage> = {
  title: "App/ReviewQueriesPage",
  component: ReviewQueriesPage,
};
export default meta;
type Story = StoryObj<typeof ReviewQueriesPage>;

export const Default: Story = {};
