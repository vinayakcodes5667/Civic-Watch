import React, { useState } from 'react';
import { useAppStore } from '../store';
import { LogIn, UserCircle, Star, LogOut, ChevronDown, Crown } from 'lucide-react';
import { Modal } from './Forms';
import { LeaderboardModal } from './LeaderboardModal';

export function AuthModal({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) onLogin(email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to Civic-Watch</h2>
        <p className="text-slate-500 mb-6 text-sm">Simulated Google Login. Domain determines role.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50"
            required
          />
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3.5 font-bold shadow-sm shadow-emerald-600/20 transition-all active:scale-[0.98]">
            Sign in with Google
          </button>
        </form>

        <div className="mt-6 text-xs text-slate-400 text-left space-y-1">
          <p>Roles Demo:</p>
          <p>• user@gmail.com ➔ Individual</p>
          <p>• user@police.gov.in ➔ Police</p>
          <p>• user@pwd.gov.in ➔ PWD/Govt</p>
        </div>
      </div>
    </div>
  );
}

const getNameFromEmail = (email: string) => {
  if (!email) return '';
  const prefix = email.split('@')[0];
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
};

export function Navbar() {
  const { currentUser, logout, login } = useAppStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  if (!currentUser) return null;

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">Civic Watch</h1>
            <p className="text-[10px] uppercase font-semibold tracking-wider text-emerald-600">
              {getNameFromEmail(currentUser.email)} ({currentUser.role})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          <div className="flex items-center gap-1.5">
            <div className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-bold border border-amber-200">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              {currentUser.points}
            </div>
            
            <button 
              onClick={() => setShowLeaderboard(true)}
              className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 hover:bg-amber-100 border border-amber-200 transition-colors shadow-sm"
              title="View Leaderboard"
            >
              <Crown className="w-4 h-4" />
            </button>
          </div>
          
          <button onClick={() => setShowDropdown(!showDropdown)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200">
            <ChevronDown className="w-4 h-4" />
          </button>

          {showDropdown && (
            <div className="absolute top-10 right-0 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-50 mb-2">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Identity Switcher</p>
              </div>
              <button onClick={() => { login('citizen@gmail.com'); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Citizen</button>
              <button onClick={() => { login('cop@police.gov.in'); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Police</button>
              <button onClick={() => { login('worker@pwd.gov.in'); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">PWD</button>
              <div className="border-t border-slate-50 mt-2 pt-2">
                <button onClick={() => { logout(); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}
    </nav>
  );
}
