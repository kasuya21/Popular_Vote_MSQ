import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Lock, Share2, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative mt-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(8,7,14,0.98) 100%)' }}
    >
      {/* Decorative top line */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #d4a017, #4dd0c4, #d4a017, transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5 group w-fit">
              <div className="p-2.5 rounded-2xl shadow-[0_0_16px_rgba(212,160,23,0.3)] group-hover:shadow-[0_0_28px_rgba(212,160,23,0.5)] transition-all"
                style={{ background: 'linear-gradient(135deg, #a07510, #d4a017, #f0c94b)' }}
              >
                <Crown size={18} className="text-[#0a0910]" />
              </div>
              <div>
                <span className="block font-bold text-lg tracking-widest text-gradient-gold" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                  MSQ 2026
                </span>
                <span className="text-xs text-[#4dd0c4]/60 tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>
                  Queen · Star · Moon
                </span>
              </div>
            </Link>
            <p className="text-[#e8dfc8]/40 text-sm mb-6 max-w-xs leading-relaxed">
              แพลตฟอร์มโหวตออนไลน์ที่โปร่งใสและปลอดภัย สำหรับงาน MSQ AND THE AMBASSADOR OF SCIENCE TECHNOLOGY 2026
            </p>
            <div className="flex gap-4">
              <a href="#" aria-label="Instagram" className="transition-all" style={{ color: 'rgba(232,223,200,0.25)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f0c94b'; e.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(240,201,75,0.5))'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(232,223,200,0.25)'; e.currentTarget.style.filter = 'none'; }}>
                <Share2 size={18} />
              </a>
              <a href="#" aria-label="Facebook" className="transition-all" style={{ color: 'rgba(232,223,200,0.25)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#4dd0c4'; e.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(77,208,196,0.5))'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(232,223,200,0.25)'; e.currentTarget.style.filter = 'none'; }}>
                <Globe size={18} />
              </a>
            </div>
          </div>

          {/* Menu */}
          <div>
            <h3 className="text-[#d4a017] text-xs tracking-[0.2em] uppercase mb-5" style={{ fontFamily: "'Cinzel', serif" }}>เมนูหลัก</h3>
            <ul className="space-y-3">
              {[
                { label: 'หน้าแรก', to: '/' },
                { label: 'ผู้สมัครทั้งหมด', to: '/candidates' },
                { label: 'อันดับคะแนน', to: '/ranking' },
                { label: 'ตรวจสอบสถานะ', to: '/track-order' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to}
                    className="text-sm tracking-wide transition-colors"
                    style={{ color: 'rgba(232,223,200,0.45)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f0c94b'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,223,200,0.45)'}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-[#d4a017] text-xs tracking-[0.2em] uppercase mb-5" style={{ fontFamily: "'Cinzel', serif" }}>ช่วยเหลือ</h3>
            <ul className="space-y-3">
              {[
                { label: 'กติกาการโหวต', to: '/terms' },
                { label: 'วิธีการชำระเงิน', to: '/terms' },
                { label: 'ติดต่อสอบถาม', to: '/terms' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to}
                    className="text-sm tracking-wide transition-colors"
                    style={{ color: 'rgba(232,223,200,0.45)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#4dd0c4'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,223,200,0.45)'}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(212,160,23,0.12)' }}>
          <p className="text-xs tracking-wider" style={{ color: 'rgba(232,223,200,0.25)', fontFamily: "'Cinzel', serif" }}>
            © 2026 MSQ 2026 · All rights reserved
          </p>
          <p className="text-xs" style={{ color: 'rgba(232,223,200,0.2)' }}>
            Made with <span style={{ color: '#d4a017' }}>♛</span> by Student Union
          </p>
          <Link to="/admin/login"
            className="flex items-center gap-1.5 text-xs tracking-wide transition-colors"
            style={{ color: 'rgba(232,223,200,0.2)', fontFamily: "'Cinzel', serif" }}
            onMouseEnter={e => e.currentTarget.style.color = '#4dd0c4'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,223,200,0.2)'}
          >
            <Lock size={12} /> Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
