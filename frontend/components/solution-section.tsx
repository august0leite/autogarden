"use client";

import { Wifi, Activity, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "@/lib/i18n";

export function SolutionSection() {
  const { t } = useTranslation();
  
  const steps = [
    {
      number: "01",
      icon: Wifi,
      title: t.solution.step1Title,
      description: t.solution.step1Description
    },
    {
      number: "02",
      icon: Activity,
      title: t.solution.step2Title,
      description: t.solution.step2Description
    },
    {
      number: "03",
      icon: CheckCircle,
      title: t.solution.step3Title,
      description: t.solution.step3Description
    }
  ];

  return (
    <section id="how-it-works" className="w-full py-24 px-6 bg-midnight">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t.solution.title}
          </h2>
          <p className="text-lg text-gray max-w-2xl mx-auto mb-6">
            {t.solution.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="relative bg-indigo/20 border border-border rounded-2xl p-8 hover:border-emerald/50 min-h-[280px] flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-6xl font-bold text-emerald/20">
                    {step.number}
                  </div>
                  <step.icon className="w-12 h-12 text-emerald flex-shrink-0" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
