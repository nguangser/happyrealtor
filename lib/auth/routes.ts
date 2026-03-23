export const PUBLIC_ROUTES = [
    "/",
    "/search",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ];
  
  export const ONBOARDING_ROUTES = [
    "/onboarding/cea",
    "/onboarding/otp",
    "/onboarding/profile",
  ];
  
  export function isPublicRoute(pathname: string) {
    return (
      PUBLIC_ROUTES.includes(pathname) ||
      pathname.startsWith("/listings/") ||
      pathname.startsWith("/projects/") ||
      pathname.startsWith("/realtors/") ||
      pathname.startsWith("/pages/")
    );
  }
  
  export function isOnboardingRoute(pathname: string) {
    return ONBOARDING_ROUTES.includes(pathname);
  }
  
  export function isDashboardRoute(pathname: string) {
    return pathname.startsWith("/dashboard");
  }
  
  export function isAdminRoute(pathname: string) {
    return pathname.startsWith("/admin");
  }