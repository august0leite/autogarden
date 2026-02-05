"use client";

import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";
import { Button } from "./button";

export function FinalCtaSection() {
  return (
    <section className="w-full py-32 px-6 bg-gradient-to-b from-midnight via-indigo/10 to-midnight">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Start registering your music
          <br />
          <span className="text-gray">with confidence.</span>
        </h2>
        
        <p className="text-lg text-gray max-w-2xl mx-auto mb-12 leading-relaxed">
          Join independent creators who are taking control of their music authorship 
          with transparent, permanent records.
        </p>

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
            onClick={() => {}}
          >
            <Eye className="w-5 h-5" />
            View Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
