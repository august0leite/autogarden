"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Sprout, Plus, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import type { GrowData } from "./onboarding-flow";

interface MultiGrowDashboardProps {
  grows: GrowData[];
  onCreateGrow: () => void;
}

function getGrowMeta(grow: GrowData, index: number) {
  return { day: 12 + index * 11, grow };
}

export function MultiGrowDashboard({
  grows,
  onCreateGrow,
}: MultiGrowDashboardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const examples = [
    { phase: t.dashboard.multiGrow.phaseVegetative, statusLabel: t.dashboard.multiGrow.statusNextWatering, statusType: "ok" as const },
    { phase: t.dashboard.multiGrow.phaseFlowering, statusLabel: t.dashboard.multiGrow.statusEc, statusType: "info" as const },
    { phase: t.dashboard.multiGrow.phaseLateFlowering, statusLabel: t.dashboard.multiGrow.statusHarvestIn20Days, statusType: "info" as const },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-5xl"
    >

      {/* Grow cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grows.map((grow, index) => {
          const base = getGrowMeta(grow, index);
          const example = examples[index % examples.length];
          const meta = { ...base, ...example };
          return (
            <motion.button
              key={grow.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
              onClick={() => router.push(`/dashboard/grow/${grow.id}`)}
              className="bg-indigo border border-border rounded-2xl p-5 text-left hover:border-emerald/40 transition-all group w-full"
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald/15 flex items-center justify-center">
                    <Sprout className="w-4 h-4 text-emerald" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">
                      {grow.growName}
                    </p>
                    {grow.strainName && (
                      <p className="text-xs text-gray mt-0.5">{grow.strainName}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray group-hover:text-white transition-colors flex-shrink-0 mt-0.5" />
              </div>

              {/* Phase + day */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-emerald bg-emerald/10 px-2 py-0.5 rounded-full">
                  {meta.phase}
                </span>
                <span className="text-xs text-gray flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t.dashboard.day} {meta.day}
                </span>
              </div>

              {/* Phase bar */}
              <div className="flex gap-1 mb-4">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 h-1 rounded-full",
                      i < Math.floor((meta.day / 90) * 6)
                        ? "bg-lime"
                        : i === Math.floor((meta.day / 90) * 6)
                        ? "bg-emerald"
                        : "bg-border"
                    )}
                  />
                ))}
              </div>

              {/* Status */}
              <p
                className={cn(
                  "text-xs font-medium",
                  meta.statusType === "ok"
                    ? "text-lime"
                    : "text-gray"
                )}
              >
                {meta.statusLabel}
              </p>
            </motion.button>
          );
        })}

        {/* Add new grow card */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: grows.length * 0.06 }}
          onClick={onCreateGrow}
          className="bg-[#0F1115] border border-dashed border-border rounded-2xl p-5 text-left hover:border-emerald/40 transition-all group flex flex-col items-center justify-center min-h-[160px] gap-3"
        >
          <div className="w-10 h-10 rounded-xl border border-dashed border-border group-hover:border-emerald/50 flex items-center justify-center transition-colors">
            <Plus className="w-5 h-5 text-gray group-hover:text-emerald transition-colors" />
          </div>
          <span className="text-sm text-gray group-hover:text-white transition-colors">
            {t.dashboard.multiGrow.newGrow}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
