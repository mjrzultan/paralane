import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { Menu, X, ArrowRight, Shield, Download, LayoutTemplate } from 'lucide-react';

interface NavbarProps {
  onAuthTrigger: (mode: 'login' | 'signup') => void;
}

export default function Navbar({ onAuthTrigger }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setIsOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setIsOpen(false);
    onAuthTrigger(mode);
  };

  return (
    <>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="fixed top-6 left-0 right-0 z-50 px-6 max-w-7xl mx-auto"
        id="navbar-container"
      >
        <div className="glass-morphism rounded-full px-6 py-3.5 flex items-center justify-between border border-white/5 shadow-2xl shadow-black/40 relative">
          
          {/* DESKTOP LAYOUT (Default: Left-Logo, Center-None, Right-Auth) */}
          <div className="hidden md:flex items-center justify-between w-full">
            {/* LEFT: Logo & Name */}
            <div 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 cursor-pointer group select-none"
              id="navbar-logo-desktop"
            >
              <Logo size={32} />
              <span className="font-display text-lg tracking-widest font-bold bg-gradient-to-r from-white via-white to-soft-cyan bg-clip-text text-transparent group-hover:to-highlight-cyan transition-all duration-300">
                PARALANE
              </span>
            </div>

            {/* CENTER NAVIGATION LINKS (Clean and simple) */}
            <div className="flex items-center gap-6">
              <button 
                onClick={() => handleNavClick('features-fold')}
                className="text-xs font-mono uppercase tracking-widest text-slate-400 hover:text-white transition-colors duration-200"
              >
                Features
              </button>
              <button 
                onClick={() => handleNavClick('security-fold')}
                className="text-xs font-mono uppercase tracking-widest text-slate-400 hover:text-white transition-colors duration-200"
              >
                Security
              </button>
              <button 
                onClick={() => handleNavClick('download-fold')}
                className="text-xs font-mono uppercase tracking-widest text-slate-400 hover:text-white transition-colors duration-200"
              >
                Apps
              </button>
            </div>

            {/* RIGHT: Login & Sign Up Premium Buttons */}
            <div className="flex items-center gap-4" id="navbar-actions-desktop">
              <button
                onClick={() => handleAuthClick('login')}
                className="relative px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-300 rounded-full group overflow-hidden"
                id="nav-login-btn"
              >
                <span className="relative z-10">Login</span>
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-accent-cyan group-hover:w-1/2 transition-all duration-300" />
              </button>
              
              <button
                onClick={() => handleAuthClick('signup')}
                className="glow-btn relative px-6 py-2 text-sm font-semibold text-black bg-gradient-to-r from-accent-cyan to-highlight-cyan rounded-full shadow-[0_0_15px_rgba(0,241,241,0.3)] hover:shadow-[0_0_25px_rgba(37,255,255,0.5)] transition-all duration-300 scale-100 hover:scale-[1.03] active:scale-[0.98]"
                id="nav-signup-btn"
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* MOBILE LAYOUT (Logo absolutely centered, hamburger on the right) */}
          <div className="flex md:hidden items-center justify-between w-full relative h-10" id="navbar-mobile-layout">
            {/* CENTERED: Logo ONLY */}
            <div 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer select-none"
              id="navbar-logo-mobile"
            >
              <Logo size={32} />
            </div>

            {/* Spacer to push hamburger to the right */}
            <div className="flex-1" />

            {/* RIGHT: Hamburger menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 p-2 text-slate-300 hover:text-white transition-colors focus:outline-none flex items-center justify-center relative z-10"
              aria-label="Toggle menu"
              id="navbar-mobile-burger"
            >
              {isOpen ? <X className="w-6 h-6 text-highlight-cyan" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </motion.header>

      {/* MOBILE DRAWER MENU (Elegant overlay) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-6 top-28 z-40 md:hidden"
            id="mobile-drawer-overlay"
          >
            <div className="glass-morphism rounded-3xl p-6 border border-white/10 shadow-3xl shadow-black flex flex-col gap-5 bg-black/90 backdrop-blur-2xl">
              
              {/* Navigation Items */}
              <div className="flex flex-col gap-3 py-2">
                <button
                  onClick={() => handleNavClick('features-fold')}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-deep-cyan/20 text-slate-300 hover:text-white transition-all text-left"
                >
                  <LayoutTemplate className="w-4 h-4 text-accent-cyan" />
                  <span className="text-sm font-medium">Features</span>
                </button>

                <button
                  onClick={() => handleNavClick('security-fold')}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-deep-cyan/20 text-slate-300 hover:text-white transition-all text-left"
                >
                  <Shield className="w-4 h-4 text-accent-cyan" />
                  <span className="text-sm font-medium">Security Details</span>
                </button>

                <button
                  onClick={() => handleNavClick('download-fold')}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-deep-cyan/20 text-slate-300 hover:text-white transition-all text-left"
                >
                  <Download className="w-4 h-4 text-accent-cyan" />
                  <span className="text-sm font-medium">Download Apps</span>
                </button>
              </div>

              {/* Action CTAs */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                <button
                  onClick={() => handleAuthClick('login')}
                  className="py-3 text-center rounded-xl bg-white/[0.03] hover:bg-white/5 border border-white/5 text-slate-300 hover:text-white font-medium text-sm transition-all"
                >
                  Login
                </button>

                <button
                  onClick={() => handleAuthClick('signup')}
                  className="py-3 text-center rounded-xl bg-gradient-to-r from-brand-cyan to-accent-cyan text-black font-semibold text-sm shadow-lg shadow-brand-cyan/20 transition-all"
                >
                  Sign Up
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
