"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { MyWorksView } from "@/components/my-works-view";
import { CreateWorkView } from "@/components/create-work-view";
import { ProfileView } from "@/components/profile-view";

type NavItem = "works" | "create" | "profile";

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState<NavItem>("works");

  const handleSignOut = () => {
    // This would redirect to signin page or handle logout
    console.log("Sign out clicked");
  };

  const handleCreateWork = () => {
    setActiveNav("create");
  };

  return (
    <DashboardLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <div className="flex-1">
        {/* Works Management */}
        {activeNav === "works" && <MyWorksView onCreateWork={handleCreateWork} />}

        {/* Create New Work */}
        {activeNav === "create" && (
          <CreateWorkView onCancel={() => setActiveNav("works")} />
        )}

        {/* Profile */}
        {activeNav === "profile" && <ProfileView onSignOut={handleSignOut} />}
      </div>
    </DashboardLayout>
  );
}
