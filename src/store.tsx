import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Report, Role, Comment, ReportStatus } from './types';

const STORAGE_KEY = 'civic_watch_data';

export interface AppData {
  users: Record<string, User>;
  reports: Report[];
}

const SEED_USERS: Record<string, User> = {
  'citizen@gmail.com': { email: 'citizen@gmail.com', role: 'Individual', points: 15 },
  'cop@police.gov.in': { email: 'cop@police.gov.in', role: 'Police', points: 20 },
  'worker@pwd.gov.in': { email: 'worker@pwd.gov.in', role: 'PWD', points: 10 }
};

const SEED_REPORTS: Report[] = [
  { id: '1', type: 'Potholes', roadType: 'Main', status: 'Pending', reporterEmail: 'citizen@gmail.com', createdAt: Date.now() - 100000, comments: [], location: 'Main Street' },
  { id: '2', type: 'Manholes', roadType: 'Street', status: 'Validated', reporterEmail: 'citizen@gmail.com', validatorEmail: 'cop@police.gov.in', createdAt: Date.now() - 200000, comments: [], location: 'Sector 4' },
  { id: '3', type: 'Garbage', status: 'Initiated', reporterEmail: 'citizen@gmail.com', createdAt: Date.now() - 300000, comments: [{ text: 'Team dispatched', authorEmail: 'worker@pwd.gov.in', timestamp: Date.now() }], location: 'Downtown Alley' },
  { id: '4', type: 'Public Infrastructure', subCategory: 'Street Light', status: 'Resolving', reporterEmail: 'citizen@gmail.com', createdAt: Date.now() - 400000, comments: [{ text: 'Parts ordered', authorEmail: 'worker@pwd.gov.in', timestamp: Date.now() }], location: 'Avenue 1' }
];

const generateAITriage = (report: Partial<Report>): Report['aiTriage'] => {
  if (
    report.subCategory === 'Fire' ||
    report.subCategory === 'Pipeline Burst' ||
    (report.type === 'Manholes' && (report.subCategory === 'Destroyed' || report.subCategory === 'Open')) ||
    report.roadType === 'Main Road' ||
    report.roadType === 'Main'
  ) {
    return { level: 'CRITICAL', score: Math.floor(Math.random() * (99 - 90 + 1)) + 90, reason: '🤖 AI Analysis: Hazard located on high-traffic infrastructure. Severe safety & vehicular accident risk.' };
  }
  if (
    (report.type === 'Potholes' && report.subCategory === 'Center') ||
    report.subCategory === 'Street light damaged' ||
    report.subCategory === 'Drain Blocked' ||
    report.subCategory === 'Drain Blockage'
  ) {
    return { level: 'HIGH', score: Math.floor(Math.random() * (89 - 70 + 1)) + 70, reason: '🤖 AI Analysis: Moderate infrastructure disruption affecting local transit flow.' };
  }
  return { level: 'MODERATE', score: Math.floor(Math.random() * (69 - 40 + 1)) + 40, reason: '🤖 AI Analysis: Routine municipal sanitation/maintenance required.' };
};

SEED_REPORTS.forEach(report => {
  if (report.status !== 'Pending') {
    report.aiTriage = generateAITriage(report);
  }
});

function getInitialData(): AppData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.reports) && parsed.users) {
        let needsSave = false;
        parsed.reports = parsed.reports.map((r: any) => {
          const processedReport = {
            ...r,
            comments: Array.isArray(r.comments) ? r.comments : [],
            reporterEmail: r.reporterEmail || 'unknown@domain.com',
            status: r.status || 'Pending',
            createdAt: r.createdAt || Date.now(),
          };

          if (['Validated', 'Initiated', 'Resolving', 'Fixed'].includes(processedReport.status) && !processedReport.aiTriage) {
            processedReport.aiTriage = generateAITriage(processedReport);
            needsSave = true;
          }

          return processedReport;
        });

        if (needsSave) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }

        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse local storage', e);
    }
  }
  return { users: SEED_USERS, reports: SEED_REPORTS };
}

interface AppStoreContext {
  data: AppData;
  currentUser: User | null;
  login: (email: string) => void;
  logout: () => void;
  addReport: (reportData: Omit<Report, 'id' | 'status' | 'reporterEmail' | 'comments' | 'createdAt'>) => void;
  validateReport: (reportId: string) => void;
  updateReportStatus: (reportId: string, status: ReportStatus, commentText: string) => void;
}

const AppContext = createContext<AppStoreContext | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(getInitialData);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const login = (email: string) => {
    let role: Role = 'Individual';
    if (email.endsWith('@police.gov.in')) role = 'Police';
    else if (email.endsWith('@pwd.gov.in')) role = 'PWD';

    setData(prev => {
      const prevUsers = prev?.users || {};
      if (!prevUsers[email]) {
        return {
          ...prev,
          users: {
            ...prevUsers,
            [email]: { email, role, points: 0 }
          }
        };
      }
      return prev;
    });
    setCurrentUserEmail(email);
  };

  const logout = () => setCurrentUserEmail(null);

  const addPoints = (email: string, points: number) => {
    setData(prev => {
      const user = prev.users?.[email];
      if (!user) return prev;
      return {
        ...prev,
        users: {
          ...prev.users,
          [email]: { ...user, points: (user.points || 0) + points }
        }
      };
    });
  };

  const addReport = (reportData: Omit<Report, 'id' | 'status' | 'reporterEmail' | 'comments' | 'createdAt'>) => {
    if (!currentUserEmail) return;
    const newReport: Report = {
      ...reportData,
      id: Math.random().toString(36).substring(2, 9),
      status: 'Pending',
      reporterEmail: currentUserEmail,
      comments: [],
      createdAt: Date.now()
    };
    
    setData(prev => ({
      ...prev,
      reports: [newReport, ...(Array.isArray(prev.reports) ? prev.reports : [])]
    }));
    
    addPoints(currentUserEmail, 5); // GAMIFICATION: +5 for new report
  };

  const validateReport = (reportId: string) => {
    if (!currentUserEmail) return;
    setData(prev => ({
      ...prev,
      reports: (Array.isArray(prev.reports) ? prev.reports : []).map(r => 
        r.id === reportId ? { ...r, status: 'Validated', validatorEmail: currentUserEmail, aiTriage: generateAITriage(r) } : r
      )
    }));
    addPoints(currentUserEmail, 2); // GAMIFICATION: +2 for validation
  };

  const updateReportStatus = (reportId: string, status: ReportStatus, commentText: string) => {
    if (!currentUserEmail) return;
    
    setData(prev => {
      let targetReport: Report | undefined;
      const prevReports = Array.isArray(prev.reports) ? prev.reports : [];
      const updatedReports = prevReports.map(r => {
        if (r.id === reportId) {
          targetReport = r;
          const newComments = Array.isArray(r.comments) ? [...r.comments] : [];
          if (commentText) {
            newComments.push({ text: commentText, authorEmail: currentUserEmail, timestamp: Date.now() });
          }
          return { ...r, status, comments: newComments };
        }
        return r;
      });

      return { ...prev, reports: updatedReports };
    });

    if (status === 'Initiated') addPoints(currentUserEmail, 1);
    else if (status === 'Resolving') addPoints(currentUserEmail, 2);
    else if (status === 'Fixed') {
      addPoints(currentUserEmail, 5);
      // Retroactive gamification for reporter
      setData(prev => {
        const prevReports = Array.isArray(prev.reports) ? prev.reports : [];
        const report = prevReports.find(r => r.id === reportId);
        if (report && prev.users?.[report.reporterEmail]) {
          return {
            ...prev,
            users: {
              ...prev.users,
              [report.reporterEmail]: {
                ...prev.users[report.reporterEmail],
                points: (prev.users[report.reporterEmail].points || 0) + 10
              }
            }
          };
        }
        return prev;
      });
    }
  };

  const currentUser = currentUserEmail && data.users ? data.users[currentUserEmail] : null;

  return (
    <AppContext.Provider value={{ data, currentUser, login, logout, addReport, validateReport, updateReportStatus }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within an AppProvider');
  return context;
}
