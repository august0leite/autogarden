"use client";

import Link from "next/link";
import { Button } from "./button";
import { motion } from "motion/react";

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-midnight/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-white hover:text-violet transition-colors">
            Audiofy
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
              How it works
            </Link>
            <Link href="#why-on-chain" className="text-gray-300 hover:text-white transition-colors">
              Why On-Chain
            </Link>
            <Link href="#who-is-it-for" className="text-gray-300 hover:text-white transition-colors">
              For Artists
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <Button variant="secondary" className="hidden sm:inline-flex">
              Sign In
            </Button>
            <Button variant="primary">
              Get started
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
