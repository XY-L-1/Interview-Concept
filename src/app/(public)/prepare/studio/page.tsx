import type { Metadata } from "next";
import Link from "next/link";
import { StudioWorkspace } from "@/modules/preparation/studio-workspace";
import { requireOwnerPage } from "@/modules/identity";
import { Icon } from "@/shared/ui/icons";

export const metadata: Metadata = {
  title: "Private Interview Studio",
  description: "Your private interview stories, timed practice, quizzes, and foundations.",
  robots: { index: false, follow: false },
};

export default async function StudioPage() {
  await requireOwnerPage();
  return <main id="main-content" tabIndex={-1}>
    <header className="ui-page !pb-7">
      <Link href="/prepare" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-brand"><Icon name="arrow-left" size={16} />Back to preparation</Link>
      <h1 className="ui-page-title mt-6">Practice, in depth.</h1>
      <p className="ui-page-subtitle">Your original stories, English answers, and technical foundations.</p>
    </header>
    <StudioWorkspace />
  </main>;
}
