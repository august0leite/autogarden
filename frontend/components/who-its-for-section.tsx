"use client";

import { Mic, Headphones, Users2, Building2 } from "lucide-react";
import { motion } from "motion/react";

export function WhoItsForSection() {
  const audiences = [
    {
      icon: Mic,
      title: "Independent artists",
      description: "Solo musicians who want clear proof of authorship for their original works."
    },
    {
      icon: Headphones,
      title: "Producers",
      description: "Beatmakers and producers collaborating with multiple artists on different projects."
    },
    {
      icon: Users2,
      title: "Collectives",
      description: "Music groups and creative teams who need transparent split agreements."
    },
    {
      icon: Building2,
      title: "Labels (coming soon)",
      description: "Independent labels managing catalogs with clear ownership documentation."
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
            Who is this for?
          </h2>
          <p className="text-lg text-gray max-w-2xl mx-auto">
            Audiofy is designed for creators who value transparency, independence, and long-term protection of their work.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, index) => (
            <motion.div
              key={index}
              className="bg-indigo/10 border border-border rounded-2xl p-6 hover:bg-indigo/20 hover:border-white/20 text-center flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-16 h-16 rounded-full bg-violet/10 flex items-center justify-center mx-auto mb-4">
                <audience.icon className="w-8 h-8 text-violet" />
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
