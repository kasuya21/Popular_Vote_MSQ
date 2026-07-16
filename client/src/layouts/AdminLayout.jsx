import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, CreditCard, BarChart2, LogOut, Zap } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/admin' },
    { name: 'ผู้สมัคร', icon: <Users size={18} />, path: '/admin/candidates' },
    { name: 'แพ็กเกจ', icon: <Package size={18} />, path: '/admin/packages' },
    { name: 'รายการชำระเงิน', icon: <CreditCard size={18} />, path: '/admin/orders' },
    { name: 'รายงาน', icon: <BarChart2 size={18} />, path: '/admin/reports' },
  ];

  return (
    <div className="flex h-screen" style={{ background: '#0d0818' }}>

      {/* Sidebar */}
      <aside className="w-60 hidden md:flex flex-col flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, rgba(23,16,58,0.98) 0%, rgba(13,8,24,0.98) 100%)',
          borderRight: '1px solid rgba(139,92,246,0.2)',
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 gap-3"
          style={{ borderBottom: '1px solid rgba(139,92,246,0.15)' }}
        >
          <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #a07510, #f0c94b)' }}>
            <Zap size={16} className="text-[#0d0818]" />
          </div>
          <span className="font-bold text-base text-[#e8dfc8] tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>
            MSQ
          </span>
          <span className="text-[10px] text-[#d4a017]/60 tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>
            ADMIN
          </span>
        </div>

        {/* Nav */}
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1 px-3">
            {menuItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm"
                  style={active ? {
                    background: 'linear-gradient(90deg, rgba(139,92,246,0.25), rgba(109,40,217,0.1))',
                    color: '#c084fc',
                    border: '1px solid rgba(139,92,246,0.3)',
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: '0.05em',
                  } : {
                    color: 'rgba(232,223,200,0.45)',
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: '0.05em',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(232,223,200,0.8)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(232,223,200,0.45)'; }}
                >
                  <span style={active ? { color: '#c084fc' } : { color: 'rgba(212,160,23,0.5)' }}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(139,92,246,0.15)' }}>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-[#e8dfc8]/30 hover:text-rose-400"
            style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.05em' }}
          >
            <LogOut size={18} />
            <span>กลับหน้าหลัก</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden h-16 flex items-center justify-between px-4"
          style={{
            background: 'rgba(23,16,58,0.97)',
            borderBottom: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          <span className="font-bold text-lg text-[#e8dfc8] tracking-widest" style={{ fontFamily: "'Cinzel', serif" }}>
            MSQ ADMIN
          </span>
          <Link to="/" className="text-[#e8dfc8]/40 hover:text-rose-400 transition-colors">
            <LogOut size={22} />
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(13,8,24,0.99) 0%, rgba(23,16,58,0.97) 100%)',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
