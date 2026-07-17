import React from 'react';
import { motion } from 'motion/react';
import { Download as DlIcon, Monitor, Smartphone, Heart, Sparkles, Image as ImageIcon } from 'lucide-react';
import Logo from './Logo';

// Precise SVG XML markup for the official Paralane logo
const PARALANE_SVG_MARKUP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <defs>
    <filter id="cute-spark-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.14  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <linearGradient id="outer-lane-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#25FFFF" />
      <stop offset="100%" stopColor="#00A3A3" />
    </linearGradient>
    <linearGradient id="inner-lane-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#00A3A3" />
      <stop offset="100%" stopColor="#005858" />
    </linearGradient>
    <filter id="cute-logo-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
    </filter>
  </defs>
  <g filter="url(#cute-logo-shadow)">
    <path d="M 36,74 L 36,42 C 36,24 64,24 64,42 C 64,60 36,60 36,60" stroke="url(#outer-lane-grad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 46,74 L 46,42 C 46,33 54,33 54,42 C 54,51 46,51 46,51" stroke="url(#inner-lane-grad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    <circle cx="50" cy="42" r="3.5" fill="#FFFFFF" filter="url(#cute-spark-glow)" />
  </g>
</svg>`;

const DOWNLOADS = [
  {
    category: 'Desktop App',
    icon: Monitor,
    platforms: [
      { name: 'macOS Universal', desc: 'Apple Silicon & Intel Macs', version: 'v1.4.2', size: '64 MB' },
      { name: 'Windows 64-bit', desc: 'Desktop Installer & Portable', version: 'v1.4.2', size: '72 MB' },
      { name: 'Linux Direct', desc: 'Universal AppImage binary', version: 'v1.4.2', size: '68 MB' }
    ]
  },
  {
    category: 'Mobile App',
    icon: Smartphone,
    platforms: [
      { name: 'iPhone & iPad', desc: 'Download on the iOS App Store', version: 'v1.4.0', size: '28 MB' },
      { name: 'Android Play Store', desc: 'Get it on Google Play', version: 'v1.4.0', size: '30 MB' },
      { name: 'Android Direct APK', desc: 'Install direct package file', version: 'v1.4.0', size: '32 MB' }
    ]
  }
];

export default function Download() {
  const handleDownloadSvg = () => {
    const blob = new Blob([PARALANE_SVG_MARKUP], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'paralane_logo.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Clear background with premium matte black
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Set up translation and scale to center a 100x100 logo into a 560x560 frame inside 1024x1024
    ctx.save();
    ctx.translate(232, 232); // (1024 - 560) / 2 = 232
    ctx.scale(5.6, 5.6);

    // 3. Shadow for the entire group
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;

    // 4. Outer Lane Gradient (vibrant neon cyan to dark cyan teal)
    const outerGrad = ctx.createLinearGradient(30, 20, 70, 80);
    outerGrad.addColorStop(0, '#25FFFF');
    outerGrad.addColorStop(1, '#00A3A3');

    // Outer Track Path: M 36,74 L 36,42 C 36,24 64,24 64,42 C 64,60 36,60 36,60
    ctx.beginPath();
    ctx.moveTo(36, 74);
    ctx.lineTo(36, 42);
    ctx.bezierCurveTo(36, 24, 64, 24, 64, 42);
    ctx.bezierCurveTo(64, 60, 36, 60, 36, 60);
    ctx.strokeStyle = outerGrad;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 5. Inner Lane Gradient (teal to dark moss-teal)
    ctx.shadowColor = 'transparent'; // Disable double shadow
    ctx.shadowBlur = 0;

    const innerGrad = ctx.createLinearGradient(40, 30, 60, 60);
    innerGrad.addColorStop(0, '#00A3A3');
    innerGrad.addColorStop(1, '#005858');

    // Draw Inner Track Path: M 46,74 L 46,42 C 46,33 54,33 54,42 C 54,51 46,51 46,51
    ctx.beginPath();
    ctx.moveTo(46, 74);
    ctx.lineTo(46, 42);
    ctx.bezierCurveTo(46, 33, 54, 33, 54, 42);
    ctx.bezierCurveTo(54, 51, 46, 51, 46, 51);
    ctx.strokeStyle = innerGrad;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.9;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // 6. Draw Spark Glow
    const sparkX = 50;
    const sparkY = 42;
    const sparkRadius = 3.5;

    // Soft glow radial gradient
    const glowGrad = ctx.createRadialGradient(sparkX, sparkY, 0, sparkX, sparkY, sparkRadius * 3);
    glowGrad.addColorStop(0, 'rgba(37, 255, 255, 1)');
    glowGrad.addColorStop(0.4, 'rgba(37, 255, 255, 0.4)');
    glowGrad.addColorStop(1, 'rgba(37, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(sparkX, sparkY, sparkRadius * 3, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // White core spark
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, sparkRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.restore();

    // 7. Download PNG
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'paralane_logo_hd.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <section id="download-fold" className="relative py-24 bg-black border-t border-white/5 px-6">
      <div className="absolute top-1/4 right-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-deep-cyan/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-dark-cyan/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-dark-cyan/30 bg-deep-cyan/20 mb-4">
            <DlIcon className="w-3.5 h-3.5 text-highlight-cyan" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-highlight-cyan font-bold">
              DOWNLOADS
            </span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Take Paralane with you.
          </h2>
          <p className="text-slate-400 font-sans font-light text-base sm:text-lg">
            Stay close to your friends on your phone, tablet, or computer. Your messages and media sync beautifully across all devices, wherever you go.
          </p>
        </div>

        {/* Download Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {DOWNLOADS.map((col, idx) => {
            const CatIcon = col.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl glass-morphism p-8 flex flex-col border border-white/5 bg-black/30 shadow-xl"
              >
                <div className="flex items-center gap-3.5 pb-6 border-b border-white/5 mb-6">
                  <div className="p-3 bg-deep-cyan/30 border border-brand-cyan/20 rounded-xl text-highlight-cyan">
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">
                    {col.category}
                  </h3>
                </div>

                <div className="space-y-4 flex-1">
                  {col.platforms.map((plat, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-4 rounded-xl bg-black/60 border border-white/5 hover:border-accent-cyan/20 hover:bg-deep-cyan/10 transition-all duration-300 flex items-center justify-between group"
                    >
                      <div className="space-y-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <h4 className="font-sans font-bold text-sm text-white group-hover:text-soft-cyan transition-colors truncate">
                            {plat.name}
                          </h4>
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-bold shrink-0">
                            {plat.version}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-light truncate">
                          {plat.desc}
                        </p>
                        
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1 font-mono">
                          <Heart className="w-2.5 h-2.5 text-accent-cyan" />
                          <span>File size: {plat.size}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => alert(`Starting secure download of ${plat.name} (${plat.version}).`)}
                        className="p-3 bg-white/[0.03] group-hover:bg-gradient-to-r group-hover:from-brand-cyan group-hover:to-accent-cyan text-slate-300 group-hover:text-black rounded-xl transition-all duration-300 hover:scale-105"
                      >
                        <DlIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

