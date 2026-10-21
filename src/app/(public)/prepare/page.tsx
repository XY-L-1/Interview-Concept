import type { Metadata } from "next";
import { requireOwnerPage } from "@/modules/identity";
import { PreparationHub } from "@/modules/preparation/preparation-hub";

export const metadata: Metadata = {
  title: "Your private preparation",
  description: "Your private stories, role context, and interview practice.",
  robots: { index: false, follow: false },
};

export default async function PreparePage() {
  await requireOwnerPage();
  return <PreparationHub />;
}
