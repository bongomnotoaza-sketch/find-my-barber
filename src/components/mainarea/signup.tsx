import { useState } from "react";
import { signUp } from "../../lib/signup"; // adjust path
import RefundsPolicy from "./refundspolicy";
import PrivacyPolicy from "./privacypolicys";
import TermsPolicy from "./termspolicys";

type SignUpProps = {
  onClose: () => void;
  // NEW: pass which kind of account they signed up as
  onSignUpSuccess: (role: "user" | "barber") => void;
};

type PolicyView = "none" | "terms" | "privacy" | "refunds";

export default function SignUp({ onClose, onSignUpSuccess }: SignUpProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [agreed, setAgreed] = useState(false);
  const [policyView, setPolicyView] = useState<PolicyView>("none");

  const handleSubmit = async (
    e: React.FormEvent | React.MouseEvent,
    role: "user" | "barber" = "user"
  ) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!agreed) {
      setError("Please agree to the Terms and Policies to continue.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const result = await signUp({
      email,
      phoneNumber: phone,
      password,
      termsAgreed: agreed,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    // If email confirmation is ON, there's no session yet.
    if (!result.data.session) {
      setMessage("Check your email to confirm your account.");
      return;
    }

    // Otherwise the user is signed in immediately.
    onSignUpSuccess(role);
  };

  if (policyView !== "none") {
    const back = () => setPolicyView("none");

    if (policyView === "terms") {
      return <TermsPolicy onBack={back} />;
    }
    if (policyView === "privacy") {
      return <PrivacyPolicy onBack={back} />;
    }
    return <RefundsPolicy onBack={back} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 relative">
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="
          absolute
          top-5
          right-5
          w-10
          h-10
          rounded-full
          flex
          items-center
          justify-center
          text-zinc-400
          hover:text-white
          hover:bg-white/10
          transition
        "
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M18 6L6 18" />
          <path d="M6 6L18 18" />
        </svg>
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/pwa-512x512.png"
            alt="Find My Barber"
            className="w-20 h-20 object-contain"
          />
        </div>

        {/* Heading */}
        <div className="text-center mb-7">
          <h1 className="text-3xl font-semibold tracking-tight">
            Create account
          </h1>

          <p className="text-zinc-400 mt-2 text-sm">
            Join Find My Barber
          </p>
        </div>

        {/* Form */}
        <form
          className="space-y-4"
          onSubmit={(e) => handleSubmit(e, "user")}
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm text-zinc-300 mb-2"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                w-full
                h-12
                px-4
                rounded-xl
                bg-zinc-950
                border border-zinc-800
                text-white
                placeholder:text-zinc-600
                outline-none
                transition
                focus:border-pink-500
                focus:ring-1
                focus:ring-pink-500/40
              "
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm text-zinc-300 mb-2"
            >
              Phone number
            </label>

            <input
              id="phone"
              type="tel"
              placeholder="+27 00 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="
                w-full
                h-12
                px-4
                rounded-xl
                bg-zinc-950
                border border-zinc-800
                text-white
                placeholder:text-zinc-600
                outline-none
                transition
                focus:border-pink-500
                focus:ring-1
                focus:ring-pink-500/40
              "
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm text-zinc-300 mb-2"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
                w-full
                h-12
                px-4
                rounded-xl
                bg-zinc-950
                border border-zinc-800
                text-white
                placeholder:text-zinc-600
                outline-none
                transition
                focus:border-pink-500
                focus:ring-1
                focus:ring-pink-500/40
              "
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm text-zinc-300 mb-2"
            >
              Confirm password
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="
                w-full
                h-12
                px-4
                rounded-xl
                bg-zinc-950
                border border-zinc-800
                text-white
                placeholder:text-zinc-600
                outline-none
                transition
                focus:border-pink-500
                focus:ring-1
                focus:ring-pink-500/40
              "
            />
          </div>

          {/* Agree to terms */}
          <label className="flex items-start gap-3 pt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="
                mt-0.5
                h-4
                w-4
                shrink-0
                rounded
                border-zinc-700
                bg-zinc-950
                accent-pink-500
                cursor-pointer
              "
            />

            <span className="text-xs text-zinc-400 leading-relaxed">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setPolicyView("terms")}
                className="text-pink-400 hover:text-pink-300 underline underline-offset-2"
              >
                Customer Terms and Conditions
              </button>
              {", "}
              <button
                type="button"
                onClick={() => setPolicyView("privacy")}
                className="text-pink-400 hover:text-pink-300 underline underline-offset-2"
              >
                Privacy Policy
              </button>
              {" and "}
              <button
                type="button"
                onClick={() => setPolicyView("refunds")}
                className="text-pink-400 hover:text-pink-300 underline underline-offset-2"
              >
                Refund, Cancellation and Dispute Policy
              </button>
              .
            </span>
          </label>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-400 text-center">
              {error}
            </p>
          )}

          {/* Success message (e.g. "check your email") */}
          {message && (
            <p className="text-sm text-green-400 text-center">
              {message}
            </p>
          )}

          {/* Split sign-up buttons */}
          <div className="flex flex-col gap-3 mt-3">
            {/* Barber button — submits with role="barber" */}
            <button
              type="button"
              onClick={(e) => handleSubmit(e, "barber")}
              disabled={loading || !agreed}
              className="
                w-full
                h-12
                rounded-xl
                font-semibold
                text-white
                bg-gradient-to-r
                from-orange-500
                via-pink-500
                to-red-500
                hover:opacity-90
                active:scale-[0.99]
                transition
                shadow-lg
                shadow-pink-500/10
                disabled:opacity-60
                disabled:active:scale-100
                disabled:cursor-not-allowed
              "
            >
              {loading ? "Creating account..." : "Sign up as Barber"}
            </button>

            {/* User button — submits with role="user" via the form's onSubmit */}
            <button
              type="submit"
              disabled={loading || !agreed}
              className="
                w-full
                h-12
                rounded-xl
                font-semibold
                text-white
                bg-gradient-to-r
                from-orange-500
                via-pink-500
                to-red-500
                hover:opacity-90
                active:scale-[0.99]
                transition
                shadow-lg
                shadow-pink-500/10
                disabled:opacity-60
                disabled:active:scale-100
                disabled:cursor-not-allowed
              "
            >
              {loading ? "Creating account..." : "Sign up as User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}