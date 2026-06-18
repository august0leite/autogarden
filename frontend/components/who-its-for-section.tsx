"use client";

import { Home, Sprout, Microscope, Cpu } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "@/lib/i18n";

export function WhoItsForSection() {
  const { t } = useTranslation();
  
  const audiences = [
    {
      icon: Home,
      title: t.who.stage1Title,
      description: t.who.stage1Description
    },
    {
      icon: Sprout,
      title: t.who.stage2Title,
      description: t.who.stage2Description
    },
    {
      icon: Microscope,
      title: t.who.stage3Title,
      description: t.who.stage3Description
    },
    {
      icon: Cpu,
      title: t.who.stage4Title,
      description: t.who.stage4Description
    }
  ];

  return (
    <section id="who-is-it-for" className="w-full py-24 px-6 bg-midnight scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t.who.title}
          </h2>
          <p className="text-lg text-gray max-w-2xl mx-auto">
            {t.who.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, index) => (
            <motion.div
              key={index}
              className="bg-indigo/10 border border-border rounded-2xl p-6 hover:bg-indigo/20 hover:border-emerald/30 text-center flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-4">
                <audience.icon className="w-8 h-8 text-emerald" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{audience.title}</h3>
              <p className="text-gray text-sm leading-relaxed">{audience.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
