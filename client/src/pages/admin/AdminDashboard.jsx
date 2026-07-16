import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { DollarSign, CheckCircle2, Heart, Clock, Edit, Ban, Loader2, Settings, Eye, EyeOff } from 'lucide-react';
import { resolveImageUrl } from '../../utils/imageUtils';
import ImageWithRetry from '../../components/ImageWithRetry';
import { getAdminPayments, getAdminCandidates, getAdminPackages, getSystemSettings, updateSystemSettings } from '../../services/api';
import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const AdminDashboard = () => {
  const queryClient = useQueryClient();

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
        <Loader2 className="w-8 h-8 animate-spin text-[#d4a017]" />
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="rounded-2xl p-6 flex items-center gap-4 border"
      style={{
        background: 'linear-gradient(135deg, rgba(10,10,10,0.95), rgba(20,20,20,0.9))',
        border: '1px solid rgba(212,175,55,0.2)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color}`}>
        <Icon size={26} />
      </div>
      <div>
        <p className="text-xs text-[#a3a3a3] font-medium mb-0.5 tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-[#f5f5f5]">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#f5f5f5]">Dashboard สรุปข้อมูล</h1>
        <p className="text-[#a3a3a3] text-sm mt-1">ภาพรวมของระบบโหวตและการชำระเงิน</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={DollarSign} label="ยอดเงินรวม (บาท)" value={`฿${stats.totalRevenue.toLocaleString()}`} color="bg-emerald-500/10 text-emerald-400" />
        <StatCard icon={CheckCircle2} label="รายการสำเร็จ" value={`${stats.paidCount} รายการ`} color="bg-blue-500/10 text-blue-400" />
        <StatCard icon={Heart} label="คะแนนทั้งหมด" value={`${stats.totalVotes.toLocaleString()} โหวต`} color="bg-rose-500/10 text-rose-400" />
        <StatCard icon={Clock} label="รอดำเนินการ" value={`${stats.pendingCount} รายการ`} color="bg-amber-500/10 text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* System Settings */}
        <div className="lg:col-span-3 rounded-2xl p-6 flex items-center justify-between border"
          style={{
            background: 'linear-gradient(135deg, rgba(10,10,10,0.95), rgba(20,20,20,0.9))',
            border: '1px solid rgba(212,175,55,0.2)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#d4af37]/15 text-[#d4af37]">
              <Settings size={22} />
            </div>
            <div>
              <h3 className="font-bold text-[#f5f5f5]">แสดงหน้ากราฟคะแนน (Ranking)</h3>
              <p className="text-sm text-[#a3a3a3]">เปิดหรือปิดการแสดงผลหน้าจัดอันดับคะแนน</p>
            </div>
          </div>
          <button
            onClick={() => updateSettingsMutation.mutate({ isRankingVisible: !settings?.isRankingVisible })}
            disabled={updateSettingsMutation.isPending}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all border ${
              settings?.isRankingVisible
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-[#1a1a1a] text-[#a3a3a3] border-[#d4af37]/20 hover:bg-[#2a2a2a]'
            }`}
          >
            {settings?.isRankingVisible ? <><Eye size={16} /> เปิดใช้งาน</> : <><EyeOff size={16} /> ปิดใช้งาน</>}
          </button>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-2xl border overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(135deg, rgba(10,10,10,0.95), rgba(20,20,20,0.9))',
            border: '1px solid rgba(212,175,55,0.2)',
          }}
        >
          <div className="p-5 border-b border-[#d4af37]/20 flex justify-between items-center">
            <h3 className="font-bold text-[#f5f5f5]">รายการชำระเงินล่าสุด</h3>
            <Link to="/admin/orders" className="text-sm text-[#d4af37] hover:text-[#f3e5ab] transition-colors">ดูทั้งหมด</Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[#a3a3a3] text-xs uppercase tracking-wider border-b border-[#d4af37]/20">
                  {['เลขออเดอร์','ผู้โหวต','ผู้สมัคร','ยอดเงิน','สถานะ','เวลา'].map(h => (
                    <th key={h} className="px-5 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4af37]/10 text-sm">
                {recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <tr key={order.id || order.orderNo} className="hover:bg-[#d4af37]/10 transition-colors">
                      <td className="px-5 py-4 font-mono text-[#c0c0c0] text-xs">{order.orderNo}</td>
                      <td className="px-5 py-4 text-[#f5f5f5]">{order.customerName}</td>
                      <td className="px-5 py-4 text-[#f5f5f5]">{order.candidate?.nickname || '—'}</td>
                      <td className="px-5 py-4 font-medium text-[#d4af37]">฿{Number(order.amount).toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          order.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          (order.status === 'PENDING' || order.status === 'PROCESSING') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {order.status === 'PAID' ? 'สำเร็จ' : order.status === 'PENDING' ? 'รอชำระ' : order.status === 'PROCESSING' ? 'รอตรวจสลิป' : 'ล้มเหลว'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#a3a3a3]">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-10 text-center text-[#a3a3a3]">ยังไม่มีรายการ</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Candidate Preview */}
        <div className="rounded-2xl border overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(135deg, rgba(10,10,10,0.95), rgba(20,20,20,0.9))',
            border: '1px solid rgba(212,175,55,0.2)',
          }}
        >
          <div className="p-5 border-b border-[#d4af37]/20 flex justify-between items-center">
            <h3 className="font-bold text-[#f5f5f5]">จัดการผู้สมัคร</h3>
            <Link to="/admin/candidates" className="text-sm text-[#d4af37] hover:text-[#f3e5ab] transition-colors">จัดการทั้งหมด</Link>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="space-y-3">
              {topCandidates.map(candidate => (
                <div key={candidate.id} className="flex items-center justify-between p-3 rounded-xl border border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-colors"
                  style={{ background: 'rgba(5,5,5,0.5)' }}
                >
                  <div className="flex items-center gap-3">
                    <ImageWithRetry src={resolveImageUrl(candidate.profileImage, 'https://via.placeholder.com/40')} alt="" className="w-10 h-10 rounded-full object-cover border border-[#d4af37]/30" fallback="https://via.placeholder.com/40" />
                    <div>
                      <p className="font-medium text-[#f5f5f5] text-sm">{candidate.nickname}</p>
                      <p className="text-xs text-[#d4af37]">{candidate.voteCount?.toLocaleString() || 0} โหวต</p>
                    </div>
                  </div>
                  <div className="flex gap-1 text-[#a3a3a3]">
                    <button className="p-1.5 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-md transition-colors"><Edit size={15} /></button>
                    <button className="p-1.5 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors"><Ban size={15} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-[#d4af37]/20 pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-[#a3a3a3] text-xs uppercase tracking-widest">แพ็กเกจโหวต</h4>
                <Link to="/admin/packages" className="text-xs text-[#d4af37] hover:text-[#f3e5ab] transition-colors">จัดการแพ็กเกจ</Link>
              </div>
              <div className="space-y-2">
                {packages.map(pkg => (
                  <div key={pkg.id} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-[#d4af37]/10 transition-colors">
                    <span className="text-[#c0c0c0]">{pkg.title || pkg.name}</span>
                    <span className="font-medium text-[#d4af37]">฿{pkg.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
