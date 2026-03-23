"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { api } from "@/convex/_generated/api";

export default function SignUpPage() {
  const createDomainUser = useMutation(
    api.modules.users.mutations.createDomainUser,
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name: fullName,
      });

      if (error) {
        setError(error.message ?? "Sign-up failed");
        return;
      }

      if (!data?.user?.id) {
        setError("Auth signup failed before returning a user id");
        return;
      }

      await createDomainUser({
        authUserId: data.user.id,
        email,
        fullName,
        mobileNumber: mobileNumber || undefined,
        referredByCode: referralCode || undefined,
      });

      const signInResult = await authClient.signIn.email({
        email,
        password,
        rememberMe: true,
      });

      if (signInResult.error) {
        setError(signInResult.error.message ?? "Sign-in after signup failed");
        return;
      }

      window.location.assign("/onboarding/cea");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected signup error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">Sign up</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Mobile number"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
        />
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Referral code (optional)"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-black px-4 py-2 text-white"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}