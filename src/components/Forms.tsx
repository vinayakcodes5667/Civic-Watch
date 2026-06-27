import React, { useState, useRef } from 'react';
import { Camera, Mic, Video, UploadCloud, X, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { ReportStatus } from '../types';

interface ModalProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ onClose, title, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export function NewReportModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: any) => void }) {
  const ISSUE_TYPES = [
    'Manholes',
    'Potholes',
    'Water',
    'Garbage',
    'Public Infrastructure'
  ];

  const SUB_CATEGORIES: Record<string, string[]> = {
    'Manholes': ['Open', 'Not properly Closed', 'Destroyed'],
    'Potholes': ['Left-side', 'Center', 'Right-side'],
    'Water': ['Rain Water Logging', 'Drain Blocked', 'Pipeline Burst'],
    'Garbage': ['Garbage Spillage', 'Not Collected', 'Drain Blockage', 'Pathway Blockage', 'No Garbage Box'],
    'Public Infrastructure': ['Street light not working', 'Street light damaged', 'Construction site spillages', 'Building Structural Cracks', 'Fire']
  };

  const ROAD_TYPES = ['Main Road', 'Street Road', 'Gully Road'];

  const [type, setType] = useState(ISSUE_TYPES[0]);
  const [subCategory, setSubCategory] = useState(SUB_CATEGORIES[ISSUE_TYPES[0]][0]);
  const [roadType, setRoadType] = useState(ROAD_TYPES[0]);
  const [location, setLocation] = useState('');
  
  const [atScene, setAtScene] = useState<boolean | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [gpsError, setGpsError] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [manualLandmark, setManualLandmark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [spatialPics, setSpatialPics] = useState({ left: false, center: false, right: false });
  const [loadingPic, setLoadingPic] = useState<'left' | 'center' | 'right' | null>(null);
  const [mediaState, setMediaState] = useState({ video: false, audio: false, fallback: false });
  const [loadingMedia, setLoadingMedia] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setType(newType);
    setSubCategory(SUB_CATEGORIES[newType][0]);
    if (newType === 'Manholes' || newType === 'Potholes') {
      setRoadType(ROAD_TYPES[0]);
    } else {
      setRoadType('');
    }
  };

  const handlePicCapture = (pos: 'left' | 'center' | 'right') => {
    setLoadingPic(pos);
    setTimeout(() => {
      setSpatialPics(prev => ({ ...prev, [pos]: true }));
      setLoadingPic(null);
    }, 500);
  };

  const handleMediaCapture = (type: 'video' | 'audio' | 'fallback') => {
    setLoadingMedia(type);
    setTimeout(() => {
      setMediaState(prev => ({ ...prev, [type]: true }));
      setLoadingMedia(null);
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLoadingMedia('fallback');
      setTimeout(() => {
        setSpatialPics({ left: true, center: true, right: true });
        setMediaState(prev => ({ ...prev, fallback: true }));
        setLoadingMedia(null);
      }, 1000);
    }
  };

  const hasAllPics = spatialPics.left && spatialPics.center && spatialPics.right;
  const hasLocation = (atScene === true && location && !gpsError) || ((atScene === false || gpsError) && manualAddress && manualLandmark);
  const isSubmitDisabled = !hasAllPics || !hasLocation || !mediaState.audio || !mediaState.video || isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;
    setIsSubmitting(true);
    
    const finalLocation = (atScene === false || gpsError) ? `${manualAddress}, ${manualLandmark}` : location;

    setTimeout(() => {
      onSubmit({ 
        type, 
        subCategory, 
        roadType: (type === 'Manholes' || type === 'Potholes') ? roadType : undefined, 
        location: finalLocation || 'GPS Captured Location',
        pictures: spatialPics
      });
      setIsSubmitting(false);
    }, 800);
  };

  const handleGpsCapture = () => {
    setIsCapturingGps(true);
    setTimeout(() => {
      if (navigator.geolocation) {
        let timeout = setTimeout(() => {
          setIsCapturingGps(false);
          setGpsError(true);
        }, 3000);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeout);
            setLocation(`Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
            setIsCapturingGps(false);
          },
          (err) => {
            clearTimeout(timeout);
            setIsCapturingGps(false);
            setGpsError(true);
          },
          { timeout: 3000 }
        );
      } else {
        setIsCapturingGps(false);
        setGpsError(true);
      }
    }, 100);
  };

  return (
    <Modal title="New Report" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Community Issue Type</label>
          <select value={type} onChange={handleTypeChange} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50">
            {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Problem Issue Type</label>
          <select value={subCategory} onChange={e => setSubCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50">
            {SUB_CATEGORIES[type].map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </div>

        {(type === 'Potholes' || type === 'Manholes') && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Road Type</label>
            <select value={roadType} onChange={e => setRoadType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50">
              {ROAD_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Geo-Location</label>
          <div className="mb-3">
            <span className="text-xs font-semibold text-slate-600 mb-2 block">Are you currently standing at the incident scene?</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setAtScene(true); setGpsError(false); }} className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${atScene === true ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Yes, at scene</button>
              <button type="button" onClick={() => setAtScene(false)} className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${atScene === false ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>No, reporting remotely</button>
            </div>
          </div>
          
          {atScene === true && !gpsError && (
            <button type="button" onClick={handleGpsCapture} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl px-4 py-3 font-medium transition-colors">
              <MapPin className="w-5 h-5" />
              {isCapturingGps ? 'Capturing GPS...' : location ? 'GPS Captured!' : 'Capture GPS'}
            </button>
          )}

          {(atScene === false || gpsError) && (
            <div className="space-y-3">
              <input type="text" placeholder="Exact Street Address / Cross-Street" value={manualAddress} onChange={e => setManualAddress(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50" />
              <input type="text" placeholder="Nearby Landmark" value={manualLandmark} onChange={e => setManualLandmark(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50" />
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between items-center">
            <span>Required Spatial Photography (For Priority Analysis)</span>
            <span className="text-emerald-600 font-bold">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => !spatialPics.left ? handlePicCapture('left') : null} className={`relative flex flex-col items-center justify-center gap-2 border rounded-xl p-3 transition-colors ${spatialPics.left ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
              {spatialPics.left && (
                <div onClick={(e) => { e.stopPropagation(); setSpatialPics(p => ({...p, left: false})) }} className="absolute top-1 right-1 bg-white p-0.5 rounded-full shadow-sm hover:bg-slate-100 cursor-pointer">
                  <X className="w-3 h-3 text-slate-500" />
                </div>
              )}
              {loadingPic === 'left' ? <Loader2 className="w-5 h-5 animate-spin" /> : spatialPics.left ? <CheckCircle className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              <span className="text-[10px] font-bold text-center leading-tight">1. Left<br/>Surroundings</span>
            </button>
            <button type="button" onClick={() => !spatialPics.center ? handlePicCapture('center') : null} className={`relative flex flex-col items-center justify-center gap-2 border rounded-xl p-3 transition-colors ${spatialPics.center ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
              {spatialPics.center && (
                <div onClick={(e) => { e.stopPropagation(); setSpatialPics(p => ({...p, center: false})) }} className="absolute top-1 right-1 bg-white p-0.5 rounded-full shadow-sm hover:bg-slate-100 cursor-pointer">
                  <X className="w-3 h-3 text-slate-500" />
                </div>
              )}
              {loadingPic === 'center' ? <Loader2 className="w-5 h-5 animate-spin" /> : spatialPics.center ? <CheckCircle className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              <span className="text-[10px] font-bold text-center leading-tight">2. Center<br/>Surroundings</span>
            </button>
            <button type="button" onClick={() => !spatialPics.right ? handlePicCapture('right') : null} className={`relative flex flex-col items-center justify-center gap-2 border rounded-xl p-3 transition-colors ${spatialPics.right ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
              {spatialPics.right && (
                <div onClick={(e) => { e.stopPropagation(); setSpatialPics(p => ({...p, right: false})) }} className="absolute top-1 right-1 bg-white p-0.5 rounded-full shadow-sm hover:bg-slate-100 cursor-pointer">
                  <X className="w-3 h-3 text-slate-500" />
                </div>
              )}
              {loadingPic === 'right' ? <Loader2 className="w-5 h-5 animate-spin" /> : spatialPics.right ? <CheckCircle className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              <span className="text-[10px] font-bold text-center leading-tight">3. Right<br/>Surroundings</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex justify-between items-center">
            <span>Additional Media Capture</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => !mediaState.video ? handleMediaCapture('video') : null} className={`relative flex flex-col items-center justify-center gap-2 border rounded-xl p-3 transition-colors ${mediaState.video ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
              {mediaState.video && (
                <div onClick={(e) => { e.stopPropagation(); setMediaState(p => ({...p, video: false})) }} className="absolute top-1 right-1 bg-white p-0.5 rounded-full shadow-sm hover:bg-slate-100 cursor-pointer">
                  <X className="w-3 h-3 text-slate-500" />
                </div>
              )}
              {loadingMedia === 'video' ? <Loader2 className="w-5 h-5 animate-spin" /> : mediaState.video ? <CheckCircle className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              <span className="text-[10px] uppercase font-bold text-center">{loadingMedia === 'video' ? 'Capturing...' : mediaState.video ? 'Captured' : '30s Video'}</span>
            </button>
            <button type="button" onClick={() => !mediaState.audio ? handleMediaCapture('audio') : null} className={`relative flex flex-col items-center justify-center gap-2 border rounded-xl p-3 transition-colors ${mediaState.audio ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
              {mediaState.audio && (
                <div onClick={(e) => { e.stopPropagation(); setMediaState(p => ({...p, audio: false})) }} className="absolute top-1 right-1 bg-white p-0.5 rounded-full shadow-sm hover:bg-slate-100 cursor-pointer">
                  <X className="w-3 h-3 text-slate-500" />
                </div>
              )}
              {loadingMedia === 'audio' ? <Loader2 className="w-5 h-5 animate-spin" /> : mediaState.audio ? <CheckCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span className="text-[10px] uppercase font-bold text-center">{loadingMedia === 'audio' ? 'Capturing...' : mediaState.audio ? 'Captured' : 'Audio'}</span>
            </button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,audio/*,video/*" onChange={handleFileUpload} multiple />
          <button type="button" onClick={() => fileInputRef.current?.click()} className={`w-full mt-2 flex items-center justify-center gap-2 text-sm rounded-xl py-2 font-medium transition-colors ${mediaState.fallback ? 'text-emerald-600 bg-emerald-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}>
            {loadingMedia === 'fallback' ? <Loader2 className="w-4 h-4 animate-spin" /> : mediaState.fallback ? <CheckCircle className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
            {loadingMedia === 'fallback' ? 'Uploading...' : mediaState.fallback ? 'File Uploaded' : 'Fallback Upload'}
          </button>
        </div>

        <button type="submit" disabled={isSubmitDisabled} className={`w-full rounded-xl py-3.5 font-bold shadow-sm transition-all active:scale-[0.98] ${!isSubmitDisabled ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20' : 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed'}`}>
          {isSubmitting ? 'Processing...' : 'Submit Report (+5 Pts)'}
        </button>
      </form>
    </Modal>
  );
}

export function ValidateModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: () => void }) {
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setSelfieCaptured(true);
      setIsCapturing(false);
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsCapturing(true);
      setTimeout(() => {
        setSelfieCaptured(true);
        setIsCapturing(false);
      }, 1000);
    }
  };

  const handleSubmit = () => {
    if (!selfieCaptured || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit();
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <Modal title="Validate Report" onClose={onClose}>
      <div className="space-y-5">
        <p className="text-slate-600 text-sm">Please provide a selfie with the issue in the background to validate this report.</p>
        
        <button onClick={handleCapture} className={`w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-colors ${selfieCaptured ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
          {isCapturing ? <Loader2 className="w-8 h-8 mb-2 animate-spin text-emerald-500" /> : selfieCaptured ? <CheckCircle className="w-8 h-8 mb-2 text-emerald-500" /> : <Camera className="w-8 h-8 mb-2 text-emerald-500" />}
          <span className="font-medium">{isCapturing ? 'Capturing...' : selfieCaptured ? 'Selfie Captured' : 'Take Selfie'}</span>
        </button>
        
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        <button type="button" onClick={() => fileInputRef.current?.click()} className={`w-full flex items-center justify-center gap-2 text-sm rounded-xl py-2 font-medium transition-colors ${selfieCaptured ? 'text-emerald-600 bg-emerald-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}>
           <UploadCloud className="w-4 h-4" /> Fallback Upload
        </button>

        <button onClick={handleSubmit} disabled={!selfieCaptured || isSubmitting} className={`w-full rounded-xl py-3.5 font-bold shadow-sm transition-all active:scale-[0.98] ${selfieCaptured && !isSubmitting ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed'}`}>
          {isSubmitting ? 'Processing...' : 'Confirm Validation (+2 Pts)'}
        </button>
      </div>
    </Modal>
  );
}

export function StatusUpdateModal({ currentStatus, onClose, onSubmit }: { currentStatus: ReportStatus, onClose: () => void, onSubmit: (s: ReportStatus, c: string) => void }) {
  const [comment, setComment] = useState('');
  const [photosCaptured, setPhotosCaptured] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const nextStatusMap: Record<string, { label: string, status: ReportStatus, pts: number }> = {
    Validated: { label: 'Initiate Work', status: 'Initiated', pts: 1 },
    Initiated: { label: 'Mark as Resolving', status: 'Resolving', pts: 2 },
    Resolving: { label: 'Mark as Fixed', status: 'Fixed', pts: 5 },
  };

  const nextAction = nextStatusMap[currentStatus];

  if (!nextAction) return null;

  const handleCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setPhotosCaptured(true);
      setIsCapturing(false);
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsCapturing(true);
      setTimeout(() => {
        setPhotosCaptured(true);
        setIsCapturing(false);
      }, 1000);
    }
  };

  const isSubmitDisabled = !comment || (nextAction.status === 'Fixed' && !photosCaptured) || isSubmitting;

  const handleSubmit = () => {
    if(isSubmitDisabled) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(nextAction.status, comment);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <Modal title={`Update Status: ${nextAction.label}`} onClose={onClose}>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Comments</label>
          <textarea 
            value={comment}
            onChange={e => setComment(e.target.value)}
            required
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[100px]"
            placeholder="Add official remarks..."
          />
        </div>
        
        {nextAction.status === 'Fixed' && (
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1.5">Required Proof</label>
             <button onClick={handleCapture} className={`w-full py-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-colors ${photosCaptured ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                {isCapturing ? <Loader2 className="w-5 h-5 animate-spin" /> : photosCaptured ? <CheckCircle className="w-5 h-5" /> : <Camera className="w-5 h-5" />} 
                {isCapturing ? 'Capturing...' : photosCaptured ? 'Photos Captured' : 'Attach 2 Photos of Fix'}
             </button>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
             <button type="button" onClick={() => fileInputRef.current?.click()} className={`w-full mt-2 flex items-center justify-center gap-2 text-sm rounded-xl py-2 font-medium transition-colors ${photosCaptured ? 'text-emerald-600 bg-emerald-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}>
               <UploadCloud className="w-4 h-4" /> Fallback Upload
             </button>
          </div>
        )}

        <button onClick={handleSubmit} disabled={isSubmitDisabled} className={`w-full rounded-xl py-3.5 font-bold shadow-sm transition-all active:scale-[0.98] flex justify-center items-center gap-2 ${isSubmitDisabled ? 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
          {isSubmitting ? 'Processing...' : <>{nextAction.label} <span className="opacity-80 font-normal">(+{nextAction.pts} Pts)</span></>}
        </button>
      </div>
    </Modal>
  );
}
