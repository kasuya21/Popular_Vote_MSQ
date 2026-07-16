import React from 'react';
import { Star, Moon, Heart, Crown } from 'lucide-react';
import { resolveImageUrl } from '../utils/imageUtils';
import ImageWithRetry from './ImageWithRetry';

const CandidateCard = ({ candidate, onClick }) => {
  const isStar = candidate.category === 'STAR';
  const isMoon = candidate.category === 'MOON';
  const isQueen = candidate.category === 'QUEEN';

  const Icon = isStar ? Star : (isQueen ? Crown : Moon);

  // Category colours in the Olympus palette
  let badgeLabel = 'ผู้เข้าประกวด';
  let badgeStyle = {};
  let iconClass = 'text-[#e8dfc8]';
  let glowStyle = {};

  if (isStar) {
    badgeLabel = 'ดาว · Star';
    badgeStyle = { background: 'rgba(212,160,23,0.2)', border: '1px solid rgba(212,160,23,0.4)', color: '#f0c94b' };
    iconClass = 'text-[#f0c94b] fill-[#f0c94b]';
    glowStyle = { '--hover-glow': '0 0 45px rgba(212,160,23,0.35)' };
  } else if (isMoon) {
    badgeLabel = 'เดือน · Moon';
    badgeStyle = { background: 'rgba(77,208,196,0.15)', border: '1px solid rgba(77,208,196,0.35)', color: '#4dd0c4' };
    iconClass = 'text-[#4dd0c4] fill-[#4dd0c4]';
    glowStyle = { '--hover-glow': '0 0 45px rgba(77,208,196,0.35)' };
  } else if (isQueen) {
    badgeLabel = 'ควีน · Queen';
    badgeStyle = { background: 'rgba(192,132,252,0.15)', border: '1px solid rgba(192,132,252,0.35)', color: '#c084fc' };
    iconClass = 'text-[#c084fc] fill-[#c084fc]';
    glowStyle = { '--hover-glow': '0 0 45px rgba(192,132,252,0.35)' };
  }

  return (
    <div
      className="glass-card overflow-hidden flex flex-col group relative cursor-pointer transition-all duration-500"
      onClick={onClick}
    >
      {/* Vote Count Badge */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold shadow-lg group-hover:scale-105 transition-transform duration-300"
        style={{
          background: 'rgba(10,9,16,0.85)',
          border: '1px solid rgba(212,160,23,0.3)',
          backdropFilter: 'blur(12px)',
          color: '#f0c94b',
        }}
      >
        <Heart size={14} className="text-[#d4a017] fill-[#d4a017]" />
        <span className="font-sans">{candidate.voteCount?.toLocaleString() || 0}</span>
      </div>

      {/* Image Container */}
      <div className="aspect-[3/4] relative overflow-hidden" style={{ background: '#0f0d1f' }}>
        <ImageWithRetry
          src={resolveImageUrl(candidate.profileImage)}
          alt={candidate.nickname}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          loading="lazy"
          fallback="https://placehold.co/300x400/1a1730/e8dfc8?text=No+Image"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(10,9,16,0.95) 0%, rgba(10,9,16,0.4) 45%, rgba(10,9,16,0.1) 100%)' }}
        />
        {/* Gold shimmer on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"
          style={{ background: 'linear-gradient(135deg, rgba(212,160,23,0.2) 0%, transparent 60%)' }}
        />

        {/* Card Content Over Image */}
        <div className="absolute bottom-0 left-0 w-full p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
          {/* Category + Number badges */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5"
              style={{ ...badgeStyle, backdropFilter: 'blur(8px)', fontFamily: "'Cinzel', serif" }}
            >
              <Icon size={10} className={iconClass} />
              {badgeLabel}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#e8dfc8]/20 text-[#e8dfc8]/70"
              style={{ background: 'rgba(10,9,16,0.6)', backdropFilter: 'blur(8px)', fontFamily: "'Cinzel', serif" }}
            >
              No. {candidate.candidateNumber}
            </span>
          </div>

          <h3 className="text-3xl font-black mb-0.5 tracking-tight text-[#e8dfc8] drop-shadow-lg" style={{ fontFamily: "'Philosopher', serif" }}>
            {candidate.nickname}
          </h3>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-5 flex-grow flex flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(19,17,30,0.9), rgba(30,27,53,0.85))' }}
      >
        {/* Decorative gold line */}
        <div className="absolute top-0 left-6 right-6 h-px opacity-30"
          style={{ background: 'linear-gradient(90deg, transparent, #d4a017, transparent)' }}
        />

        <div className="mt-2">
          <p className="text-sm text-[#e8dfc8]/45 mb-5 flex items-center gap-2 justify-center tracking-wide">
            {candidate.faculty}
            {candidate.year && <><span className="w-1 h-1 rounded-full bg-[#d4a017]/40 inline-block" /> ปี {candidate.year}</>}
          </p>

          <div className="block w-full text-center py-3.5 rounded-2xl font-bold btn-primary-gradient opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-300 tracking-widest text-sm"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            ดูโปรไฟล์และโหวต
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
