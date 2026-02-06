import React from 'react';
import { Music } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-midnight border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="mb-12 grid gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet/20 text-violet">
                <Music className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white">Audiofy</span>
            </div>
            <p className="max-w-xs text-sm text-gray-400">
              The transparent standard for music authorship and royalty splits.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Product</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#how-it-works" className="hover:text-violet transition-colors">How it works</a></li>
              <li><a href="#why-on-chain" className="hover:text-violet transition-colors">Why On-Chain</a></li>
              <li><a href="#who-is-it-for" className="hover:text-violet transition-colors">For Artists</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Company</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-violet transition-colors">About</a></li>
              <li><a href="#" className="hover:text-violet transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-violet transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-gray-500">
              &copy; {currentYear} Audiofy. All rights reserved.
            </p>
            
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-2">
              <p className="text-xs text-yellow-500/80">
                Disclaimer: Audiofy is currently a Proof of Concept focused on validating transparent music registration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
