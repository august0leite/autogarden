"use client";

import { useState } from "react";
import { ArrowLeft, Mail, ArrowRight } from "lucide-react";
import { Button } from "./button";
import { AuthLayout } from "./auth-layout";
import { motion } from "motion/react";

export function ForgotPasswordCard() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    // Mock loading state
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSent(true);
      console.log("Password reset email sent to:", email);
    }, 1200);
  };

  if (sent) {
    return (
      <AuthLayout>
        <div className="bg-indigo/50 backdrop-blur border border-border rounded-2xl p-8 shadow-2xl text-center">
          {/* Success message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-violet/20 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Mail className="w-8 h-8 text-violet" />
              </motion.div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-gray text-sm leading-relaxed mb-6">
              We've sent a password reset link to{" "}
              <span className="text-white font-medium">{email}</span>
            </p>
            <p className="text-gray text-xs">
              It may take a minute to arrive. Check your spam folder if you don't see it.
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-3 mt-8 pt-8 border-t border-border/50"
          >
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to sign in
            </Button>
          </motion.div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="bg-indigo/50 backdrop-blur border border-border rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Reset your password</h1>
          <p className="text-gray text-sm">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-midnight/50 border border-border hover:border-border/80 transition-all duration-200 font-medium placeholder:text-gray/50 focus:outline-none focus:ring-2 focus:ring-violet focus:ring-offset-2 focus:ring-offset-indigo/50"
            />
          </motion.div>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-transparent border-t-white rounded-full"
                  />
                  Sending...
                </>
              ) : (
                <>
                  Send reset link
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </motion.div>
        </form>

        {/* Footer links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-gray space-y-3"
        >
          <div>
            <button
              type="button"
              className="text-violet hover:text-violet/80 transition-colors focus:outline-none focus:ring-2 focus:ring-violet focus:ring-offset-2 focus:ring-offset-indigo/50 rounded px-2 py-1 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </button>
          </div>
          <div>
            Don't have an account?{" "}
            <button
              type="button"
              className="text-violet hover:text-violet/80 transition-colors focus:outline-none focus:ring-2 focus:ring-violet focus:ring-offset-2 focus:ring-offset-indigo/50 rounded px-1 font-medium"
            >
              Create one
            </button>
          </div>
        </motion.div>
      </div>
    </AuthLayout>
  );
}
