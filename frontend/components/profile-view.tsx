"use client";

import { useState } from "react";
import { User, Mail, Link as LinkIcon, LogOut } from "lucide-react";
import { Button } from "./button";
import { motion } from "motion/react";

interface ProfileViewProps {
  onSignOut: () => void;
}

export function ProfileView({ onSignOut }: ProfileViewProps) {
  const [name, setName] = useState("Alex Johnson");
  const [email] = useState("alex@audiofy.io");
  const [walletConnected] = useState(true);
  const [walletAddress] = useState("0x742d...8e88");

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
            <h2 className="text-2xl font-semibold text-white mb-2">{name}</h2>
            <p className="text-gray mb-4">Music creator and artist</p>

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
              className="w-full px-4 py-2 rounded-lg bg-midnight/50 border border-border text-white focus:outline-none focus:ring-2 focus:ring-violet"
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

        {/* Wallet Connection */}
        <div className="bg-indigo/30 border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Wallet</h3>

          <div className="bg-midnight/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  walletConnected ? "bg-green-500" : "bg-yellow-500"
                }`}
              />
              <span className="text-sm font-medium text-white">
                {walletConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            {walletConnected && (
              <div className="flex items-center gap-2 p-3 bg-violet/10 rounded-lg border border-violet/20">
                <LinkIcon className="w-4 h-4 text-violet flex-shrink-0" />
                <span className="text-sm font-mono text-white">{walletAddress}</span>
              </div>
            )}

            <p className="text-xs text-gray">
              {walletConnected
                ? "Your wallet is connected and ready for on-chain transactions"
                : "Connect a wallet to register works on-chain"}
            </p>
          </div>

          <Button variant="secondary" size="lg" className="w-full">
            {walletConnected ? "Disconnect wallet" : "Connect wallet"}
          </Button>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-indigo/30 border border-border rounded-lg p-6 mt-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Preferences</h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm text-white">
              Email me when someone registers a collaboration with my work
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm text-white">
              Notify me about new royalties distributions
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm text-white">
              Include my profile in the Audiofy creator directory
            </span>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mt-6 space-y-4">
        <h3 className="text-lg font-semibold text-red-400">Danger zone</h3>

        <div className="space-y-3">
          <Button variant="secondary" size="lg" className="w-full">
            Request data export
          </Button>

          <Button
            variant="primary"
            size="lg"
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            onClick={onSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
