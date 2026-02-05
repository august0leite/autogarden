"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Wallet } from "lucide-react";
import { Button } from "./button";
import { AuthLayout } from "./auth-layout";
import { motion } from "motion/react";

type InputState = "default" | "focus" | "error" | "success";

export function SignInCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    // Mock loading state
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Mock success
      console.log("Sign in attempted with:", { email, password });
    }, 1500);
  };

  return (
    <AuthLayout>
      <div className="bg-indigo/50 backdrop-blur border border-border rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Sign in to Audiofy</h1>
          <p className="text-gray text-sm">
            Access your music registry and manage your works.
          </p>
        </motion.div>

        <form onSubmit={handleSignIn} className="space-y-4">
          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error === "Email is required") setError(null);
              }}
              className={`w-full px-4 py-3 rounded-lg bg-midnight/50 border transition-all duration-200 font-medium placeholder:text-gray/50 focus:outline-none focus:ring-2 focus:ring-violet focus:ring-offset-2 focus:ring-offset-indigo/50 ${
                error ? "border-red-500/50 focus:ring-red-500" : "border-border hover:border-border/80"
              }`}
            />
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error === "Password is required") setError(null);
                }}
                className={`w-full px-4 py-3 rounded-lg bg-midnight/50 border transition-all duration-200 font-medium placeholder:text-gray/50 focus:outline-none focus:ring-2 focus:ring-violet focus:ring-offset-2 focus:ring-offset-indigo/50 ${
                  error ? "border-red-500/50 focus:ring-red-500" : "border-border hover:border-border/80"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-white transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Error message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: error ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="min-h-5"
          >
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                {error}
              </div>
            )}
          </motion.div>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-transparent border-t-white rounded-full"
                  />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="relative py-4"
          >
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <div className="relative flex justify-center">
              <span className="px-3 bg-indigo/50 text-gray text-sm">or continue with</span>
            </div>
          </motion.div>

          {/* Wallet Sign In */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => console.log("Wallet sign in")}
            >
              <Wallet className="w-5 h-5" />
              Sign in with wallet
            </Button>
          </motion.div>

          {/* Wallet microcopy */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-center text-gray text-xs leading-relaxed"
          >
            No transaction or fees required
          </motion.p>
        </form>

        {/* Footer links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="mt-6 pt-6 border-t border-border/50 space-y-3"
        >
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-gray hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-violet focus:ring-offset-2 focus:ring-offset-indigo/50 rounded px-2 py-1"
            >
              Forgot your password?
            </button>
          </div>
          <div className="text-center text-sm text-gray">
            Don't have an account?{" "}
            <Link href="/signup">
              <button
                type="button"
                className="text-violet hover:text-violet/80 transition-colors focus:outline-none focus:ring-2 focus:ring-violet focus:ring-offset-2 focus:ring-offset-indigo/50 rounded px-1 font-medium"
              >
                Create one
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Loading state mockup - visible when needed */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl bg-midnight/20 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-3 border-transparent border-t-violet rounded-full"
              />
              <span className="text-sm text-gray">Verifying credentials...</span>
            </div>
          </motion.div>
        )}
      </div>
    </AuthLayout>
  );
}
