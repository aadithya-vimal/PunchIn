import React from 'react';

const NotificationBanner = ({ message, type = 'info', onClose }) => {
  if (!message) return null;
  const color = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-indigo-600';
  return (
    <div className={`fixed top-0 left-0 w-full z-[9999] p-4 text-white text-center font-bold ${color} shadow-lg`}>
      {message}
      <button onClick={onClose} className="ml-4 px-3 py-1 bg-black/30 rounded hover:bg-black/50">Dismiss</button>
    </div>
  );
};

export default NotificationBanner;
