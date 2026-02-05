import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { ProblemSection } from "@/components/problem-section";
import { SolutionSection } from "@/components/solution-section";
import { WhyOnChainSection } from "@/components/why-onchain-section";
import { WhoItsForSection } from "@/components/who-its-for-section";
import { FinalCtaSection } from "@/components/final-cta-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-midnight">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <WhyOnChainSection />
      <WhoItsForSection />
      <FinalCtaSection />
      <Footer />
    </main>
  );
}

