import React, { useState } from 'react';

function getDaysLeft(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  return diff;
}

function getColor(daysLeft) {
  if (daysLeft > 7) return 'bg-green-600';
  if (daysLeft > 2) return 'bg-yellow-400';
  return 'bg-red-500';
}

function getMonthDays(year, month) {
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

const DueCalendar = () => {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [manageOpen, setManageOpen] = useState(false);
  // Use local date only (no time) for today
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const monthDays = getMonthDays(viewYear, viewMonth);

  const addItem = () => {
    if (!title || !dueDate) return;
    setItems([...items, { title, dueDate }]);
    setTitle('');
    setDueDate('');
  };

  const tasksByDay = monthDays.map(day => {
    const dateStr = day.toISOString().slice(0, 10);
    return items.filter(item => item.dueDate === dateStr);
  });

  return (
    <div className="bg-white/10 p-6 rounded-xl shadow-lg mb-8">
      <h3 className="text-xl font-bold mb-2">Due Calendar</h3>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 rounded bg-indigo-700 text-white text-sm"
            onClick={() => {
              if (viewMonth === 0) {
                setViewMonth(11);
                setViewYear(viewYear - 1);
              } else {
                setViewMonth(viewMonth - 1);
              }
            }}
            aria-label="Previous Month"
          >&lt;</button>
          <span className="text-lg font-semibold text-indigo-300">{monthNames[viewMonth]} {viewYear}</span>
          <button
            className="px-2 py-1 rounded bg-indigo-700 text-white text-sm"
            onClick={() => {
              if (viewMonth === 11) {
                setViewMonth(0);
                setViewYear(viewYear + 1);
              } else {
                setViewMonth(viewMonth + 1);
              }
            }}
            aria-label="Next Month"
          >&gt;</button>
        </div>
        <button
          onClick={() => setManageOpen(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >Manage Due List</button>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-6">
        {monthDays.map((day, idx) => {
          // Use local date string (YYYY-MM-DD) for comparison
          const dateStr = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
          const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
          const tasks = items.filter(item => item.dueDate === dateStr);
          let color = 'bg-white/20';
          if (tasks.length > 0) {
            const minDaysLeft = Math.min(...tasks.map(t => getDaysLeft(t.dueDate)));
            color = getColor(minDaysLeft);
          }
          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDay(dateStr)}
              className={`rounded-lg p-2 text-center text-white font-bold ${color} ${dateStr === todayStr ? 'border-2 border-indigo-400' : ''}`}
            >
              {day.getDate()}
              {tasks.length > 0 && <span className="block text-xs mt-1">{tasks.length} task{tasks.length > 1 ? 's' : ''}</span>}
            </button>
          );
        })}
      </div>
      {selectedDay && (
        <div className="mb-4 p-4 bg-black/20 rounded-lg">
          <h4 className="font-semibold mb-2">Tasks for {selectedDay}</h4>
          <ul>
            {items.filter(item => item.dueDate === selectedDay).length === 0 ? (
              <li className="text-white/60">No tasks for this day.</li>
            ) : (
              items.filter(item => item.dueDate === selectedDay).map((item, idx) => (
                <li key={idx} className="mb-2 text-white flex justify-between items-center">
                  <span>{item.title}</span>
                  <span className="ml-2 text-xs">Due: {item.dueDate}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {manageOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-indigo-900 rounded-xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setManageOpen(false)} className="absolute top-4 right-4 text-xl bg-gray-800 hover:bg-gray-600 text-white rounded-full px-3 py-1">&times;</button>
            <h4 className="text-lg font-bold mb-4 text-white">Manage Due List</h4>
            <div className="flex flex-col gap-2 mb-4">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Title"
                className="px-3 py-2 rounded-lg border border-white/20 bg-black/20 text-white"
              />
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-white/20 bg-black/20 text-white"
              />
              <button
                onClick={addItem}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg w-full"
              >Add</button>
            </div>
            <ul>
              {items.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between mb-2 p-3 rounded-lg bg-white/10 text-white">
                  <span className="font-semibold">{item.title}</span>
                  <span className="ml-2 text-xs">Due: {item.dueDate}</span>
                  <button
                    onClick={() => setItems(items.filter((_, i) => i !== idx))}
                    className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-xs ml-2"
                  >Delete</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DueCalendar;
