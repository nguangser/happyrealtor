"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

type Props = {
  userId: Id<"users">;
  mobileNumber?: string;
};

export function OtpForm({ userId, mobileNumber }: Props) {

  const requestOtp = useMutation(api.modules.otp.mutations.requestOtp);
  const verifyOtp = useMutation(api.modules.otp.mutations.verifyOtp);

  const [phone, setPhone] = useState(mobileNumber ?? "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setTimeout(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function handleSendOtp() {
    setError(null);
    setInfo(null);
    setIsSending(true);

    try {
      await requestOtp({
        userId,
        mobileNumber: phone,
        purpose: "verify_mobile",
      });

      setInfo("Mock OTP sent. Check your Convex terminal output.");
      setCooldown(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsSending(false);
    }
  }

  async function handleVerify(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsVerifying(true);

    try {
      const result = await verifyOtp({
        userId,
        mobileNumber: phone,
        purpose: "verify_mobile",
        code: otp,
      });

      if (result.ok) {
        window.location.assign("/onboarding/profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
      <div>
        <label
          htmlFor="mobile"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Mobile Number
        </label>
        <input
          id="mobile"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
          placeholder="e.g. 96338323"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={handleSendOtp}
        disabled={isSending || cooldown > 0}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSending
          ? "Sending..."
          : cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Send OTP"}
      </button>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label
            htmlFor="otp"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            OTP Code
          </label>
          <input
            id="otp"
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        {info ? <p className="text-sm text-green-700">{info}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isVerifying}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isVerifying ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
}