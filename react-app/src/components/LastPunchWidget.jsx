import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';

const LastPunchWidget = () => {
    const { lastPunch } = useContext(UserContext);

    if (!lastPunch) return null;

    const isAttended = lastPunch.status === 'attended';
    const isBunked = lastPunch.status === 'bunked';

    return (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg flex items-center justify-between border-l-4 border-indigo-500">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    isAttended ? 'bg-green-500/20 text-green-400' : 
                    isBunked ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-white'
                }`}>
                    <i className="fas fa-history"></i>
                </div>
                <div>
                    <h4 className="text-xs text-white/50 uppercase tracking-wider font-bold">Last Activity</h4>
                    <div className="text-sm font-medium text-white">
                        {lastPunch.subjectName === "Batch Update" ? "Bulk Update" : lastPunch.subjectName}
                        {lastPunch.period !== "-" && <span className="text-white/60 ml-1">(P{lastPunch.period})</span>}
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-xs text-white/80">{lastPunch.date}</div>
                <div className="text-xs text-white/50">{lastPunch.time}</div>
            </div>
        </div>
    );
};

export default LastPunchWidget;