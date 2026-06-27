import React, { useState } from 'react';
import { useAppStore } from '../store';
import { ReportCard } from './ReportCard';
import { NewReportModal, ValidateModal, StatusUpdateModal } from './Forms';
import { Plus, LayoutGrid, CheckCircle } from 'lucide-react';
import { ReportStatus, Report } from '../types';

export function Dashboard() {
  const { data, currentUser, validateReport, updateReportStatus, logout } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'my_reports' | 'feed' | 'workspace' | 'pwd_fixed' | 'police_archive'>('feed');
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [validatingReportId, setValidatingReportId] = useState<string | null>(null);
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);

  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterNearMe, setFilterNearMe] = useState(false);

  React.useEffect(() => {
    if (currentUser?.role === 'Individual') setActiveTab('my_reports');
    else if (currentUser?.role === 'PWD') setActiveTab('workspace');
    else setActiveTab('feed');
  }, [currentUser?.role]);

  if (!currentUser) {
    if (logout) logout();
    return null;
  }

  const reports = Array.isArray(data?.reports) ? data.reports : [];
  
  const applyFilters = (reps: Report[]) => {
    return reps.filter(r => {
      if (filterCategory !== 'All' && r.type !== filterCategory) return false;
      if (filterSeverity !== 'All') {
        if (!r.aiTriage) return false;
        if (r.aiTriage.level.toUpperCase() !== filterSeverity.toUpperCase()) return false;
      }
      if (filterNearMe) {
        if (r.roadType !== 'Street Road' && r.roadType !== 'Gully Road') return false;
      }
      return true;
    });
  };

  const isFilteringActive = filterCategory !== 'All' || filterSeverity !== 'All' || filterNearMe;

  const myReports = reports.filter(r => r?.reporterEmail === currentUser.email);
  const pendingFeed = applyFilters(reports.filter(r => r?.status === 'Pending' && r?.reporterEmail !== currentUser.email));
  const pwdWorkspace = applyFilters(reports.filter(r => ['Validated', 'Initiated', 'Resolving'].includes(r?.status)));
  const pwdFixed = reports.filter(r => r?.status === 'Fixed');
  const policeArchive = reports.filter(r => r?.status !== 'Pending');

  const handleActionClick = (report: Report) => {
    if (report.status === 'Pending') setValidatingReportId(report.id);
    else if (['Validated', 'Initiated', 'Resolving'].includes(report.status) && currentUser.role === 'PWD') {
      setUpdatingReportId(report.id);
    }
  };

  const activeUpdatingReport = updatingReportId ? reports.find(r => r.id === updatingReportId) : null;

  const renderEmptyState = (isFiltered: boolean) => {
    if (isFiltered) {
      return (
        <div className="text-center py-12 px-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-slate-700 font-medium">No local civic issues currently match these parameters. Try expanding your search!</h3>
        </div>
      );
    }
    return (
      <div className="text-center py-12 px-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm">
        <div className="text-4xl mb-3">📭</div>
        <h3 className="text-slate-700 font-medium">No civic reports currently populate this view.</h3>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto pt-20 pb-24 px-4 min-h-screen">
      
      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
        {currentUser.role === 'Individual' && (
          <button 
            onClick={() => setActiveTab('my_reports')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'my_reports' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
          >
            My Reports
          </button>
        )}
        {(currentUser.role === 'Individual' || currentUser.role === 'Police') && (
          <>
            <button 
              onClick={() => setActiveTab('feed')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'feed' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              Validation Feed
            </button>
            {currentUser.role === 'Police' && (
              <button 
                onClick={() => setActiveTab('police_archive')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'police_archive' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
              >
                Validated Archive
              </button>
            )}
          </>
        )}
        {currentUser.role === 'PWD' && (
          <>
            <button 
              onClick={() => setActiveTab('workspace')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'workspace' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              PWD Workspace
            </button>
            <button 
              onClick={() => setActiveTab('pwd_fixed')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'pwd_fixed' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              Fixed Feed
            </button>
          </>
        )}
      </div>

      {/* Filter Bar */}
      {(activeTab === 'feed' || activeTab === 'workspace') && (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3 shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-2 items-center">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 min-w-[120px] bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
          >
            <option value="All">All Categories</option>
            <option value="Fire">Fire</option>
            <option value="Water">Water</option>
            <option value="Potholes">Potholes</option>
            <option value="Manholes">Manholes</option>
            <option value="Garbage">Garbage</option>
            <option value="Public Infrastructure">Public Infrastructure</option>
          </select>
          <select 
            value={filterSeverity} 
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="flex-1 min-w-[120px] bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
          >
            <option value="All">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
          </select>
          <button 
            onClick={() => setFilterNearMe(!filterNearMe)}
            className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${filterNearMe ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
          >
            📍 Near Me
          </button>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'my_reports' && (
          <>
            {myReports.length === 0 ? renderEmptyState(false) : (
              myReports.map(r => <ReportCard key={r.id} report={r} />)
            )}
          </>
        )}

        {activeTab === 'feed' && (
          <>
            {pendingFeed.length === 0 ? renderEmptyState(isFilteringActive) : (
              pendingFeed.map(r => (
                <ReportCard 
                  key={r.id} 
                  report={r} 
                  reporter={data.users?.[r.reporterEmail]}
                  actionLabel="Validate"
                  onActionClick={() => handleActionClick(r)}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'workspace' && (
          <>
            {pwdWorkspace.length === 0 ? renderEmptyState(isFilteringActive) : (
              pwdWorkspace.map(r => (
                <ReportCard 
                  key={r.id} 
                  report={r} 
                  reporter={data.users?.[r.reporterEmail]}
                  actionLabel="Change Status"
                  onActionClick={() => handleActionClick(r)}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'pwd_fixed' && (
          <>
            {pwdFixed.length === 0 ? renderEmptyState(false) : (
              pwdFixed.map(r => (
                <ReportCard 
                  key={r.id} 
                  report={r} 
                  reporter={data.users?.[r.reporterEmail]}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'police_archive' && (
          <>
            {policeArchive.length === 0 ? renderEmptyState(false) : (
              policeArchive.map(r => (
                <ReportCard 
                  key={r.id} 
                  report={r} 
                  reporter={data.users?.[r.reporterEmail]}
                  isArchiveView={true}
                />
              ))
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {validatingReportId && (
        <ValidateModal 
          onClose={() => setValidatingReportId(null)} 
          onSubmit={() => { validateReport(validatingReportId); setValidatingReportId(null); }} 
        />
      )}

      {activeUpdatingReport && (
        <StatusUpdateModal 
          currentStatus={activeUpdatingReport.status}
          onClose={() => setUpdatingReportId(null)}
          onSubmit={(status, comment) => { updateReportStatus(activeUpdatingReport.id, status, comment); setUpdatingReportId(null); }}
        />
      )}
    </div>
  );
}
