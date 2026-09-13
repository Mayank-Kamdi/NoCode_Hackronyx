import React, { useState, useEffect } from 'react';
import { Shield, Radio, BarChart3, Smartphone, Send, UserCheck, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, activeAlertsCount }) => {
  const { role, loginAs } = useAuth();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#424874] text-white border-b border-[#A6B1E1]/40 px-4 py-2.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Clean Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#A6B1E1] to-[#424874] shadow-md border border-[#DCD6F7]/50">
            <Shield className="w-6 h-6 text-[#F4EEFF]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-black text-xl tracking-wider text-white">
                NoCode
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#424874] bg-[#F4EEFF] rounded uppercase">
                Emergency Alert Gateway
              </span>
            </div>
            <p className="text-[11px] text-[#DCD6F7] font-medium">
              Real-Time Safety & Multi-Device Emergency Response Platform
            </p>
          </div>
        </div>

        {/* Simplified User & Security Device Navigation Tabs */}
        <nav className="flex items-center bg-[#2B3054] p-1 rounded-xl border border-[#A6B1E1]/30">
          
          {/* User SOS Sender Tab */}
          <button
            onClick={() => setActiveTab('edge')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'edge'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md'
                : 'text-[#DCD6F7] hover:text-white hover:bg-white/10'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-amber-300" />
            User SOS Sender
          </button>

          {/* Security Responder Device Receiver Tab */}
          <button
            onClick={() => setActiveTab('security')}
            className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md'
                : 'text-[#DCD6F7] hover:text-white hover:bg-white/10'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-300" />
            Security Receiver
            {activeAlertsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-bold rounded-full animate-bounce">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Command Overview Tab */}
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-[#A6B1E1] to-[#424874] text-white shadow-md'
                : 'text-[#DCD6F7] hover:text-white hover:bg-white/10'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Command Center
          </button>

          {/* Analytics Tab */}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-[#DCD6F7] hover:text-white hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>
        </nav>

        {/* Live Status & Role Selector */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#2B3054] rounded-lg border border-[#A6B1E1]/30 text-[11px] font-mono">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-emerald-400">REALTIME WEBSOCKET: LIVE</span>
            <span className="text-[#A6B1E1]">|</span>
            <span className="text-white">{timeStr}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#2B3054] px-2 py-1 rounded-xl border border-[#A6B1E1]/30">
            <UserCheck className="w-3.5 h-3.5 text-[#A6B1E1]" />
            <select
              value={role}
              onChange={(e) => loginAs(e.target.value as any)}
              className="bg-[#424874] text-white text-xs font-bold py-0.5 px-2 rounded-lg border border-[#A6B1E1]/40 focus:outline-none cursor-pointer"
            >
              <option value="ADMIN">COMMAND CENTER</option>
              <option value="SECURITY">SECURITY OFFICER DEVICE</option>
              <option value="AI_EDGE_DEVICE">USER SENDER DEVICE</option>
            </select>
          </div>
        </div>

      </div>
    </header>
  );
};
