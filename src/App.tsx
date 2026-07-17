import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Security from './components/Security';
import Download from './components/Download';
import Footer from './components/Footer';
import AuthPage from './components/AuthPage';
import ChatWorkspace from './components/ChatWorkspace';
import { User as UserType } from './types';

export default function App() {
  const [activeAuthPage, setActiveAuthPage] = useState<'landing' | 'login' | 'signup'>('landing');
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // Read session state on mount
  useEffect(() => {
    const saved = localStorage.getItem('paralane_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved) as UserType);
      } catch (e) {
        console.error('Failed to parse local storage session', e);
      }
    }
  }, []);

  const handleAuthTrigger = (mode: 'login' | 'signup') => {
    setActiveAuthPage(mode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: UserType) => {
    setCurrentUser(user);
    localStorage.setItem('paralane_user', JSON.stringify(user));
    setActiveAuthPage('landing');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('paralane_user');
  };

  const handleUserUpdate = (updated: UserType) => {
    setCurrentUser(updated);
    localStorage.setItem('paralane_user', JSON.stringify(updated));
  };

  // If a session is currently active, render the Chat Workspace directly!
  if (currentUser) {
    return (
      <div className="relative min-h-screen bg-slate-950 text-white selection:bg-accent-cyan/30 selection:text-soft-cyan">
        <ChatWorkspace currentUser={currentUser} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-accent-cyan/30 selection:text-soft-cyan">
      {activeAuthPage === 'landing' ? (
        <>
          {/* Premium floating navigation */}
          <Navbar onAuthTrigger={handleAuthTrigger} />

          {/* Hero section fold (100vh centerpiece) */}
          <Hero onAuthTrigger={handleAuthTrigger} />

          {/* Feature sections fold */}
          <Features />

          {/* Technical security details fold */}
          <Security />

          {/* Cross-platform app downloads fold */}
          <Download />

          {/* Premium minimal footer */}
          <Footer />
        </>
      ) : (
        <AuthPage 
          initialMode={activeAuthPage} 
          onClose={() => setActiveAuthPage('landing')} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
