"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./button";
import { AuthLayout } from "./auth-layout";
import { motion } from "motion/react";
import { useTranslation } from "@/lib/i18n";

export function SignInCard() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError(t.auth.errorEmailRequired);
      return;
    }

    if (!password) {
      setError(t.auth.errorPasswordRequired);
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
      <div className="relative bg-indigo/50 backdrop-blur border border-border rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">{t.auth.signInTitle}</h1>
          <p className="text-gray text-sm">
            {t.auth.signInSubtitle}
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
              {t.auth.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              placeholder={t.auth.emailPlaceholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error === t.auth.errorEmailRequired) setError(null);
              }}
              className={`w-full px-4 py-3 rounded-lg bg-midnight/50 border transition-all duration-200 font-medium placeholder:text-gray/50 focus:outline-none focus:ring-2 focus:ring-emerald focus:ring-offset-2 focus:ring-offset-indigo/50 ${
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
              {t.auth.passwordLabel}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t.auth.passwordPlaceholder}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error === t.auth.errorPasswordRequired) setError(null);
                }}
                className={`w-full px-4 py-3 rounded-lg bg-midnight/50 border transition-all duration-200 font-medium placeholder:text-gray/50 focus:outline-none focus:ring-2 focus:ring-emerald focus:ring-offset-2 focus:ring-offset-indigo/50 ${
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
                  {t.auth.signingIn}
                </>
              ) : (
                t.auth.signInButton
              )}
            </Button>
          </motion.div>
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
              className="text-sm text-gray hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald focus:ring-offset-2 focus:ring-offset-indigo/50 rounded px-2 py-1"
            >
              {t.auth.forgotPassword}
            </button>
          </div>
          <div className="text-center text-sm text-gray">
            {t.auth.noAccount}{" "}
            <Link 
              href="/signup"
              className="text-emerald hover:text-emerald/80 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald focus:ring-offset-2 focus:ring-offset-indigo/50 rounded px-1 font-medium"
            >
              {t.auth.createAccount}
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
                className="w-8 h-8 border-3 border-transparent border-t-emerald rounded-full"
              />
              <span className="text-sm text-gray">Verifying credentials...</span>
            </div>
          </motion.div>
        )}
      </div>
    </AuthLayout>
  );
}
