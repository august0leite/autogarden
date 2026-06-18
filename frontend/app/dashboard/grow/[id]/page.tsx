"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { GrowDashboard } from "@/components/grow-dashboard";
import { OnboardingFlow, type GrowData } from "@/components/onboarding-flow";
import { ProfileView } from "@/components/profile-view";

const STORAGE_KEY = "sprout_grows";

type NavItem = "works" | "create" | "profile";

export default function GrowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [grow, setGrow] = useState<GrowData | null>(null);
  const [activeNav, setActiveNav] = useState<NavItem>("works");
  const [isCreatingGrow, setIsCreatingGrow] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const grows: GrowData[] = JSON.parse(stored);
        const found = grows.find((g) => g.id === params.id);
        if (found) setGrow(found);
        else router.replace("/dashboard");
      } else {
        router.replace("/dashboard");
      }
    } catch {
      router.replace("/dashboard");
    }
  }, [params.id, router]);

  const handleNewGrowComplete = (data: GrowData) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const grows: GrowData[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...grows, data]));
    } catch {}
    setIsCreatingGrow(false);
    router.push(`/dashboard/grow/${data.id}`);
  };

  const handleNavChange = (nav: NavItem) => {
    if (nav === "create") {
      setIsCreatingGrow(true);
      setActiveNav("works");
    } else if (nav === "works") {
      router.push("/dashboard");
    } else {
      setIsCreatingGrow(false);
      setActiveNav(nav);
    }
  };

  if (!grow) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-emerald border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout 
      activeNav={activeNav} 
      onNavChange={handleNavChange}
      topBarAction={
        !isCreatingGrow && activeNav === "works" && (
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald/10 border border-emerald/30 text-emerald hover:text-white hover:bg-emerald hover:border-emerald transition-all"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )
      }
    >
      <div className="max-w-7xl">

        {isCreatingGrow ? (
          <OnboardingFlow
            modal
            initialStep={2}
            onComplete={handleNewGrowComplete}
            onCancel={() => setIsCreatingGrow(false)}
          />
        ) : activeNav === "works" ? (
          <GrowDashboard
            grow={grow}
            currentDay={12}
            onAddGrow={() => {
              setIsCreatingGrow(true);
              setActiveNav("works");
            }}
          />
        ) : activeNav === "profile" ? (
          <ProfileView onSignOut={() => console.log("sign out")} />
        ) : null}
      </div>
    </DashboardLayout>
  );
}
