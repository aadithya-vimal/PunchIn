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

const DueList = () => {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [manageOpen, setManageOpen] = useState(false);

  const addItem = () => {
    if (!title || !dueDate) return;
    setItems([...items, { title, dueDate }]);
    setTitle('');
    setDueDate('');
  };

  const deleteItem = idx => {
    setItems(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-white/10 p-6 rounded-xl shadow-lg mb-8">
      <h3 className="text-xl font-bold mb-4">Due List</h3>
      <button
        onClick={() => setManageOpen(true)}
        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg mb-4"
      >Manage Due List</button>
      <ul>
        {items.map((item, idx) => {
          const daysLeft = getDaysLeft(item.dueDate);
          const color = getColor(daysLeft);
          return (
            <li key={idx} className={`flex items-center justify-between mb-2 p-3 rounded-lg ${color} text-white`}>
              <span className="font-semibold">{item.title}</span>
              <span>{daysLeft >= 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Past Due'}</span>
              <span className="ml-2 text-xs">Due: {item.dueDate}</span>
            </li>
          );
        })}
      </ul>
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
                    onClick={() => deleteItem(idx)}
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

export default DueList;
