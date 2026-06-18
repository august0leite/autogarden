"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sprout,
  ArrowRight,
  ChevronLeft,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export interface GrowData {
  id: string;
  growName: string;
  startDate: string;
  strainName: string;
  plantCount: number;
  plantType: "autoflower" | "photoperiod" | "unknown";
  environment: "tent" | "cabinet" | "room" | "outdoor";
  substrate: "soil" | "coco" | "peat" | "hydro";
  useFertilizers: boolean;
  fertilizerBrand: string;
  equipment: string[];
}

interface OnboardingFlowProps {
  onComplete: (data: GrowData) => void;
  /** Start at a specific step (1 = welcome). Default: 1 */
  initialStep?: number;
  /** When true, renders without the full-screen page wrapper */
  modal?: boolean;
  onCancel?: () => void;
}

const ENVIRONMENTS = [
  { id: "tent" as const, icon: "🌱" },
  { id: "cabinet" as const, icon: "🪴" },
  { id: "room" as const, icon: "🏠" },
  { id: "outdoor" as const, icon: "☀️" },
];

const SUBSTRATES = [
  { id: "soil" as const },
  { id: "coco" as const },
  { id: "peat" as const },
  { id: "hydro" as const },
];

const FERTILIZER_BRANDS = [
  "Advanced Nutrients",
  "BioBizz",
  "Canna",
  "General Hydroponics",
  "GreenHouse Feeding",
  "Hesi",
  "House & Garden",
  "Mills Nutrients",
  "Plagron",
  "Remo Nutrients",
];

const EQUIPMENT_OPTIONS = [
  { id: "light-timer" },
  { id: "temp-sensor" },
  { id: "humidity-sensor" },
  { id: "ph-meter" },
  { id: "ec-meter" },
  { id: "auto-watering" },
];

const TIMELINE_PHASES = ["today", "vegetative", "flowering", "harvest"] as const;

const slideVariants = {
  enter: { opacity: 0, x: 32 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -32 },
};

export function OnboardingFlow({ onComplete, initialStep = 1, modal = false, onCancel }: OnboardingFlowProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(initialStep);
  const TOTAL_STEPS = 6;

  const today = new Date().toISOString().split("T")[0];

  const [data, setData] = useState({
    growName: "",
    startDate: today,
    strainName: "",
    plantCount: 1,
    plantType: "autoflower" as "autoflower" | "photoperiod" | "unknown",
    environment: null as "tent" | "cabinet" | "room" | "outdoor" | null,
    substrate: null as "soil" | "coco" | "peat" | "hydro" | null,
    useFertilizers: null as boolean | null,
    fertilizerBrand: "",
    fertilizerManual: "",
    equipment: [] as string[],
  });

  const environmentLabels = {
    tent: t.dashboard.onboarding.envTent,
    cabinet: t.dashboard.onboarding.envCabinet,
    room: t.dashboard.onboarding.envRoom,
    outdoor: t.dashboard.onboarding.envOutdoor,
  } as const;

  const substrateLabels = {
    soil: t.dashboard.onboarding.substrateSoil,
    coco: t.dashboard.onboarding.substrateCoco,
    peat: t.dashboard.onboarding.substratePeat,
    hydro: t.dashboard.onboarding.substrateHydro,
  } as const;

  const equipmentLabels = {
    "light-timer": t.dashboard.onboarding.eqLightTimer,
    "temp-sensor": t.dashboard.onboarding.eqTempSensor,
    "humidity-sensor": t.dashboard.onboarding.eqHumiditySensor,
    "ph-meter": t.dashboard.onboarding.eqPhMeter,
    "ec-meter": t.dashboard.onboarding.eqEcMeter,
    "auto-watering": t.dashboard.onboarding.eqAutoWatering,
  } as const;

  const update = (partial: Partial<typeof data>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const toggleEquipment = (id: string) => {
    setData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(id)
        ? prev.equipment.filter((e) => e !== id)
        : [...prev.equipment, id],
    }));
  };

  const handleComplete = () => {
    onComplete({
      id: `grow-${Date.now()}`,
      growName: data.growName.trim() || t.dashboard.onboarding.growNamePlaceholder,
      startDate: data.startDate,
      strainName: data.strainName,
      plantCount: data.plantCount,
      plantType: data.plantType,
      environment: data.environment ?? "tent",
      substrate: data.substrate ?? "soil",
      useFertilizers: data.useFertilizers ?? false,
      fertilizerBrand: data.fertilizerBrand || data.fertilizerManual,
      equipment: data.equipment,
    });
  };

  return (
    <div className={modal ? "flex flex-col items-center justify-center min-h-full px-4 py-12" : "min-h-screen bg-[#0F1115] flex flex-col items-center justify-center px-4 py-12"}>
      {modal && onCancel && (
        <div className="w-full max-w-md flex justify-end mb-2">
          <button
            onClick={onCancel}
            className="text-gray hover:text-white transition-colors p-1"
            aria-label={t.dashboard.onboarding.close}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}
      <AnimatePresence mode="wait">
        {/* ───────────── Step 1 — Welcome ───────────── */}
        {step === 1 && (
          <motion.div
            key="step-1"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28 }}
            className="flex flex-col items-center text-center max-w-lg w-full"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-8 w-16 h-16 rounded-2xl bg-emerald flex items-center justify-center"
            >
              <Sprout className="w-9 h-9 text-white" />
            </motion.div>

            <span className="text-xs font-semibold tracking-widest text-emerald uppercase mb-4">
              Sprout
            </span>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {t.dashboard.onboarding.welcomeTitle}
            </h1>

            <p className="text-gray text-lg mb-12 leading-relaxed max-w-sm">
              {t.dashboard.onboarding.welcomeDescription}
            </p>

            <Button size="lg" onClick={next} className="flex items-center gap-3">
              {t.dashboard.onboarding.createFirstGrow}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {/* ───────────── Step 2 — Grow Name ───────────── */}
        {step === 2 && (
          <motion.div
            key="step-2"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28 }}
            className="w-full max-w-md"
          >
            <StepHeader step={1} total={TOTAL_STEPS} onBack={back} />
            <div className="bg-indigo border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-8">
                {t.dashboard.onboarding.letsStart}
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray mb-2">
                    {t.dashboard.onboarding.growName}
                  </label>
                  <input
                    type="text"
                    value={data.growName}
                    onChange={(e) => update({ growName: e.target.value })}
                    placeholder={t.dashboard.onboarding.growNamePlaceholder}
                    className="w-full bg-[#0F1115] border border-border rounded-xl px-4 py-3 text-white placeholder-gray/40 focus:outline-none focus:border-emerald/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray mb-2">
                    {t.dashboard.onboarding.startDate}
                  </label>
                  <input
                    type="date"
                    value={data.startDate}
                    onChange={(e) => update({ startDate: e.target.value })}
                    className="w-full bg-[#0F1115] border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald/60 transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>
              <Button size="lg" onClick={next} className="w-full mt-8">
                {t.dashboard.onboarding.continue}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ───────────── Step 3 — Plant ───────────── */}
        {step === 3 && (
          <motion.div
            key="step-3"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28 }}
            className="w-full max-w-md"
          >
            <StepHeader step={2} total={TOTAL_STEPS} onBack={back} />
            <div className="bg-indigo border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-8">
                {t.dashboard.onboarding.whatAreYouGrowing}
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray mb-2">
                    {t.dashboard.onboarding.strainName}
                  </label>
                  <input
                    type="text"
                    value={data.strainName}
                    onChange={(e) => update({ strainName: e.target.value })}
                    placeholder={t.dashboard.onboarding.strainPlaceholder}
                    className="w-full bg-[#0F1115] border border-border rounded-xl px-4 py-3 text-white placeholder-gray/40 focus:outline-none focus:border-emerald/60 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray mb-3">
                    {t.dashboard.onboarding.plantCount}
                  </label>
                  <div className="flex items-center gap-5">
                    <button
                      onClick={() =>
                        update({ plantCount: Math.max(1, data.plantCount - 1) })
                      }
                      className="w-10 h-10 rounded-lg bg-[#0F1115] border border-border flex items-center justify-center text-white hover:border-emerald/50 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-bold text-white w-8 text-center tabular-nums">
                      {data.plantCount}
                    </span>
                    <button
                      onClick={() =>
                        update({ plantCount: data.plantCount + 1 })
                      }
                      className="w-10 h-10 rounded-lg bg-[#0F1115] border border-border flex items-center justify-center text-white hover:border-emerald/50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray mb-3">
                    {t.dashboard.onboarding.type}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "autoflower", label: t.dashboard.onboarding.typeAuto },
                        { id: "photoperiod", label: t.dashboard.onboarding.typePhoto },
                        { id: "unknown", label: t.dashboard.onboarding.typeUnknown },
                      ] as const
                    ).map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => update({ plantType: id })}
                        className={cn(
                          "px-3 py-3 rounded-xl border text-sm font-medium transition-all",
                          data.plantType === id
                            ? "bg-emerald/15 border-emerald text-white"
                            : "bg-[#0F1115] border-border text-gray hover:border-emerald/30 hover:text-white"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {data.plantType === "unknown" && (
                      <motion.p
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="text-sm text-gray bg-emerald/5 border border-emerald/20 rounded-xl px-4 py-3"
                      >
                        {t.dashboard.onboarding.typeHelp}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <Button size="lg" onClick={next} className="w-full mt-8">
                {t.dashboard.onboarding.continue}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ───────────── Step 4 — Environment ───────────── */}
        {step === 4 && (
          <motion.div
            key="step-4"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28 }}
            className="w-full max-w-md"
          >
            <StepHeader step={3} total={TOTAL_STEPS} onBack={back} />
            <div className="bg-indigo border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-8">
                {t.dashboard.onboarding.environmentTitle}
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {ENVIRONMENTS.map((env) => (
                    <button
                      key={env.id}
                      onClick={() => update({ environment: env.id })}
                      className={cn(
                        "p-5 rounded-xl border flex flex-col items-center gap-2.5 transition-all",
                        data.environment === env.id
                          ? "bg-emerald/15 border-emerald"
                          : "bg-[#0F1115] border-border hover:border-emerald/30"
                      )}
                    >
                      <span className="text-2xl">{env.icon}</span>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          data.environment === env.id
                            ? "text-white"
                            : "text-gray"
                        )}
                      >
                        {environmentLabels[env.id]}
                      </span>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray mb-3">
                    {t.dashboard.onboarding.substrate}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SUBSTRATES.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => update({ substrate: sub.id })}
                        className={cn(
                          "px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                          data.substrate === sub.id
                            ? "bg-emerald/15 border-emerald text-white"
                            : "bg-[#0F1115] border-border text-gray hover:border-emerald/30 hover:text-white"
                        )}
                      >
                        {substrateLabels[sub.id]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                size="lg"
                onClick={next}
                disabled={!data.environment || !data.substrate}
                className="w-full mt-8"
              >
                {t.dashboard.onboarding.continue}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ───────────── Step 5 — Nutrition ───────────── */}
        {step === 5 && (
          <motion.div
            key="step-5"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28 }}
            className="w-full max-w-md"
          >
            <StepHeader step={4} total={TOTAL_STEPS} onBack={back} />
            <div className="bg-indigo border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-8">
                {t.dashboard.onboarding.useFertilizers}
              </h2>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {([true, false] as const).map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => update({ useFertilizers: val })}
                      className={cn(
                        "px-4 py-4 rounded-xl border text-sm font-medium transition-all",
                        data.useFertilizers === val
                          ? "bg-emerald/15 border-emerald text-white"
                          : "bg-[#0F1115] border-border text-gray hover:border-emerald/30 hover:text-white"
                      )}
                    >
                      {val ? t.dashboard.onboarding.yes : t.dashboard.onboarding.no}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {data.useFertilizers === true && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="space-y-3"
                    >
                      <p className="text-sm text-gray">{t.dashboard.onboarding.selectBrand}</p>
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
                        {FERTILIZER_BRANDS.map((brand) => (
                          <button
                            key={brand}
                            onClick={() =>
                              update({
                                fertilizerBrand: brand,
                                fertilizerManual: "",
                              })
                            }
                            className={cn(
                              "w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all",
                              data.fertilizerBrand === brand
                                ? "bg-emerald/15 border-emerald text-white"
                                : "bg-[#0F1115] border-border text-gray hover:border-emerald/30 hover:text-white"
                            )}
                          >
                            {brand}
                          </button>
                        ))}
                      </div>
                      <div>
                        <p className="text-sm text-gray mb-2">
                          {t.dashboard.onboarding.orAddManually}
                        </p>
                        <input
                          type="text"
                          value={data.fertilizerManual}
                          onChange={(e) =>
                            update({
                              fertilizerManual: e.target.value,
                              fertilizerBrand: "",
                            })
                          }
                          placeholder={t.dashboard.onboarding.manualBrandPlaceholder}
                          className="w-full bg-[#0F1115] border border-border rounded-xl px-4 py-3 text-white placeholder-gray/40 focus:outline-none focus:border-emerald/60 transition-colors"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Button
                size="lg"
                onClick={next}
                disabled={data.useFertilizers === null}
                className="w-full mt-8"
              >
                {t.dashboard.onboarding.continue}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ───────────── Step 6 — Equipment ───────────── */}
        {step === 6 && (
          <motion.div
            key="step-6"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28 }}
            className="w-full max-w-md"
          >
            <StepHeader step={5} total={TOTAL_STEPS} onBack={back} />
            <div className="bg-indigo border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-1">
                {t.dashboard.onboarding.equipmentTitle}
              </h2>
              <p className="text-sm text-gray mb-7">
                {t.dashboard.onboarding.equipmentSubtitle}
              </p>
              <div className="space-y-2.5">
                {EQUIPMENT_OPTIONS.map((eq) => {
                  const checked = data.equipment.includes(eq.id);
                  return (
                    <button
                      key={eq.id}
                      onClick={() => toggleEquipment(eq.id)}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-4 rounded-xl border transition-all text-left",
                        checked
                          ? "bg-emerald/15 border-emerald"
                          : "bg-[#0F1115] border-border hover:border-emerald/30"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all",
                          checked
                            ? "bg-emerald border-emerald"
                            : "border-border"
                        )}
                      >
                        {checked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          checked ? "text-white" : "text-gray"
                        )}
                      >
                        {equipmentLabels[eq.id as keyof typeof equipmentLabels]}
                      </span>
                    </button>
                  );
                })}
              </div>
              <Button size="lg" onClick={next} className="w-full mt-8">
                {t.dashboard.onboarding.continue}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ───────────── Step 7 — Ready ───────────── */}
        {step === 7 && (
          <motion.div
            key="step-7"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28 }}
            className="flex flex-col items-center text-center max-w-md w-full"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="mb-8 w-20 h-20 rounded-full bg-emerald/15 border border-emerald/40 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <Check className="w-10 h-10 text-emerald" />
              </motion.div>
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-2">
              {t.dashboard.onboarding.growCreated}
            </h2>
            <p className="text-gray mb-10">
              {t.dashboard.onboarding.readyDescription.replace(
                "{name}",
                data.growName.trim() || t.dashboard.onboarding.growNamePlaceholder
              )}
            </p>

            {/* Timeline preview */}
            <div className="w-full bg-indigo border border-border rounded-2xl p-6 mb-8 text-left">
              <p className="text-xs font-semibold text-gray uppercase tracking-widest mb-6">
                {t.dashboard.onboarding.estimatedTimeline}
              </p>
              <div>
                {TIMELINE_PHASES.map((phase, i) => (
                  <div key={phase} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0",
                          i === 0 ? "bg-lime" : "bg-border"
                        )}
                      />
                      {i < TIMELINE_PHASES.length - 1 && (
                        <div className="w-px h-9 bg-border mt-1" />
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-sm pb-9 leading-none",
                        i === 0 ? "text-lime font-semibold" : "text-gray"
                      )}
                    >
                      {phase === "today"
                        ? t.dashboard.onboarding.timelineToday
                        : phase === "vegetative"
                        ? t.dashboard.onboarding.timelineVegetative
                        : phase === "flowering"
                        ? t.dashboard.onboarding.timelineFlowering
                        : t.dashboard.onboarding.timelineHarvest}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Button size="lg" onClick={handleComplete} className="w-full flex items-center justify-center gap-2">
              {t.dashboard.onboarding.goToDashboard}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Sub-components ─── */

function StepHeader({
  step,
  total,
  onBack,
}: {
  step: number;
  total: number;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={onBack}
        className="text-gray hover:text-white transition-colors p-1"
        aria-label={t.dashboard.onboarding.back}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald rounded-full"
          initial={{ width: `${((step - 1) / total) * 100}%` }}
          animate={{ width: `${(step / total) * 100}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs text-gray tabular-nums">
        {step}/{total}
      </span>
    </div>
  );
}
