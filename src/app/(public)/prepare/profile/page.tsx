import type { Metadata } from "next";
import Link from "next/link";
import { requireOwnerPage } from "@/modules/identity/server";
import { PreparationWorkspacePage } from "@/modules/preparation/workspace";

export const metadata: Metadata = { title: "My profile", description: "Your private interview profile.", robots: { index: false, follow: false } };

export default async function ProfilePage() {
  await requireOwnerPage();
  return <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
    <Link href="/prepare" className="text-sm font-medium text-muted hover:text-brand">← Preparation</Link>
    <p className="mt-7 text-xs font-semibold uppercase tracking-widest text-brand">Private workspace</p>
    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">My profile</h1>
    <p className="mb-8 mt-3 max-w-2xl text-base leading-7 text-muted">Keep your facts, evidence, and project contributions together. Prepare a different emphasis for each conversation.</p>
    <PreparationWorkspacePage />
  </main>;
}
