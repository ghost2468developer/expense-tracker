import { Dashboard } from "@/components/dashboard";
import { Landing } from "@/components/landing";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) return <Landing />;
  return <Dashboard user={user} />;
}
