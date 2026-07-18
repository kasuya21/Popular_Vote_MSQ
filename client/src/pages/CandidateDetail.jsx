import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Moon, Crown, Heart, ArrowLeft, Lock } from 'lucide-react';
import { getCandidateById, getRankings, getSystemSettings } from '../services/api';
import { resolveImageUrl } from '../utils/imageUtils';
import ImageWithRetry from '../components/ImageWithRetry';
import LoadingSpinner from '../components/LoadingSpinner';

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: settings = { isRankingVisible: true } } = useQuery({
    queryKey: ['settings'],
    queryFn: getSystemSettings
  });

  const { data: candidate, isLoading: candidateLoading } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => getCandidateById(id)
  });

  const { data: rankings = [] } = useQuery({
    queryKey: ['rankings', candidate?.category],
    queryFn: () => getRankings(candidate?.category),
    enabled: !!candidate?.category && settings.isRankingVisible
  });

  const loading = candidateLoading;
  const topVotes = rankings.length > 0 ? Math.max(rankings[0].voteCount, candidate?.voteCount || 0) : candidate?.voteCount || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-[#e8dfc8]">ไม่พบผู้สมัคร</h2>
        <button onClick={() => navigate('/candidates')} className="mt-4 text-[#d4a017] hover:underline">กลับไปหน้าผู้สมัคร</button>
      </div>
    );
  }

  const isStar = candidate.category === 'STAR';
  const isQueen = candidate.category === 'QUEEN';
  const isMoon = candidate.category === 'MOON';
  const Icon = isStar ? Star : (isQueen ? Crown : Moon);

  let badgeStyle = {};
  let badgeLabel = 'ผู้เข้าประกวด';
  let iconClass = 'text-[#e8dfc8]';
  let accentColor = '#d4a017';

  if (isStar) {
    badgeStyle = { background: 'rgba(240,201,75,0.15)', border: '1px solid rgba(240,201,75,0.4)', color: '#f0c94b' };
    badgeLabel = 'ดาว · Star';
    iconClass = 'text-[#f0c94b] fill-[#f0c94b]';
    accentColor = '#f0c94b';
  } else if (isMoon) {
    badgeStyle = { background: 'rgba(77,208,196,0.15)', border: '1px solid rgba(77,208,196,0.4)', color: '#4dd0c4' };
    badgeLabel = 'เดือน · Moon';
    iconClass = 'text-[#4dd0c4] fill-[#4dd0c4]';
    accentColor = '#4dd0c4';
  } else if (isQueen) {
    badgeStyle = { background: 'rgba(192,132,252,0.15)', border: '1px solid rgba(192,132,252,0.4)', color: '#c084fc' };
    badgeLabel = 'ควีน · Queen';
    iconClass = 'text-[#c084fc] fill-[#c084fc]';
    accentColor = '#c084fc';
  }

  const percentToTop = topVotes > 0 ? Math.min(100, Math.round((candidate.voteCount / topVotes) * 100)) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back button */}
      <button
        onClick={() => navigate('/candidates')}
        className="flex items-center gap-2 font-medium mb-8 transition-colors"
        style={{ color: 'rgba(232,223,200,0.6)' }}
        onMouseEnter={e => e.currentTarget.style.color = accentColor}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,223,200,0.6)'}
      >
        <ArrowLeft size={20} /> กลับไปหน้าผู้สมัคร
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left Col: Image */}
        <div>
          <div className="overflow-hidden rounded-3xl shadow-2xl" style={{ border: `1px solid ${accentColor}40` }}>
            <ImageWithRetry
              src={resolveImageUrl(candidate.profileImage)}
              alt={candidate.nickname}
              className="w-full h-auto aspect-[3/4] object-cover"
              fallback="https://placehold.co/400x500/1a1730/e8dfc8?text=No+Image"
            />
          </div>
        </div>

        {/* Right Col: Info & Voting */}
        <div className="flex flex-col">
          {/* Name & badges */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ ...badgeStyle, fontFamily: "'Cinzel', serif" }}>
                <Icon size={12} className={iconClass} />
                {badgeLabel}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full" style={{ background: 'rgba(232,223,200,0.08)', border: '1px solid rgba(232,223,200,0.2)', color: 'rgba(232,223,200,0.7)', fontFamily: "'Cinzel', serif" }}>
                No. {candidate.candidateNumber}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black mb-2 text-[#e8dfc8]" style={{ fontFamily: "'Philosopher', serif" }}>
              {candidate.nickname}
            </h1>
            <p className="text-lg font-medium" style={{ color: accentColor }}>
              {candidate.faculty}
            </p>
          </div>

          {/* Vote score card */}
          <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(23,17,56,0.7)', border: `1px solid ${accentColor}30`, backdropFilter: 'blur(12px)' }}>
            {!settings.isRankingVisible ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#151226] border border-[#d4a017]/30 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(212,160,23,0.15)]">
                  <Lock size={32} className="text-[#d4a017]" />
                </div>
                <h3 className="text-xl font-bold text-[#e8dfc8] mb-1">คะแนนถูกซ่อน</h3>
                <p className="text-sm text-[#e8dfc8]/60">รอลุ้นผลคะแนน</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: 'rgba(232,223,200,0.5)' }}>คะแนนปัจจุบัน</p>
                    <div className="flex items-center gap-2 text-3xl font-bold text-[#e8dfc8]">
                      <Heart size={26} className="fill-rose-400 text-rose-400" />
                      {candidate.voteCount.toLocaleString()}
                      <span className="text-base font-normal" style={{ color: 'rgba(232,223,200,0.5)' }}>โหวต</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold block mb-1" style={{ color: 'rgba(232,223,200,0.5)' }}>เทียบกับอันดับ 1</span>
                    <span className="text-xl font-bold" style={{ color: accentColor }}>{percentToTop}%</span>
                  </div>
                </div>
                <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: 'rgba(232,223,200,0.08)' }}>
                  <div
                    className="h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentToTop}%`, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}aa)` }}
                  />
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
