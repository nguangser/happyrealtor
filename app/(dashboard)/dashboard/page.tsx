import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessDashboard } from "@/lib/auth/permissions";
import { getRedirectPathForUser } from "@/lib/auth/onboarding";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!canAccessDashboard(user)) {
    redirect(getRedirectPathForUser(user));
  }

  return <div>Dashboard</div>;
}