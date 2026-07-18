import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Star, Moon, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CandidateCard from '../components/CandidateCard';
import { getCandidates, getSystemSettings } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const categoryTabs = [
  { id: 'ALL', label: 'ทั้งหมด', icon: Filter },
  { id: 'STAR', label: 'ดาว · Star', icon: Star },
  { id: 'MOON', label: 'เดือน · Moon', icon: Moon },
  { id: 'QUEEN', label: 'ควีน · Queen', icon: Crown },
];

const Candidates = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { data: settings = { isRankingVisible: true } } = useQuery({
    queryKey: ['settings'],
    queryFn: getSystemSettings
  });

  const { data: allCandidates = [], isLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: getCandidates
  });

  const filteredCandidates = allCandidates.filter(candidate => {
    const matchCategory = activeTab === 'ALL' || candidate.category === activeTab;
    const term = searchTerm.toLowerCase();
    const matchSearch =
      candidate.fullName?.toLowerCase().includes(term) ||
      candidate.nickname?.toLowerCase().includes(term) ||
      candidate.faculty?.toLowerCase().includes(term) ||
      candidate.candidateNumber?.toLowerCase().includes(term);
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-xs tracking-[0.2em] uppercase text-[#d4a017] mb-3" style={{ fontFamily: "'Cinzel', serif" }}>
          ⚡ Hall of Olympians
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-[#e8dfc8] mb-4">ผู้เข้าประกวด</h1>
        <p className="text-lg text-[#e8dfc8]/50 max-w-2xl mx-auto">
          ทำความรู้จักและร่วมโหวตให้กำลังใจตัวแทนที่คุณคิดว่าเหมาะสมที่สุด
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">

        {/* Category tabs */}
        <div className="flex p-1.5 rounded-full overflow-x-auto w-full md:w-auto flex-nowrap scrollbar-hide"
          style={{
            background: 'rgba(10,9,16,0.7)',
            border: '1px solid rgba(212,160,23,0.2)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {categoryTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className="px-5 py-2.5 rounded-full whitespace-nowrap flex items-center gap-2 transition-all duration-300 text-sm font-medium tracking-wide"
                style={{
                  fontFamily: "'Cinzel', serif",
                  ...(isActive
                    ? {
                        background: 'linear-gradient(90deg, #a07510, #d4a017, #f0c94b)',
                        color: '#0a0910',
                        fontWeight: 700,
                        boxShadow: '0 0 12px rgba(212,160,23,0.4)',
                      }
                    : { color: 'rgba(232,223,200,0.5)' }),
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={14} className={isActive ? 'fill-[#0a0910]' : ''} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="ค้นหาชื่อ, สาขา, หมายเลข..."
            className="w-full rounded-full pl-11 pr-4 py-3 text-sm text-[#e8dfc8] placeholder-[#e8dfc8]/30 focus:outline-none transition-all tracking-wide"
            style={{
              background: 'rgba(10,9,16,0.8)',
              border: '1px solid rgba(212,160,23,0.25)',
              boxShadow: 'none',
            }}
            onFocus={e => e.target.style.border = '1px solid rgba(212,160,23,0.6)'}
            onBlur={e => e.target.style.border = '1px solid rgba(212,160,23,0.25)'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-3.5 text-[#d4a017]/60" size={18} />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {filteredCandidates.map(candidate => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isRankingVisible={settings.isRankingVisible}
              onClick={() => navigate(`/candidate/${candidate.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-3xl"
          style={{
            background: 'rgba(10,9,16,0.6)',
            border: '1px dashed rgba(212,160,23,0.2)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)' }}
          >
            <Search className="text-[#d4a017]/50" size={30} />
          </div>
          <h3 className="text-xl font-bold text-[#e8dfc8]/70 mb-2" style={{ fontFamily: "'Cinzel', serif" }}>ไม่พบผู้สมัคร</h3>
          <p className="text-[#e8dfc8]/40 mb-6">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่</p>
          <button
            onClick={() => { setSearchTerm(''); setActiveTab('ALL'); }}
            className="px-6 py-2.5 rounded-full text-sm font-medium transition-all tracking-widest"
            style={{
              background: 'rgba(212,160,23,0.12)',
              border: '1px solid rgba(212,160,23,0.35)',
              color: '#f0c94b',
              fontFamily: "'Cinzel', serif",
            }}
          >
            ล้างการค้นหา
          </button>
        </div>
      )}
    </div>
  );
};

export default Candidates;
