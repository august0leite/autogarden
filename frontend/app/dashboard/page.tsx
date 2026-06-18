"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { OnboardingFlow, type GrowData } from "@/components/onboarding-flow";
import { GrowDashboard } from "@/components/grow-dashboard";
import { MultiGrowDashboard } from "@/components/multi-grow-dashboard";
import { ProfileView } from "@/components/profile-view";

const STORAGE_KEY = "sprout_grows";

type NavItem = "works" | "create" | "profile";

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState<NavItem>("works");
  const [grows, setGrows] = useState<GrowData[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as GrowData[];
    } catch {}
    return [];
  });
  const [isOnboarding, setIsOnboarding] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: GrowData[] = JSON.parse(stored);
        return parsed.length === 0;
      }
    } catch {}
    return true;
  });
  const [isCreatingGrow, setIsCreatingGrow] = useState(false);

  // Persist grows whenever they change
  useEffect(() => {
    if (grows.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(grows));
    }
  }, [grows]);

  const isFirstRun = isOnboarding && grows.length === 0;

  const handleOnboardingComplete = (data: GrowData) => {
    setGrows((prev) => [...prev, data]);
    setIsOnboarding(false);
    setIsCreatingGrow(false);
    setActiveNav("works");
  };

  const handleCreateGrow = () => {
    setIsCreatingGrow(true);
    setActiveNav("works");
  };

  const handleNavChange = (nav: NavItem) => {
    if (nav === "create") {
      handleCreateGrow();
    } else {
      setIsCreatingGrow(false);
      setActiveNav(nav);
    }
  };

  const handleSignOut = () => {
    console.log("Sign out clicked");
  };

  // First-run: full-screen onboarding, no chrome
  if (isFirstRun) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <DashboardLayout activeNav={activeNav} onNavChange={handleNavChange}>
      <div className="flex-1">
        {/* Creating a new grow — inline inside the dashboard */}
        {isCreatingGrow && activeNav === "works" && (
          <OnboardingFlow
            modal
            initialStep={2}
            onComplete={handleOnboardingComplete}
            onCancel={() => setIsCreatingGrow(false)}
          />
        )}

        {/* Grows */}
        {!isCreatingGrow && activeNav === "works" && (
          <>
            {grows.length === 1 ? (
              <GrowDashboard
                grow={grows[0]}
                currentDay={12}
                onAddGrow={handleCreateGrow}
              />
            ) : grows.length > 1 ? (
              <MultiGrowDashboard
                grows={grows}
                onCreateGrow={handleCreateGrow}
              />
            ) : null}
          </>
        )}

        {/* Profile */}
        {activeNav === "profile" && <ProfileView onSignOut={handleSignOut} />}
      </div>
    </DashboardLayout>
  );
}


