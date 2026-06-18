"use client";

import React from 'react';
import { Sprout } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  
  return (
    <footer className="bg-midnight border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="mb-12 grid gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald/20 text-emerald">
                <Sprout className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white">Sprout</span>
            </div>
            <p className="max-w-xs text-sm text-gray-400">
              {t.footer.tagline}
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">{t.footer.productTitle}</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#how-it-works" className="hover:text-emerald transition-colors">{t.footer.howItWorks}</a></li>
              <li><a href="#why-automated" className="hover:text-emerald transition-colors">{t.footer.whyUse}</a></li>
              <li><a href="#who-is-it-for" className="hover:text-emerald transition-colors">{t.footer.whoIsItFor}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">{t.footer.companyTitle}</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-emerald transition-colors">{t.footer.about}</a></li>
              <li><a href="#" className="hover:text-emerald transition-colors">{t.footer.contact}</a></li>
              <li><a href="#" className="hover:text-emerald transition-colors">{t.footer.terms}</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-gray-500">
              &copy; {currentYear} Sprout. {t.footer.rights}
            </p>
            
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-2">
              <p className="text-xs text-yellow-500/80">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
