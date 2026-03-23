export type UserRole = "pending" | "realtor" | "admin" | "superadmin";
export type AccountStatus = "active" | "suspended" | "deactivated";
export type OnboardingStage =
  | "pending_cea"
  | "pending_otp"
  | "profile_setup"
  | "completed";

export type AuthUserState = {
  role: UserRole;
  accountStatus: AccountStatus;
  onboardingStage: OnboardingStage;
};

export function getRedirectPathForUser(user: AuthUserState): string {
  if (user.accountStatus === "suspended" || user.accountStatus === "deactivated") {
    return "/sign-in";
  }

  if (user.role === "admin" || user.role === "superadmin") {
    return "/admin";
  }

  if (user.onboardingStage === "pending_cea") {
    return "/onboarding/cea";
  }

  if (user.onboardingStage === "pending_otp") {
    return "/onboarding/otp";
  }

  if (user.onboardingStage === "profile_setup") {
    return "/onboarding/profile";
  }

  return "/dashboard";
}