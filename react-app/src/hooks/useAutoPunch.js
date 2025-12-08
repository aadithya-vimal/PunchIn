import { useEffect, useRef } from 'react';

const useAutoPunch = ({
  autoPunch,
  timetable,
  attendanceData,
  subjects,
  classTimings,
  dailyOverrides,
  batchPunchIn
}) => {
  // Use Refs to hold the latest data without triggering effect re-runs
  const dataRef = useRef({ timetable, attendanceData, subjects, classTimings, dailyOverrides });

  // Update refs whenever data changes
  useEffect(() => {
    dataRef.current = { timetable, attendanceData, subjects, classTimings, dailyOverrides };
  }, [timetable, attendanceData, subjects, classTimings, dailyOverrides]);

  useEffect(() => {
    if (!autoPunch) return;

    const runAutoCheck = () => {
      const { timetable, attendanceData, subjects, classTimings, dailyOverrides } = dataRef.current;
      
      const now = new Date();
      const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const dateStr = now.toISOString().slice(0, 10);
      // Use standard time format HH:MM
      const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

      const daySchedule = timetable[dayName];
      if (!daySchedule) return;

      const punchesNeeded = [];

      Object.entries(daySchedule).forEach(([period, defaultSubjectIndex]) => {
        const startTime = classTimings[period];
        if (!startTime) return;

        // Check if class has started (Current Time >= Start Time)
        // Simple string comparison works for "09:00" vs "09:05" formats
        if (currentTime >= startTime) {
          // Determine actual subject (handle overrides)
          const overrideIndex = dailyOverrides[dateStr]?.[period];
          const finalSubjectIndex = overrideIndex !== undefined ? overrideIndex : defaultSubjectIndex;

          // Check if already punched
          const currentData = attendanceData[finalSubjectIndex];
          const alreadyMarked = currentData?.dailyStatus?.[dateStr]?.[period];

          // Only punch if NOT marked and subject exists
          if (!alreadyMarked && subjects[finalSubjectIndex]) {
            punchesNeeded.push({
              date: dateStr,
              period: period,
              subjectIndex: finalSubjectIndex,
              status: 'attended' // Default: Mark Present
            });
          }
        }
      });

      if (punchesNeeded.length > 0) {
        console.log("Auto-Punching:", punchesNeeded);
        batchPunchIn(punchesNeeded);
      }
    };

    // Run check immediately, then every 30 seconds
    runAutoCheck();
    const interval = setInterval(runAutoCheck, 30000);

    return () => clearInterval(interval);
  }, [autoPunch, batchPunchIn]); // Only re-run if on/off toggle changes
};

export default useAutoPunch;