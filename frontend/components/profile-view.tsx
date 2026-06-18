"use client";

import { useState } from "react";
import { User, Mail, LogOut } from "lucide-react";
import { Button } from "./button";
import { motion } from "motion/react";

interface ProfileViewProps {
  onSignOut: () => void;
}

export function ProfileView({ onSignOut }: ProfileViewProps) {
  const [name, setName] = useState("Alex Johnson");
  const [email] = useState("alex@sprout.ag");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl"
    >
      {/* Profile Header */}
      <div className="bg-indigo/30 border border-border rounded-lg p-8 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet to-indigo flex items-center justify-center flex-shrink-0">
            <User className="w-10 h-10 text-white" />
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-white mb-6">{name}</h2>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray">
                <Mail className="w-4 h-4" />
                <span>{email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <div className="bg-indigo/30 border border-border rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white">Account settings</h3>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-midnight/50 border border-border text-white focus:outline-none focus:ring-2 focus:ring-emerald"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 rounded-lg bg-midnight/50 border border-border text-gray cursor-not-allowed"
            />
            <p className="text-xs text-gray mt-2">
              Contact support to change your email address
            </p>
          </div>

          <div className="pt-4 border-t border-border/50">
            <Button variant="secondary" size="lg" className="w-full">
              Edit profile
            </Button>
          </div>
        </div>

        {/* Device Settings */}
        <div className="bg-indigo/30 border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Connected devices</h3>

          <div className="bg-midnight/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0 bg-green-500" />
              <span className="text-sm font-medium text-white">3 devices online</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-emerald/10 rounded border border-emerald/20">
                <span className="text-sm text-white">Soil Sensor #1</span>
                <span className="text-xs text-gray">Active</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-emerald/10 rounded border border-emerald/20">
                <span className="text-sm text-white">Temperature Controller</span>
                <span className="text-xs text-gray">Active</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-emerald/10 rounded border border-emerald/20">
                <span className="text-sm text-white">Irrigation System</span>
                <span className="text-xs text-gray">Active</span>
              </div>
            </div>

            <p className="text-xs text-gray">
              All devices are connected and monitoring your cultivation environment
            </p>
          </div>

          <Button variant="secondary" size="lg" className="w-full">
            Manage devices
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
