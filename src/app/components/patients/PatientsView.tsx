import { useProductVertical } from "@/app/context/ProductVerticalContext";
import { AllPatientsPage } from "@/app/components/patients/AllPatientsPage";
import { PatientSegmentationAgentsPage } from "@/app/components/patients/PatientSegmentationAgentsPage";
import { AppShellContentPlaceholder } from "@/app/components/layout/AppShellContentPlaceholder";
import {
  PATIENTS_L2_ALL_PATIENTS_KEY,
  PATIENTS_L2_PATIENT_SEGMENTS_KEY,
  PATIENTS_L2_SEGMENTATION_AGENTS_KEY,
} from "@/app/components/patients/patientsL2Nav";

export type PatientsViewProps = {
  patientsL2ActiveItem?: string;
};

export function PatientsView({ patientsL2ActiveItem }: PatientsViewProps = {}) {
  const { vertical } = useProductVertical();
  const isDental = vertical === "dental";

  if (!isDental) {
    return <AppShellContentPlaceholder view="healthcare-patients" />;
  }

  if (
    !patientsL2ActiveItem ||
    patientsL2ActiveItem === PATIENTS_L2_ALL_PATIENTS_KEY
  ) {
    return <AllPatientsPage />;
  }

  if (patientsL2ActiveItem === PATIENTS_L2_PATIENT_SEGMENTS_KEY) {
    return (
      <AppShellContentPlaceholder
        view="healthcare-patients"
        productLabel="Patients · Patient segments"
      />
    );
  }

  if (patientsL2ActiveItem === PATIENTS_L2_SEGMENTATION_AGENTS_KEY) {
    return <PatientSegmentationAgentsPage />;
  }

  return (
    <AppShellContentPlaceholder
      view="healthcare-patients"
      productLabel={`Patients · ${patientsL2ActiveItem.includes("/") ? patientsL2ActiveItem.split("/").pop() : patientsL2ActiveItem}`}
    />
  );
}
