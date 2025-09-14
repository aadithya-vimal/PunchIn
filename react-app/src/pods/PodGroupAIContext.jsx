import React, { useContext } from 'react';
import { AIContext } from '../context/AIContext';
import { PodContext } from './PodContext';
import { UserContext } from '../context/UserContext';

export const PodGroupAIContext = React.createContext();

export const PodGroupAIProvider = ({ children }) => {
  const { getBunkRecommendation } = useContext(AIContext);
  const { podMembers, getMemberData } = useContext(PodContext);
  const { currentUser, attendanceData, subjects, timetable } = useContext(UserContext);

  // Get group bunk recommendation
  const getGroupBunkRecommendation = async (selectedUids) => {
    // Fetch data for all selected members
    const groupData = [];
    for (const uid of selectedUids) {
      let memberSubjects = subjects;
      let memberTimetable = timetable;
      let memberAttendance = attendanceData;
      if (uid !== currentUser.uid) {
        const member = await getMemberData(uid);
        memberSubjects = member.subjects || [];
        memberTimetable = member.timetable || {};
        memberAttendance = {}; // For demo, not fetching attendance
      }
      groupData.push({ uid, subjects: memberSubjects, timetable: memberTimetable, attendance: memberAttendance });
    }
    // Build prompt for AI
    const prompt = `You are a collaborative academic planner. Given the following group data, recommend the best day for a group bunk that minimizes academic risk for all members. For each member, show at-risk subjects and attendance. If no safe day exists, explain why.\n\n${groupData.map(m => `Member: ${m.uid}\nSubjects: ${m.subjects.join(', ')}\nTimetable: ${JSON.stringify(m.timetable)}\nAttendance: ${JSON.stringify(m.attendance)}`).join('\n\n')}`;
    return await getBunkRecommendation(prompt);
  };

  return <PodGroupAIContext.Provider value={{ getGroupBunkRecommendation }}>{children}</PodGroupAIContext.Provider>;
};
