import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { Shield, Sparkles, Send, Check } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => {
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer id="footer-section" className="relative bg-black border-t border-white/5 pt-20 pb-10 px-6 overflow-hidden">
      {/* Background soft lighting */}
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-deep-cyan/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-80 h-80 bg-dark-cyan/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-16 border-b border-white/5">
          
          {/* Column 1: Brand details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <Logo size={32} />
              <span className="font-display text-xl tracking-widest font-bold bg-gradient-to-r from-white via-white to-soft-cyan bg-clip-text text-transparent">
                PARALANE
              </span>
            </div>
            
            <p className="text-xs text-slate-400 font-light leading-relaxed max-w-xs">
              Fast, beautiful, and secure messaging. Stripping ads and trackers so your personal conversations stay exactly as they should be.
            </p>

            <div className="flex items-center gap-2 text-[10px] font-mono text-highlight-cyan bg-deep-cyan/35 px-3 py-1.5 rounded-full border border-accent-cyan/15 w-max">
              <Shield className="w-3.5 h-3.5" />
              STATUS: SYSTEM ONLINE
            </div>
          </div>

          {/* Column 2: Links */}
          <div className="space-y-4">
            <h4 className="font-mono text-[10px] tracking-widest uppercase text-slate-500 font-bold">
              PLATFORM
            </h4>
            <ul className="space-y-2 text-xs font-light text-slate-400">
              <li><a href="#features-fold" className="hover:text-soft-cyan transition-colors">Features</a></li>
              <li><a href="#messaging-preview-fold" className="hover:text-soft-cyan transition-colors">Workspace</a></li>
              <li><a href="#security-fold" className="hover:text-soft-cyan transition-colors">Safety Overview</a></li>
              <li><a href="#download-fold" className="hover:text-soft-cyan transition-colors">Download App</a></li>
            </ul>
          </div>

          {/* Column 3: Links */}
          <div className="space-y-4">
            <h4 className="font-mono text-[10px] tracking-widest uppercase text-slate-500 font-bold">
              PRODUCT
            </h4>
            <ul className="space-y-2 text-xs font-light text-slate-400">
              <li><a href="#about" onClick={(e) => e.preventDefault()} className="hover:text-soft-cyan transition-colors">About Us</a></li>
              <li><a href="#brand" onClick={(e) => { e.preventDefault(); document.getElementById('brand')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-soft-cyan transition-colors">Brand Kit</a></li>
              <li><a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-soft-cyan transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-soft-cyan transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Column 4: Links */}
          <div className="space-y-4">
            <h4 className="font-mono text-[10px] tracking-widest uppercase text-slate-500 font-bold">
              RESOURCES
            </h4>
            <ul className="space-y-2 text-xs font-light text-slate-400">
              <li><a href="#blog" onClick={(e) => e.preventDefault()} className="hover:text-soft-cyan transition-colors">Official Blog</a></li>
              <li><a href="#help" onClick={(e) => e.preventDefault()} className="hover:text-soft-cyan transition-colors">Support Center</a></li>
              <li><a href="#api" onClick={(e) => e.preventDefault()} className="hover:text-soft-cyan transition-colors">Developer API</a></li>
              <li><a href="#git" onClick={(e) => e.preventDefault()} className="hover:text-soft-cyan transition-colors">GitHub Source</a></li>
            </ul>
          </div>

          {/* Column 5: Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-mono text-[10px] tracking-widest uppercase text-slate-500 font-bold">
              STAY IN THE LOOP
            </h4>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Subscribe to get updates on new features and releases. We never share your email address.
            </p>

            <form onSubmit={handleSubscribe} className="relative flex gap-2 max-w-sm">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.02] hover:bg-white/[0.04] focus:bg-black rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 border border-white/5 focus:border-accent-cyan/30 focus:outline-none focus:ring-1 focus:ring-accent-cyan/15 transition-all duration-300"
              />
              <button
                type="submit"
                className="px-4 bg-brand-cyan hover:bg-accent-cyan text-black rounded-xl transition-all duration-200 flex items-center justify-center shadow-md shadow-brand-cyan/10 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {subscribed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -bottom-8 left-0 right-0 flex items-center gap-1.5 text-[10px] text-highlight-cyan font-mono"
                  >
                    <Check className="w-3.5 h-3.5 text-soft-cyan" />
                    SUBSCRIBED SUCCESSFULLY!
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

        </div>

        {/* Bottom copyright segment */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-10 text-slate-500 text-[10px] font-mono gap-4">
          <div className="flex items-center gap-2">
            <span>© 2026 PARALANE. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-brand-cyan font-bold tracking-widest font-sans">FAST. FUN. SECURE.</span>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-slate-300 transition-colors">TERMS OF SERVICE</a>
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-slate-300 transition-colors">PRIVACY POLICY</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
