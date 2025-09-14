import React, { useState } from 'react';
import { useContext } from 'react';
import { PodContext } from './PodContext';
import { UserContext } from '../context/UserContext';
import DisclaimerModal from './DisclaimerModal';

const PodCopyFeature = ({ selectedUid, memberData, modalOpen, setModalOpen }) => {
  const podContext = useContext(PodContext);
  const { currentUser, updateAttendanceData, saveData, setSubjects, setTimetable } = useContext(UserContext);
  const [copying, setCopying] = useState(false);

  if (!podContext) {
    return <div className="text-red-400 p-4">Pod context is not available. Please reload the page or check your connection.</div>;
  }

  const handleConfirm = async () => {
    setModalOpen(false);
    setCopying(true);
    setSubjects(memberData?.subjects || []);
    setTimetable(memberData?.timetable || {});
    const newAttendance = {};
    (memberData?.subjects || []).forEach((_, idx) => {
      newAttendance[idx] = { attended: 0, total: 0, requiredPerc: 75, dailyStatus: {} };
    });
    await saveData({ subjects: memberData?.subjects, timetable: memberData?.timetable, attendanceData: newAttendance });
    setCopying(false);
    alert('Your subjects and timetable have been overwritten. Attendance reset to zero.');
  };

  return (
    <div>
      <DisclaimerModal open={modalOpen} onConfirm={handleConfirm} onCancel={() => setModalOpen(false)} />
      {copying && <div className="text-yellow-400">Copying data...</div>}
    </div>
  );
};

export default PodCopyFeature;
