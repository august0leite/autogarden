"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Circle, Droplets, FlaskConical, Thermometer, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import type { GrowData } from "./onboarding-flow";

interface GrowDashboardProps {
  grow: GrowData;
  currentDay?: number;
  onAddGrow?: () => void;
}

type MetricTone = "ideal" | "warning" | "critical";

const TOTAL_CYCLE_DAYS = 90;
const LIGHTS_ON_HOUR = 6;
const LIGHTS_OFF_HOUR = 24;

const PHASE_MARKERS = [
  { key: "germination", label: "Germinação", day: 1 },
  { key: "seedling", label: "Muda", day: 7 },
  { key: "vegetative", label: "Vegetativo", day: 15 },
  { key: "flowering", label: "Floração", day: 36 },
  { key: "flush", label: "Flush", day: 75 },
  { key: "harvest", label: "Colheita", day: 90 },
] as const;

function getCurrentPhase(day: number) {
  if (day <= 6) return "Germinação";
  if (day <= 14) return "Muda";
  if (day <= 35) return "Vegetativo";
  if (day <= 74) return "Floração";
  if (day <= 89) return "Flush";
  return "Colheita";
}

function getNextMilestone(day: number) {
  const next = PHASE_MARKERS.find((marker) => marker.day > day);
  if (!next) return { label: "Colheita concluída", inDays: 0 };
  return { label: next.label, inDays: next.day - day };
}

function formatHarvestDate(startDate: string) {
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return "14 de Agosto";
  const harvest = new Date(start);
  harvest.setDate(harvest.getDate() + TOTAL_CYCLE_DAYS - 1);
  return harvest.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });
}

export function GrowDashboard({ grow, currentDay = 12 }: GrowDashboardProps) {
  useTranslation();

  const safeDay = Math.max(1, currentDay);
  const growName = grow.growName?.trim() || "Primeiro Cultivo";
  const strainName = grow.strainName?.trim() || "Northern Lights";
  const phaseLabel = getCurrentPhase(safeDay);
  const progressPercent = Math.min(100, Math.round((safeDay / TOTAL_CYCLE_DAYS) * 100));
  const nextMilestone = getNextMilestone(safeDay);
  const harvestDate = formatHarvestDate(grow.startDate);
  const hasHardware = grow.equipment.length > 0;
  const todayReference = `Hoje • ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}`;
  const startedAtReference = grow.startDate
    ? `Iniciado em ${new Date(grow.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}`
    : "Iniciado recentemente";

  const currentHour = new Date().getHours();
  const isLightOn = currentHour >= LIGHTS_ON_HOUR && currentHour < LIGHTS_OFF_HOUR;

  const metrics = [
    {
      icon: <Thermometer className="h-5 w-5" />,
      label: "Temperatura",
      value: "24°C",
      range: "22°C - 27°C",
      status: "Ideal",
      tone: "ideal" as MetricTone,
    },
    {
      icon: <Droplets className="h-5 w-5" />,
      label: "Umidade",
      value: "62%",
      range: "55% - 65%",
      status: "Ideal",
      tone: "ideal" as MetricTone,
    },
    {
      icon: <Zap className="h-5 w-5" />,
      label: "EC",
      value: "1.4",
      range: "1.5 - 1.8",
      status: "Atenção",
      tone: "warning" as MetricTone,
    },
    {
      icon: <FlaskConical className="h-5 w-5" />,
      label: "pH",
      value: "6.1",
      range: "5.8 - 6.3",
      status: "Ideal",
      tone: "ideal" as MetricTone,
    },
  ];

  const healthScore = 85;
  const healthStatus = "Tudo certo";
  const soilMoisture = "68%";

  const actions = [
    { emoji: "💧", title: "Regar", when: "Em 18 horas", priority: 1 },
    { emoji: "🧪", title: "Fertilizar", when: "Em 3 dias", priority: 2 },
    { emoji: "🌸", title: "Início da floração", when: `Em ${nextMilestone.inDays} dias`, priority: 3 },
  ].sort((a, b) => a.priority - b.priority);

  const todayHistory = [
    "Foto adicionada",
    "Rega realizada",
    "Fertilização realizada",
    "Medição registrada",
    "Observação adicionada",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto flex w-full max-w-6xl flex-col gap-6"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <section
        className={cn(
          "w-full rounded-3xl border p-4 shadow-xl transition-all duration-500 md:p-8",
          isLightOn
            ? "border-emerald-300/20 bg-gradient-to-br from-[#071A12] via-[#0B2A1D] to-[#0F3A28] shadow-emerald-950/40"
            : "border-slate-400/15 bg-gradient-to-br from-[#071018] via-[#0A1620] to-[#0A1C18] shadow-black/40"
        )}
      >
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.35fr_1fr] xl:gap-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <div>
                <p
                  className="text-3xl font-semibold leading-tight md:text-4xl"
                  style={{
                    fontFamily: "Manrope, Inter, system-ui, sans-serif",
                    color: isLightOn ? "#FFFFFF" : "#E5E7EB",
                  }}
                >
                  {strainName}
                </p>
                <p className="mt-4 text-sm text-gray-300 md:text-base">{phaseLabel}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={isLightOn ? "day" : "night"}>{growName}</Badge>
                {hasHardware && <Badge tone={isLightOn ? "day" : "night"}>Equipamentos funcionando</Badge>}
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-8">
              <p className="text-[11px] uppercase tracking-[0.24em] text-gray-300">Próxima ação</p>
              <p
                className="text-xl font-semibold md:text-2xl"
                style={{
                  fontFamily: "Manrope, Inter, system-ui, sans-serif",
                  color: isLightOn ? "#FFFFFF" : "#E5E7EB",
                }}
              >
                Regar em 18h
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <HeroTodayRow icon="🌱" label="Solo" value={soilMoisture} />
                <HeroTodayRow icon="⚡" label="Saúde" value={`${healthScore}%`} helper={healthStatus} />
                <HeroTodayRow icon="📅" label={nextMilestone.label} value={`Em ${nextMilestone.inDays} dias`} />
                <HeroTodayRow icon="🌾" label="Colheita" value={harvestDate} />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-8 rounded-2xl border border-white/10 bg-black/20 p-4 md:p-8">
            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-gray-300">Dia atual do ciclo</p>
              <p
                className="text-5xl font-bold leading-none md:text-6xl xl:text-7xl"
                style={{
                  fontFamily: "Manrope, Inter, system-ui, sans-serif",
                  color: isLightOn ? "#FFFFFF" : "#E5E7EB",
                }}
              >
                DIA {safeDay}
              </p>
              <p className="text-sm text-gray-300">de {TOTAL_CYCLE_DAYS} dias</p>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-8">
              <p className="text-sm text-gray-300">{todayReference}</p>
              <p className="text-sm text-gray-400">{startedAtReference}</p>
            </div>

            <div className="border-t border-white/10 pt-8">
              <InfoRow label="Colheita estimada" value={harvestDate} />
            </div>
          </div>
        </div>
      </section>

      <SectionCard title="Saúde do cultivo">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              icon={metric.icon}
              label={metric.label}
              value={metric.value}
              range={metric.range}
              status={metric.status}
              tone={metric.tone}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Hoje">
        <div className="space-y-3">
          {actions.map((action) => (
            <div key={action.title} className="rounded-2xl border border-border bg-[#0F1115] px-4 py-3 md:px-5 md:py-4">
              <p className="text-sm font-medium text-white md:text-base">
                <span className="mr-2">{action.emoji}</span>
                {action.title}
              </p>
              <p className="mt-1 text-xs text-gray md:text-sm">{action.when}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Progresso do cultivo">
        <div className="rounded-2xl border border-border bg-[#0F1115] p-4 md:p-6">
          <p className="text-lg font-semibold text-white md:text-xl">Dia {safeDay} de {TOTAL_CYCLE_DAYS}</p>

          <div className="mt-4 h-6 w-full overflow-hidden rounded-full border border-white/10 bg-[#0B0E13]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="text-emerald-300">{progressPercent}% concluído</span>
            <span className="text-gray">Colheita estimada em {harvestDate}</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
            {PHASE_MARKERS.map((marker) => {
              const done = safeDay >= marker.day;
              const current = marker.label === phaseLabel;
              return (
                <div
                  key={marker.key}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs md:text-sm",
                    done
                      ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                      : "border-border bg-[#141922] text-gray",
                    current && "border-emerald-300/40 bg-emerald-500/15 text-white"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {done ? <CheckCircle2 className="h-4 w-4" /> : current ? <Circle className="h-4 w-4" /> : <span className="h-4 w-4" />}
                    <span>{marker.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Histórico do dia">
        <div className="space-y-2">
          {todayHistory.map((event) => (
            <div key={event} className="rounded-xl border border-border bg-[#0F1115] px-4 py-3 text-sm text-white">
              {event}
            </div>
          ))}
        </div>
      </SectionCard>
    </motion.div>
  );
}

function Badge({ tone, children }: { tone: "day" | "night"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-medium",
        tone === "day"
          ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-300"
          : "border-sky-300/30 bg-sky-300/10 text-sky-300"
      )}
    >
      {children}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.24em] text-gray">{label}</p>
      <p className="mt-1 text-sm font-medium text-white md:text-base">{value}</p>
    </div>
  );
}

function HeroTodayRow({
  icon,
  label,
  value,
  helper,
}: {
  icon: string;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">
            <span className="mr-2">{icon}</span>
            {label}
          </p>
          {helper && <p className="mt-1 text-xs text-gray">{helper}</p>}
        </div>
        <p className="whitespace-nowrap text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  range,
  status,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  range: string;
  status: string;
  tone: MetricTone;
}) {
  return (
    <div className="rounded-2xl border border-border bg-[#0F1115] p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gray">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
        </div>
        <div className="text-gray">{icon}</div>
      </div>
      <p className="mt-4 text-xs text-gray">Faixa recomendada: {range}</p>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium",
            tone === "ideal" && "border-emerald-300/30 bg-emerald-300/10 text-emerald-300",
            tone === "warning" && "border-amber-300/30 bg-amber-300/10 text-amber-300",
            tone === "critical" && "border-red-300/30 bg-red-300/10 text-red-300"
          )}
        >
          {tone === "ideal" ? "✓" : tone === "warning" ? "⚠" : "!"} {status}
        </span>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-indigo p-4 shadow-lg shadow-black/10 md:p-6">
      <h2
        className="mb-4 text-xs uppercase tracking-[0.28em] text-emerald/90"
        style={{ fontFamily: "Manrope, Inter, system-ui, sans-serif" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}