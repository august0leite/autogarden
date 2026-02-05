"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "./button";
import { motion } from "motion/react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Abstract grid background */}
      <div className="absolute inset-0 bg-midnight">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet/5 via-transparent to-transparent" />
        
        {/* Connected nodes effect - subtle circles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-violet/30 blur-sm" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-violet/20 blur-sm" />
        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 rounded-full bg-violet/25 blur-sm" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center"
      >
        {/* Logo/Product name */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-gray bg-clip-text text-transparent">
            Audiofy
          </h1>
        </div>

        {/* Headline */}
        <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
          Music authorship,
          <br />
          <span className="text-gray">recorded forever.</span>
        </h2>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-gray max-w-2xl mx-auto mb-12 leading-relaxed">
          Register your music with transparent ownership and royalty splits — no intermediaries, no ambiguity.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/signup">
            <Button 
              variant="primary" 
              size="lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <PlayCircle className="w-5 h-5" />
            How it works
          </Button>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-border rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 bg-gray rounded-full" />
        </div>
      </div>
    </section>
  );
}
