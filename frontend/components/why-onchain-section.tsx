"use client";

import { Lock, Globe, Shield, Clock, Database } from "lucide-react";
import { motion } from "motion/react";

export function WhyOnChainSection() {
    const benefits = [
        {
            icon: Lock,
            title: "Immutable records",
            description: "Once registered, authorship data cannot be altered or deleted. Your record is permanent."
        },
        {
            icon: Globe,
            title: "Public verification",
            description: "Anyone can verify ownership percentages and contributor information at any time."
        },
        {
            icon: Shield,
            title: "No single owner",
            description: "The system isn't controlled by a company or intermediary. It exists independently."
        },
        {
            icon: Database,
            title: "Tamper-proof",
            description: "Technical architecture prevents manipulation of registered works and authorship data."
        },
        {
            icon: Clock,
            title: "Future-proof infrastructure",
            description: "Built on resilient technology designed to outlast any single organization or platform."
        }
    ];

    return (
        <section id="why-on-chain" className="w-full py-24 px-6 bg-indigo/20 scroll-mt-16">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Why register music on-chain?
                    </h2>
                    <p className="text-lg text-gray max-w-2xl mx-auto">
                        On-chain registration provides guarantees that traditional systems cannot offer.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            className="bg-indigo/30 border border-border rounded-2xl p-6 hover:border-violet/50  group flex flex-col"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-14 h-14 rounded-full bg-violet/10 flex items-center justify-center group-hover:bg-violet/20 transition-colors flex-shrink-0">
                                    <benefit.icon className="w-7 h-7 text-violet" />
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
