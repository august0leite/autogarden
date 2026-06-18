"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sprout, 
  Plus, 
  User,
  LogOut, 
  Menu, 
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";

type NavItem = "works" | "create" | "profile";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeNav: NavItem;
  onNavChange: (nav: NavItem) => void;
  topBarAction?: React.ReactNode;
}

export function DashboardLayout({ children, activeNav, onNavChange, topBarAction }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems: Array<{ id: NavItem; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: "works", label: t.dashboard.myGrows, icon: <Sprout className="w-5 h-5" /> },
    { id: "create", label: t.dashboard.newGrow, icon: <Plus className="w-5 h-5" /> },
    { id: "profile", label: t.dashboard.profile, icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-midnight">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-indigo border-r border-border flex flex-col transition-all duration-300 fixed md:relative h-full z-40`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald flex items-center justify-center flex-shrink-0">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-lg font-bold text-white">Sprout</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeNav === item.id
                  ? "bg-emerald text-white"
                  : "text-gray hover:bg-indigo/50 hover:text-white"
              }`}
            >
              {item.icon}
              {sidebarOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {item.badge && sidebarOpen && (
                <span className="ml-auto text-xs bg-indigo/50 px-2 py-1 rounded">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray hover:bg-indigo/50 hover:text-white transition-all">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">{t.dashboard.signOut}</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex absolute -right-3 top-24 bg-indigo border border-border rounded-full p-1.5 text-gray hover:text-white transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </button>
      </motion.aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-indigo/80 rounded-lg text-white"
      >
        {sidebarOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="w-full flex justify-end items-center gap-2 px-6 md:px-8 py-4">
          {topBarAction}
          <LanguageSelector />
        </div>
        {/* Content */}
        <div className="px-6 md:px-8 pb-6 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
