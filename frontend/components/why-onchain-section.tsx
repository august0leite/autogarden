"use client";

import { Lock, LineChart, Zap, Clock, Database } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "@/lib/i18n";

export function WhyOnChainSection() {
    const { t } = useTranslation();
    
    const benefits = [
        {
            icon: Lock,
            title: t.why.benefit1Title,
            description: t.why.benefit1Description
        },
        {
            icon: LineChart,
            title: t.why.benefit2Title,
            description: t.why.benefit2Description
        },
        {
            icon: Zap,
            title: t.why.benefit3Title,
            description: t.why.benefit3Description
        },
        {
            icon: Database,
            title: t.why.benefit4Title,
            description: t.why.benefit4Description
        },
        {
            icon: Clock,
            title: t.why.benefit5Title,
            description: t.why.benefit5Description
        }
    ];

    return (
        <section id="why-automated" className="w-full py-24 px-6 bg-indigo/20 scroll-mt-16">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        {t.why.title}
                    </h2>
                    <p className="text-lg text-gray max-w-2xl mx-auto">
                        {t.why.subtitle}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            className="bg-indigo/30 border border-border rounded-2xl p-6 hover:border-emerald/50  group flex flex-col"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-14 h-14 rounded-full bg-emerald/10 flex items-center justify-center group-hover:bg-emerald/20 transition-colors flex-shrink-0">
                                    <benefit.icon className="w-7 h-7 text-emerald" />
                                </div>
                                <h3 className="text-lg font-semibold">{benefit.title}</h3>
                            </div>
                            <p className="text-gray text-sm leading-relaxed">{benefit.description}</p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
