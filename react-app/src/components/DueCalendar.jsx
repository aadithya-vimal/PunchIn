import React, { useState, useEffect, useContext } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserContext } from '../context/UserContext.jsx';

function getDaysLeft(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  return diff;
}

function getMonthDays(year, month) {
  const days = [];
  const lastDay = new Date(year, month + 1, 0);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

const DueCalendar = () => {
  const { currentUser } = useContext(UserContext);
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [manageOpen, setManageOpen] = useState(false);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const monthDays = getMonthDays(viewYear, viewMonth);

  useEffect(() => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setItems(data.dueItems || []);
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  const addItem = (e) => {
    e?.preventDefault();
    if (!title.trim() || !dueDate) return;
    const newItems = [...items, { title: title.trim(), dueDate }];
    setItems(newItems);
    setTitle('');
    setDueDate('');
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      setDoc(userDocRef, { dueItems: newItems }, { merge: true });
    }
  };

  const removeItem = (idx) => {
    const newItems = items.filter((_, i) => i !== idx);
    setItems(newItems);
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      setDoc(userDocRef, { dueItems: newItems }, { merge: true });
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  return (
    <div className="apple-card p-5 sm:p-6 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <i className="fas fa-calendar-check text-sky-400"></i>
              Deadlines & Dues
            </h3>
            <span className="apple-badge text-[10px]">{items.length} Pending</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setManageOpen(!manageOpen)}
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors p-1"
              title="Manage tasks"
            >
              <i className={`fas ${manageOpen ? 'fa-calendar' : 'fa-list-check'}`}></i>
            </button>
            <div className="flex items-center gap-1 ml-2">
              <button 
                onClick={prevMonth} 
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center text-xs"
              >
                <i className="fas fa-chevron-left text-[10px]"></i>
              </button>
              <button 
                onClick={nextMonth} 
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center text-xs"
              >
                <i className="fas fa-chevron-right text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Month Title */}
        <div className="text-xs font-semibold text-white/80 mb-3 font-mono">
          {monthNames[viewMonth]} {viewYear}
        </div>

        {/* View Mode: Calendar vs Manage */}
        {!manageOpen ? (
          <div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-white/40 uppercase mb-2">
              {['S','M','T','W','T','F','S'].map((d, i) => <div key={i}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Padding offset for first day */}
              {Array.from({ length: new Date(viewYear, viewMonth, 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8"></div>
              ))}

              {monthDays.map(day => {
                const dateStr = day.toISOString().slice(0, 10);
                const dayTasks = items.filter(it => it.dueDate === dateStr);
                const isCurrentDay = day.getTime() === today.getTime();
                const isSelected = selectedDay === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDay(selectedDay === dateStr ? null : dateStr)}
                    className={`h-8 rounded-xl flex flex-col items-center justify-center text-xs font-mono relative transition-all ${
                      isSelected
                        ? 'bg-sky-500 text-white font-bold shadow-md'
                        : isCurrentDay
                          ? 'border border-sky-400 text-sky-300 font-bold'
                          : 'hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <span>{day.getDate()}</span>
                    {dayTasks.length > 0 && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-400'} absolute bottom-1`}></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected day preview */}
            {selectedDay && (
              <div className="mt-4 p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs">
                <span className="font-mono text-[10px] text-white/50 block mb-1">Items due on {selectedDay}:</span>
                {items.filter(it => it.dueDate === selectedDay).length === 0 ? (
                  <p className="text-white/40 italic text-[11px]">No deadlines on this date.</p>
                ) : (
                  <div className="space-y-1.5">
                    {items.filter(it => it.dueDate === selectedDay).map((it, i) => (
                      <div key={i} className="flex items-center justify-between text-white font-medium">
                        <span>&bull; {it.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Manage Task List */
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {items.length === 0 ? (
              <p className="text-xs text-white/40 italic py-4 text-center">No assignments or project dues tracked.</p>
            ) : (
              items.map((it, idx) => {
                const diff = getDaysLeft(it.dueDate);
                return (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{it.title}</div>
                      <div className="text-[10px] font-mono text-white/40">Due: {it.dueDate} ({diff >= 0 ? `${diff}d left` : 'Overdue'})</div>
                    </div>
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-white/40 hover:text-rose-400 transition-colors p-1"
                    >
                      <i className="fas fa-trash-alt text-[10px]"></i>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Quick Add Form */}
      <form onSubmit={addItem} className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="New assignment or exam..."
          className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-sky-500"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={!title.trim() || !dueDate}
            className="apple-btn-secondary text-xs px-3 py-1.5 shrink-0 disabled:opacity-40"
          >
            + Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default DueCalendar;
