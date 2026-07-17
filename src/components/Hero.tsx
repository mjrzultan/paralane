import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, MessageSquare, ArrowRight, Download, Users, Zap } from 'lucide-react';

interface HeroProps {
  onAuthTrigger: (mode: 'login' | 'signup') => void;
}

export default function Hero({ onAuthTrigger }: HeroProps) {
  // Particle background canvas setup
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      alpha: number;
      fadeSpeed: number;
    }> = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Initialize particles
    const particleCount = Math.min(60, Math.floor(window.innerWidth / 25));
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.5 + 0.1,
        fadeSpeed: (Math.random() * 0.002) + 0.001,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw ambient grid
      ctx.strokeStyle = 'rgba(0, 139, 139, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw and update particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        p.alpha += p.fadeSpeed;
        if (p.alpha > 0.6 || p.alpha < 0.1) {
          p.fadeSpeed *= -1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37, 255, 255, ${p.alpha})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#00F1F1';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero-section"
      className="relative min-h-[92vh] w-full flex flex-col justify-center items-center overflow-hidden bg-black px-6 pt-32 pb-16"
    >
      {/* 1. DEDICATED VIDEO BACKGROUND CONTAINER LAYER */}
      <div className="absolute inset-0 z-0 overflow-hidden" id="video-bg-container">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-[1.18] origin-center"
          id="hero-bg-video"
        >
          <source src="https://res.cloudinary.com/hserz3g7/video/upload/v1784299407/kling_20260717_VIDEO_make_this__5686_0_n5qo8a.mp4" type="video/mp4" />
        </video>
        
        {/* Interactive canvas particle engine */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen" />

        {/* Ambient cyan glowing blobs representing the color distribution */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-deep-cyan/20 ambient-glow" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-dark-cyan/10 ambient-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-cyan/5 ambient-glow" />
      </div>

      {/* 2. PREMIUM TRANSLUCENT OVERLAY LAYER */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, rgba(0, 37, 37, 0.45) 0%, rgba(0, 0, 0, 0.75) 50%, rgba(0, 88, 88, 0.3) 100%)`
        }}
      />
      
      {/* Subtle radial glow overlay centered behind content */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] z-10 pointer-events-none opacity-60"
        style={{
          background: `radial-gradient(circle, rgba(0,241,241,0.08) 0%, transparent 70%)`
        }}
      />

      {/* 3. HERO CONTENT WRAPPER */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-4xl w-full">
        {/* Uppercase Small Label */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex items-center gap-2 mb-6 px-3.5 py-1 rounded-full border border-brand-cyan/20 bg-deep-cyan/20 backdrop-blur-sm shadow-inner"
        >
          <MessageSquare className="w-3.5 h-3.5 text-highlight-cyan" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-highlight-cyan font-bold">
            NEVER MISS A BEAT
          </span>
        </motion.div>

        {/* Massive Elegant Headline */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="font-display text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white select-none mb-4"
          id="hero-headline"
        >
          PARALANE
        </motion.h1>

        {/* Premium Minimal Subheadline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="font-sans text-xl sm:text-2xl font-light text-soft-cyan tracking-wide mb-6"
          id="hero-subheadline"
        >
          Conversations, without compromise.
        </motion.p>

        {/* Interactive connection lane vector & mini animation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="w-full max-w-md mx-auto mb-12 h-24 flex items-center justify-center gap-10 relative select-none"
          id="hero-animated-vectors"
        >
          {/* Connecting Lane Line behind */}
          <div className="absolute left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent top-1/2 -translate-y-1/2" />
          
          {/* Floating animated glowing signal pulse */}
          <motion.div
            className="absolute h-[2px] w-16 bg-gradient-to-r from-transparent via-highlight-cyan to-transparent top-1/2 -translate-y-1/2"
            animate={{ x: [-120, 120] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Node 1: Sparkles */}
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-950/80 border border-accent-cyan/25 backdrop-blur-md flex items-center justify-center shadow-[0_0_12px_rgba(0,163,163,0.1)] hover:border-highlight-cyan/50 transition-colors">
              <Sparkles className="w-5 h-5 text-highlight-cyan" />
            </div>
          </motion.div>

          {/* Node 2: Core Zap Active Engine */}
          <motion.div
            animate={{ y: [4, -4, 4] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-full bg-slate-950/90 border-2 border-highlight-cyan backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(37,255,255,0.2)]">
              <div className="w-2.5 h-2.5 rounded-full bg-highlight-cyan animate-ping absolute" />
              <Zap className="w-5 h-5 text-highlight-cyan relative z-10" />
            </div>
          </motion.div>

          {/* Node 3: Secure Shield */}
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-950/80 border border-accent-cyan/25 backdrop-blur-md flex items-center justify-center shadow-[0_0_12px_rgba(0,163,163,0.1)] hover:border-highlight-cyan/50 transition-colors">
              <Shield className="w-5 h-5 text-highlight-cyan" />
            </div>
          </motion.div>
        </motion.div>

        {/* Hero CTA Buttons - cleanly redirects to auth pages or downloads */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto"
          id="hero-cta-group"
        >
          <button
            onClick={() => onAuthTrigger('signup')}
            className="glow-btn w-full sm:w-auto px-8 py-4 text-base font-semibold text-black bg-gradient-to-r from-accent-cyan to-highlight-cyan rounded-full shadow-[0_0_20px_rgba(37,255,255,0.35)] hover:shadow-[0_0_30px_rgba(37,255,255,0.55)] transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onAuthTrigger('login')}
            className="w-full sm:w-auto px-8 py-4 text-base font-medium text-white hover:text-highlight-cyan bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-accent-cyan/30 rounded-full transition-all duration-300"
          >
            Sign In
          </button>
        </motion.div>

        {/* Under-buttons social trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-10 flex items-center justify-center gap-6 text-xs text-slate-400 font-mono"
        >
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-accent-cyan" />
            <span>99.9% Delivery Rate</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Encrypted Channels</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll down indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        onClick={() => handleScrollToSection('features-fold')}
        className="absolute bottom-6 z-20 cursor-pointer flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity select-none"
        id="scroll-indicator"
      >
        <span className="text-[10px] font-mono tracking-[0.25em] text-slate-400 uppercase">
          Explore Features
        </span>
        <svg
          className="w-4 h-4 text-accent-cyan"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </motion.div>
    </section>
  );
}
