import React, { useEffect, useState } from 'react';
import { Trophy, Star, Moon, Crown, RefreshCw, Zap, Flame, TrendingUp, ArrowRight, Lock, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRankings, getSystemSettings } from '../services/api';
import { resolveImageUrl } from '../utils/imageUtils';
import ImageWithRetry from '../components/ImageWithRetry';
import LoadingSpinner from '../components/LoadingSpinner';

// ── Medal colours ──────────────────────────────────────────────
const RANK_META = {
  1: {
    label: 'Champion',
    gradient: 'linear-gradient(135deg, #b8860b 0%, #ffd700 40%, #ffeaa0 60%, #d4a017 100%)',
    glow: '0 0 60px rgba(255,215,0,0.7), 0 0 120px rgba(212,160,23,0.4)',
    ring: 'rgba(255,215,0,0.8)',
    text: '#ffd700',
    badge: '🏆',
    pillarH: 220,
  },
  2: {
    label: 'Runner-up',
    gradient: 'linear-gradient(135deg, #7a8695 0%, #c0c9d6 40%, #e8edf3 60%, #9baab8 100%)',
    glow: '0 0 40px rgba(192,201,214,0.6)',
    ring: 'rgba(192,201,214,0.8)',
    text: '#c0c9d6',
    badge: '🥈',
    pillarH: 170,
  },
  3: {
    label: '3rd Place',
    gradient: 'linear-gradient(135deg, #7c3d0a 0%, #cd7f32 40%, #e8a668 60%, #a0520e 100%)',
    glow: '0 0 40px rgba(205,127,50,0.6)',
    ring: 'rgba(205,127,50,0.8)',
    text: '#cd7f32',
    badge: '🥉',
    pillarH: 130,
  },
  4: { label: '4th', gradient: 'linear-gradient(135deg, #5b21b6, #7c3aed)', glow: '0 0 20px rgba(124,58,237,0.4)', ring: 'rgba(139,92,246,0.6)', text: '#a78bfa', badge: '4', pillarH: 90 },
  5: { label: '5th', gradient: 'linear-gradient(135deg, #831843, #db2777)', glow: '0 0 20px rgba(219,39,119,0.4)', ring: 'rgba(244,114,182,0.6)', text: '#f472b6', badge: '5', pillarH: 60 },
};

// ─── Live Podium Step ──────────────────────────────────────────
const PodiumStep = ({ candidate, rank }) => {
  if (!candidate) return <div className="flex-1" />;
  const meta = RANK_META[rank] || RANK_META[5];
  const isChamp = rank === 1;
  const imgSize = isChamp ? 'w-28 h-28 md:w-36 md:h-36' : rank === 2 ? 'w-22 h-22 md:w-28 md:h-28' : rank <= 3 ? 'w-18 h-18 md:w-24 md:h-24' : 'w-16 h-16 md:w-20 md:h-20';

  return (
    <div className={`flex flex-col items-center flex-1 relative`}
      style={{ order: rank === 2 ? 1 : rank === 1 ? 2 : rank === 3 ? 3 : rank === 4 ? 0 : 4 }}
    >
      {/* Champion crown + lightning */}
      {isChamp && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 animate-float z-20">
          <span className="text-3xl drop-shadow-[0_0_12px_rgba(255,215,0,0.9)]">👑</span>
        </div>
      )}

      {/* Avatar */}
      <div className="relative mb-4 group cursor-pointer hover:-translate-y-2 transition-transform duration-300">
        {/* Pulsing outer ring */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ background: meta.gradient, transform: 'scale(1.3)' }}
        />
        <div className={`rounded-full p-1 relative z-10 ${imgSize}`}
          style={{
            background: meta.gradient,
            boxShadow: meta.glow,
          }}
        >
          <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-[#0d0818]">
            <ImageWithRetry src={resolveImageUrl(candidate.profileImage)} alt={candidate.nickname} className="w-full h-full object-cover" fallback="https://placehold.co/300x400/1a1730/e8dfc8?text=No+Image" />
          </div>
        </div>

        {/* Rank badge */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center font-black text-[#0d0818] text-sm z-20 shadow-xl border-2 border-[#0d0818]/60"
          style={{ background: meta.gradient }}
        >
          {rank <= 3 ? meta.badge : `#${rank}`}
        </div>
      </div>

      {/* Name + votes */}
      <div className="text-center px-1 mb-2 sm:mb-3">
        <h4 className="font-black text-[#e8dfc8] line-clamp-1 text-[11px] sm:text-sm md:text-base drop-shadow-md" style={{ fontFamily: "'Philosopher', serif" }}>
          {candidate.nickname}
        </h4>
        <p className="text-[9px] sm:text-xs md:text-sm font-bold mt-0.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full inline-block"
          style={{ background: 'rgba(212,160,23,0.15)', border: `1px solid ${meta.ring}`, color: meta.text }}
        >
          {candidate.voteCount.toLocaleString()} <span className="hidden sm:inline">pts</span>
        </p>
      </div>

      {/* Pillar */}
      <div className="w-full rounded-t-xl relative overflow-hidden"
        style={{
          height: `${meta.pillarH}px`,
          background: `linear-gradient(180deg, ${meta.ring.replace('0.8', '0.3')} 0%, rgba(13,8,24,0.8) 100%)`,
          borderTop: `2px solid ${meta.ring}`,
          boxShadow: `inset 0 4px 20px rgba(255,255,255,0.05), ${meta.glow.split(',')[0]}`,
        }}
      >
        {/* Scan line effect */}
        <div className="absolute inset-x-0 top-0 h-px opacity-60"
          style={{ background: `linear-gradient(90deg, transparent, ${meta.text}, transparent)` }}
        />
        <div className="absolute inset-y-0 left-0 w-px opacity-30"
          style={{ background: `linear-gradient(180deg, ${meta.text}, transparent)` }}
        />
        <div className="absolute inset-y-0 right-0 w-px opacity-30"
          style={{ background: `linear-gradient(180deg, ${meta.text}, transparent)` }}
        />
        {/* Big rank number watermark */}
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-6xl md:text-8xl font-black opacity-10 select-none"
          style={{ color: meta.text, fontFamily: "'Cinzel Decorative', serif" }}
        >
          {rank}
        </span>
      </div>
    </div>
  );
};

// ─── Leaderboard Row ──────────────────────────────────────────
const LeaderboardRow = ({ candidate, rank, onClick, prevRank }) => {
  const isRising = prevRank && prevRank > rank;
  const catColor = candidate.category === 'STAR' ? '#fbbf24' : candidate.category === 'MOON' ? '#4dd0c4' : '#c084fc';
  const catLabel = candidate.category === 'STAR' ? '⭐ ดาว' : candidate.category === 'MOON' ? '🌙 เดือน' : '👑 ควีน';

  // Bar fill — normalise to max ~100%
  const barPercent = Math.max(5, Math.min(100, (candidate.voteCount / 5000) * 100));

  return (
    <div
      className="group relative flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: 'linear-gradient(135deg, rgba(23,16,58,0.85), rgba(13,8,24,0.9))',
        border: '1px solid rgba(139,92,246,0.15)',
      }}
      onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(212,160,23,0.35)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(212,160,23,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(139,92,246,0.15)'; e.currentTarget.style.boxShadow = 'none'; }}
      onClick={onClick}
    >
      {/* Progress bar bg */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute inset-y-0 left-0 rounded-2xl transition-all duration-1000"
          style={{
            width: `${barPercent}%`,
            background: `linear-gradient(90deg, rgba(212,160,23,0.06), transparent)`,
          }}
        />
      </div>

      {/* Rank */}
      <div className="w-10 sm:w-14 flex-shrink-0 text-center relative z-10">
        <span className="text-xl sm:text-2xl font-black"
          style={{ color: rank <= 3 ? '#d4a017' : 'rgba(232,223,200,0.35)', fontFamily: "'Cinzel', serif" }}
        >
          #{rank}
        </span>
        {isRising && (
          <div className="flex justify-center mt-0.5">
            <ChevronUp size={12} className="text-emerald-400" />
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex-shrink-0 relative z-10 border-2 transition-all duration-300"
        style={{ borderColor: catColor + '60' }}
      >
        <ImageWithRetry src={resolveImageUrl(candidate.profileImage)} alt={candidate.nickname} className="w-full h-full object-cover" fallback="https://placehold.co/300x400/1a1730/e8dfc8?text=No+Image" />
      </div>

      {/* Info */}
      <div className="flex-grow min-w-0 relative z-10 mx-1 sm:mx-0">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <h4 className="text-base sm:text-lg font-bold text-[#e8dfc8] truncate group-hover:text-[#f0c94b] transition-colors"
            style={{ fontFamily: "'Philosopher', serif" }}
          >
            {candidate.nickname}
          </h4>
          <span className="text-[10px] px-2 py-0.5 rounded-full hidden sm:inline tracking-wider"
            style={{ background: catColor + '20', color: catColor, border: `1px solid ${catColor}40`, fontFamily: "'Cinzel', serif" }}
          >
            {catLabel}
          </span>
        </div>
        <p className="text-xs text-[#e8dfc8]/35 truncate mt-0.5 tracking-wide">{candidate.faculty}</p>

        {/* Mini progress bar */}
        <div className="h-1 rounded-full mt-2 w-full max-w-[200px] overflow-hidden"
          style={{ background: 'rgba(139,92,246,0.15)' }}
        >
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${barPercent}%`, background: `linear-gradient(90deg, ${catColor}80, ${catColor})` }}
          />
        </div>
      </div>

      {/* Votes */}
      <div className="flex-shrink-0 text-right relative z-10">
        <div className="font-black text-base sm:text-xl text-[#f0c94b]" style={{ fontFamily: "'Philosopher', serif" }}>
          {candidate.voteCount.toLocaleString()}
        </div>
        <div className="text-[9px] sm:text-[10px] text-[#e8dfc8]/30 tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>VOTES</div>
      </div>

      {/* Arrow */}
      <ArrowRight size={16} className="text-[#e8dfc8]/20 group-hover:text-[#d4a017] group-hover:translate-x-1 transition-all hidden sm:block" />
    </div>
  );
};

// ─── Category tab config ──────────────────────────────────────
const TABS = [
  { id: 'STAR',  label: 'ดาว',  icon: Star,  color: '#fbbf24', active: 'linear-gradient(135deg,#92400e,#d97706,#fbbf24)' },
  { id: 'MOON',  label: 'เดือน', icon: Moon,  color: '#4dd0c4', active: 'linear-gradient(135deg,#164e63,#0891b2,#4dd0c4)' },
  { id: 'QUEEN', label: 'ควีน', icon: Crown, color: '#c084fc', active: 'linear-gradient(135deg,#581c87,#9333ea,#c084fc)' },
];

// ─── Main Ranking component ───────────────────────────────────
const Ranking = () => {
  const [activeTab, setActiveTab] = useState('STAR');
  const navigate = useNavigate();

  const { data: settings } = useQuery({ queryKey: ['systemSettings'], queryFn: getSystemSettings });

  const {
    data: rankings = [],
    isLoading: loading,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['rankings', activeTab],
    queryFn: () => getRankings(activeTab),
    refetchInterval: 5000, // Auto refresh every 5 seconds
  });

  const refreshing = isFetching && !loading;

  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);
  const activeTabMeta = TABS.find(t => t.id === activeTab);

  // ── Ranking closed ──────────────────────────────────────────
  if (settings && settings.isRankingVisible === false) {
    return (
      <div className="max-w-3xl mx-auto py-24 px-4 text-center flex flex-col items-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-float"
          style={{ background: 'linear-gradient(135deg, rgba(23,16,58,0.9), rgba(13,8,24,0.95))', border: '2px solid rgba(212,160,23,0.3)' }}
        >
          <Lock className="text-[#d4a017] w-12 h-12" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#f0c94b] mb-4" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
          ปิดการแสดงผลอันดับ
        </h1>
        <p className="text-[#e8dfc8]/55 mb-8 max-w-md mx-auto text-lg">
          แอดมินปิดการแสดงผลชั่วคราว คุณยังสามารถโหวตได้ตามปกติ
        </p>
        <button onClick={() => navigate('/candidates')} className="btn-primary-gradient px-10 py-3 rounded-full tracking-widest"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          ไปที่หน้าโหวต
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-14 px-4">

      {/* ── PAGE HEADER ─────────────────────────────────── */}
      <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 text-xs tracking-[0.2em] uppercase"
          style={{
            background: 'rgba(212,160,23,0.1)',
            border: '1px solid rgba(212,160,23,0.3)',
            color: '#d4a017',
            fontFamily: "'Cinzel', serif",
          }}
        >
          <Flame size={14} className="animate-pulse" />
          LIVE STANDINGS
        </div>

        <h1 className="text-4xl md:text-6xl font-black mb-3 leading-tight" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
          <span className="text-gradient-gold">อันดับ</span>
          <span className="text-[#e8dfc8]"> คะแนน</span>
        </h1>
        <p className="text-[#e8dfc8]/40 text-sm tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>
          * คะแนนอัปเดตหลังยืนยันการชำระเงิน
        </p>
      </div>

      {/* ── CATEGORY TABS ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-14">
        <div className="flex p-1 rounded-2xl w-full md:w-auto gap-1"
          style={{ background: 'rgba(13,8,24,0.8)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 md:flex-none flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-3 rounded-xl font-bold transition-all duration-300 text-[11px] sm:text-sm"
                style={{
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: '0.08em',
                  ...(isActive ? {
                    background: tab.active,
                    color: '#fff',
                    boxShadow: `0 4px 20px ${tab.color}40`,
                  } : {
                    color: 'rgba(232,223,200,0.4)',
                  }),
                }}
              >
                <Icon size={16} className={isActive ? 'fill-white' : ''} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => refetch()}
          disabled={loading || refreshing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          style={{
            background: 'rgba(23,16,58,0.8)',
            border: '1px solid rgba(212,160,23,0.25)',
            color: '#d4a017',
            fontFamily: "'Cinzel', serif",
          }}
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          อัปเดต
        </button>
      </div>

      {loading && !refreshing ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <LoadingSpinner />
          <p className="text-[#e8dfc8]/30 text-sm tracking-widest animate-pulse" style={{ fontFamily: "'Cinzel', serif" }}>
            LOADING STANDINGS...
          </p>
        </div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#e8dfc8]/30 text-lg" style={{ fontFamily: "'Cinzel', serif" }}>ยังไม่มีข้อมูลการโหวต</p>
        </div>
      ) : (
        <>
          {/* ── TOP 3 PODIUM ──────────────────────────────── */}
          {top3.length > 0 && (
            <div className="relative mb-16">
              {/* Spotlight glow behind podium */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(212,160,23,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }}
              />

              {/* Category label */}
              <div className="text-center mb-8">
                <span className="text-xs tracking-[0.25em] uppercase font-bold"
                  style={{ color: activeTabMeta?.color, fontFamily: "'Cinzel', serif" }}
                >
                  ⚡ {activeTabMeta?.label} · Top Champions
                </span>
              </div>

              {/* Podium */}
              <div className="flex items-end justify-center gap-2 sm:gap-4 pt-12 max-w-4xl mx-auto">
                {[top3[1], top3[0], top3[2]].map((c, i) => {
                  const rank = [2, 1, 3][i];
                  return c ? <PodiumStep key={c.id} candidate={c} rank={rank} /> : <div key={i} className="flex-1" />;
                })}
              </div>
              {/* Podium base platform */}
              <div className="h-4 max-w-4xl mx-auto rounded-b-2xl"
                style={{
                  background: 'linear-gradient(180deg, rgba(212,160,23,0.25) 0%, rgba(13,8,24,0.5) 100%)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(212,160,23,0.2)',
                  borderTop: 'none',
                }}
              />
            </div>
          )}

          {/* ── LEADERBOARD (rank 4+) ──────────────────────── */}
          {rest.length > 0 && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Section header */}
              <div className="flex items-center gap-3 mb-5 px-2">
                <div className="p-2 rounded-xl" style={{ background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.2)' }}>
                  <TrendingUp size={18} className="text-[#d4a017]" />
                </div>
                <h3 className="text-lg font-bold text-[#e8dfc8]" style={{ fontFamily: "'Cinzel', serif" }}>
                  อันดับอื่นๆ
                </h3>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(212,160,23,0.3), transparent)' }} />
              </div>

              {rest.map((candidate, i) => (
                <LeaderboardRow
                  key={candidate.id}
                  candidate={candidate}
                  rank={i + 4}
                  onClick={() => navigate(`/candidate/${candidate.id}`)}
                />
              ))}
            </div>
          )}

          {/* ── VOTE CTA ───────────────────────────────────── */}
          <div className="mt-14 text-center">
            <div className="inline-block p-px rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #a07510, #d4a017, #4dd0c4)' }}
            >
              <div className="px-8 py-5 rounded-2xl text-center"
                style={{ background: 'linear-gradient(135deg, rgba(13,8,24,0.97), rgba(23,16,58,0.95))' }}
              >
                <p className="text-[#e8dfc8]/60 text-sm mb-3 tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>
                  สนับสนุนผู้เข้าประกวดที่คุณชื่นชอบ
                </p>
                <button
                  onClick={() => navigate('/candidates')}
                  className="btn-primary-gradient px-10 py-3 rounded-full font-bold flex items-center gap-2 mx-auto tracking-widest"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  <Zap size={16} /> โหวตเลย
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Ranking;
