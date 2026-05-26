import { useProductVertical } from "@/app/context/ProductVerticalContext";
import { IntakePipelinePage } from "@/app/components/intake/IntakePipelinePage";
import { IntakePreVisitAgentsPage } from "@/app/components/intake/IntakePreVisitAgentsPage";
import { AppShellContentPlaceholder } from "@/app/components/layout/AppShellContentPlaceholder";
import {
  INTAKE_L2_PIPELINE_KEY,
  INTAKE_L2_PRE_VISIT_AGENTS_KEY,
} from "@/app/components/intake/intakeL2Nav";

export type IntakeViewProps = {
  intakeL2ActiveItem?: string;
};

export function IntakeView({ intakeL2ActiveItem }: IntakeViewProps = {}) {
  const { vertical } = useProductVertical();
  const isDental = vertical === "dental";

  if (!isDental) {
    return <AppShellContentPlaceholder view="healthcare-intake" />;
  }

  if (!intakeL2ActiveItem || intakeL2ActiveItem === INTAKE_L2_PIPELINE_KEY) {
    return <IntakePipelinePage />;
  }

  if (intakeL2ActiveItem === INTAKE_L2_PRE_VISIT_AGENTS_KEY) {
    return <IntakePreVisitAgentsPage />;
  }

  const child = intakeL2ActiveItem.includes("/")
    ? intakeL2ActiveItem.split("/").pop()!
    : intakeL2ActiveItem;

  return (
    <AppShellContentPlaceholder
      view="healthcare-intake"
      productLabel={`Intake · ${child}`}
    />
  );
}
