import { getOptionalOwner } from "@/modules/identity";
import { AppShell } from "@/shared/ui/app-shell";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const owner = await getOptionalOwner();
  return <AppShell owner={owner}>{children}</AppShell>;
}
