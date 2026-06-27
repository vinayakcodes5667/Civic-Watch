import React, { useState } from 'react';
import { Report, User } from '../types';
import { MapPin, CheckCircle, ShieldAlert, Wrench, FileImage, Camera, Mic, Video, Clock, UserCircle, Activity } from 'lucide-react';
import { Modal } from './Forms';

const getRoleFromEmail = (email: string) => {
  if (!email) return 'Unknown';
  if (email.endsWith('@police.gov.in')) return 'Police';
  if (email.endsWith('@pwd.gov.in')) return 'PWD';
  return 'Individual';
};

interface ReportCardProps {
  key?: React.Key;
  report: Report;
  reporter?: User;
  onActionClick?: () => void;
  actionLabel?: string;
  isArchiveView?: boolean;
}

export function ReportCard({ report, reporter, onActionClick, actionLabel, isArchiveView }: ReportCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locationError, setLocationError] = useState(false);

  if (!report) return null;
  
  const handleDirectionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!report.location || report.location === 'Unknown Location' || report.location === 'GPS Captured Location') {
      setLocationError(true);
      setTimeout(() => setLocationError(false), 2000);
      return;
    }

    const gpsMatch = report.location.match(/Lat:\s*([0-9.-]+),\s*Lng:\s*([0-9.-]+)/i);
    let url = '';
    if (gpsMatch) {
      const lat = gpsMatch[1];
      const lng = gpsMatch[2];
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(report.location)}`;
    }
    window.open(url, '_blank');
  };

  const statusColors: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    Validated: 'bg-blue-100 text-blue-800 border-blue-200',
    Initiated: 'bg-purple-100 text-purple-800 border-purple-200',
    Resolving: 'bg-orange-100 text-orange-800 border-orange-200',
    Fixed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const statusColor = statusColors[report.status] || 'bg-slate-100 text-slate-800 border-slate-200';

  const triageStyles: Record<string, { badge: string, icon: string }> = {
    CRITICAL: { badge: 'bg-red-50 text-red-700 border-red-500/20', icon: '🚨' },
    HIGH: { badge: 'bg-orange-50 text-orange-700 border-orange-500/20', icon: '⚠️' },
    MODERATE: { badge: 'bg-blue-50 text-blue-700 border-blue-500/20', icon: '⚡' }
  };

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-slate-100 mb-4 transition-all hover:shadow-md cursor-pointer relative"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 text-lg flex items-center gap-2">
              {report.type || 'Unknown Issue'}
              {report.subCategory && <span className="text-sm font-normal text-slate-500">({report.subCategory})</span>}
            </span>
            {report.roadType && <span className="text-sm text-slate-500">{report.roadType} Road</span>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
              {report.status || 'Pending'}
            </span>
            {report.aiTriage && (
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${triageStyles[report.aiTriage.level].badge}`}>
                [{triageStyles[report.aiTriage.level].icon} AI Triage: {report.aiTriage.level} ({report.aiTriage.score}%)]
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center text-slate-600 mb-3 text-sm">
          <MapPin className="w-4 h-4 mr-1.5 text-emerald-600" />
          {report.location || 'Unknown Location'}
        </div>

        <div className="flex items-center justify-between mb-3 text-sm">
          <div className="flex items-center text-slate-600 bg-slate-100/50 px-2 py-1 rounded-lg">
            <span className="mr-1">{report.reporterEmail?.split('@')[0] || 'Unknown'}</span>
            {reporter && (
               <span className="font-medium text-amber-500 flex items-center">
                 ⭐ {reporter.points || 0}
               </span>
            )}
          </div>
          <div className="text-xs text-slate-400">
            {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ''}
          </div>
        </div>

        {(report.comments?.length || 0) > 0 && (
          <div className="mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Updates</p>
            <div className="space-y-2">
              {report.comments.map((c, i) => (
                <div key={i} className="text-sm text-slate-700">
                  <span className="font-medium text-slate-900">
                    {getRoleFromEmail(c?.authorEmail || '') === 'PWD' ? `PWD_${c?.authorEmail?.split('@')[0]}` : c?.authorEmail?.split('@')[0] || 'System'}:
                  </span>{' '}
                  {c?.text || ''}
                </div>
              ))}
            </div>
          </div>
        )}

        {isArchiveView ? (
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
            <div className="flex-1 bg-slate-50 text-slate-500 border border-slate-200 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Successfully Validated
            </div>
          </div>
        ) : actionLabel && onActionClick && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
            <button 
              onClick={handleDirectionsClick}
              className={`flex-1 ${locationError ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2`}
            >
              {locationError ? 'Location Unavailable' : <><MapPin className="w-4 h-4" /> Directions</>}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onActionClick();
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20"
            >
              {report.status === 'Pending' ? <ShieldAlert className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
              {actionLabel}
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <Modal title="Report Details" onClose={() => setIsModalOpen(false)}>
          <div className="space-y-6">
            {/* AI Callout Box */}
            {report.aiTriage && (
              <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
                <div className="relative z-10">
                  <h3 className="text-xs font-semibold text-indigo-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                    🤖 Gemini AI Priority Assessment
                  </h3>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${report.aiTriage.level === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : report.aiTriage.level === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                      {report.aiTriage.level}
                    </span>
                    <span className="text-lg font-bold text-white">{report.aiTriage.score}% Score</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {report.aiTriage.reason}
                  </p>
                </div>
              </div>
            )}

            {/* Original Report Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3 h-3" /> Issue Info
              </h3>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-medium">{report.type || 'Unknown Issue'} {report.subCategory ? `(${report.subCategory})` : ''}</span>
                </div>
                {report.roadType && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Road Type:</span>
                    <span className="font-medium">{report.roadType} Road</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-medium">{report.location || 'Unknown Location'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date/Time:</span>
                  <span className="font-medium">{report.createdAt ? new Date(report.createdAt).toLocaleString() : ''}</span>
                </div>
              </div>
            </div>

            {/* Reporter Info */}
            <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 shadow-sm rounded-xl">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{report.reporterEmail?.split('@')[0] || 'Unknown'}</p>
                <p className="text-xs text-amber-500 font-medium flex items-center gap-1">⭐ {reporter?.points || 0} Social Points</p>
              </div>
            </div>

            {/* Media Section */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1">
                <FileImage className="w-3 h-3" /> Attached Media
              </h3>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className={`aspect-square rounded-lg flex flex-col items-center justify-center border ${report.pictures?.left || !report.pictures ? 'bg-emerald-50 border-emerald-200 text-emerald-500' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                   {report.pictures?.left || !report.pictures ? <CheckCircle className="w-5 h-5 mb-1" /> : <Camera className="w-5 h-5 mb-1" />}
                   <span className="text-[10px] font-medium">Left</span>
                </div>
                <div className={`aspect-square rounded-lg flex flex-col items-center justify-center border ${report.pictures?.center || !report.pictures ? 'bg-emerald-50 border-emerald-200 text-emerald-500' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                   {report.pictures?.center || !report.pictures ? <CheckCircle className="w-5 h-5 mb-1" /> : <Camera className="w-5 h-5 mb-1" />}
                   <span className="text-[10px] font-medium">Center</span>
                </div>
                <div className={`aspect-square rounded-lg flex flex-col items-center justify-center border ${report.pictures?.right || !report.pictures ? 'bg-emerald-50 border-emerald-200 text-emerald-500' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                   {report.pictures?.right || !report.pictures ? <CheckCircle className="w-5 h-5 mb-1" /> : <Camera className="w-5 h-5 mb-1" />}
                   <span className="text-[10px] font-medium">Right</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 gap-2 text-xs font-medium">
                  <Mic className="w-4 h-4" /> Audio
                </div>
                <div className="h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 gap-2 text-xs font-medium">
                  <Video className="w-4 h-4" /> Video
                </div>
              </div>
            </div>

            {/* Validation Details */}
            {['Validated', 'Initiated', 'Resolving', 'Fixed'].includes(report.status) && report.validatorEmail && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Validation
                </h3>
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-slate-700 mb-2">
                    Validated by <span className="font-semibold text-slate-900">{report.validatorEmail.split('@')[0]} ({getRoleFromEmail(report.validatorEmail)})</span>
                  </p>
                  <div className="h-20 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 gap-2 border border-slate-300">
                    <Camera className="w-5 h-5" /> Selfie Proof
                  </div>
                </div>
              </div>
            )}

            {/* Resolution Log */}
            {report.comments && report.comments.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Resolution Timeline
                </h3>
                <div className="space-y-4 pl-2 border-l-2 border-slate-100 ml-2 mt-4">
                  {report.comments.map((c, i) => (
                    <div key={i} className="relative pl-4">
                      <div className="absolute w-2 h-2 bg-emerald-400 rounded-full -left-[5px] top-1.5 ring-4 ring-white" />
                      <p className="text-xs text-slate-400 mb-0.5">{c.timestamp ? new Date(c.timestamp).toLocaleString() : ''}</p>
                      <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="font-medium text-slate-900">
                          {getRoleFromEmail(c.authorEmail || '') === 'PWD' ? `PWD_${c.authorEmail?.split('@')[0]}` : c.authorEmail?.split('@')[0] || 'System'}:
                        </span>{' '}
                        {c.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
