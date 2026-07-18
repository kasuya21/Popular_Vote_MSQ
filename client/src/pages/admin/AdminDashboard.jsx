import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { DollarSign, CheckCircle2, Heart, Clock, Edit, Ban, Loader2, Settings, Eye, EyeOff, Store, TrendingUp, Users, Trophy } from 'lucide-react';
import { resolveImageUrl } from '../../utils/imageUtils';
import ImageWithRetry from '../../components/ImageWithRetry';
import { getAdminPayments, getAdminCandidates, getAdminPackages, getSystemSettings, updateSystemSettings } from '../../services/api';
import { useMemo } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: getSystemSettings
  });

  const updateSettingsMutation = useMutation({
    mutationFn: updateSystemSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['systemSettings'] })
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['adminPayments'],
    queryFn: getAdminPayments
  });

  const { data: candidates = [], isLoading: isLoadingCandidates } = useQuery({
    queryKey: ['adminCandidates'],
    queryFn: getAdminCandidates
  });

  const { data: packages = [], isLoading: isLoadingPackages } = useQuery({
    queryKey: ['adminPackages'],
    queryFn: getAdminPackages
  });

  const stats = useMemo(() => {
    const paidOrders = orders.filter(o => o.status === 'PAID');
    const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING');
    const revenue = paidOrders.reduce((sum, o) => sum + Number(o.amount), 0);
    const votes = candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);
    return { totalRevenue: revenue, paidCount: paidOrders.length, totalVotes: votes, pendingCount: pendingOrders.length };
  }, [orders, candidates]);

  const recentOrders = useMemo(() =>
    [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5), [orders]);

  const topCandidates = useMemo(() =>
    [...candidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0)).slice(0, 4), [candidates]);

  const formatDate = (d) => new Date(d).toLocaleString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const isLoading = isLoadingOrders || isLoadingCandidates || isLoadingPackages || isLoadingSettings;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#f5f5f5]" style={{ fontFamily: "'Cinzel', serif" }}>Admin Dashboard</h1>
          <p className="text-[#a3a3a3] text-sm mt-2">ยินดีต้อนรับสู่ระบบจัดการ MSQ 2026</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => navigate('/admin/pos')}
            className="flex-1 md:flex-none btn-primary-gradient px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105"
          >
            <Store size={18} /> เข้าสู่หน้า POS Walk-in
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative overflow-hidden rounded-2xl p-6 border border-[#d4af37]/30 bg-[#0a0a0a] shadow-lg group hover:border-[#d4af37] transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-[#d4af37]/20" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-[#a3a3a3] font-medium tracking-wide">ยอดขายรวม</p>
                <h3 className="text-3xl font-black text-[#d4af37] mt-1 tracking-tight">฿{stats.totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="p-3 rounded-full bg-[#d4af37]/10 text-[#d4af37]">
                <DollarSign size={24} />
              </div>
            </div>
            <p className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp size={14}/> อัปเดตล่าสุด</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl p-6 border border-emerald-500/30 bg-[#0a0a0a] shadow-lg group hover:border-emerald-500 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-[#a3a3a3] font-medium tracking-wide">รายการสำเร็จ</p>
                <h3 className="text-3xl font-black text-[#f5f5f5] mt-1 tracking-tight">{stats.paidCount}</h3>
              </div>
              <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
            </div>
            <p className="text-xs text-[#a3a3a3]">รายการชำระเงินที่สมบูรณ์</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl p-6 border border-rose-500/30 bg-[#0a0a0a] shadow-lg group hover:border-rose-500 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-rose-500/20" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-[#a3a3a3] font-medium tracking-wide">คะแนนโหวตรวม</p>
                <h3 className="text-3xl font-black text-[#f5f5f5] mt-1 tracking-tight">{stats.totalVotes.toLocaleString()}</h3>
              </div>
              <div className="p-3 rounded-full bg-rose-500/10 text-rose-400">
                <Heart size={24} />
              </div>
            </div>
            <p className="text-xs text-[#a3a3a3]">คะแนนโหวตทั้งหมดในระบบ</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl p-6 border border-[#a3a3a3]/30 bg-[#0a0a0a] shadow-lg group hover:border-[#a3a3a3] transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#a3a3a3]/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-[#a3a3a3]/20" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-[#a3a3a3] font-medium tracking-wide">ผู้สมัครทั้งหมด</p>
                <h3 className="text-3xl font-black text-[#f5f5f5] mt-1 tracking-tight">{candidates.length}</h3>
              </div>
              <div className="p-3 rounded-full bg-[#a3a3a3]/10 text-[#c0c0c0]">
                <Users size={24} />
              </div>
            </div>
            <p className="text-xs text-[#a3a3a3]">ผู้เข้าประกวดในรอบนี้</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Settings Toggle */}
          <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-[#d4af37]/20 bg-[#050505] shadow-lg gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#d4af37]/15 text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <Settings size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#f5f5f5] text-lg">แสดงหน้าจัดอันดับ (Ranking)</h3>
                <p className="text-sm text-[#a3a3a3] mt-1">เปิดหรือปิดการแสดงผลหน้าจัดอันดับคะแนนสำหรับบุคคลทั่วไป</p>
              </div>
            </div>
            <button
              onClick={() => updateSettingsMutation.mutate({ isRankingVisible: !settings?.isRankingVisible })}
              disabled={updateSettingsMutation.isPending}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
                settings?.isRankingVisible
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/50 hover:bg-rose-500/30'
              }`}
            >
              {settings?.isRankingVisible ? <><Eye size={18} /> สถานะ: เปิดใช้งาน</> : <><EyeOff size={18} /> สถานะ: ปิดใช้งาน</>}
            </button>
          </div>

          {/* Recent Orders */}
          <div className="rounded-2xl border border-[#d4af37]/20 bg-[#050505] overflow-hidden shadow-lg">
            <div className="p-6 border-b border-[#d4af37]/20 flex justify-between items-center bg-[#0a0a0a]">
              <h3 className="font-bold text-[#f5f5f5] text-lg flex items-center gap-2">
                <Store className="text-[#d4af37]" size={20}/> รายการชำระเงินล่าสุด
              </h3>
              <Link to="/admin/orders" className="text-sm font-medium text-[#d4af37] hover:text-[#f3e5ab] transition-colors border border-[#d4af37]/30 px-4 py-1.5 rounded-full hover:bg-[#d4af37]/10">
                ดูทั้งหมด
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[#a3a3a3] text-xs uppercase tracking-wider border-b border-[#d4af37]/10 bg-[#0a0a0a]/50">
                    {['เลขออเดอร์','ลูกค้า','ผู้สมัคร','ยอดเงิน','สถานะ','เวลา'].map(h => (
                      <th key={h} className="px-6 py-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d4af37]/10 text-sm">
                  {recentOrders.length > 0 ? (
                    recentOrders.map(order => (
                      <tr key={order.id || order.orderNo} className="hover:bg-[#d4af37]/5 transition-colors group">
                        <td className="px-6 py-4 font-mono text-[#c0c0c0] text-xs group-hover:text-[#d4af37] transition-colors">{order.orderNo}</td>
                        <td className="px-6 py-4 text-[#f5f5f5] font-medium">{order.customerName || 'Walk-in'}</td>
                        <td className="px-6 py-4 text-[#f5f5f5]">{order.candidate?.nickname || '—'}</td>
                        <td className="px-6 py-4 font-bold text-[#d4af37]">฿{Number(order.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                            order.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                            (order.status === 'PENDING' || order.status === 'PROCESSING') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {order.status === 'PAID' ? 'สำเร็จ' : order.status === 'PENDING' ? 'รอชำระ' : order.status === 'PROCESSING' ? 'รอตรวจสลิป' : 'ล้มเหลว'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#a3a3a3] text-xs">{formatDate(order.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-[#a3a3a3] flex flex-col items-center gap-3">
                        <Store size={32} className="text-[#333]" />
                        <span>ยังไม่มีรายการสั่งซื้อ</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          
          {/* Top Candidates Widget */}
          <div className="rounded-2xl border border-[#d4af37]/20 bg-[#050505] overflow-hidden shadow-lg">
            <div className="p-5 border-b border-[#d4af37]/20 flex justify-between items-center bg-[#0a0a0a]">
              <h3 className="font-bold text-[#f5f5f5] flex items-center gap-2">
                <Trophy size={18} className="text-[#d4af37]" /> ผู้นำคะแนนโหวต
              </h3>
            </div>
            <div className="p-2">
              <div className="space-y-1">
                {topCandidates.map((candidate, index) => (
                  <div key={candidate.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#d4af37]/10 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 text-center font-bold text-sm ${index === 0 ? 'text-[#d4af37]' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-[#555]'}`}>
                        #{index + 1}
                      </div>
                      <ImageWithRetry 
                        src={resolveImageUrl(candidate.profileImage)} 
                        alt="" 
                        className="w-10 h-10 rounded-full object-cover border border-[#d4af37]/30 group-hover:border-[#d4af37] transition-colors" 
                        fallback="https://placehold.co/40x40/1a1730/e8dfc8?text=?" 
                      />
                      <div>
                        <p className="font-bold text-[#f5f5f5] text-sm leading-tight">{candidate.nickname}</p>
                        <p className="text-xs text-[#a3a3a3]">No. {candidate.candidateNumber}</p>
                      </div>
                    </div>
                    <div className="font-bold text-[#d4af37] text-sm bg-[#d4af37]/10 px-3 py-1 rounded-full">
                      {candidate.voteCount?.toLocaleString() || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 border-t border-[#d4af37]/10 bg-[#0a0a0a]">
              <button onClick={() => navigate('/admin/candidates')} className="w-full text-center text-xs font-medium text-[#d4af37] hover:text-[#f3e5ab] py-2 rounded-lg hover:bg-[#d4af37]/10 transition-colors">
                ดูผู้สมัครทั้งหมด
              </button>
            </div>
          </div>

          {/* Packages Widget */}
          <div className="rounded-2xl border border-[#d4af37]/20 bg-[#050505] overflow-hidden shadow-lg">
            <div className="p-5 border-b border-[#d4af37]/20 flex justify-between items-center bg-[#0a0a0a]">
              <h3 className="font-bold text-[#f5f5f5] text-sm">แพ็กเกจทั้งหมด</h3>
              <Link to="/admin/packages" className="text-xs text-[#d4af37] hover:text-[#f3e5ab] transition-colors">จัดการ</Link>
            </div>
            <div className="p-4 space-y-3">
              {packages.map(pkg => (
                <div key={pkg.id} className="flex justify-between items-center p-3 rounded-xl border border-[#d4af37]/10 bg-[#0a0a0a] hover:border-[#d4af37]/30 transition-colors">
                  <div>
                    <span className="block text-[#f5f5f5] font-medium text-sm">{pkg.title || pkg.name}</span>
                    <span className="text-xs text-[#a3a3a3]">{pkg.voteAmount.toLocaleString()} โหวต</span>
                  </div>
                  <span className="font-bold text-[#d4af37] text-sm">฿{Number(pkg.price).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
