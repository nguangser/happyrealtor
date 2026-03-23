import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessAdmin } from "@/lib/auth/permissions";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!canAccessAdmin(user)) {
    redirect("/dashboard");
  }

  return <div>Admin</div>;
}