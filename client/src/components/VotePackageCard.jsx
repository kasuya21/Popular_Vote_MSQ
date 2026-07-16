import React from 'react';
import { CheckCircle2, Zap } from 'lucide-react';

const VotePackageCard = ({ pkg, isSelected, onClick, compact = false }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl transition-all duration-300 cursor-pointer
        ${isSelected
          ? 'scale-[1.03] shadow-[0_0_35px_rgba(212,160,23,0.5)]'
          : 'hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(212,160,23,0.2)]'
        }
      `}
      style={{
        background: isSelected
          ? 'linear-gradient(135deg, rgba(30,27,53,0.98), rgba(19,17,30,0.95))'
          : compact
          ? 'rgba(10,9,16,0.6)'
          : 'linear-gradient(135deg, rgba(19,17,30,0.95), rgba(30,27,53,0.9))',
        border: isSelected
          ? '1.5px solid rgba(212,160,23,0.7)'
          : '1.5px solid rgba(212,160,23,0.2)',
        backdropFilter: 'blur(16px)',
      }}
      onClick={onClick}
    >
      {/* Selection glow ring */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 30px rgba(212,160,23,0.1)' }}
        />
      )}

      {/* Selection checkmark */}
      {isSelected && (
        <div className="absolute top-4 right-4 z-10">
          <CheckCircle2 size={26} className="text-[#f0c94b]" style={{ filter: 'drop-shadow(0 0 8px rgba(240,201,75,0.7))' }} />
        </div>
      )}

      {/* Package Header */}
      <div className="p-6">
        {/* Title */}
        <div className="flex items-center gap-2 mb-1">
          <Zap size={14} className="text-[#d4a017]" />
          <h3 className="text-base font-bold tracking-wide text-[#e8dfc8]" style={{ fontFamily: "'Cinzel', serif" }}>
            {pkg.title}
          </h3>
        </div>

        {/* Vote amount */}
        <div className="flex items-end gap-2 mb-6 mt-4">
          <span className="text-5xl font-black tracking-tight text-gradient-gold" style={{ fontFamily: "'Philosopher', serif" }}>
            {pkg.voteAmount}
          </span>
          <span className="text-base font-medium mb-1 text-[#d4a017]/70" style={{ fontFamily: "'Cinzel', serif" }}>
            โหวต
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-5 border-t border-[#d4a017]/15">
          <span className="text-sm text-[#e8dfc8]/45 tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>ราคา</span>
          <span className="text-2xl font-bold text-[#f0c94b] flex items-center gap-0.5" style={{ fontFamily: "'Philosopher', serif" }}>
            <span className="text-sm font-normal text-[#d4a017]/70 align-top mt-1">฿</span>
            {pkg.price}
          </span>
        </div>
      </div>

      {/* Decorative shimmer bottom bar */}
      <div className="h-0.5 w-full"
        style={{ background: isSelected ? 'linear-gradient(90deg, #a07510, #f0c94b, #4dd0c4, #f0c94b, #a07510)' : 'linear-gradient(90deg, transparent, rgba(212,160,23,0.3), transparent)' }}
      />
    </div>
  );
};

export default VotePackageCard;
