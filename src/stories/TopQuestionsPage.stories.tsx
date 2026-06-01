import type { Meta, StoryObj } from "@storybook/react";
import { TopQuestionsPage } from "@/app/components/frontdesk/TopQuestionsPage";

const meta: Meta<typeof TopQuestionsPage> = {
  title: "App/TopQuestionsPage",
  component: TopQuestionsPage,
};
export default meta;
type Story = StoryObj<typeof TopQuestionsPage>;

export const Default: Story = {};
