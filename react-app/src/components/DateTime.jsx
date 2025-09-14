import React, { useState, useEffect } from 'react';

const DateTime = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Format full date and time for desktop
  const fullDate = now.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  // Format short date for mobile
  const shortDate = now.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'numeric',
    year: '2-digit',
  });

  return (
    <div
      className="
        fixed top-6 left-6 z-50 bg-black/20 backdrop-blur-md
        px-3 py-1.5 rounded-xl min-w-[6rem] sm:min-w-[12rem]
        text-white font-mono select-none flex justify-between items-center
        text-xs sm:text-sm md:text-base
      "
      title={`${fullDate} ${time}`}
    >
      <span className="inline sm:hidden">{shortDate}</span>
      <span className="hidden sm:inline">{fullDate}</span>
      <span className="ml-2">{time}</span>
    </div>
  );
};

export default DateTime;
