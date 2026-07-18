import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Trophy, Search } from 'lucide-react';
import { getSystemSettings } from '../services/api';

const MobileBottomNav = () => {
  const location = useLocation();

  const { data: settings } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: getSystemSettings
  });

  const isRankingVisible = settings?.isRankingVisible !== false;

  const navItems = [
    { name: 'หน้าแรก', path: '/', icon: Home },
    { name: 'ผู้สมัคร', path: '/candidates', icon: Users },
    { name: 'อันดับ', path: '/ranking', icon: Trophy },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{
        background: 'linear-gradient(180deg, rgba(5,5,5,0.92), rgba(0,0,0,0.98))',
        borderTop: '1px solid rgba(212,175,55,0.2)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 relative group"
            >
              {/* Active gold underline dot */}
              {active && (
                <div className="absolute top-1 w-6 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #aa8529, #f3e5ab)' }}
                />
              )}

              <div className={`p-1.5 rounded-full transition-all duration-300 ${active ? '' : 'text-[#f5f5f5]/30 group-hover:text-[#f5f5f5]/60'}`}
                style={active ? {
                  background: 'rgba(212,175,55,0.15)',
                  color: '#f3e5ab',
                  filter: 'drop-shadow(0 0 6px rgba(243,229,171,0.5))',
                } : {}}
              >
                <Icon size={21} />
              </div>
              <span className="text-[10px] tracking-wider"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: active ? '#f3e5ab' : 'rgba(245,245,245,0.3)',
                }}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
