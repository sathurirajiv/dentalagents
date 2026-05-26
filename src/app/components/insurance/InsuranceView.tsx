import { useProductVertical } from "@/app/context/ProductVerticalContext";
import { InsuranceCasesPage } from "@/app/components/insurance/InsuranceCasesPage";
import { InsuranceVerificationAgentsPage } from "@/app/components/insurance/InsuranceVerificationAgentsPage";
import { AppShellContentPlaceholder } from "@/app/components/layout/AppShellContentPlaceholder";
import {
  INSURANCE_L2_CASES_KEY,
  INSURANCE_L2_VERIFICATION_AGENTS_KEY,
} from "@/app/components/insurance/insuranceL2Nav";

export type InsuranceViewProps = {
  insuranceL2ActiveItem?: string;
};

export function InsuranceView({ insuranceL2ActiveItem }: InsuranceViewProps = {}) {
  const { vertical } = useProductVertical();
  const isDental = vertical === "dental";

  if (!isDental) {
    return <AppShellContentPlaceholder view="healthcare-insurance" />;
  }

  if (!insuranceL2ActiveItem || insuranceL2ActiveItem === INSURANCE_L2_CASES_KEY) {
    return <InsuranceCasesPage />;
  }

  if (insuranceL2ActiveItem === INSURANCE_L2_VERIFICATION_AGENTS_KEY) {
    return <InsuranceVerificationAgentsPage />;
  }

  const child = insuranceL2ActiveItem.includes("/")
    ? insuranceL2ActiveItem.split("/").pop()!
    : insuranceL2ActiveItem;

  return (
    <AppShellContentPlaceholder
      view="healthcare-insurance"
      productLabel={`Insurance · ${child}`}
    />
  );
}
