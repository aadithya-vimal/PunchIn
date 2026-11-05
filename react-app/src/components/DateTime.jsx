import React, { useState, useEffect } from 'react';

const DateTime = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fullDate = now.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="
        inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full
        bg-white/[0.04] border border-white/10 text-white/80
        font-mono text-xs select-none backdrop-blur-md
      "
      title={`${fullDate} ${time}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
      <span>{fullDate}</span>
      <span className="text-white/30 font-sans">|</span>
      <span className="text-white font-medium">{time}</span>
    </div>
  );
};

export default DateTime;
