export function generateReferralCode(fullName: string): string {
    const clean = fullName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${clean || "USER"}${suffix}`;
  }