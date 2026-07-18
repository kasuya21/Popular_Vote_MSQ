import React from 'react';
import { Zap } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, small = false, message = "LOADING..." }) => {
  if (small) {
    return (
      <span className="w-4 h-4 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin inline-block align-middle"></span>
    );
  }

  const loader = (
    <div className="flex flex-col items-center justify-center space-y-5">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full blur-md bg-[#d4af37]/20 animate-pulse"></div>
        {/* Spinning rings */}
        <div className="w-16 h-16 border-4 border-[#d4af37]/10 border-t-[#d4af37] rounded-full animate-spin"></div>
        <div className="absolute inset-1.5 w-13 h-13 border-4 border-[#c084fc]/10 border-b-[#c084fc] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
        <div className="absolute inset-3 w-10 h-10 border-4 border-[#4dd0c4]/10 border-l-[#4dd0c4] rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
        {/* Inner icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap size={20} className="text-[#f3e5ab] animate-pulse drop-shadow-[0_0_8px_rgba(243,229,171,0.8)]" />
        </div>
      </div>
      {message && (
        <div className="text-sm font-bold tracking-[0.2em] text-[#d4af37] animate-pulse drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]" style={{ fontFamily: "'Cinzel', serif" }}>
          {message}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(5, 5, 5, 0.85)', backdropFilter: 'blur(12px)' }}>
        {loader}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full py-16">
      {loader}
    </div>
  );
};

export default LoadingSpinner;
