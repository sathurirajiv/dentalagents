import { useProductVertical } from "@/app/context/ProductVerticalContext";
import { AppShellContentPlaceholder } from "@/app/components/layout/AppShellContentPlaceholder";
import { ReviewQueriesPage } from "@/app/components/frontdesk/ReviewQueriesPage";
import { FrontDeskAgentPage } from "@/app/components/frontdesk/FrontDeskAgentPage";
import { ResolutionsPage } from "@/app/components/frontdesk/ResolutionsPage";
import { TopQuestionsPage } from "@/app/components/frontdesk/TopQuestionsPage";
import {
  FRONTDESK_L2_REVIEW_QUERIES_KEY,
  FRONTDESK_L2_AGENT_KEY,
  FRONTDESK_L2_RESOLUTIONS_KEY,
  FRONTDESK_L2_TOP_QUESTIONS_KEY,
} from "@/app/components/frontdesk/frontdeskL2Nav";

export function FrontDeskView({ frontdeskL2ActiveItem }: { frontdeskL2ActiveItem: string }) {
  const { vertical } = useProductVertical();
  if (vertical !== "dental") {
    return <AppShellContentPlaceholder view="healthcare-frontdesk" />;
  }

  if (frontdeskL2ActiveItem === FRONTDESK_L2_AGENT_KEY)         return <FrontDeskAgentPage />;
  if (frontdeskL2ActiveItem === FRONTDESK_L2_REVIEW_QUERIES_KEY) return <ReviewQueriesPage />;
  if (frontdeskL2ActiveItem === FRONTDESK_L2_RESOLUTIONS_KEY)    return <ResolutionsPage />;
  if (frontdeskL2ActiveItem === FRONTDESK_L2_TOP_QUESTIONS_KEY)  return <TopQuestionsPage />;

  return <AppShellContentPlaceholder view="healthcare-frontdesk" />;
}
