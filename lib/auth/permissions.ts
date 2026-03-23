import type { AuthUserState } from "./onboarding";

export function canAccessDashboard(user: AuthUserState) {
  return (
    user.accountStatus === "active" &&
    (user.role === "realtor" || user.role === "admin" || user.role === "superadmin") &&
    user.onboardingStage === "completed"
  );
}

export function canAccessAdmin(user: AuthUserState) {
  return (
    user.accountStatus === "active" &&
    (user.role === "admin" || user.role === "superadmin")
  );
}