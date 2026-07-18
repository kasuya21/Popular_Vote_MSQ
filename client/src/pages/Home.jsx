import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, ArrowRight, Activity, Heart, Crown, Star, Moon } from 'lucide-react';
import CandidateCard from '../components/CandidateCard';
import VotePackageCard from '../components/VotePackageCard';
import CountdownTimer from '../components/CountdownTimer';
import { getCandidates, getVotePackages, getSystemSettings } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();

  const { data: candidates, isLoading: isCandidatesLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: getCandidates
  });

  const { data: packages, isLoading: isPackagesLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: getVotePackages
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSystemSettings
  });

  const topCandidates = React.useMemo(() => {
    if (!candidates) return [];
    const categories = ['STAR', 'MOON', 'QUEEN'];
    return categories.map(cat => {
      const catCands = candidates.filter(c => c.category === cat);
      catCands.sort((a, b) => b.voteCount - a.voteCount);
      return catCands[0];
    }).filter(Boolean);
  }, [candidates]);

  const popularPackages = packages ? packages.slice(0, 3) : [];
  const totalVotes = candidates ? candidates.reduce((sum, c) => sum + c.voteCount, 0) : 0;

  return (
    <div className="space-y-28 pb-20">

      {/* ══════════ HERO ══════════ */}
      <section className="relative pt-20 md:pt-32 pb-10 overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.07) 0%, transparent 70%)' }}
        />
        <div className="absolute -top-20 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(77,208,196,0.06) 0%, transparent 70%)' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.03) 0%, transparent 70%)' }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-5xl mx-auto px-4">

            {/* Crown badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-10 text-sm font-bold animate-in fade-in slide-in-from-bottom-4 duration-700 tracking-widest"
              style={{
                background: 'rgba(212,175,55,0.1)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: '#f3e5ab',
                backdropFilter: 'blur(12px)',
                fontFamily: "'Cinzel', serif",
              }}
            >
              <Crown size={14} className="text-[#f0c94b]" />
              <span>MSQ 2026 · 22 JULY 2026</span>
            </div>

            {/* Headline */}
            <h1 className="font-black mb-6 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              <span className="block text-[#f5f5f5]/80 text-xl md:text-3xl mb-3 tracking-[0.18em]" style={{ fontFamily: "'Cinzel', serif" }}>
                MSQ AND THE AMBASSADOR
              </span>
              <span className="text-gradient-gold text-4xl md:text-6xl lg:text-7xl" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                OF SCIENCE
              </span>
              <br />
              <span className="text-gradient-silver text-3xl md:text-5xl lg:text-6xl" style={{ fontFamily: "'Cinzel', serif" }}>
                TECHNOLOGY 2026
              </span>
            </h1>

            {/* Category badges */}
            <div className="flex justify-center gap-3 mb-8 flex-wrap animate-in fade-in duration-700 delay-150">
              {[
                { label: 'STAR', color: '#f0c94b', bg: 'rgba(240,201,75,0.12)', border: 'rgba(240,201,75,0.3)', Icon: Star },
                { label: 'MOON', color: '#4dd0c4', bg: 'rgba(77,208,196,0.12)', border: 'rgba(77,208,196,0.3)', Icon: Moon },
                { label: 'QUEEN', color: '#c084fc', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.3)', Icon: Crown },
              ].map(({ label, color, bg, border, Icon }) => (
                <span key={label}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full tracking-widest"
                  style={{ background: bg, border: `1px solid ${border}`, color, fontFamily: "'Cinzel', serif" }}>
                  <Icon size={11} className="fill-current" /> {label}
                </span>
              ))}
            </div>

            {/* Sub */}
            <p className="text-base md:text-lg text-[#dcdcdc]/80 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              ร่วมเป็นส่วนหนึ่งในค่ำคืนแห่งเกียรติยศ
              <br className="hidden md:block" />
              โหวตให้กับผู้ที่เหมาะสมกับตำแหน่ง Ambassador มากที่สุด
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link to="/candidates"
                className="btn-primary-gradient px-10 py-4 rounded-full text-base font-bold flex items-center justify-center gap-3 w-full sm:w-auto tracking-widest transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ fontFamily: "'Cinzel', serif" }}>
                ดูผู้สมัครทั้งหมด <ArrowRight size={18} />
              </Link>
              <Link to="/ranking"
                className="btn-outline-glass px-10 py-4 rounded-full text-base w-full sm:w-auto flex items-center justify-center gap-3 tracking-widest"
                style={{ fontFamily: "'Cinzel', serif" }}>
                <Trophy size={18} /> ดูอันดับคะแนน
              </Link>
            </div>

            {/* Stats Row */}
            <div className="mt-16 pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-1000 delay-500"
              style={{ borderTop: '1px solid rgba(212,160,23,0.12)' }}
            >
              <div className="glass-card p-5 flex flex-col items-center justify-center">
                <p className="text-3xl md:text-4xl font-black mb-1 text-gradient-gold">
                  {candidates ? candidates.length : '—'}
                </p>
                <p className="text-[10px] text-[#f5f5f5]/50 font-bold uppercase tracking-[0.15em]" style={{ fontFamily: "'Cinzel', serif" }}>
                  ผู้สมัคร
                </p>
              </div>

              <div className="glass-card p-5 flex flex-col items-center justify-center">
                <p className="text-3xl md:text-4xl font-black mb-1 text-gradient-silver">
                  {totalVotes > 0 ? totalVotes.toLocaleString() : '—'}
                </p>
                <p className="text-[10px] text-[#f5f5f5]/50 font-bold uppercase tracking-[0.15em]" style={{ fontFamily: "'Cinzel', serif" }}>
                  คะแนนรวม
                </p>
              </div>

              <div className="col-span-2 glass-card p-5 flex flex-col items-center justify-center">
                <p className="text-[11px] text-[#d4af37] font-bold uppercase tracking-[0.15em] mb-4 flex items-center gap-2" style={{ fontFamily: "'Cinzel', serif" }}>
                  <Activity size={13} className="animate-pulse" /> ปิดโหวตในอีก
                </p>
                <div className="scale-110 origin-center">
                  <CountdownTimer targetDate={new Date('2026-07-22T22:00:00+07:00')} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ Featured Candidates ══════════ */}
      {(!settings || settings.isRankingVisible !== false) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-[#d4af37] mb-2 flex items-center gap-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Trophy size={12} /> Hall of Fame
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#f5f5f5]">ผู้นำคะแนนโหวต</h2>
            <p className="text-[#dcdcdc]/60 mt-1 text-sm">ผู้เข้าประกวดที่ได้รับคะแนนสูงสุดในขณะนี้</p>
          </div>
          <Link to="/ranking"
            className="hidden sm:flex items-center gap-1.5 text-sm transition-colors tracking-wide"
            style={{ color: 'rgba(232,223,200,0.5)', fontFamily: "'Cinzel', serif" }}
            onMouseEnter={e => e.currentTarget.style.color = '#f0c94b'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,223,200,0.5)'}
          >
            ดูอันดับทั้งหมด <ArrowRight size={15} />
          </Link>
        </div>

        {isCandidatesLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex overflow-x-auto md:overflow-visible snap-x snap-mandatory md:flex md:flex-row md:justify-center gap-6 md:gap-8 pt-4 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {topCandidates.map((candidate) => (
              <div key={candidate.id} className="relative min-w-[220px] w-[65vw] md:w-[260px] snap-center flex-shrink-0">
                <div className="absolute -top-3 -left-3 h-9 px-4 rounded-full flex items-center justify-center font-bold text-xs shadow-xl z-10 text-[#0a0910] tracking-wider"
                  style={{
                    background: candidate.category === 'STAR' 
                      ? 'linear-gradient(135deg, #f0c94b, #d4a017)'
                      : candidate.category === 'MOON' 
                        ? 'linear-gradient(135deg, #4dd0c4, #2bbba6)'
                        : 'linear-gradient(135deg, #c084fc, #a855f7)',
                    border: '2px solid rgba(10,9,16,0.6)',
                    fontFamily: "'Cinzel', serif",
                  }}
                >
                  TOP {candidate.category}
                </div>
                <CandidateCard candidate={candidate} onClick={() => navigate(`/candidate/${candidate.id}`)} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center sm:hidden">
          <Link to="/ranking" className="inline-flex items-center gap-1.5 text-sm transition-colors" style={{ color: 'rgba(232,223,200,0.5)' }}>
            ดูอันดับทั้งหมด <ArrowRight size={15} />
          </Link>
        </div>
      </section>
      )}

    </div>
  );
};

export default Home;
