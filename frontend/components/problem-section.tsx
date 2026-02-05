"use client";

import { AlertCircle, FileQuestion, Users, FileText } from "lucide-react";
import { motion } from "motion/react";

export function ProblemSection() {
  const problems = [
    {
      icon: FileQuestion,
      title: "Authorship disputes",
      description: "Disagreements over who created what, with no clear proof of contribution."
    },
    {
      icon: FileText,
      title: "Lack of clear records",
      description: "Manual contracts and agreements that can be lost, disputed, or ignored."
    },
    {
      icon: Users,
      title: "Trust-based agreements",
      description: "Relying on verbal promises or informal splits that become unclear over time."
    },
    {
      icon: AlertCircle,
      title: "No verification",
      description: "No public way to verify ownership percentages or authorship claims."
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
            The problem with music ownership
          </h2>
          <p className="text-lg text-gray max-w-2xl mx-auto">
            Traditional music registration creates confusion, disputes, and lost opportunities for independent creators.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((problem, index) => (
            <motion.div 
              key={index}
              className="bg-indigo/50 border border-border rounded-2xl p-8 hover:border-white/20 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <problem.icon className="w-10 h-10 text-violet flex-shrink-0" />
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
