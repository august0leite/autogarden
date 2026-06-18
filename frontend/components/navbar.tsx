"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { buttonVariants } from "./button";
import { LanguageSelector } from "./language-selector";
import { useTranslation } from "@/lib/i18n";

export function Navbar() {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const { t } = useTranslation();

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-midnight/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-white hover:text-emerald transition-colors">
            Sprout
          </Link>

          {/* Navigation Links - Only visible on landing page */}
          {isLandingPage && (
            <div className="hidden md:flex items-center gap-8">
              <Link href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
                {t.navbar.howItWorks}
              </Link>
              <Link href="#why-automated" className="text-gray-300 hover:text-white transition-colors">
                {t.navbar.whyUse}
              </Link>
              <Link href="#who-is-it-for" className="text-gray-300 hover:text-white transition-colors">
                {t.navbar.whoIsItFor}
              </Link>
            </div>
          )}

          {/* CTA Buttons + Language Selector */}
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Link href="/signin" className={buttonVariants({ variant: "secondary" })}>
              {t.navbar.signIn}
            </Link>
            <Link href="/signup" className={buttonVariants({ variant: "primary", className: "hidden sm:inline-flex" })}>
              {t.navbar.getStarted}
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
