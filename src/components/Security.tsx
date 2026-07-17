import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Key, EyeOff, Smile, Sparkles, Send, HardDrive } from 'lucide-react';

interface TechLayer {
  id: string;
  tabLabel: string;
  icon: any;
  title: string;
  description: string;
  details: string[];
  visualCode: string;
}

const TECH_LAYERS: TechLayer[] = [
  {
    id: 'encryption',
    tabLabel: 'Safe Chats',
    icon: Key,
    title: 'Locked & Encrypted',
    description: 'Every single message you send is automatically sealed before leaving your phone or laptop. Only the recipient possesses the digital key required to unlock and read your messages.',
    details: [
      'Instant lock on all chat bubbles',
      'Secure photo & video sharing',
      'No middleman key storage',
      'Automatic key rotation'
    ],
    visualCode: `// Encrypted Message Payload
{
  "sender": "Me",
  "status": "locked",
  "payload": "U2VuZGluZyB5b3UgYSBzbWlsZSEgOik=",
  "verification": "verified ✔"
}`
  },
  {
    id: 'metadata',
    tabLabel: 'No Tracking',
    icon: EyeOff,
    title: 'Zero Tracker Guarantee',
    description: 'We do not log your location, map your friends lists, or track your browsing habits. We believe your private chats should remain 100% private, free from invasive advertising.',
    details: [
      'Strict ad-free environment',
      'No search tracking or log files',
      'Completely clear of hidden scripts',
      'Anonymized connection pathing'
    ],
    visualCode: `// Privacy Profile
{
  "ad_tracking": "disabled",
  "location_logging": "none",
  "contact_sharing": "opt-out-by-default",
  "data_mining": "never"
}`
  },
  {
    id: 'hosting',
    tabLabel: 'Local Storage',
    icon: HardDrive,
    title: 'Sovereign Device Storage',
    description: 'Your chat history is saved directly on your devices, not stored forever on centralized cloud platforms. You are always in control of how long your messages exist.',
    details: [
      'Auto-delete timer options',
      'Local encrypted backups',
      'No centralized host database',
      'Clear cache with a single tap'
    ],
    visualCode: `// Local Retention Settings
{
  "history_storage": "on-device-only",
  "auto_delete_older_than": "30_days",
  "cloud_leak_protection": "active"
}`
  }
];

export default function Security() {
  const [activeTab, setActiveTab] = useState('encryption');
  const activeLayer = TECH_LAYERS.find(t => t.id === activeTab) || TECH_LAYERS[0];

  return (
    <section id="security-fold" className="relative py-24 bg-black border-t border-white/5 px-6">
      {/* Background visual detail */}
      <div className="absolute top-1/4 right-10 w-[450px] h-[450px] bg-dark-cyan/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-deep-cyan/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Information and Tab selection */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-dark-cyan/30 bg-deep-cyan/20">
                <Shield className="w-3.5 h-3.5 text-highlight-cyan" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-highlight-cyan font-bold">
                  TRUST & SAFETY
                </span>
              </div>
              
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Keeping your chats strictly yours.
              </h2>
              
              <p className="text-slate-400 font-sans font-light text-base leading-relaxed">
                Paralane is built with secure, industry-leading protocols. Our framework ensures only you and your friends can see what you share, keeping threats away from your personal space.
              </p>
            </div>

            {/* Premium Tab Buttons */}
            <div className="flex flex-col gap-2.5 p-1.5 rounded-xl bg-white/[0.02] border border-white/5" id="security-tabs-container">
              {TECH_LAYERS.map((layer) => {
                const Icon = layer.icon;
                const isSelected = layer.id === activeTab;
                return (
                  <button
                    key={layer.id}
                    onClick={() => setActiveTab(layer.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg text-left transition-all duration-300 ${
                      isSelected
                        ? 'bg-deep-cyan/30 border border-brand-cyan/30 text-white shadow-lg'
                        : 'hover:bg-white/[0.01] border border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-highlight-cyan' : 'text-slate-500'}`} />
                    <span className="font-sans font-semibold text-sm tracking-wide">
                      {layer.tabLabel}
                    </span>
                    {isSelected && (
                      <motion.div
                        layoutId="activeSecurityIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-highlight-cyan shadow-[0_0_8px_rgba(0,241,241,0.8)]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Visualizer Window / Code Block */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl glass-morphism overflow-hidden border border-white/10 shadow-2xl relative"
                id="security-visualizer-card"
              >
                {/* Header of Visualizer */}
                <div className="px-6 py-4 bg-black/40 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                    <span className="font-mono text-[10px] text-slate-500 ml-2">PARALANE_METRIC.JSON</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-highlight-cyan bg-deep-cyan/25 px-2 py-0.5 rounded border border-accent-cyan/15">
                    <Smile className="w-3 h-3" />
                    FUN & SECURE
                  </div>
                </div>

                {/* Content Block */}
                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-white mb-2">
                      {activeLayer.title}
                    </h3>
                    <p className="text-sm text-slate-400 font-light leading-relaxed">
                      {activeLayer.description}
                    </p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeLayer.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-black/35 border border-white/5">
                        <div className="w-5 h-5 rounded-full bg-deep-cyan/35 border border-brand-cyan/20 flex items-center justify-center text-highlight-cyan font-mono text-[10px] font-bold">
                          {idx + 1}
                        </div>
                        <span className="text-xs font-sans text-slate-300 font-light">
                          {detail}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Code Block representation */}
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      Standard Verified Data Block
                    </div>
                    <pre className="p-4 bg-black/80 rounded-xl border border-white/5 overflow-x-auto text-[11px] font-mono text-soft-cyan">
                      <code>{activeLayer.visualCode}</code>
                    </pre>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
