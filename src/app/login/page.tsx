import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth-screen";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");
  return <AuthScreen mode="login" />;
}
