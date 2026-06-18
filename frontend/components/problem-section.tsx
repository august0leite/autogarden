"use client";

import { Clock, Database, Thermometer, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "@/lib/i18n";

export function ProblemSection() {
  const { t } = useTranslation();
  
  const problems = [
    {
      icon: Clock,
      title: t.problem.card1Title,
      description: t.problem.card1Description
    },
    {
      icon: Thermometer,
      title: t.problem.card2Title,
      description: t.problem.card2Description
    },
    {
      icon: Database,
      title: t.problem.card3Title,
      description: t.problem.card3Description
    },
    {
      icon: AlertTriangle,
      title: t.problem.card4Title,
      description: t.problem.card4Description
    }
  ];

  return (
    <section className="w-full py-24 px-6 bg-indigo/30">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t.problem.title}
          </h2>
          <p className="text-lg text-gray max-w-2xl mx-auto">
            {t.problem.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((problem, index) => (
            <motion.div 
              key={index}
              className="bg-indigo/50 border border-border rounded-2xl p-8 hover:border-emerald/30 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <problem.icon className="w-10 h-10 text-emerald flex-shrink-0" />
                <h3 className="text-xl font-semibold">{problem.title}</h3>
              </div>
              <p className="text-gray leading-relaxed">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
