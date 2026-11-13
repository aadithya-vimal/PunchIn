// Punch.In Screenshot Ingestion & Academic Data Extraction Service
import { analyzeBYOKVision } from './byokService.js';

/**
 * Capture screen, window, or tab via native browser getDisplayMedia
 * Returns { imageBase64, mimeType }
 */
export const captureDisplayScreenshot = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    throw new Error('Screen capture is not supported by this browser. Please upload or paste an image instead.');
  }

  let stream = null;
  try {
    // Request screen/window/tab video stream
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'browser',
        cursor: 'never'
      },
      audio: false
    });

    const track = stream.getVideoTracks()[0];
    if (!track) {
      throw new Error('No video track available from display media.');
    }

    // Wait for the track to be active and have frames
    const imageCapture = window.ImageCapture ? new window.ImageCapture(track) : null;
    let imageBase64 = '';

    if (imageCapture) {
      try {
        const bitmap = await imageCapture.grabFrame();
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        imageBase64 = canvas.toDataURL('image/png');
      } catch (err) {
        // Fallback to video element below if grabFrame fails
      }
    }

    if (!imageBase64) {
      // Standard video element frame grab fallback
      const video = document.createElement('video');
      video.muted = true;
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      imageBase64 = canvas.toDataURL('image/png');
    }

    return {
      imageBase64,
      mimeType: 'image/png'
    };
  } finally {
    // Always stop all tracks immediately so recording indicator turns off
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
  }
};

/**
 * Convert a File or Blob into base64 and mimeType
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof Blob)) {
      return reject(new Error('Invalid file provided.'));
    }
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        imageBase64: reader.result,
        mimeType: file.type || 'image/png'
      });
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

/**
 * Extract image data from a clipboard paste event
 */
export const extractImageFromClipboard = async (clipboardItemsOrEvent) => {
  let items = [];
  if (clipboardItemsOrEvent?.clipboardData?.items) {
    items = Array.from(clipboardItemsOrEvent.clipboardData.items);
  } else if (clipboardItemsOrEvent?.items) {
    items = clipboardItemsOrEvent.items;
  }

  for (const item of items) {
    if (item.type && item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        return await fileToBase64(file);
      }
    }
  }

  // Also check navigator.clipboard if available
  if (navigator.clipboard?.read) {
    try {
      const clipItems = await navigator.clipboard.read();
      for (const clipItem of clipItems) {
        const imageType = clipItem.types.find(t => t.startsWith('image/'));
        if (imageType) {
          const blob = await clipItem.getType(imageType);
          return await fileToBase64(blob);
        }
      }
    } catch (e) {
      // Clipboard read permissions may be denied, non-blocking
    }
  }

  return null;
};

/**
 * Parse JSON safely from AI output with markdown fence stripping
 */
export const parseCleanJSON = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return {};

  let text = rawText.trim();

  // Strip markdown code fences ```json ... ``` or ``` ... ```
  if (text.startsWith('```')) {
    text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }

  // Find the first '{' and last '}'
  const startIdx = text.indexOf('{');
  const endIdx = text.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    text = text.substring(startIdx, endIdx + 1);
  }

  // Pre-clean common syntax issues like curly quotes
  text = text.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");

  try {
    return JSON.parse(text);
  } catch (firstErr) {
    // Try relaxed regex fixes for common JSON errors like trailing commas
    const fixed = text
      .replace(/,\s*([}\]])/g, '$1') // remove trailing commas
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'); // ensure quotes around keys
    try {
      return JSON.parse(fixed);
    } catch {
      console.warn('Failed to parse AI JSON response:', firstErr, text);
      throw new Error('AI produced invalid JSON. Please try analyzing the screenshot again or cropping closer to the table.');
    }
  }
};

const EXTRACTION_SYSTEM_PROMPT = `
You are an expert academic OCR and document intelligence engine for college attendance and timetable portals.
Your task is to analyze screenshots, photos, or documents of student attendance dashboards, ERP portals, and weekly timetables.
Extract every detail with 100% precision and return ONLY valid raw JSON conforming strictly to the requested schema.
`;

const BUILD_ANALYSIS_PROMPT = (mode = 'auto') => {
  return `
Analyze this image. It may contain:
1. An Attendance Report / Course List (showing subject names/codes, classes attended/conducted, total, percentage).
2. A Weekly Timetable / Class Matrix (showing days like Mon-Sat and periods P1-P8 or time slots with subjects or free periods).
3. Both attendance and timetable.
4. Period timings / bell schedule (e.g., 09:00, 10:00).

Mode requested: ${mode}

CRITICAL RULES:
1. SUBJECT EXTRACTION:
   - For every course / subject found, extract:
     * "name": Full clean subject title (e.g., "Computer Networks", "Database Management Systems Lab").
     * "code": Subject code if visible (e.g., "CS301", "21CS52") or null.
     * "attended": Integer number of classes attended/present. If only percentage is given, calculate attended based on total, or if only attended and total are given, extract them accurately.
     * "total": Integer number of total classes held/conducted.
     * "percentage": Float percentage (0 to 100).
     * "requiredPerc": Minimum criteria if stated (e.g., 75, 80, 85) or 75.
   - If only subjects and no attendance counts are visible, still list all subjects with attended: 0, total: 0.

2. TIMETABLE EXTRACTION:
   - Map into a weekly schedule for days: "monday", "tuesday", "wednesday", "thursday", "friday", "saturday".
   - Normalize periods to numeric strings: "1", "2", "3", "4", "5", "6", "7", "8".
   - If a period slot has a subject, provide the subject name (matching one of the extracted subjects).
   - If a period slot is free, break, lunch, library, leisure, or empty, set value to "Free".
   - If Saturday has no classes, leave saturday as an empty object {}.

3. PERIOD TIMINGS EXTRACTION:
   - If clock timings are visible (e.g., 9:00 AM - 9:55 AM), map period numbers to 24-hour start time "HH:MM":
     e.g., "1": "09:00", "2": "10:00", "3": "11:00", "4": "12:00", "5": "14:00", "6": "15:00", "7": "16:00", "8": "17:00".

OUTPUT SCHEMA: Return ONLY a JSON object with this exact structure:
{
  "detectedType": "both", // "attendance", "timetable", or "both"
  "collegeOrPortalName": "Optional detected university or portal title",
  "summary": "Brief 1-sentence summary of what was extracted",
  "subjects": [
    {
      "name": "Subject Name",
      "code": "Code or null",
      "attended": 18,
      "total": 22,
      "percentage": 81.82,
      "requiredPerc": 75
    }
  ],
  "timetable": {
    "monday": { "1": "Subject Name", "2": "Subject Name", "3": "Free", "4": "Subject Name", "5": "Free", "6": "Free", "7": "Free", "8": "Free" },
    "tuesday": { ... },
    "wednesday": { ... },
    "thursday": { ... },
    "friday": { ... },
    "saturday": { ... }
  },
  "classTimings": {
    "1": "09:00",
    "2": "10:00"
  }
}
`;
};

/**
 * Main Screenshot Analysis Method
 */
export const analyzeScreenshot = async ({
  imageBase64,
  mimeType = 'image/png',
  mode = 'auto',
  onProgress = null
}) => {
  if (!imageBase64) {
    throw new Error('No screenshot image provided.');
  }

  if (onProgress) onProgress('Encoding screenshot & preparing AI Vision payload...');

  const prompt = BUILD_ANALYSIS_PROMPT(mode);

  if (onProgress) onProgress('Transmitting to Vision Model (Extracting subjects & timetable)...');

  const rawResult = await analyzeBYOKVision({
    imageBase64,
    mimeType,
    prompt,
    systemPrompt: EXTRACTION_SYSTEM_PROMPT
  });

  if (onProgress) onProgress('Validating extracted academic structure...');

  const parsed = parseCleanJSON(rawResult);

  // Normalize subjects array
  const subjects = Array.isArray(parsed.subjects) ? parsed.subjects.map(s => ({
    name: String(s.name || s.subjectName || s.courseName || 'Unnamed Subject').trim(),
    code: s.code ? String(s.code).trim() : null,
    attended: Math.max(0, parseInt(s.attended, 10) || 0),
    total: Math.max(0, parseInt(s.total, 10) || 0),
    percentage: typeof s.percentage === 'number' ? s.percentage : 0,
    requiredPerc: parseInt(s.requiredPerc, 10) || 75
  })) : [];

  // Recalculate percentage if attended/total are valid
  subjects.forEach(s => {
    if (s.total > 0 && (!s.percentage || s.percentage === 0)) {
      s.percentage = Number(((s.attended / s.total) * 100).toFixed(2));
    }
  });

  // Normalize timetable
  const rawTt = parsed.timetable || {};
  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const timetable = {};

  validDays.forEach(day => {
    const daySchedule = rawTt[day] || rawTt[day.slice(0, 3)] || {};
    timetable[day] = {};
    for (let p = 1; p <= 8; p++) {
      const val = daySchedule[String(p)] || daySchedule[p];
      if (val !== undefined && val !== null) {
        timetable[day][String(p)] = String(val).trim();
      }
    }
  });

  // Normalize timings if present
  let classTimings = null;
  if (parsed.classTimings && typeof parsed.classTimings === 'object') {
    classTimings = {};
    for (let p = 1; p <= 8; p++) {
      if (parsed.classTimings[String(p)] || parsed.classTimings[p]) {
        classTimings[String(p)] = String(parsed.classTimings[String(p)] || parsed.classTimings[p]).trim();
      }
    }
  }

  return {
    detectedType: parsed.detectedType || (subjects.length > 0 && Object.keys(timetable.monday).length > 0 ? 'both' : subjects.length > 0 ? 'attendance' : 'timetable'),
    collegeOrPortalName: parsed.collegeOrPortalName || '',
    summary: parsed.summary || `Found ${subjects.length} subjects and weekly schedule.`,
    subjects,
    timetable,
    classTimings
  };
};

/**
 * Intelligent Matcher: Reconcile extracted data with current UserContext state
 */
export const reconcileExtractedData = ({
  extractedSubjects = [],
  extractedTimetable = {},
  currentSubjects = [],
  currentAttendance = {}
}) => {
  // Normalize string for fuzzy comparison
  const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const subjectMappings = extractedSubjects.map((extSub) => {
    const extNorm = normalize(extSub.name);
    const extCodeNorm = extSub.code ? normalize(extSub.code) : '';

    // Check if matches existing
    let matchIndex = -1;
    let matchName = '';

    currentSubjects.forEach((currSub, idx) => {
      const currNorm = normalize(currSub);
      if (currNorm === extNorm) {
        matchIndex = idx;
        matchName = currSub;
      } else if (extCodeNorm && currNorm.includes(extCodeNorm)) {
        matchIndex = idx;
        matchName = currSub;
      } else if (currNorm.length > 4 && (extNorm.includes(currNorm) || currNorm.includes(extNorm))) {
        const currHasLab = currNorm.includes('lab');
        const extHasLab = extNorm.includes('lab');
        if (currHasLab === extHasLab) {
          matchIndex = idx;
          matchName = currSub;
        }
      }
    });

    const isExisting = matchIndex !== -1;
    const currData = isExisting ? currentAttendance[matchIndex] || {} : null;

    return {
      extracted: extSub,
      isExisting,
      matchedIndex: matchIndex,
      matchedName: matchName,
      currentAttended: currData ? currData.attended : null,
      currentTotal: currData ? currData.total : null,
      selected: true // checked by default in review
    };
  });

  return {
    subjectMappings,
    hasExtractedTimetable: Object.values(extractedTimetable).some(day => Object.keys(day).length > 0)
  };
};

/**
 * Build final merged payload ready to pass to saveData() in UserContext
 */
export const buildFinalMergePayload = ({
  subjectMappings = [],
  extractedTimetable = {},
  extractedTimings = null,
  currentSubjects = [],
  currentAttendanceData = {},
  currentTimetable = {},
  currentTimings = {},
  options = {
    updateAttendance: true,
    updateTimetable: true,
    updateTimings: true,
    mergeMode: 'merge' // 'merge' (add missing + update) or 'replace' (wipe and replace)
  }
}) => {
  const finalSubjects = options.mergeMode === 'replace' ? [] : [...currentSubjects];
  const finalAttendance = options.mergeMode === 'replace' ? {} : JSON.parse(JSON.stringify(currentAttendanceData));
  const finalTimetable = options.mergeMode === 'replace' ? {} : JSON.parse(JSON.stringify(currentTimetable));
  const finalTimings = { ...currentTimings, ...(options.updateTimings && extractedTimings ? extractedTimings : {}) };

  // Map from extracted name / code to target subject index in finalSubjects
  const nameToIndexMap = new Map();

  // 1. Process subjects & attendance
  subjectMappings.forEach((mapping) => {
    if (!mapping.selected) return;

    let targetIndex = -1;
    const subName = mapping.extracted.name;

    if (options.mergeMode === 'replace') {
      targetIndex = finalSubjects.length;
      finalSubjects.push(subName);
    } else {
      if (mapping.isExisting && mapping.matchedIndex !== -1) {
        targetIndex = mapping.matchedIndex;
      } else {
        // Find if already inserted
        targetIndex = finalSubjects.findIndex(s => s.toLowerCase() === subName.toLowerCase());
        if (targetIndex === -1) {
          targetIndex = finalSubjects.length;
          finalSubjects.push(subName);
        }
      }
    }

    nameToIndexMap.set(subName.toLowerCase(), targetIndex);
    if (mapping.extracted.code) {
      nameToIndexMap.set(mapping.extracted.code.toLowerCase(), targetIndex);
    }

    if (options.updateAttendance) {
      const prevData = finalAttendance[targetIndex] || { dailyStatus: {} };
      finalAttendance[targetIndex] = {
        ...prevData,
        attended: mapping.extracted.attended,
        total: mapping.extracted.total,
        requiredPerc: mapping.extracted.requiredPerc || 75
      };
    }
  });

  // 2. Process timetable
  if (options.updateTimetable && extractedTimetable) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    days.forEach(day => {
      const daySlots = extractedTimetable[day];
      if (!daySlots) return;

      if (!finalTimetable[day]) finalTimetable[day] = {};

      for (let p = 1; p <= 8; p++) {
        const slotVal = daySlots[String(p)];
        if (slotVal === undefined) continue;

        const strVal = String(slotVal).trim();
        const lowerVal = strVal.toLowerCase();

        // Check if free / leisure / break
        if (
          lowerVal === 'free' ||
          lowerVal === '-1' ||
          lowerVal === 'break' ||
          lowerVal === 'lunch' ||
          lowerVal === 'leisure' ||
          lowerVal === 'recess' ||
          lowerVal === 'library' ||
          lowerVal === ''
        ) {
          finalTimetable[day][p] = -1;
          continue;
        }

        // Try exact name match
        let foundIndex = nameToIndexMap.get(lowerVal);

        // Try fuzzy lookup against finalSubjects
        if (foundIndex === undefined) {
          const normVal = lowerVal.replace(/[^a-z0-9]/g, '');
          foundIndex = finalSubjects.findIndex(s => {
            const sNorm = s.toLowerCase().replace(/[^a-z0-9]/g, '');
            return sNorm === normVal || sNorm.includes(normVal) || normVal.includes(sNorm);
          });

          // If timetable has a subject not yet in subjects list, add it!
          if (foundIndex === -1 && strVal.length > 1) {
            foundIndex = finalSubjects.length;
            finalSubjects.push(strVal);
            finalAttendance[foundIndex] = {
              attended: 0,
              total: 0,
              requiredPerc: 75,
              dailyStatus: {}
            };
            nameToIndexMap.set(lowerVal, foundIndex);
          }
        }

        finalTimetable[day][p] = foundIndex !== -1 && foundIndex !== undefined ? foundIndex : -1;
      }
    });
  }

  return {
    subjects: finalSubjects,
    attendanceData: finalAttendance,
    timetable: finalTimetable,
    classTimings: finalTimings
  };
};
