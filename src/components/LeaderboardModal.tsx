import React from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../store';
import { X } from 'lucide-react';

interface Rival {
  name: string;
  points: number;
  isCurrentUser?: boolean;
}

const MOCK_RIVALS: Record<string, Rival[]> = {
  Individual: [
    { name: 'Priya', points: 100 },
    { name: 'Amit', points: 85 },
    { name: 'Neha', points: 40 },
    { name: 'Rahul', points: 10 },
  ],
  Police: [
    { name: 'Officer Singh', points: 150 },
    { name: 'Inspector Rao', points: 90 },
    { name: 'Sgt. Patel', points: 20 },
    { name: 'Constable Kumar', points: 15 },
  ],
  PWD: [
    { name: 'Tech Verma', points: 200 },
    { name: 'Eng. Sharma', points: 120 },
    { name: 'Crew Lead Das', points: 50 },
    { name: 'Worker Raj', points: 40 },
  ]
};

const getNameFromEmail = (email: string) => {
  if (!email) return '';
  const prefix = email.split('@')[0];
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
};

export function LeaderboardModal({ onClose }: { onClose: () => void }) {
  const { currentUser } = useAppStore();
  
  if (!currentUser) return null;

  const roleRivals = MOCK_RIVALS[currentUser.role] || [];
  
  const allPlayers = [
    ...roleRivals,
    { name: getNameFromEmail(currentUser.email), points: currentUser.points, isCurrentUser: true }
  ].sort((a, b) => b.points - a.points);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md flex flex-col rounded-2xl bg-white shadow-2xl max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header (Pinned Top) */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">👑 Social Leaderboard</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600">✕</button>
        </div>
        
        {/* Scrollable Leaderboard List */}
        <div className="overflow-y-auto p-6 space-y-3">
          {allPlayers.map((player, index) => {
            let rankIcon = null;
            if (index === 0) rankIcon = <span className="text-xl" title="1st Place">🥇</span>;
            else if (index === 1) rankIcon = <span className="text-xl" title="2nd Place">🥈</span>;
            else if (index === 2) rankIcon = <span className="text-xl" title="3rd Place">🥉</span>;
            else rankIcon = <span className="text-slate-400 font-bold w-5 inline-block text-center">{index + 1}</span>;

            return (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3.5 rounded-xl border ${player.isCurrentUser ? 'bg-emerald-50 border-emerald-500/50 shadow-sm' : 'bg-slate-50 border-slate-200'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 flex justify-center">{rankIcon}</div>
                  <div className={`font-medium ${player.isCurrentUser ? 'text-emerald-800' : 'text-slate-700'}`}>
                    {player.name} {player.isCurrentUser && <span className="ml-1 text-xs text-emerald-600 font-bold uppercase tracking-wider">(You)</span>}
                  </div>
                </div>
                <div className={`font-bold ${player.isCurrentUser ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {player.points} pts
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
