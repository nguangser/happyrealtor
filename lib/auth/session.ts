import type { Id } from "@/convex/_generated/dataModel";
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import type { AuthUserState } from "./onboarding";

export type CurrentUser = AuthUserState & {
  id: Id<"users">;
  authUserId: string;
  email: string;
  fullName: string;
  mobileNumber?: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const authed = await isAuthenticated();

  if (!authed) {
    return null;
  }

  const domainUser = await fetchAuthQuery(api.modules.users.queries.getCurrent, {});

  if (!domainUser) {
    return null;
  }

  return {
    id: domainUser._id,
    authUserId: domainUser.authUserId,
    email: domainUser.email,
    fullName: domainUser.fullName,
    mobileNumber: domainUser.mobileNumber,
    role: domainUser.role,
    accountStatus: domainUser.accountStatus,
    onboardingStage: domainUser.onboardingStage,
  };
}