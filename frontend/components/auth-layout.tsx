"use client";

import { motion } from "motion/react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-midnight">
      {/* Left side - Branding & Context */}
      <div className="absolute inset-y-0 left-0 w-0 md:w-1/2 bg-gradient-to-br from-indigo to-midnight">
        {/* Abstract background elements */}
        <div className="absolute inset-0">
          {/* Grid pattern - very subtle */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px'
            }} 
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald/10 via-transparent to-transparent" />
          
          {/* Animated nodes/connections - very subtle */}
          <motion.div
            animate={{ 
              y: [0, 30, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-emerald/20 blur-md"
          />
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-emerald/15 blur-md"
          />
          <motion.div
            animate={{ 
              y: [0, 25, 0],
              opacity: [0.25, 0.45, 0.25]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 rounded-full bg-emerald/18 blur-md"
          />
          
          {/* Connection lines - very faint */}
          <svg className="absolute inset-0 w-full h-full opacity-5">
            <line x1="25%" y1="25%" x2="75%" y2="75%" stroke="rgb(16, 185, 129)" strokeWidth="1" />
            <line x1="75%" y1="25%" x2="25%" y2="75%" stroke="rgb(16, 185, 129)" strokeWidth="1" />
          </svg>
        </div>

        {/* Content - hidden on mobile, visible on desktop */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 h-full flex flex-col justify-center px-12 py-20 hidden md:flex"
        >
          {/* Logo */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white">Sprout</h1>
          </div>

          {/* Main headline */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              Access your cultivation dashboard.
            </h2>
            <p className="text-gray text-lg leading-relaxed mb-8">
              Securely manage your grow operations, device connections, and environmental data.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald/40 flex items-center justify-center mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald" />
              </div>
              <span className="text-gray">Real-time environmental monitoring</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald/40 flex items-center justify-center mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald" />
              </div>
              <span className="text-gray">Automated device control</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald/40 flex items-center justify-center mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald" />
              </div>
              <span className="text-gray">Complete cultivation history</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Authentication Card */}
      <div className="relative z-10 w-full md:w-1/2 md:ml-auto min-h-screen flex items-center justify-center px-6 py-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
