import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(targetDate) - +new Date();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  useEffect(() => {
    const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearTimeout(timer);
  });

  const timeBlocks = [
    { label: 'วัน', value: timeLeft.days },
    { label: 'ชั่วโมง', value: timeLeft.hours },
    { label: 'นาที', value: timeLeft.minutes },
    { label: 'วินาที', value: timeLeft.seconds },
  ];

  return (
    <div className="flex justify-center gap-3 sm:gap-5">
      {timeBlocks.map((block, index) => (
        <div key={index} className="flex flex-col items-center">
          {/* Block with gold border glow */}
          <div className="relative w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center mb-2 rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(30,27,53,0.9), rgba(19,17,30,0.95))',
              border: '1px solid rgba(212,160,23,0.35)',
              boxShadow: '0 0 16px rgba(212,160,23,0.15), inset 0 1px 0 rgba(212,160,23,0.2)',
            }}
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 opacity-20"
              style={{ background: 'linear-gradient(45deg, transparent 40%, rgba(240,201,75,0.3) 50%, transparent 60%)' }}
            />
            <span className="text-2xl sm:text-4xl font-bold relative z-10 text-gradient-gold">
              {String(block.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-[#e8dfc8]/50 tracking-widest uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
            {block.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
