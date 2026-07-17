import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Users, LogOut, MessageSquare, Plus, Search, 
  Sparkles, Shield, User, Bot, UserPlus, Hash, ChevronRight, X, Image,
  Settings, Moon, Sun, ArrowLeft, Check, Bell
} from 'lucide-react';
import { User as UserType, Chat as ChatType, Message as MessageType, MessageRequest } from '../types';
import Logo from './Logo';

const ABSTRACT_PARTICLES = [
  { id: 1, top: '12%', left: '14%', size: 4, delay: '0s', duration: '18s', opacity: 0.15 },
  { id: 2, top: '24%', left: '76%', size: 6, delay: '2s', duration: '22s', opacity: 0.12 },
  { id: 3, top: '48%', left: '6%', size: 3, delay: '4s', duration: '15s', opacity: 0.15 },
  { id: 4, top: '68%', left: '84%', size: 8, delay: '1s', duration: '25s', opacity: 0.08 },
  { id: 5, top: '82%', left: '28%', size: 5, delay: '5s', duration: '20s', opacity: 0.14 },
  { id: 6, top: '16%', left: '56%', size: 4, delay: '3s', duration: '19s', opacity: 0.12 },
  { id: 7, top: '58%', left: '42%', size: 5, delay: '7s', duration: '21s', opacity: 0.10 },
  { id: 8, top: '52%', left: '88%', size: 3, delay: '6s', duration: '16s', opacity: 0.14 },
  { id: 9, top: '34%', left: '22%', size: 7, delay: '1.5s', duration: '24s', opacity: 0.07 },
  { id: 10, top: '78%', left: '62%', size: 4, delay: '4.5s', duration: '17s', opacity: 0.13 },
  { id: 11, top: '8%', left: '78%', size: 6, delay: '2.5s', duration: '23s', opacity: 0.11 },
  { id: 12, top: '90%', left: '12%', size: 5, delay: '8s', duration: '20s', opacity: 0.16 }
];

interface ChatWorkspaceProps {
  currentUser: UserType;
  onLogout: () => void;
  onUserUpdate?: (user: UserType) => void;
}

export default function ChatWorkspace({ currentUser, onLogout, onUserUpdate }: ChatWorkspaceProps) {
  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [activeTab, setActiveTab] = useState<'chats' | 'users'>('chats');
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  
  // Message input
  const [newMessageText, setNewMessageText] = useState('');
  
  // Create Group Modal
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Theme & Privacy States
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('paralane_theme') as 'dark' | 'light') || 'dark';
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [allowSearch, setAllowSearch] = useState(currentUser.allowSearch !== false);
  const [requireMessageRequests, setRequireMessageRequests] = useState(currentUser.requireMessageRequests === true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Message Requests & Discovery Modal States
  const [messageRequests, setMessageRequests] = useState<MessageRequest[]>([]);
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [discoverySearchQuery, setDiscoverySearchQuery] = useState('');

  // Profile settings states
  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [editAvatarUrl, setEditAvatarUrl] = useState(currentUser.avatarUrl);
  const [profileSaveError, setProfileSaveError] = useState('');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const isDark = theme === 'dark';
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showSettingsModal) {
      setEditUsername(currentUser.username);
      setEditAvatarUrl(currentUser.avatarUrl);
      setProfileSaveError('');
      setProfileSaveSuccess(false);
    }
  }, [showSettingsModal, currentUser]);

  useEffect(() => {
    setAllowSearch(currentUser.allowSearch !== false);
    setRequireMessageRequests(currentUser.requireMessageRequests === true);
  }, [currentUser]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('paralane_theme', nextTheme);
  };

  const handleTogglePrivacy = async (checked: boolean) => {
    setRequireMessageRequests(checked);
    try {
      const res = await fetch(`/api/users/${currentUser.id}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requireMessageRequests: checked })
      });
      if (res.ok) {
        const data = await res.json();
        if (onUserUpdate) {
          onUserUpdate(data.user);
        }
      }
    } catch (e) {
      console.error("Failed to update privacy settings", e);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername.trim()) {
      setProfileSaveError('Username cannot be empty.');
      return;
    }
    setSavingProfile(true);
    setProfileSaveError('');
    setProfileSaveSuccess(false);
    try {
      const res = await fetch(`/api/users/${currentUser.id}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editUsername.trim(),
          avatarUrl: editAvatarUrl.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileSaveError(data.error || 'Failed to update profile settings.');
      } else {
        setProfileSaveSuccess(true);
        if (onUserUpdate) {
          onUserUpdate(data.user);
        }
        // Also update allUsers state locally so user list updates immediately
        setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, username: data.user.username, avatarUrl: data.user.avatarUrl } : u));
      }
    } catch (err) {
      setProfileSaveError('A connection error occurred. Please try again.');
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Fetch chats and users
  const fetchChats = async () => {
    try {
      const res = await fetch(`/api/chats?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setChats(data);
        
        // Keep selected chat state updated in case of participant updates
        if (selectedChat) {
          const updatedChat = data.find((c: ChatType) => c.id === selectedChat.id);
          if (updatedChat) {
            setSelectedChat(updatedChat);
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch chats', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (e) {
      console.error('Failed to fetch users', e);
    }
  };

  const fetchMessageRequests = async () => {
    try {
      const res = await fetch(`/api/message-requests?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessageRequests(data);
      }
    } catch (e) {
      console.error('Failed to fetch message requests', e);
    }
  };

  const handleSendRequest = async (receiverId: string) => {
    try {
      const res = await fetch('/api/message-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUser.id, receiverId })
      });
      if (res.ok) {
        fetchMessageRequests();
      }
    } catch (e) {
      console.error('Failed to send request', e);
    }
  };

  const handleRespondRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      const res = await fetch(`/api/message-requests/${requestId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchMessageRequests();
        fetchChats();
      }
    } catch (e) {
      console.error('Failed to respond to request', e);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}/messages?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Failed to fetch messages', e);
    }
  };

  // Initial load
  useEffect(() => {
    fetchChats();
    fetchUsers();
    fetchMessageRequests();

    // Start Real-Time message pulling
    pollingRef.current = setInterval(() => {
      fetchChats();
      fetchUsers();
      fetchMessageRequests();
      if (selectedChat) {
        fetchMessages(selectedChat.id);
      }
    }, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [currentUser.id, selectedChat?.id]);

  // Handle Chat selection
  const handleSelectChat = (chat: ChatType) => {
    setSelectedChat(chat);
    setMessages([]); // clear old messages for nice fade-in loading
    fetchMessages(chat.id);
    
    // Clear search and switch to chat tab on mobile viewports
    setSearchQuery('');
  };

  // Start DM chat with a user
  const handleStartDM = async (otherUser: UserType) => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: otherUser.username,
          isGroup: false,
          participantIds: [currentUser.id, otherUser.id],
          createdBy: currentUser.id
        })
      });
      if (res.ok) {
        const chat = await res.json();
        // Add to active local state list if not there
        if (!chats.some(c => c.id === chat.id)) {
          setChats(prev => [chat, ...prev]);
        }
        setSelectedChat(chat);
        setMessages([]);
        fetchMessages(chat.id);
        setActiveTab('chats');
        setSearchQuery('');
      }
    } catch (e) {
      console.error('Failed to initiate direct message', e);
    }
  };

  // Create Group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName.trim(),
          isGroup: true,
          participantIds: [...selectedMembers, currentUser.id],
          createdBy: currentUser.id
        })
      });

      if (res.ok) {
        const newGroup = await res.json();
        setChats(prev => [newGroup, ...prev]);
        setSelectedChat(newGroup);
        setMessages([]);
        fetchMessages(newGroup.id);
        
        // Reset modal fields
        setGroupName('');
        setSelectedMembers([]);
        setShowGroupModal(false);
        setActiveTab('chats');
      }
    } catch (e) {
      console.error('Failed to create group', e);
    }
  };

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedChat) return;

    const body = {
      senderId: currentUser.id,
      text: newMessageText.trim()
    };

    // Optimistic UI updates
    const tempId = `temp-${Date.now()}`;
    const tempMessage: MessageType = {
      id: tempId,
      chatId: selectedChat.id,
      senderId: currentUser.id,
      senderName: currentUser.username,
      senderAvatar: currentUser.avatarUrl,
      text: newMessageText.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessageText('');

    try {
      const res = await fetch(`/api/chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const savedMessage = await res.json();
        // Replace optimistic message with the database saved message
        setMessages(prev => prev.map(m => m.id === tempId ? savedMessage : m));
        
        // Auto-scroll to bottom immediately
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  // Auto scroll to bottom when messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Filters
  const filteredChats = chats.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = allUsers.filter(u => 
    u.id !== currentUser.id && u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`fixed inset-0 z-50 flex overflow-hidden font-sans transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-white' : 'bg-[#FAF9F5] text-slate-800'
    }`} id="workspace-main-wrapper">
      {/* Dynamic Background Accents */}
      <style>{`
        @keyframes drift {
          0% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) translateX(15px);
          }
          100% {
            transform: translateY(-10px) translateX(-5px);
          }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[140px] transition-opacity duration-500 ${
          isDark ? 'bg-accent-cyan/10 opacity-100' : 'bg-cyan-500/5 opacity-80'
        }`} />
        <div className={`absolute -bottom-40 -right-40 w-[450px] h-[450px] rounded-full blur-[160px] transition-opacity duration-500 ${
          isDark ? 'bg-dark-cyan/5 opacity-100' : 'bg-teal-500/5 opacity-80'
        }`} />

        {/* Abstract Background Particles */}
        {ABSTRACT_PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-cyan-400"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: isDark ? p.opacity : p.opacity * 0.4,
              animation: `drift ${p.duration} ease-in-out infinite alternate`,
              animationDelay: p.delay,
              filter: isDark ? 'blur(0.5px)' : 'none',
            }}
          />
        ))}
      </div>

      {/* LEFT COMPONENT: Chats/Users Sidebar */}
      <aside className={`w-full md:w-80 lg:w-96 border-r relative z-10 flex flex-col h-full shrink-0 select-none transition-all duration-300 ${
        selectedChat ? 'hidden md:flex' : 'flex'
      } ${
        isDark ? 'border-white/5 bg-slate-950/70 backdrop-blur-xl' : 'border-slate-200 bg-white/90 backdrop-blur-xl'
      }`} id="sidebar-panel">
        
        {/* Sidebar Header with Brand */}
        <div className={`p-5 border-b flex items-center justify-between transition-colors relative ${
          isDark ? 'border-white/5' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <Logo size={24} />
            <span className={`font-display text-sm tracking-widest font-extrabold bg-gradient-to-r bg-clip-text text-transparent ${
              isDark ? 'from-white to-soft-cyan' : 'from-slate-900 to-cyan-600'
            }`}>
              PARALANE
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Top Search Icon Button */}
            <button
              onClick={() => setShowDiscoveryModal(true)}
              className={`p-2 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center border ${
                isDark 
                  ? 'bg-white/[0.02] border-white/5 hover:border-accent-cyan/30 text-slate-300 hover:text-white' 
                  : 'bg-slate-100 border-slate-200 hover:border-cyan-500 text-slate-600 hover:text-slate-950 shadow-xs'
              }`}
              title="Search & message requests directory"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* User Profile Trigger Button */}
            <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(prev => !prev)}
              className={`relative w-8 h-8 rounded-full border-2 overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none cursor-pointer flex items-center justify-center ${
                showProfileMenu 
                  ? 'border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]' 
                  : isDark ? 'border-white/15 hover:border-accent-cyan' : 'border-slate-200 hover:border-cyan-500'
              }`}
              title="Open account menu"
            >
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.username} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>

            {/* Glossy Dropdown Menu */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className={`absolute right-0 mt-2.5 w-56 rounded-2xl p-1.5 z-50 border backdrop-blur-xl shadow-2xl transition-all ${
                    isDark 
                      ? 'bg-slate-950/90 border-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
                      : 'bg-white/95 border-slate-200/80 text-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.1)]'
                  }`}
                >
                  {/* Micro Info Header */}
                  <div className={`px-3 py-2.5 border-b mb-1 transition-colors ${
                    isDark ? 'border-white/5' : 'border-slate-100'
                  }`}>
                    <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {currentUser.username}
                    </p>
                    <p className={`text-[9px] font-mono truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {currentUser.email}
                    </p>
                  </div>

                  {/* Settings */}
                  <button
                    onClick={() => {
                      setShowSettingsModal(true);
                      setShowProfileMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                      isDark ? 'hover:bg-white/5 text-slate-200 hover:text-white' : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Workspace Settings</span>
                  </button>

                  {/* Add Friend (Switch activeTab to users) */}
                  <button
                    onClick={() => {
                      setActiveTab('users');
                      setSearchQuery('');
                      setShowProfileMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                      isDark ? 'hover:bg-white/5 text-slate-200 hover:text-white' : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5 text-teal-500" />
                    <span>Add Friend / Discover</span>
                  </button>

                  {/* Create Group Space */}
                  <button
                    onClick={() => {
                      setShowGroupModal(true);
                      setShowProfileMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                      isDark ? 'hover:bg-white/5 text-slate-200 hover:text-white' : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Create Group Space</span>
                  </button>

                  {/* Divider */}
                  <div className={`h-px my-1 transition-colors ${isDark ? 'bg-white/5' : 'bg-slate-200/60'}`} />

                  {/* Logout */}
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer text-red-500 ${
                      isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                    }`}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout Session</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

        {/* Dynamic Navigation Tabs */}
        <div className={`mt-4 px-4 flex gap-2 border-b pb-3 transition-colors ${
          isDark ? 'border-white/5' : 'border-slate-200'
        }`}>
          <button
            onClick={() => { setActiveTab('chats'); setSearchQuery(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-mono tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer border ${
              activeTab === 'chats' 
                ? isDark
                  ? 'bg-deep-cyan/25 border-accent-cyan/35 text-highlight-cyan font-bold shadow-[0_0_15px_rgba(37,255,255,0.06)]' 
                  : 'bg-cyan-50 border-cyan-200 text-cyan-600 font-bold shadow-[0_2px_10px_rgba(6,182,212,0.08)]'
                : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>CHATS ({chats.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-mono tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer border relative ${
              activeTab === 'users' 
                ? isDark
                  ? 'bg-deep-cyan/25 border-accent-cyan/35 text-highlight-cyan font-bold shadow-[0_0_15px_rgba(37,255,255,0.06)]' 
                  : 'bg-cyan-50 border-cyan-200 text-cyan-600 font-bold shadow-[0_2px_10px_rgba(6,182,212,0.08)]'
                : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>REQUESTS</span>
            {messageRequests.filter(r => r.receiverId === currentUser.id && r.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Unified Contact Search bar */}
        <div className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder={activeTab === 'chats' ? "Search workspace spaces..." : "Filter requests list..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs transition-all duration-300 focus:outline-none focus:ring-1 ${
                isDark 
                  ? 'bg-white/[0.02] border-white/5 text-white placeholder-slate-500 focus:border-accent-cyan/40 focus:ring-accent-cyan/10' 
                  : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-cyan-500 focus:ring-cyan-200/50'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content lists section */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          
          {/* TAB 1: ACTIVE CHATS */}
          {activeTab === 'chats' && (
            <>
              {/* Quick header with group launch button */}
              <div className="flex items-center justify-between px-1 mb-2">
                <span className={`text-[10px] font-mono tracking-wider uppercase font-bold ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>Active Connections</span>
                <button
                  onClick={() => setShowGroupModal(true)}
                  className={`flex items-center gap-1 text-[10px] font-mono font-bold transition-all px-2 py-1 rounded-md border cursor-pointer ${
                    isDark 
                      ? 'bg-accent-cyan/10 border-accent-cyan/20 text-highlight-cyan hover:bg-accent-cyan/25 hover:text-white' 
                      : 'bg-cyan-50 border-cyan-200 text-cyan-600 hover:bg-cyan-100 hover:text-cyan-700'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  <span>GROUP</span>
                </button>
              </div>

              {filteredChats.length === 0 ? (
                <div className={`p-8 text-center rounded-2xl border ${
                  isDark ? 'bg-white/[0.01] border-white/5' : 'bg-slate-100/50 border-slate-200/60'
                }`}>
                  <Bot className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className={`text-xs font-light ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>No chat spaces found.</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Create a group or find people to start direct lines.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredChats.map((chat) => {
                    const isSelected = selectedChat?.id === chat.id;
                    return (
                      <button
                        key={chat.id}
                        onClick={() => handleSelectChat(chat)}
                        className={`w-full p-3.5 rounded-2xl transition-all flex items-center justify-between gap-3 text-left border relative group cursor-pointer ${
                          isSelected 
                            ? isDark
                              ? 'bg-deep-cyan/20 border-accent-cyan/40 shadow-md shadow-accent-cyan/5' 
                              : 'bg-cyan-50 border-cyan-200 shadow-sm shadow-cyan-100'
                            : isDark
                              ? 'bg-white/[0.01] hover:bg-white/[0.03] border-white/5 hover:border-white/10'
                              : 'bg-white hover:bg-slate-50 border-slate-200/60 hover:border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.01)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`relative w-10 h-10 rounded-xl border flex items-center justify-center overflow-hidden shrink-0 ${
                            isDark ? 'bg-slate-900 border-white/10' : 'bg-slate-100 border-slate-200'
                          }`}>
                            {chat.isGroup ? (
                              <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                <Hash className="w-5 h-5 text-cyan-600" />
                              </div>
                            ) : (
                              <img 
                                src={chat.avatarUrl} 
                                alt={chat.name} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className={`text-xs font-semibold truncate max-w-[150px] ${isDark ? 'text-white' : 'text-slate-800'}`}>{chat.name}</h4>
                            <p className={`text-[9px] font-mono mt-0.5 truncate max-w-[180px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {chat.isGroup ? 'Group Space Channel' : 'Direct secure tunnel'}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? 'text-cyan-500 translate-x-0.5' : 'text-slate-400 group-hover:text-slate-600'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 2: REQUESTS MANAGER VIEW */}
          {activeTab === 'users' && (
            <>
              <div className="px-1 mb-3">
                <span className={`text-[10px] font-mono tracking-wider uppercase font-bold ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>Message Requests Center</span>
              </div>

              {/* Filtering requests by search query if any */}
              {(() => {
                const incomingPending = messageRequests.filter(r => r.receiverId === currentUser.id && r.status === 'pending');
                const outgoingAll = messageRequests.filter(r => r.senderId === currentUser.id);

                const filterFunc = (r: MessageRequest) => {
                  if (!searchQuery.trim()) return true;
                  const term = searchQuery.toLowerCase();
                  const isSender = r.senderId === currentUser.id;
                  const otherName = isSender ? (r.receiverName || "User") : r.senderName;
                  return otherName.toLowerCase().includes(term);
                };

                const filteredIncoming = incomingPending.filter(filterFunc);
                const filteredOutgoing = outgoingAll.filter(filterFunc);

                if (incomingPending.length === 0 && outgoingAll.length === 0) {
                  return (
                    <div className={`p-8 text-center rounded-2xl border ${
                      isDark ? 'bg-white/[0.01] border-white/5' : 'bg-slate-100/50 border-slate-200/60'
                    }`}>
                      <Bell className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className={`text-xs font-light ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>No requests found.</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-mono">Click the search icon at the top to discover profiles and start requests.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-5">
                    {/* Incoming pending requests */}
                    {filteredIncoming.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[9px] font-mono uppercase tracking-widest text-cyan-500 font-bold px-1">
                          Incoming Pending ({filteredIncoming.length})
                        </h4>
                        <div className="space-y-1.5">
                          {filteredIncoming.map((req) => (
                            <div
                              key={req.id}
                              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 text-left ${
                                isDark 
                                  ? 'bg-white/[0.02] border-white/5 shadow-md' 
                                  : 'bg-white border-slate-200 shadow-xs'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img 
                                  src={req.senderAvatar} 
                                  alt={req.senderName} 
                                  className="w-8 h-8 rounded-xl object-cover shrink-0" 
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0">
                                  <h4 className={`text-xs font-semibold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    {req.senderName}
                                  </h4>
                                  <span className="text-[8px] font-mono text-slate-400 block mt-0.5">Wants to chat</span>
                                </div>
                              </div>

                              <div className="flex gap-1 shrink-0">
                                <button
                                  onClick={() => handleRespondRequest(req.id, 'accepted')}
                                  className="p-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-all cursor-pointer"
                                  title="Accept"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                                <button
                                  onClick={() => handleRespondRequest(req.id, 'declined')}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                    isDark ? 'border-white/5 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                  }`}
                                  title="Decline"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Outgoing sent requests */}
                    {filteredOutgoing.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold px-1">
                          Sent Requests ({filteredOutgoing.length})
                        </h4>
                        <div className="space-y-1.5">
                          {filteredOutgoing.map((req) => {
                            const recName = req.receiverName || allUsers.find(u => u.id === req.receiverId)?.username || "User";
                            const recAvatar = allUsers.find(u => u.id === req.receiverId)?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${recName}`;
                            return (
                              <div
                                key={req.id}
                                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 text-left ${
                                  isDark 
                                    ? 'bg-white/[0.01] border-white/5' 
                                    : 'bg-white border-slate-100 shadow-2xs'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img 
                                    src={recAvatar} 
                                    alt={recName} 
                                    className="w-8 h-8 rounded-xl object-cover shrink-0" 
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <h4 className={`text-xs font-semibold truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                      {recName}
                                    </h4>
                                    <span className="text-[8px] font-mono text-slate-500 block mt-0.5">
                                      {new Date(req.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono tracking-wider uppercase shrink-0 font-bold ${
                                  req.status === 'pending'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : req.status === 'accepted'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                  {req.status}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}

        </div>
      </aside>

      {/* RIGHT COMPONENT: ACTIVE CHAT SCREEN */}
      <main className={`flex-1 flex flex-col h-full relative z-10 overflow-hidden transition-all duration-300 ${
        selectedChat ? 'flex' : 'hidden md:flex'
      } ${
        isDark ? 'bg-slate-950' : 'bg-[#FAF9F5]'
      }`} id="workspace-active-chat-view">
        {selectedChat ? (
          <div className="flex-1 flex flex-col h-full relative" id="active-chat-container">
            {/* Chat header panel */}
            <header className={`p-4 border-b flex items-center justify-between relative z-10 select-none transition-colors duration-300 ${
              isDark ? 'border-white/5 bg-slate-900/40 backdrop-blur-md' : 'border-slate-200 bg-white/70 backdrop-blur-md'
            }`}>
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedChat(null)}
                  className={`md:hidden p-1.5 rounded-lg transition-all cursor-pointer ${
                    isDark 
                      ? 'text-slate-400 hover:text-white hover:bg-white/5' 
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
                  }`}
                  title="Back to lists"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center overflow-hidden shrink-0 ${
                  isDark ? 'bg-slate-950 border-white/10' : 'bg-slate-100 border-slate-200'
                }`}>
                  {selectedChat.isGroup ? (
                    <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      <Hash className="w-5 h-5 text-cyan-600" />
                    </div>
                  ) : (
                    <img 
                      src={selectedChat.avatarUrl} 
                      alt={selectedChat.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                <div>
                  <h3 className={`text-xs font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    <span>{selectedChat.name}</span>
                    {selectedChat.isGroup && (
                      <span className={`text-[8px] border px-1 py-0.5 rounded uppercase font-bold tracking-widest ${
                        isDark ? 'bg-accent-cyan/15 border-accent-cyan/20 text-highlight-cyan' : 'bg-cyan-50 border-cyan-200 text-cyan-600'
                      }`}>
                        GROUP CHANNEL
                      </span>
                    )}
                  </h3>
                  <div className={`text-[9px] font-mono mt-0.5 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active line sync</span>
                    {selectedChat.isGroup && (
                      <>
                        <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>•</span>
                        <span>{selectedChat.participantIds.length} members connected</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Bot trigger helper notice */}
              {selectedChat.id === 'chat-general' && (
                <div className={`hidden sm:flex items-center gap-2 border py-1 px-3 rounded-lg transition-colors duration-300 ${
                  isDark ? 'bg-slate-950/80 border-white/5' : 'bg-white/95 border-slate-200/80 shadow-sm'
                }`}>
                  <Bot className="w-3.5 h-3.5 text-cyan-500" />
                  <span className={`text-[9px] font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Type <strong className="text-cyan-500">@bot</strong> for AI system responses
                  </span>
                </div>
              )}
            </header>

            {/* Message Thread Scroll panel */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 relative" id="message-list-scroller">
              <div className={`absolute inset-x-0 top-0 h-10 pointer-events-none ${
                isDark ? 'bg-gradient-to-b from-slate-950 to-transparent' : 'bg-gradient-to-b from-[#FAF9F5] to-transparent'
              }`} />
              
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isMine = msg.senderId === currentUser.id;
                  const isSystem = msg.senderId === 'user-system';
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className={`flex gap-3 max-w-2xl ${isMine ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center overflow-hidden shrink-0 shadow ${
                        isDark ? 'bg-slate-900 border-white/15' : 'bg-white border-slate-200'
                      }`}>
                        <img 
                          src={msg.senderAvatar} 
                          alt={msg.senderName} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Content block */}
                      <div className="space-y-1">
                        {/* Name and Micro-Timestamp */}
                        <div className={`flex items-center gap-2 px-1 ${isMine ? 'justify-end' : ''}`}>
                          <span className={`text-[10px] font-bold ${
                            isSystem 
                              ? 'text-cyan-600' 
                              : isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}>
                            {msg.senderName}
                          </span>
                          <span className={`text-[8px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>

                        {/* Text card balloon */}
                        <div className={`p-3.5 rounded-2xl text-xs sm:text-sm font-normal leading-relaxed select-text shadow-sm relative ${
                          isMine 
                            ? isDark
                              ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-black rounded-tr-none font-bold pr-7' 
                              : 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-tr-none font-semibold pr-7'
                            : isSystem 
                              ? isDark
                                ? 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-100 rounded-tl-none shadow-[0_0_15px_rgba(37,255,255,0.04)] font-medium' 
                                : 'bg-cyan-50/90 border border-cyan-200 text-cyan-950 rounded-tl-none font-medium'
                              : isDark
                                ? 'bg-slate-900 border border-white/10 text-white rounded-tl-none shadow-md font-normal'
                                : 'bg-white border border-slate-200 text-slate-950 rounded-tl-none shadow-[0_1.5px_4px_rgba(0,0,0,0.04)] font-normal'
                        }`}>
                          {msg.text}
                          {isMine && (
                            <span 
                              className={`absolute bottom-1 right-2.5 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                msg.seen 
                                  ? 'bg-cyan-400 ring-2 ring-cyan-400/30' 
                                  : 'bg-slate-400 ring-2 ring-slate-400/20'
                              }`} 
                              title={msg.seen ? "Seen by recipient" : "Message Sent"} 
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Footer */}
            <footer className={`p-4 border-t backdrop-blur-md relative z-10 transition-colors duration-300 ${
              isDark ? 'border-white/5 bg-slate-900/20' : 'border-slate-200 bg-white/75'
            }`}>
              <form onSubmit={handleSendMessage} className="flex gap-2.5 items-center">
                <input 
                  type="text"
                  required
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder={
                    selectedChat.id === 'chat-general' 
                      ? "Send instant message (use @bot for simulation)..." 
                      : `Message ${selectedChat.name}...`
                  }
                  className={`flex-1 border rounded-xl px-4 py-3 text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:ring-1 ${
                    isDark 
                      ? 'bg-white/[0.02] hover:bg-white/[0.04] focus:bg-black/60 border-white/5 focus:border-accent-cyan/50 text-white focus:ring-accent-cyan/15 placeholder-slate-500' 
                      : 'bg-slate-100 hover:bg-slate-200/50 focus:bg-white border-slate-200 focus:border-cyan-500 text-slate-900 focus:ring-cyan-200 placeholder-slate-400 shadow-inner'
                  }`}
                />

                <button
                  type="submit"
                  disabled={!newMessageText.trim()}
                  className={`px-5 py-3 rounded-xl transition-all font-semibold flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 ${
                    isDark 
                      ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-900/20' 
                      : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow shadow-cyan-200'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </footer>
          </div>
        ) : (
          /* Empty Space Landing view */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative select-none">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
              <div className={`w-[400px] h-[400px] rounded-full blur-[120px] animate-pulse ${
                isDark ? 'bg-accent-cyan/5' : 'bg-cyan-500/5'
              }`} />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 max-w-sm space-y-6"
            >
              <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center mx-auto shadow-xl ${
                isDark 
                  ? 'bg-deep-cyan/15 border-accent-cyan/30 text-highlight-cyan shadow-accent-cyan/10' 
                  : 'bg-cyan-50 border-cyan-200 text-cyan-600'
              }`}>
                <Shield className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h3 className={`font-display text-lg font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Active Paralane Sync Channel
                </h3>
                <p className={`text-xs font-light mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Select an existing chat space from your active connections list, start a new direct connection with any user, or create a custom group space channel.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full py-2.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-all ${
                    isDark 
                      ? 'bg-white/[0.02] border-white/5 hover:border-accent-cyan/30 hover:bg-white/5 text-slate-300 hover:text-white' 
                      : 'bg-white border-slate-200 hover:border-cyan-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-sm'
                  }`}
                >
                  Browse Users Directory
                </button>
                <button
                  onClick={() => setShowGroupModal(true)}
                  className={`w-full py-2.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-all ${
                    isDark 
                      ? 'bg-accent-cyan/10 border-accent-cyan/20 text-highlight-cyan hover:bg-accent-cyan/20' 
                      : 'bg-cyan-50 border-cyan-200 text-cyan-600 hover:bg-cyan-100 hover:border-cyan-300'
                  }`}
                >
                  + Create Group Space
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>

      {/* CREATE GROUP SPACE MODAL OVERLAY */}
      <AnimatePresence>
        {showGroupModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md border rounded-3xl p-6 shadow-2xl relative transition-colors duration-300 ${
                isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {/* Close Button */}
              <button 
                onClick={() => { setShowGroupModal(false); setGroupName(''); setSelectedMembers([]); }}
                className={`absolute top-5 right-5 p-1 rounded-full transition-all cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <div className={`p-2 rounded-lg border ${
                  isDark ? 'bg-deep-cyan/30 border-brand-cyan/20 text-highlight-cyan' : 'bg-cyan-50 border-cyan-200 text-cyan-600'
                }`}>
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Create Group Space</h3>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Start a secure conversation with multiple people.</p>
                </div>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                {/* Group Name input */}
                <div className="space-y-1.5">
                  <label className={`text-[9px] font-mono uppercase tracking-wider font-bold ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>Group Name</label>
                  <input 
                    type="text"
                    required
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Engineering Sync ⚡"
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-1 ${
                      isDark 
                        ? 'bg-white/[0.02] border-white/5 focus:border-accent-cyan/50 focus:ring-accent-cyan/15 text-white placeholder-slate-600' 
                        : 'bg-slate-100 border-slate-200 focus:bg-white focus:border-cyan-500 focus:ring-cyan-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Member Select */}
                <div className="space-y-1.5">
                  <label className={`text-[9px] font-mono uppercase tracking-wider font-bold ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Select Members ({selectedMembers.length} Selected)
                  </label>
                  
                  {allUsers.filter(u => u.id !== currentUser.id).length === 0 ? (
                    <div className={`p-4 text-center rounded-xl border ${
                      isDark ? 'bg-white/[0.01] border-white/5' : 'bg-slate-50 border-slate-200/60'
                    }`}>
                      <p className="text-[10px] text-slate-500 font-mono">No other registered users in directory.</p>
                    </div>
                  ) : (
                    <div className={`max-h-40 overflow-y-auto space-y-1.5 border rounded-xl p-2 ${
                      isDark ? 'border-white/5 bg-black/40' : 'border-slate-200 bg-slate-50'
                    }`}>
                      {allUsers
                        .filter(u => u.id !== currentUser.id)
                        .map(user => {
                          const isChecked = selectedMembers.includes(user.id);
                          return (
                            <button
                              type="button"
                              key={user.id}
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedMembers(prev => prev.filter(id => id !== user.id));
                                } else {
                                  setSelectedMembers(prev => [...prev, user.id]);
                                }
                              }}
                              className={`w-full p-2 rounded-lg flex items-center justify-between border transition-all text-left cursor-pointer ${
                                isChecked 
                                  ? isDark
                                    ? 'bg-deep-cyan/15 border-accent-cyan/30' 
                                    : 'bg-cyan-50/80 border-cyan-200'
                                  : 'border-transparent hover:bg-slate-200/10'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <img src={user.avatarUrl} alt={user.username} className="w-6 h-6 rounded-md object-cover" referrerPolicy="no-referrer" />
                                <span className={`text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{user.username}</span>
                              </div>
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                isChecked 
                                  ? 'border-cyan-500 bg-cyan-500 text-white' 
                                  : isDark ? 'border-white/20' : 'border-slate-300'
                              }`}>
                                {isChecked && <span className="text-[9px] font-bold">✓</span>}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!groupName.trim()}
                  className={`w-full mt-4 py-3 font-semibold rounded-xl text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-40 ${
                    isDark 
                      ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-900/20' 
                      : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow shadow-cyan-200'
                  }`}
                >
                  Create Group Space
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACCOUNT & SYSTEM SETTINGS MODAL OVERLAY */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md border rounded-3xl p-6 shadow-2xl relative transition-all duration-300 max-h-[90vh] overflow-y-auto ${
                isDark ? 'bg-slate-950 border-white/10 text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-800 shadow-xl'
              }`}
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowSettingsModal(false)}
                className={`absolute top-5 right-5 p-1 rounded-full transition-all cursor-pointer z-10 ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <div className={`p-2 rounded-lg border ${
                  isDark ? 'bg-deep-cyan/30 border-brand-cyan/20 text-highlight-cyan' : 'bg-cyan-50 border-cyan-200 text-cyan-600'
                }`}>
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Workspace Settings</h3>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Configure appearance, privacy parameters, and session state.</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Profile Customization Section */}
                <div className="space-y-3 pb-5 border-b border-slate-200/60 dark:border-white/5">
                  <h4 className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>My Profile Details</h4>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={editAvatarUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=placeholder"} 
                        alt="Avatar preview" 
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-white/10 bg-black/20"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newSeed = Math.random().toString(36).substring(7);
                          setEditAvatarUrl(`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(newSeed)}`);
                        }}
                        className={`absolute -bottom-1.5 -right-1.5 p-1 rounded-full border shadow-sm cursor-pointer transition-colors ${
                          isDark ? 'bg-slate-900 border-white/10 text-cyan-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-cyan-600 hover:bg-slate-50'
                        }`}
                        title="Generate random profile seed"
                      >
                        <Sparkles className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-mono leading-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{currentUser.email}</p>
                      <p className={`text-[9px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Click sparkles to randomize seed, or paste any custom image URL below.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Username</label>
                      <input 
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-xl text-xs transition-all duration-300 focus:outline-none focus:ring-1 ${
                          isDark 
                            ? 'bg-white/[0.02] border-white/5 text-white focus:border-accent-cyan/40 focus:ring-accent-cyan/10' 
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-cyan-500 focus:ring-cyan-200/50'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Profile Picture URL</label>
                      <input 
                        type="text"
                        value={editAvatarUrl}
                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                        placeholder="Avatar Image URL (HTTPS)"
                        className={`w-full px-3 py-2 border rounded-xl text-xs transition-all duration-300 focus:outline-none focus:ring-1 ${
                          isDark 
                            ? 'bg-white/[0.02] border-white/5 text-white focus:border-accent-cyan/40 focus:ring-accent-cyan/10' 
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-cyan-500 focus:ring-cyan-200/50'
                        }`}
                      />
                    </div>

                    {profileSaveError && (
                      <p className="text-[10px] text-red-400 font-mono font-semibold">{profileSaveError}</p>
                    )}
                    {profileSaveSuccess && (
                      <p className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" /> Profile details saved!
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className={`w-full py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold rounded-xl text-[10px] uppercase hover:brightness-110 cursor-pointer flex items-center justify-center gap-1 transition-all ${
                        savingProfile ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </form>
                </div>

                {/* 1. Theme Setting */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Visual Appearance</h4>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Switch between ambient dark and paper light modes.</p>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border capitalize ${
                      isDark ? 'bg-slate-900 border-white/5 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      {theme} Mode
                    </span>
                  </div>

                  <div className={`p-1 rounded-xl flex gap-1 ${
                    isDark ? 'bg-black/30' : 'bg-slate-100'
                  }`}>
                    <button
                      onClick={() => theme !== 'dark' && handleToggleTheme()}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isDark 
                          ? 'bg-slate-900 text-white shadow border border-white/10' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Dark Theme</span>
                    </button>
                    <button
                      onClick={() => theme !== 'light' && handleToggleTheme()}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        !isDark 
                          ? 'bg-white text-slate-900 shadow border border-slate-200/80' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Light Theme</span>
                    </button>
                  </div>
                </div>

                 {/* 2. Privacy Setting */}
                <div className="space-y-2.5">
                  <h4 className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Privacy & Message Requests</h4>
                  <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
                    isDark ? 'bg-white/[0.01] border-white/5' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="pt-0.5">
                      {requireMessageRequests ? (
                        <Shield className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="privacy-toggle" className={`text-xs font-semibold cursor-pointer ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}>
                          Require message requests
                        </label>
                        <input 
                          type="checkbox"
                          id="privacy-toggle"
                          checked={requireMessageRequests}
                          onChange={(e) => handleTogglePrivacy(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                        />
                      </div>
                      <p className={`text-[10px] leading-relaxed mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        When enabled, people who are not currently in a direct chat with you must send a message request first before they can initiate direct chats.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Session State (Logout option moved here!) */}
                <div className={`pt-4 border-t flex flex-col gap-3 ${
                  isDark ? 'border-white/5' : 'border-slate-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Session State</h4>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Securely terminate your connection tunnel.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowSettingsModal(false);
                      onLogout();
                    }}
                    className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-600 text-red-500 hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Terminate Secure Connection (Logout)</span>
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USERS DISCOVERY & MESSAGE REQUESTS MODAL OVERLAY */}
      <AnimatePresence>
        {showDiscoveryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg border rounded-3xl p-6 shadow-2xl relative transition-all duration-300 flex flex-col max-h-[85vh] ${
                isDark ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {/* Close Button */}
              <button 
                onClick={() => {
                  setShowDiscoveryModal(false);
                  setDiscoverySearchQuery('');
                }}
                className={`absolute top-5 right-5 p-1 rounded-full transition-all cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-lg border ${
                  isDark ? 'bg-deep-cyan/30 border-brand-cyan/20 text-highlight-cyan' : 'bg-cyan-50 border-cyan-200 text-cyan-600'
                }`}>
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Discover Users Directory</h3>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Search registered usernames and initiate message requests.</p>
                </div>
              </div>

              {/* Discovery search bar */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search usernames (e.g. alice, bob, charlie)..."
                  value={discoverySearchQuery}
                  onChange={(e) => setDiscoverySearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-xs transition-all duration-300 focus:outline-none focus:ring-1 ${
                    isDark 
                      ? 'bg-white/[0.02] border-white/5 text-white placeholder-slate-500 focus:border-accent-cyan/40 focus:ring-accent-cyan/10' 
                      : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-cyan-500 focus:ring-cyan-200/50'
                  }`}
                />
                {discoverySearchQuery && (
                  <button 
                    onClick={() => setDiscoverySearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Users List Container */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {(() => {
                  if (!discoverySearchQuery.trim()) {
                    return (
                      <div className="text-center py-8">
                        <Search className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-40" />
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Start typing a username to search profiles...
                        </p>
                      </div>
                    );
                  }

                  const filtered = allUsers.filter(u => {
                    if (u.id === currentUser.id) return false;
                    return u.username.toLowerCase().includes(discoverySearchQuery.toLowerCase());
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <User className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>No registered profiles found.</p>
                      </div>
                    );
                  }

                  return filtered.map(user => {
                    // Check if already has active chat
                    const hasActiveChat = chats.find(c => !c.isGroup && c.participantIds.includes(user.id));
                    
                    // Check existing request
                    const existingRequest = messageRequests.find(r => 
                      (r.senderId === currentUser.id && r.receiverId === user.id) ||
                      (r.senderId === user.id && r.receiverId === currentUser.id)
                    );

                    return (
                      <div 
                        key={user.id} 
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                          isDark ? 'bg-white/[0.01] border-white/5' : 'bg-slate-50 border-slate-200/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img 
                            src={user.avatarUrl} 
                            alt={user.username} 
                            className="w-9 h-9 rounded-xl object-cover shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {user.username}
                              </h4>
                              {user.requireMessageRequests && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 uppercase font-bold shrink-0">
                                  🔒 REQUEST REQ
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-slate-400 truncate mt-0.5 font-mono">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons based on privacy and request status */}
                        <div className="shrink-0">
                          {hasActiveChat ? (
                            <button
                              onClick={() => {
                                handleSelectChat(hasActiveChat);
                                setShowDiscoveryModal(false);
                                setDiscoverySearchQuery('');
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold rounded-xl text-[10px] uppercase hover:brightness-110 cursor-pointer"
                            >
                              Message
                            </button>
                          ) : !user.requireMessageRequests ? (
                            <button
                              onClick={() => {
                                handleStartDM(user);
                                setShowDiscoveryModal(false);
                                setDiscoverySearchQuery('');
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold rounded-xl text-[10px] uppercase hover:brightness-110 cursor-pointer"
                            >
                              Chat Direct
                            </button>
                          ) : existingRequest ? (
                            (() => {
                              if (existingRequest.status === 'accepted') {
                                return (
                                  <button
                                    onClick={() => {
                                      handleStartDM(user);
                                      setShowDiscoveryModal(false);
                                      setDiscoverySearchQuery('');
                                    }}
                                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold rounded-xl text-[10px] uppercase hover:brightness-110 cursor-pointer"
                                  >
                                    Open Chat
                                  </button>
                                );
                              }
                              if (existingRequest.status === 'pending') {
                                if (existingRequest.senderId === currentUser.id) {
                                  return (
                                    <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-[10px] uppercase font-mono font-semibold">
                                      Pending Approval
                                    </span>
                                  );
                                } else {
                                  return (
                                    <button
                                      onClick={() => {
                                        setActiveTab('users');
                                        setShowDiscoveryModal(false);
                                        setDiscoverySearchQuery('');
                                      }}
                                      className="px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/20 rounded-xl text-[10px] uppercase font-bold transition-all cursor-pointer"
                                    >
                                      Review Request
                                    </button>
                                  );
                                }
                              }
                              // declined
                              return (
                                <button
                                  onClick={() => handleSendRequest(user.id)}
                                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-600 text-red-400 hover:text-white rounded-xl text-[10px] uppercase font-bold transition-all cursor-pointer"
                                >
                                  Retry Request
                                </button>
                              );
                            })()
                          ) : (
                            <button
                              onClick={() => handleSendRequest(user.id)}
                              className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl text-[10px] uppercase hover:brightness-110 cursor-pointer flex items-center gap-1"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>Request</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
