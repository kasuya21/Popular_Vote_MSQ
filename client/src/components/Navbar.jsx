import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSystemSettings } from '../services/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const { data: settings } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: getSystemSettings
  });

  const isRankingVisible = settings?.isRankingVisible !== false;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'หน้าแรก', path: '/' },
    { name: 'ผู้เข้าประกวด', path: '/candidates' },
    { name: 'อันดับคะแนน', path: '/ranking' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled ? 'pt-2 sm:pt-3 px-2 sm:px-4' : 'pt-0 px-0'}`}>
      <nav className={`mx-auto transition-all duration-500 ease-in-out ${scrolled
          ? 'max-w-6xl backdrop-blur-xl rounded-full border border-[#d4af37]/25 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(212,175,55,0.1)]'
          : 'max-w-7xl bg-transparent border-transparent'
        }`}
        style={scrolled ? { background: 'linear-gradient(135deg, rgba(10,10,10,0.92) 0%, rgba(5,5,5,0.88) 100%)' } : {}}
      >
        <div className={`px-4 sm:px-6 lg:px-8 transition-all duration-500 ${scrolled ? 'py-2' : 'py-5'}`}>
          <div className="flex justify-between items-center">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative p-2.5 rounded-2xl overflow-hidden group-hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                style={{ background: 'linear-gradient(135deg, #aa8529, #d4af37, #f3e5ab, #d4af37)' }}
              >
                <Zap size={20} className="text-[#050505] relative z-10" />
              </div>
              <span className="font-bold text-xl tracking-wider" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                <span className="text-gradient-gold">MSQ</span>
                <span className="text-gradient-silver ml-1.5 text-sm font-normal tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>2026</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1 p-1.5 rounded-full border border-[#d4af37]/20"
              style={{ background: 'rgba(5,5,5,0.5)', backdropFilter: 'blur(12px)' }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-5 py-2 text-sm rounded-full transition-all duration-300 tracking-wide ${isActive(link.path)
                      ? 'text-[#050505] shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                      : 'text-[#f5f5f5]/70 hover:text-[#f3e5ab]'
                    }`}
                  style={isActive(link.path) ? {
                    fontFamily: "'Cinzel', serif",
                    background: 'linear-gradient(90deg, #aa8529, #d4af37, #f3e5ab)',
                    fontWeight: 700
                  } : { fontFamily: "'Cinzel', serif" }}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Admin / Vote Button */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/admin/login"
                className="text-sm text-[#f5f5f5]/50 hover:text-[#c0c0c0] px-4 py-2 transition-colors tracking-wide"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                ผู้ดูแลระบบ
              </Link>
              <Link to="/candidates" className="btn-primary-gradient px-6 py-2.5 rounded-full text-sm flex items-center gap-2">
                ดูผู้สมัครทั้งหมด <ArrowRight size={15} />
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-[#f5f5f5] p-2 rounded-xl border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-colors"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-[#d4af37]/20 pt-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm tracking-wide transition-all ${isActive(link.path)
                      ? 'text-[#f3e5ab] bg-[#d4af37]/10 border border-[#d4af37]/30'
                      : 'text-[#f5f5f5]/70 hover:text-[#f3e5ab] hover:bg-[#d4af37]/5'
                    }`}
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/candidates"
                onClick={() => setIsOpen(false)}
                className="block btn-primary-gradient text-center py-3 rounded-xl text-sm mt-3"
              >
                ดูผู้สมัครทั้งหมด
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
