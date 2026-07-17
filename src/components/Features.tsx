import React from 'react';
import { motion } from 'motion/react';
import { Zap, Sparkles, Lock, FolderHeart } from 'lucide-react';

const FEATURE_LIST = [
  {
    id: 'feat-fast',
    icon: Zap,
    title: 'Instant Delivery',
    description: 'Sub-millisecond sync on every device.',
    gridSpan: 'md:col-span-2 lg:col-span-3',
    highlight: 'SUPER SPEED',
    colorGrad: 'from-cyan-500/20 to-blue-600/5',
    iconColor: 'text-cyan-400',
    borderColor: 'group-hover/bento:border-cyan-500/40',
    shadowColor: 'group-hover/bento:shadow-[0_0_25px_rgba(34,211,238,0.25)]',
  },
  {
    id: 'feat-themes',
    icon: Sparkles,
    title: 'Expressive Design',
    description: 'Dynamic customized accents & physics.',
    gridSpan: 'md:col-span-1 lg:col-span-3',
    highlight: 'CUSTOM DESIGN',
    colorGrad: 'from-fuchsia-500/20 to-pink-600/5',
    iconColor: 'text-fuchsia-400',
    borderColor: 'group-hover/bento:border-fuchsia-500/40',
    shadowColor: 'group-hover/bento:shadow-[0_0_25px_rgba(232,121,249,0.25)]',
  },
  {
    id: 'feat-private',
    icon: Lock,
    title: 'Strictly Private',
    description: 'Encrypted, tracker-free conversations.',
    gridSpan: 'md:col-span-1 lg:col-span-3',
    highlight: 'SECURE CHATS',
    colorGrad: 'from-emerald-500/20 to-teal-600/5',
    iconColor: 'text-emerald-400',
    borderColor: 'group-hover/bento:border-emerald-500/40',
    shadowColor: 'group-hover/bento:shadow-[0_0_25px_rgba(52,211,153,0.25)]',
  },
  {
    id: 'feat-media',
    icon: FolderHeart,
    title: 'High-Quality Media',
    description: 'Original formats up to 10GB.',
    gridSpan: 'md:col-span-2 lg:col-span-3',
    highlight: 'RICH SHARING',
    colorGrad: 'from-amber-500/20 to-orange-600/5',
    iconColor: 'text-amber-400',
    borderColor: 'group-hover/bento:border-amber-500/40',
    shadowColor: 'group-hover/bento:shadow-[0_0_25px_rgba(251,191,36,0.25)]',
  },
];

export default function Features() {
  return (
    <section id="features-fold" className="relative py-24 bg-black overflow-hidden border-t border-white/5 px-6">
      {/* Soft backdrops */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[400px] h-[400px] bg-deep-cyan/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-dark-cyan/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-dark-cyan/30 bg-deep-cyan/20 mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-cyan font-bold">
              FEATURES
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4"
          >
            Supercharged chats. Smooth vibes.
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 font-sans font-light text-base sm:text-lg"
          >
            Paralane combines incredible speed with beautiful, intuitive design to make talking with your friends and teams a seamless pleasure.
          </motion.p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6" id="features-bento-grid">
          {FEATURE_LIST.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
                className={`${feat.gridSpan} rounded-2xl glass-morphism p-8 flex flex-col justify-between hover:bg-deep-cyan/15 group/bento transition-all duration-300 relative overflow-hidden`}
              >
                {/* Micro illumination background effect */}
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-accent-cyan/5 rounded-full blur-2xl group-hover/bento:bg-accent-cyan/15 transition-all duration-500" />
                <div className="absolute inset-0 border border-white/0 group-hover/bento:border-white/5 rounded-2xl transition-all pointer-events-none" />

                <div>
                  <div className="flex justify-between items-start mb-6">
                    {/* Highly Expressive Color-Coded Glowing Icon badge */}
                    <div className={`relative flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-950/90 border border-white/10 overflow-hidden shadow-2xl transition-all duration-300 ${feat.borderColor} ${feat.shadowColor}`}>
                      <div className={`absolute inset-0 opacity-15 group-hover/bento:opacity-30 transition-opacity duration-300 bg-gradient-to-br ${feat.colorGrad}`} />
                      <div className="absolute inset-[3px] rounded-[13px] bg-slate-900/90 border border-white/5 flex items-center justify-center">
                        <Icon className={`w-7 h-7 ${feat.iconColor} transition-transform duration-500 group-hover/bento:scale-110`} />
                      </div>
                    </div>

                    <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 font-bold px-2 py-0.5 rounded border border-white/5 bg-white/[0.01]">
                      {feat.highlight}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-white mb-2 group-hover/bento:text-soft-cyan transition-colors">
                    {feat.title}
                  </h3>
                  
                  <p className="text-slate-400 text-sm font-light leading-relaxed mb-4">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
