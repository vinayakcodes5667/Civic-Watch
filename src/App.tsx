import React, { useState } from 'react';
import { useAppStore } from './store';
import { AuthModal, Navbar } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { NewReportModal } from './components/Forms';
import { Plus } from 'lucide-react';

export default function App() {
  const { currentUser, login, addReport } = useAppStore();
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200">
      {!currentUser ? (
        <AuthModal onLogin={login} />
      ) : (
        <>
          <Navbar />
          <Dashboard />
          
          {currentUser.role === 'Individual' && (
            <button 
              onClick={() => setIsNewReportOpen(true)}
              className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}

          {isNewReportOpen && (
            <NewReportModal 
              onClose={() => setIsNewReportOpen(false)}
              onSubmit={(data) => {
                addReport(data);
                setIsNewReportOpen(false);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

