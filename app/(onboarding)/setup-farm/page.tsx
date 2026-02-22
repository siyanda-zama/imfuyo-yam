import dynamic from "next/dynamic";

const FarmSetupWizard = dynamic(
  () => import("@/components/onboarding/FarmSetupWizard"),
  { ssr: false }
);

export default function SetupFarmPage() {
  return <FarmSetupWizard />;
}
