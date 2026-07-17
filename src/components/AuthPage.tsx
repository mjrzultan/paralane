import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Shield, Eye, EyeOff, ArrowRight, ArrowLeft, 
  CheckCircle2, Key, Sparkles, User, Smile, Lock
} from 'lucide-react';
import { User as UserType } from '../types';
import Logo from './Logo';

interface AuthPageProps {
  initialMode: 'login' | 'signup';
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

export default function AuthPage({ initialMode, onClose, onLoginSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>(initialMode);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Forgot password specific states
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotMessage, setForgotMessage] = useState('');

  // Google OAuth specific states
  const [showGoogleSim, setShowGoogleSim] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  // Handle conventional register, login, or forgot password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'forgot-password') {
      if (forgotStep === 1) {
        if (!email) {
          setError('Please enter your email address.');
          return;
        }
        setIsLoading(true);
        try {
          const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await res.json();
          setIsLoading(false);
          if (res.ok) {
            setForgotStep(2);
            setForgotMessage(data.message);
          } else {
            setError(data.error || 'Failed to initialize reset request.');
          }
        } catch (err) {
          setIsLoading(false);
          setError('Failed to reach server. Try again.');
        }
      } else {
        if (!newPassword) {
          setError('Please enter your new password.');
          return;
        }
        setIsLoading(true);
        try {
          const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword })
          });
          const data = await res.json();
          setIsLoading(false);
          if (res.ok) {
            setIsSuccess(true);
            setForgotMessage('Your credentials have been updated.');
          } else {
            setError(data.error || 'Failed to reset password.');
          }
        } catch (err) {
          setIsLoading(false);
          setError('Failed to reach server. Try again.');
        }
      }
      return;
    }

    if (!email || !password || (mode === 'signup' && !username)) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    const endpoint = mode === 'signup' ? '/api/auth/register' : '/api/auth/login';
    const payload = mode === 'signup' 
      ? { email, username, password } 
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setIsLoading(false);
      
      if (res.ok) {
        setIsSuccess(true);
        // Save user state so we can pass to parent on modal completion
        sessionStorage.setItem('temp_authenticated_user', JSON.stringify(data.user));
      } else {
        setError(data.error || 'An unexpected error occurred. Please check your credentials.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Could not connect to the Paralane authentication gateway. Ensure server is online.');
    }
  };

  // Google Simulator Logic
  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail || !googleName) return;
    
    setIsLoading(true);
    setShowGoogleSim(false);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleEmail,
          name: googleName,
          googleId: `g-${Date.now()}`
        })
      });
      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        setIsSuccess(true);
        sessionStorage.setItem('temp_authenticated_user', JSON.stringify(data.user));
      } else {
        setError(data.error || 'Google login verification failed.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Could not reach Google verification endpoint.');
    }
  };

  React.useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        handleEnterWorkspace();
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleEnterWorkspace = () => {
    const saved = sessionStorage.getItem('temp_authenticated_user');
    if (saved) {
      const user = JSON.parse(saved) as UserType;
      onLoginSuccess(user);
    } else {
      onClose();
    }
    sessionStorage.removeItem('temp_authenticated_user');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-y-auto flex flex-col justify-between" id="auth-page-container">
      {/* Decorative premium radial gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-deep-cyan/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-dark-cyan/10 blur-[130px]" />
      </div>

      {/* TOP HEADER segment */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between select-none">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-full hover:bg-white/5 text-xs font-mono tracking-wider uppercase cursor-pointer"
          id="auth-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2" id="auth-header-logo">
          <Logo size={28} />
          <span className="font-display text-sm tracking-widest font-bold bg-gradient-to-r from-white to-soft-cyan bg-clip-text text-transparent">
            PARALANE
          </span>
        </div>
      </header>

      {/* MAIN CONTAINER CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md" id="auth-form-card-container">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="glass-morphism rounded-3xl p-10 border border-white/10 shadow-3xl shadow-black text-center flex flex-col items-center justify-center relative overflow-hidden"
              >
                {/* Micro background particle pulse */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
                  <div className="w-[180px] h-[180px] bg-cyan-500/10 rounded-full blur-[40px] animate-pulse" />
                </div>

                <div className="relative z-10 space-y-6">
                  {/* High Fidelity Spin/Pulse animation */}
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    {/* Ring 1 - Outer Pulsing Halo */}
                    <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-75" />
                    {/* Ring 2 - Rotating Segment */}
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-teal-400 animate-spin" />
                    {/* Ring 3 - Inner static glowing core */}
                    <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                      <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-display text-xl font-bold tracking-tight text-white">
                      Verifying Sovereign Session
                    </h2>
                    <p className="text-slate-400 text-xs font-mono tracking-wide leading-relaxed">
                      Syncing communication keys...
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="glass-morphism rounded-3xl p-8 border border-white/10 shadow-3xl shadow-black"
              >
                {/* Title Segment */}
                <div className="flex justify-between items-start mb-8 select-none">
                  <div>
                    <h1 className="font-display text-2xl font-extrabold text-white tracking-tight">
                      {mode === 'signup' ? 'Create account' : mode === 'login' ? 'Sign In' : 'Forgot Password'}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1.5 font-light">
                      {mode === 'signup' 
                        ? 'Join Paralane to message instantly and stay secure.' 
                        : mode === 'login'
                          ? 'Access your chats and catch up on what you missed.'
                          : 'Restore access to your private communication keys.'
                      }
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-deep-cyan/30 border border-brand-cyan/20 text-highlight-cyan">
                    <Smile className="w-5 h-5" />
                  </div>
                </div>

                {/* Form Segment */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* FORGOT PASSWORD PROTOCOL FLOW */}
                  {mode === 'forgot-password' ? (
                    <>
                      {forgotStep === 1 ? (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold">
                            Registered Email Address
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <Mail className="w-4 h-4" />
                            </div>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="charlie@example.com"
                              className="w-full pl-10 pr-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] focus:bg-black/60 rounded-xl text-sm text-white placeholder-slate-500 border border-white/5 focus:border-accent-cyan/50 focus:outline-none focus:ring-1 focus:ring-accent-cyan/20 transition-all duration-300"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-3 bg-deep-cyan/25 border border-accent-cyan/20 rounded-xl">
                            <p className="text-xs font-mono text-highlight-cyan">{forgotMessage}</p>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold">
                              New Secure Password
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                <Key className="w-4 h-4" />
                              </div>
                              <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full pl-10 pr-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] focus:bg-black/60 rounded-xl text-sm text-white placeholder-slate-500 border border-white/5 focus:border-accent-cyan/50 focus:outline-none focus:ring-1 focus:ring-accent-cyan/20 transition-all duration-300"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* CONVENTIONAL SIGNUP / LOGIN FORM */
                    <>
                      {/* Username field (Signup Only) */}
                      {mode === 'signup' && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold">
                            Choose Username
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                              <User className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              required
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              placeholder="charlie_chats"
                              className="w-full pl-10 pr-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] focus:bg-black/60 rounded-xl text-sm text-white placeholder-slate-500 border border-white/5 focus:border-accent-cyan/50 focus:outline-none focus:ring-1 focus:ring-accent-cyan/20 transition-all duration-300"
                            />
                          </div>
                        </div>
                      )}

                      {/* Email field */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                            <Mail className="w-4 h-4" />
                          </div>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="charlie@example.com"
                            className="w-full pl-10 pr-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] focus:bg-black/60 rounded-xl text-sm text-white placeholder-slate-500 border border-white/5 focus:border-accent-cyan/50 focus:outline-none focus:ring-1 focus:ring-accent-cyan/20 transition-all duration-300"
                          />
                        </div>
                      </div>

                      {/* Password field */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center select-none">
                          <label className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold">
                            Password
                          </label>
                          {mode === 'login' && (
                            <button
                              type="button"
                              onClick={() => {
                                setMode('forgot-password');
                                setForgotStep(1);
                                setError('');
                              }}
                              className="text-[10px] font-mono text-slate-500 hover:text-accent-cyan transition-colors cursor-pointer"
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                            <Key className="w-4 h-4" />
                          </div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-10 pr-10 py-3 bg-white/[0.02] hover:bg-white/[0.04] focus:bg-black/60 rounded-xl text-sm text-white placeholder-slate-500 border border-white/5 focus:border-accent-cyan/50 focus:outline-none focus:ring-1 focus:ring-accent-cyan/20 transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {error && (
                    <p className="text-xs text-rose-400 font-medium pt-1 select-none">
                      {error}
                    </p>
                  )}

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="glow-btn w-full mt-6 py-3 px-4 bg-gradient-to-r from-brand-cyan to-accent-cyan hover:from-accent-cyan hover:to-highlight-cyan text-black font-semibold rounded-xl text-sm shadow-lg shadow-brand-cyan/20 transition-all duration-300 flex items-center justify-center gap-2 group/btn disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>
                          {mode === 'forgot-password' 
                            ? (forgotStep === 1 ? 'Verify Email Address' : 'Update Password')
                            : mode === 'signup' 
                              ? 'Create Account' 
                              : 'Sign In'
                          }
                        </span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Google Authenticator integration */}
                  {mode !== 'forgot-password' && (
                    <div className="pt-3 select-none">
                      <div className="relative flex items-center justify-center my-4">
                        <div className="absolute left-0 right-0 h-[1px] bg-white/5" />
                        <span className="relative z-10 px-3 bg-slate-950 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          or connect with
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowGoogleSim(true)}
                        className="w-full py-3 px-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-2 text-slate-200 hover:text-white transition-all cursor-pointer"
                      >
                        {/* Custom vector SVG google icon */}
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Sign In with Google</span>
                      </button>
                    </div>
                  )}

                  {/* Toggle Mode selection */}
                  <div className="flex flex-col items-center gap-2 mt-6 pt-4 border-t border-white/5 text-center select-none">
                    <p className="text-xs text-slate-400 font-light flex items-center gap-1.5">
                      <span>
                        {mode === 'forgot-password' 
                          ? 'Remembered your password?' 
                          : mode === 'signup' 
                            ? 'Already have an account?' 
                            : "Don't have an account yet?"
                        }
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMode(mode === 'signup' ? 'login' : 'signup');
                          setForgotStep(1);
                          setError('');
                        }}
                        className="text-highlight-cyan hover:text-white font-semibold transition-colors cursor-pointer"
                      >
                        {mode === 'forgot-password' ? 'Sign In' : mode === 'signup' ? 'Sign In' : 'Sign Up'}
                      </button>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* GOOGLE SIGN IN OAUTH SIMULATOR PORTAL */}
      <AnimatePresence>
        {showGoogleSim && (
          <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative"
            >
              {/* Back out button */}
              <button 
                onClick={() => setShowGoogleSim(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-4 mb-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <svg className="w-6 h-6 text-black" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-white text-base">Google Identity Account</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Connect your verified account to start communication immediately.</p>
                </div>
              </div>

              <form onSubmit={handleGoogleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="Charlie Smith"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">Your Google Email</label>
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="charliesmith@gmail.com"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-white text-black font-semibold text-xs uppercase tracking-wider transition-all hover:bg-slate-200 cursor-pointer"
                >
                  Confirm & Link Google Profile
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER segment */}
      <footer className="relative z-10 w-full text-center py-6 text-slate-500 text-[10px] font-mono select-none">
        <span>© 2026 PARALANE. Chat instantly, share safely.</span>
      </footer>
    </div>
  );
}

// Cute little helper component to dismiss overlay inside modal
function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
