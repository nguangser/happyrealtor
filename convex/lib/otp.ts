export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_RESEND_LIMIT = 3;
export const OTP_FAILED_ATTEMPT_LIMIT = 5;
export const OTP_LOCK_MS = 15 * 60 * 1000;

export async function hashOtp(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}