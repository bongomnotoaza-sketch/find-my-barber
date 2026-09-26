import { useState } from "react";
import { signIn } from "../../lib/auth"; // adjust path to wherever auth.ts lives

type LoginProps = {
  onLoginSuccess: () => void;
  onSignUpPress: () => void;
};

export default function Login({ onLoginSuccess, onSignUpPress }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn(email, password);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/pwa-512x512.png"
            alt="Find My Barber"
            className="w-24 h-24 object-contain"
          />
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Sign in to continue to Find My Barber
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm text-zinc-300 mb-2">
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
                w-full h-13 px-4 rounded-xl bg-zinc-950
                border border-zinc-800 text-white placeholder:text-zinc-600
                outline-none transition
                focus:border-pink-500 focus:ring-1 focus:ring-pink-500/40
              "
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="text-sm text-zinc-300">
                Password
              </label>
              <button
                type="button"
                className="text-xs text-pink-400 hover:text-pink-300 transition"
              >
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
                w-full h-13 px-4 rounded-xl bg-zinc-950
                border border-zinc-800 text-white placeholder:text-zinc-600
                outline-none transition
                focus:border-pink-500 focus:ring-1 focus:ring-pink-500/40
              "
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-400 text-center -mt-1">
              {error}
            </p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full h-13 rounded-xl mt-2 font-semibold text-white
              bg-gradient-to-r from-orange-500 via-pink-500 to-red-500
              hover:opacity-90 active:scale-[0.99] transition
              shadow-lg shadow-pink-500/10
              disabled:opacity-60 disabled:active:scale-100
            "
          >
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>

        {/* Sign up */}
        <p className="text-center text-sm text-zinc-500 mt-7">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSignUpPress}
            className="text-pink-400 hover:text-pink-300 transition"
          >
            Sign up
          </button>
        </p>

      </div>
    </div>
  );
}