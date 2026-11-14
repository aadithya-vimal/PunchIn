import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '../context/UserContext.jsx';
import { AIContext } from '../context/AIContext.jsx';
import {
  captureDisplayScreenshot,
  fileToBase64,
  extractImageFromClipboard,
  reconcileExtractedData,
  buildFinalMergePayload,
  computeArtifactDiff
} from '../services/screenshotParser.js';

const ScreenshotIngestModal = () => {
  const {
    subjects,
    attendanceData,
    timetable,
    classTimings,
    saveData
  } = useContext(UserContext);

  const {
    byokConfig,
    hasActiveKey,
    openBYOKModal,
    closeScreenshotModal,
    parseScreenshot,
    PROVIDERS
  } = useContext(AIContext);

  // Flow step: 'input' -> 'analyzing' -> 'review'
  const [step, setStep] = useState('input');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageMimeType, setImageMimeType] = useState('image/png');
  const [scanMode, setScanMode] = useState('auto'); // 'auto', 'attendance', 'timetable'

  // Status & Progress
  const [progressMessage, setProgressMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  // Extracted Result
  const [extractedRaw, setExtractedRaw] = useState(null);
  const [subjectMappings, setSubjectMappings] = useState([]);
  const [extractedTimetable, setExtractedTimetable] = useState({});
  const [extractedTimings, setExtractedTimings] = useState(null);

  // Review & Merge Options
  const [reviewTab, setReviewTab] = useState('subjects'); // 'subjects', 'timetable', 'timings'
  const [updateAttendance, setUpdateAttendance] = useState(true);
  const [updateTimetable, setUpdateTimetable] = useState(true);
  const [updateTimings, setUpdateTimings] = useState(true);
  const [mergeMode, setMergeMode] = useState('merge'); // 'merge' or 'replace'

  // Success Feedback & Rollback
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [artifactDiff, setArtifactDiff] = useState(null);
  const [isArtifactVerified, setIsArtifactVerified] = useState(false);
  const [createBackupSnapshot, setCreateBackupSnapshot] = useState(true);
  const [showFullImagePreview, setShowFullImagePreview] = useState(false);
  const [hasExistingBackup, setHasExistingBackup] = useState(false);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const existing = localStorage.getItem('punchin_schedule_backup');
        setHasExistingBackup(!!existing);
      } catch {
        setHasExistingBackup(false);
      }
    }
  }, []);

  const fileInputRef = useRef(null);

  // Listen for global clipboard paste (Ctrl+V / Cmd+V) when modal is mounted
  useEffect(() => {
    const handlePaste = async (e) => {
      if (step !== 'input') return;
      const result = await extractImageFromClipboard(e);
      if (result) {
        setImagePreview(result.imageBase64);
        setImageMimeType(result.mimeType);
        setErrorMessage('');
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [step]);

  // Handle Screen Capture
  const handleCaptureScreen = async () => {
    setIsCapturing(true);
    setErrorMessage('');
    try {
      const result = await captureDisplayScreenshot();
      setImagePreview(result.imageBase64);
      setImageMimeType(result.mimeType);
    } catch (err) {
      if (!err.message?.includes('cancelled') && !err.message?.includes('Permission denied')) {
        setErrorMessage(err.message || 'Screen capture was cancelled or failed.');
      }
    } finally {
      setIsCapturing(false);
    }
  };

  // Handle File Input Selection or Drop
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await fileToBase64(file);
      setImagePreview(result.imageBase64);
      setImageMimeType(result.mimeType);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage('Failed to read image file.');
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const result = await fileToBase64(file);
      setImagePreview(result.imageBase64);
      setImageMimeType(result.mimeType);
      setErrorMessage('');
    }
  };

  // Run AI Vision Analysis
  const handleAnalyze = async () => {
    if (!hasActiveKey()) {
      setErrorMessage('Please configure a Google Gemini or Groq API key first.');
      openBYOKModal();
      return;
    }

    if (!imagePreview) {
      setErrorMessage('Please capture, paste, or select a screenshot image first.');
      return;
    }

    setStep('analyzing');
    setErrorMessage('');
    setProgressMessage('Initializing Vision model...');

    try {
      const result = await parseScreenshot({
        imageBase64: imagePreview,
        mimeType: imageMimeType,
        mode: scanMode,
        onProgress: (msg) => setProgressMessage(msg)
      });

      setExtractedRaw(result);

      // Reconcile with current user state
      const { subjectMappings: mapped, hasExtractedTimetable } = reconcileExtractedData({
        extractedSubjects: result.subjects || [],
        extractedTimetable: result.timetable || {},
        currentSubjects: subjects || [],
        currentAttendance: attendanceData || {}
      });

      setSubjectMappings(mapped);
      setExtractedTimetable(result.timetable || {});
      setExtractedTimings(result.classTimings || null);

      // Default review tab
      if (mapped.length > 0) {
        setReviewTab('subjects');
      } else if (hasExtractedTimetable) {
        setReviewTab('timetable');
      }

      setStep('review');
    } catch (err) {
      console.error('Extraction error:', err);
      setErrorMessage(err.message || 'Vision analysis failed. Please verify your API key and try again.');
      setStep('input');
    }
  };

  // Editing extracted subjects in review table
  const handleSubjectToggle = (index) => {
    setSubjectMappings(prev => prev.map((m, i) => i === index ? { ...m, selected: !m.selected } : m));
  };

  const handleSubjectNameChange = (index, newName) => {
    setSubjectMappings(prev => prev.map((m, i) => {
      if (i === index) {
        return {
          ...m,
          extracted: { ...m.extracted, name: newName }
        };
      }
      return m;
    }));
  };

  const handleSubjectCountChange = (index, field, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setSubjectMappings(prev => prev.map((m, i) => {
      if (i === index) {
        const updated = { ...m.extracted, [field]: num };
        if (updated.total > 0) {
          updated.percentage = Number(((updated.attended / updated.total) * 100).toFixed(1));
        }
        return { ...m, extracted: updated };
      }
      return m;
    }));
  };

  // Step 3 -> 4: Compute Diff & Proceed to Confirmation
  const handleProceedToConfirm = () => {
    try {
      const diff = computeArtifactDiff({
        subjectMappings,
        extractedTimetable,
        extractedTimings,
        currentSubjects: subjects || [],
        currentAttendanceData: attendanceData || {},
        currentTimetable: timetable || {},
        currentTimings: classTimings || {},
        options: {
          updateAttendance,
          updateTimetable,
          updateTimings,
          mergeMode
        }
      });
      setArtifactDiff(diff);
      setIsArtifactVerified(false);
      setStep('confirm');
    } catch (err) {
      console.error('Failed to compute diff:', err);
      setErrorMessage('Could not calculate schedule diff. ' + (err.message || ''));
    }
  };

  // Apply Changes to UserContext with Optional Rollback Snapshot
  const handleApply = async () => {
    try {
      // 1. Create automatic rollback recovery snapshot in localStorage
      if (createBackupSnapshot && typeof localStorage !== 'undefined') {
        try {
          const snapshot = {
            timestamp: new Date().toISOString(),
            source: 'screenshot_ingest_backup',
            subjects: subjects || [],
            attendanceData: attendanceData || {},
            timetable: timetable || {},
            classTimings: classTimings || {}
          };
          localStorage.setItem('punchin_schedule_backup', JSON.stringify(snapshot));
          setHasExistingBackup(true);
        } catch (storageErr) {
          console.warn('Could not store backup snapshot in localStorage:', storageErr);
        }
      }

      // 2. Build merge payload
      const finalPayload = buildFinalMergePayload({
        subjectMappings,
        extractedTimetable,
        extractedTimings,
        currentSubjects: subjects || [],
        currentAttendanceData: attendanceData || {},
        currentTimetable: timetable || {},
        currentTimings: classTimings || {},
        options: {
          updateAttendance,
          updateTimetable,
          updateTimings,
          mergeMode
        }
      });

      // 3. Save to app context and persistent storage
      await saveData(finalPayload);
      setAppliedSuccess(true);
      setTimeout(() => {
        closeScreenshotModal();
      }, 1200);
    } catch (err) {
      console.error('Failed to apply schedule data:', err);
      setErrorMessage('Failed to save imported schedule. ' + (err.message || ''));
    }
  };

  // Restore previous schedule from backup
  const handleRestoreBackup = async () => {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem('punchin_schedule_backup');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.subjects && parsed.attendanceData) {
        await saveData({
          subjects: parsed.subjects,
          attendanceData: parsed.attendanceData,
          timetable: parsed.timetable || {},
          classTimings: parsed.classTimings || {}
        });
        setAppliedSuccess(true);
        setTimeout(() => {
          closeScreenshotModal();
        }, 1200);
      }
    } catch (err) {
      setErrorMessage('Failed to restore backup snapshot: ' + err.message);
    }
  };

  const activeProviderName = byokConfig.activeProvider === PROVIDERS.GOOGLE
    ? `Google Gemini (${byokConfig.googleModel})`
    : `Groq (${byokConfig.groqVisionModel})`;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="apple-card bg-[#0f131c]/98 border border-white/15 rounded-3xl p-5 sm:p-7 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center text-base">
              <i className="fas fa-camera"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Screenshot Academic Ingestion
                </h2>
                <button
                  type="button"
                  onClick={openBYOKModal}
                  className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/80 hover:text-white border border-white/15 flex items-center gap-1 transition-colors"
                  title="Configure Vision AI provider"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                  <span>{activeProviderName}</span>
                  <i className="fas fa-cog text-[8px]"></i>
                </button>
              </div>
              <p className="text-[11px] text-white/50">
                Auto-extract subjects, attendance numbers, and weekly timetables directly from college portal screenshots
              </p>
            </div>
          </div>

          <button 
            onClick={closeScreenshotModal} 
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center text-xs transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-grow overflow-y-auto pr-1 space-y-4">

          {/* Step Progress Bar */}
          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-medium text-white/50 px-1 overflow-x-auto pb-1">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              step === 'input' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold' : 'bg-white/[0.04]'
            }`}>
              <span className="w-3.5 h-3.5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold">1</span>
              <span>Upload / Capture</span>
            </div>
            <i className="fas fa-chevron-right text-[8px] opacity-30"></i>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              step === 'analyzing' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold' : 'bg-white/[0.04]'
            }`}>
              <span className="w-3.5 h-3.5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold">2</span>
              <span>Vision OCR</span>
            </div>
            <i className="fas fa-chevron-right text-[8px] opacity-30"></i>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              step === 'review' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold' : 'bg-white/[0.04]'
            }`}>
              <span className="w-3.5 h-3.5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold">3</span>
              <span>Review Mappings</span>
            </div>
            <i className="fas fa-chevron-right text-[8px] opacity-30"></i>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              step === 'confirm' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold' : 'bg-white/[0.04]'
            }`}>
              <span className="w-3.5 h-3.5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold">4</span>
              <span>Verify & Confirm Diff</span>
            </div>
          </div>
          
          {/* Missing BYOK Warning */}
          {!hasActiveKey() && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-amber-200">
                <i className="fas fa-key text-amber-400 text-sm"></i>
                <span>BYOK Key required for Vision OCR: Enter your Google Gemini or Groq key.</span>
              </div>
              <button
                type="button"
                onClick={openBYOKModal}
                className="apple-btn-primary text-xs px-3.5 py-1.5 whitespace-nowrap"
              >
                Configure Key
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-200 text-xs flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-rose-400"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: INPUT STAGE */}
          {step === 'input' && (
            <div className="space-y-4">
              
              {/* Scan Mode Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                  Extraction Target
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-white/[0.04] border border-white/10 rounded-2xl text-xs">
                  <button
                    type="button"
                    onClick={() => setScanMode('auto')}
                    className={`py-2 px-2 rounded-xl font-medium text-center transition-all ${
                      scanMode === 'auto'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    ⚡ Auto-Detect Both
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanMode('attendance')}
                    className={`py-2 px-2 rounded-xl font-medium text-center transition-all ${
                      scanMode === 'attendance'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    📊 Attendance & Counts
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanMode('timetable')}
                    className={`py-2 px-2 rounded-xl font-medium text-center transition-all ${
                      scanMode === 'timetable'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    🗓️ Weekly Timetable
                  </button>
                </div>
              </div>

              {/* Action Cards: Capture / Upload / Paste */}
              {!imagePreview ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Screen Capture Card */}
                  <div
                    onClick={handleCaptureScreen}
                    className="p-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-sky-500/40 cursor-pointer transition-all flex flex-col items-center justify-center text-center group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 group-hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 flex items-center justify-center text-xl mb-3 transition-colors">
                      <i className="fas fa-desktop"></i>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">
                      {isCapturing ? 'Selecting Window...' : 'Capture Portal Screen'}
                    </h3>
                    <p className="text-[11px] text-white/50 max-w-xs">
                      Pick your active college ERP portal tab or window for an instant zero-file snapshot
                    </p>
                  </div>

                  {/* Upload / Dropzone Card */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-dashed border-white/15 hover:border-sky-500/40 cursor-pointer transition-all flex flex-col items-center justify-center text-center group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 group-hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xl mb-3 transition-colors">
                      <i className="fas fa-file-arrow-up"></i>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">Upload or Drag Image</h3>
                    <p className="text-[11px] text-white/50 max-w-xs">
                      Supports PNG, JPG, WebP screenshots or phone photos of your printed schedule
                    </p>
                  </div>
                </div>
              ) : (
                /* Image Preview Container */
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/80">Loaded Screenshot</span>
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
                    >
                      <i className="fas fa-trash-alt text-[10px]"></i>
                      <span>Remove & Choose Another</span>
                    </button>
                  </div>

                  <div className="relative max-h-72 rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Portal Screenshot"
                      className="max-h-72 w-auto object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Paste shortcut hint */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-white/40">
                <i className="fas fa-paste text-sky-400 mr-1.5"></i>
                <span>Pro Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white/80">Ctrl + V</kbd> anywhere in this dialog to paste a snipped screenshot instantly.</span>
              </div>
            </div>
          )}

          {/* STEP 2: ANALYZING STAGE */}
          {step === 'analyzing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-sky-500/20 border-t-sky-400 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-2 border-indigo-500/20 border-b-indigo-400 animate-spin"></div>
                <div className="w-full h-full flex items-center justify-center text-sky-400 text-lg">
                  <i className="fas fa-wand-magic-sparkles"></i>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Extracting Academic Intelligence...
                </h3>
                <p className="text-xs text-sky-400 font-mono animate-pulse">
                  {progressMessage}
                </p>
                <p className="text-[11px] text-white/40 mt-2 max-w-sm">
                  Powered by {activeProviderName}. Analyzing subject catalog, attendance ratios, and weekly schedule matrix.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & APPLY STAGE */}
          {step === 'review' && (
            <div className="space-y-4">
              
              {/* Summary Bar */}
              <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-sky-400 text-sm"></i>
                  <div>
                    <span className="font-semibold text-white">Extraction Successful: </span>
                    <span className="text-sky-200">{extractedRaw?.summary || 'Found academic schedule details.'}</span>
                  </div>
                </div>
                {extractedRaw?.collegeOrPortalName && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 self-start sm:self-auto">
                    {extractedRaw.collegeOrPortalName}
                  </span>
                )}
              </div>

              {/* Review Tabs */}
              <div className="flex border-b border-white/10 gap-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setReviewTab('subjects')}
                  className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all ${
                    reviewTab === 'subjects'
                      ? 'border-sky-400 text-white'
                      : 'border-transparent text-white/50 hover:text-white'
                  }`}
                >
                  <i className="fas fa-book"></i>
                  <span>Subjects & Attendance ({subjectMappings.filter(m => m.selected).length}/{subjectMappings.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewTab('timetable')}
                  className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all ${
                    reviewTab === 'timetable'
                      ? 'border-sky-400 text-white'
                      : 'border-transparent text-white/50 hover:text-white'
                  }`}
                >
                  <i className="fas fa-calendar-alt"></i>
                  <span>Weekly Timetable Matrix</span>
                </button>

                {extractedTimings && Object.keys(extractedTimings).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setReviewTab('timings')}
                    className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all ${
                      reviewTab === 'timings'
                        ? 'border-sky-400 text-white'
                        : 'border-transparent text-white/50 hover:text-white'
                    }`}
                  >
                    <i className="fas fa-clock"></i>
                    <span>Period Timings</span>
                  </button>
                )}
              </div>

              {/* TAB 1: SUBJECTS & ATTENDANCE */}
              {reviewTab === 'subjects' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="chkUpdateAtt"
                        checked={updateAttendance}
                        onChange={(e) => setUpdateAttendance(e.target.checked)}
                        className="rounded bg-white/10 border-white/20 text-sky-500 focus:ring-0"
                      />
                      <label htmlFor="chkUpdateAtt" className="text-white/80 font-medium">
                        Apply extracted attendance counts & totals
                      </label>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-white/60">
                      <span>Import Mode:</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="mergeMode"
                          value="merge"
                          checked={mergeMode === 'merge'}
                          onChange={() => setMergeMode('merge')}
                          className="text-sky-500"
                        />
                        <span>Merge (Keep others)</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="mergeMode"
                          value="replace"
                          checked={mergeMode === 'replace'}
                          onChange={() => setMergeMode('replace')}
                          className="text-sky-500"
                        />
                        <span>Replace catalog</span>
                      </label>
                    </div>
                  </div>

                  {subjectMappings.length === 0 ? (
                    <div className="p-8 text-center text-white/40 border border-dashed border-white/10 rounded-2xl text-xs">
                      No subject counts detected in screenshot. You can configure subjects manually or extract timetable.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider text-[10px] bg-white/[0.02]">
                            <th className="py-2.5 px-3 w-8">
                              <input
                                type="checkbox"
                                checked={subjectMappings.every(m => m.selected)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setSubjectMappings(prev => prev.map(m => ({ ...m, selected: checked })));
                                }}
                                className="rounded bg-white/10 border-white/20 text-sky-500 focus:ring-0"
                              />
                            </th>
                            <th className="py-2.5 px-3">Subject Name</th>
                            <th className="py-2.5 px-3 text-center">Attended</th>
                            <th className="py-2.5 px-3 text-center">Total</th>
                            <th className="py-2.5 px-3 text-center">Percentage</th>
                            <th className="py-2.5 px-3">Match Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {subjectMappings.map((item, idx) => {
                            const sub = item.extracted;
                            const pct = sub.total > 0 ? ((sub.attended / sub.total) * 100).toFixed(1) : 0;
                            const pctNum = Number(pct);

                            return (
                              <tr key={idx} className={item.selected ? 'hover:bg-white/[0.02]' : 'opacity-40 hover:opacity-70'}>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="checkbox"
                                    checked={item.selected}
                                    onChange={() => handleSubjectToggle(idx)}
                                    className="rounded bg-white/10 border-white/20 text-sky-500 focus:ring-0"
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="text"
                                    value={sub.name}
                                    onChange={(e) => handleSubjectNameChange(idx, e.target.value)}
                                    className="w-full bg-transparent border-0 text-white font-medium focus:ring-1 focus:ring-sky-500 rounded px-1 text-xs"
                                  />
                                  {sub.code && (
                                    <span className="text-[10px] font-mono text-white/40 block px-1">
                                      Code: {sub.code}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    value={sub.attended}
                                    onChange={(e) => handleSubjectCountChange(idx, 'attended', e.target.value)}
                                    className="w-16 text-center bg-white/5 border border-white/10 rounded-lg py-1 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                                  />
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    value={sub.total}
                                    onChange={(e) => handleSubjectCountChange(idx, 'total', e.target.value)}
                                    className="w-16 text-center bg-white/5 border border-white/10 rounded-lg py-1 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                                  />
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`font-mono font-bold text-xs ${
                                    pctNum >= 85 ? 'text-emerald-400' : pctNum >= 75 ? 'text-sky-400' : 'text-rose-400'
                                  }`}>
                                    {pct}%
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">
                                  {item.isExisting ? (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                                      Matches: {item.matchedName}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                      + New Course
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TIMETABLE MATRIX */}
              {reviewTab === 'timetable' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="chkUpdateTt"
                        checked={updateTimetable}
                        onChange={(e) => setUpdateTimetable(e.target.checked)}
                        className="rounded bg-white/10 border-white/20 text-sky-500 focus:ring-0"
                      />
                      <label htmlFor="chkUpdateTt" className="text-white/80 font-medium">
                        Apply extracted weekly period schedule
                      </label>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] p-2">
                    <table className="w-full text-left text-xs min-w-[580px]">
                      <thead>
                        <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider text-[10px]">
                          <th className="py-2 px-2 text-center w-12">Period</th>
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(d => (
                            <th key={d} className="py-2 px-2 text-center uppercase font-semibold text-white/80">
                              {d.slice(0, 3)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {Array.from({ length: 8 }, (_, i) => i + 1).map(period => (
                          <tr key={period}>
                            <td className="py-2 px-2 text-center font-mono text-white/40 text-[11px]">
                              P{period}
                            </td>
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(day => {
                              const val = extractedTimetable[day]?.[String(period)] || 'Free';
                              const isFree = !val || val.toLowerCase() === 'free' || val === '-1';

                              return (
                                <td key={day} className="py-1 px-1">
                                  <div className={`p-1.5 rounded-lg text-center text-[10px] font-medium truncate max-w-[90px] mx-auto ${
                                    isFree
                                      ? 'bg-white/[0.02] text-white/30 border border-white/5'
                                      : 'bg-sky-500/10 text-sky-200 border border-sky-500/20'
                                  }`} title={val}>
                                    {isFree ? '🏖️ Free' : val}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: TIMINGS */}
              {reviewTab === 'timings' && extractedTimings && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="chkUpdateTimings"
                        checked={updateTimings}
                        onChange={(e) => setUpdateTimings(e.target.checked)}
                        className="rounded bg-white/10 border-white/20 text-sky-500 focus:ring-0"
                      />
                      <label htmlFor="chkUpdateTimings" className="text-white/80 font-medium">
                        Update period start timings
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Array.from({ length: 8 }, (_, i) => i + 1).map(p => (
                      <div key={p} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                        <span className="font-mono text-xs text-white/50 font-semibold">Period {p}</span>
                        <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                          {extractedTimings[String(p)] || classTimings[String(p)] || '--:--'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: ARTIFACT VERIFICATION & DIFF CONFIRMATION */}
          {step === 'confirm' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Diff Metric Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">New Courses</span>
                  <span className="font-mono text-lg font-bold text-emerald-300">
                    +{artifactDiff?.newSubjects?.length || 0}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 block">Attendance Diffs</span>
                  <span className="font-mono text-lg font-bold text-sky-300">
                    {artifactDiff?.updatedSubjects?.length || 0}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block">Timetable Slots</span>
                  <span className="font-mono text-lg font-bold text-indigo-300">
                    {artifactDiff?.timetableSlotsChanged || 0}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/50 block">Unchanged</span>
                  <span className="font-mono text-lg font-bold text-white/80">
                    {artifactDiff?.unchangedSubjects?.length || 0}
                  </span>
                </div>
              </div>

              {/* Artifact & Diff Comparison Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Left: Scanned Artifact Thumbnail Card */}
                <div className="lg:col-span-4 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <i className="fas fa-image text-sky-400"></i> Scanned Artifact
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowFullImagePreview(true)}
                        className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
                      >
                        <i className="fas fa-expand-alt"></i> Zoom
                      </button>
                    </div>

                    <div 
                      onClick={() => setShowFullImagePreview(true)}
                      className="relative rounded-xl overflow-hidden border border-white/10 group cursor-pointer aspect-video sm:aspect-auto max-h-48 bg-black/40 flex items-center justify-center"
                    >
                      <img 
                        src={imagePreview} 
                        alt="Scanned Academic Artifact" 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs text-white gap-1.5 font-medium">
                        <i className="fas fa-search-plus"></i> View Full Image
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-[11px] text-white/60">
                      <div className="flex justify-between">
                        <span>Model:</span>
                        <span className="text-white font-mono">{activeProviderName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mode:</span>
                        <span className="text-white uppercase font-mono">{scanMode}</span>
                      </div>
                      {extractedRaw?.collegeOrPortalName && (
                        <div className="flex justify-between">
                          <span>Portal:</span>
                          <span className="text-sky-300 font-semibold">{extractedRaw.collegeOrPortalName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {mergeMode === 'replace' && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-[10px]">
                      ⚠️ <strong>Replace Mode Active:</strong> Your current courses and timetable will be completely replaced by this scan.
                    </div>
                  )}
                </div>

                {/* Right: Detailed Before vs After Changes Breakdown */}
                <div className="lg:col-span-8 space-y-3">
                  
                  {/* Updated Attendance Diff Table */}
                  {artifactDiff?.updatedSubjects?.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
                      <h4 className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
                        <i className="fas fa-arrows-rotate text-sky-400"></i>
                        Attendance Modifications Detected ({artifactDiff.updatedSubjects.length})
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[11px] text-left">
                          <thead>
                            <tr className="border-b border-white/10 text-white/40 uppercase font-mono text-[9px]">
                              <th className="pb-2 font-semibold">Subject</th>
                              <th className="pb-2 font-semibold">Current Recorded</th>
                              <th className="pb-2 font-semibold"></th>
                              <th className="pb-2 font-semibold">Scanned Artifact</th>
                              <th className="pb-2 font-semibold text-right">Net Impact</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-mono">
                            {artifactDiff.updatedSubjects.map((sub, idx) => (
                              <tr key={idx} className="hover:bg-white/[0.02]">
                                <td className="py-2 pr-2 font-sans font-semibold text-white max-w-[140px] truncate" title={sub.name}>
                                  {sub.name}
                                </td>
                                <td className="py-2 text-white/50">
                                  {sub.oldAttended}/{sub.oldTotal} ({sub.oldPercentage}%)
                                </td>
                                <td className="py-2 text-sky-400 text-center font-sans">→</td>
                                <td className="py-2 text-white font-bold">
                                  {sub.newAttended}/{sub.newTotal} ({sub.newPercentage}%)
                                </td>
                                <td className="py-2 text-right">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    sub.diffPercentage >= 0
                                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                  }`}>
                                    {sub.diffPercentage >= 0 ? `+${sub.diffPercentage}%` : `${sub.diffPercentage}%`}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* New Subjects List */}
                  {artifactDiff?.newSubjects?.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
                      <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                        <i className="fas fa-plus-circle text-emerald-400"></i>
                        New Subjects to Register ({artifactDiff.newSubjects.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {artifactDiff.newSubjects.map((sub, idx) => (
                          <div key={idx} className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center gap-2">
                            <span className="font-semibold text-white">{sub.name}</span>
                            <span className="font-mono text-[10px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                              {sub.attended}/{sub.total} ({sub.percentage}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timetable Slots Notice */}
                  {updateTimetable && (artifactDiff?.timetableSlotsChanged || 0) > 0 && (
                    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs flex items-center gap-2">
                      <i className="fas fa-calendar-check text-indigo-400 text-sm"></i>
                      <span>
                        <strong>{artifactDiff.timetableSlotsChanged} Timetable Slots</strong> mapped from screenshot across your weekly grid.
                      </span>
                    </div>
                  )}

                  {/* Period Timings Notice */}
                  {updateTimings && (artifactDiff?.timingsChanged || 0) > 0 && (
                    <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs flex items-center gap-2">
                      <i className="fas fa-clock text-sky-400 text-sm"></i>
                      <span>
                        <strong>{artifactDiff.timingsChanged} Period Timings</strong> detected and aligned to college bell schedule.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Explicit Confirmation & Rollback Safeguards */}
              <div className="p-4 rounded-2xl bg-sky-500/[0.06] border border-sky-500/25 space-y-3">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <i className="fas fa-shield-halved text-sky-400"></i>
                  <span>Academic Data Integrity Confirmation</span>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-white/90 group">
                  <input
                    type="checkbox"
                    checked={isArtifactVerified}
                    onChange={(e) => setIsArtifactVerified(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 text-sky-500 focus:ring-0 bg-white/10 w-4 h-4 cursor-pointer"
                  />
                  <span className="leading-tight group-hover:text-white">
                    I have visually inspected the scanned artifact image and confirm the attendance percentages and course names are accurate.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-white/70 group">
                  <input
                    type="checkbox"
                    checked={createBackupSnapshot}
                    onChange={(e) => setCreateBackupSnapshot(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 text-sky-500 focus:ring-0 bg-white/10 w-4 h-4 cursor-pointer"
                  />
                  <span className="leading-tight group-hover:text-white/90">
                    Create an automatic rollback snapshot before applying (Recommended to revert anytime).
                  </span>
                </label>

                {hasExistingBackup && (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                    <span>A previous recovery snapshot is saved in your browser.</span>
                    <button
                      type="button"
                      onClick={handleRestoreBackup}
                      className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                    >
                      <i className="fas fa-clock-rotate-left text-[10px]"></i>
                      <span>Restore Prior Snapshot</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Full Image Zoom Overlay Modal */}
          {showFullImagePreview && imagePreview && (
            <div 
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center p-4 animate-in fade-in duration-150"
              onClick={() => setShowFullImagePreview(false)}
            >
              <div 
                className="max-w-5xl max-h-[90vh] overflow-auto rounded-2xl border border-white/20 bg-[#0f131c] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3 border-b border-white/10 flex justify-between items-center text-xs text-white">
                  <span className="font-semibold flex items-center gap-2">
                    <i className="fas fa-magnifying-glass-plus text-sky-400"></i>
                    Original Scanned Artifact
                  </span>
                  <button 
                    onClick={() => setShowFullImagePreview(false)}
                    className="apple-btn-secondary text-[11px] px-2.5 py-1"
                  >
                    Close (Esc)
                  </button>
                </div>
                <div className="p-2">
                  <img src={imagePreview} alt="Full Resolution Artifact" className="max-w-full h-auto rounded-lg" />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4 flex-shrink-0">
          {step === 'review' ? (
            <>
              <button
                type="button"
                onClick={() => setStep('input')}
                className="apple-btn-secondary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <i className="fas fa-arrow-left text-[10px]"></i>
                <span>Back to Image</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToConfirm}
                className="apple-btn-primary text-xs px-6 py-2 flex items-center gap-2"
              >
                <span>Review & Confirm Changes (Step 4)</span>
                <i className="fas fa-arrow-right text-[10px]"></i>
              </button>
            </>
          ) : step === 'confirm' ? (
            <>
              <button
                type="button"
                onClick={() => setStep('review')}
                className="apple-btn-secondary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <i className="fas fa-arrow-left text-[10px]"></i>
                <span>Back to Review</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                disabled={!isArtifactVerified || appliedSuccess}
                className="apple-btn-primary text-xs px-6 py-2 flex items-center gap-2 disabled:opacity-40"
              >
                {appliedSuccess ? (
                  <>
                    <i className="fas fa-check"></i>
                    <span>Applied to Schedule!</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-shield-check"></i>
                    <span>Confirm & Apply to Schedule</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={closeScreenshotModal}
                className="apple-btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!imagePreview || step === 'analyzing'}
                className="apple-btn-primary text-xs px-6 py-2 flex items-center gap-2 disabled:opacity-40"
              >
                <i className="fas fa-sparkles"></i>
                <span>Analyze Screenshot</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default ScreenshotIngestModal;
