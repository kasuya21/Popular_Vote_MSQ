import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, CheckCircle2, AlertCircle, Clock, FileText, Check, X, Image as ImageIcon } from 'lucide-react';
import { getAdminPayments, approveSlip, rejectSlip } from '../../services/api';

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['adminPayments'],
    queryFn: getAdminPayments
  });

  const filteredOrders = orders.filter(order => {
    const matchStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchSearch = order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.customerContact?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('th-TH', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"><CheckCircle2 size={14} /> สำเร็จ</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium"><Clock size={14} /> รอชำระ</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium"><Clock size={14} /> รอตรวจสลิป</span>;
      case 'EXPIRED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium"><AlertCircle size={14} /> หมดอายุ</span>;
      case 'FAILED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium"><AlertCircle size={14} /> ล้มเหลว</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[#a3a3a3] text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#f5f5f5]">รายการชำระเงิน</h1>
          <p className="text-[#a3a3a3] text-sm mt-1">ตรวจสอบและจัดการรายการชำระเงินทั้งหมด</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-[#050505] px-4 py-2 rounded-xl text-sm font-medium border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10 flex items-center gap-2 shadow-sm transition-colors">
            <FileText size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-[#0a0a0a] rounded-2xl border border-[#d4af37]/20 shadow-sm overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(10,10,10,0.95), rgba(20,20,20,0.9))' }}>
        <div className="p-4 border-b border-[#d4af37]/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 text-[#a3a3a3]" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาเลขออเดอร์, ชื่อ, ข้อมูลติดต่อ..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#d4af37]/30 bg-[#050505] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 text-sm text-[#f5f5f5] placeholder-[#a3a3a3]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={18} className="text-[#a3a3a3]" />
            <select 
              className="bg-[#050505] border border-[#d4af37]/30 text-[#c0c0c0] text-sm rounded-lg focus:ring-[#d4af37]/50 focus:border-[#d4af37]/50 block w-full p-2 outline-none"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <option value="PAID">สำเร็จ (PAID)</option>
              <option value="PROCESSING">รอตรวจสลิป (PROCESSING)</option>
              <option value="PENDING">รอชำระ (PENDING)</option>
              <option value="EXPIRED">หมดอายุ (EXPIRED)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#050505]/50 text-[#a3a3a3] text-xs uppercase tracking-wider border-b border-[#d4af37]/20">
                <th className="px-6 py-3 font-medium">เลขออเดอร์ / เวลา</th>
                <th className="px-6 py-3 font-medium">ผู้โหวต / ติดต่อ</th>
                <th className="px-6 py-3 font-medium">ผู้สมัครที่โหวตให้</th>
                <th className="px-6 py-3 font-medium">ยอดเงิน</th>
                <th className="px-6 py-3 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-[#a3a3a3]">
                    <span className="loading loading-spinner loading-md text-[#d4af37]"></span>
                  </td>
                </tr>
              ) : filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-[#d4af37]/10 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-mono font-bold text-[#c0c0c0]">{order.orderNo}</p>
                    <p className="text-xs text-[#a3a3a3]">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#f5f5f5]">{order.customerName}</p>
                    <p className="text-xs text-[#a3a3a3]">{order.customerContact}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#f5f5f5]">{order.candidate?.nickname}</p>
                    <p className="text-xs text-[#d4af37] font-medium">+{order.expectedVoteAmount} โหวต</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#d4af37]">
                    ฿{Number(order.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                    {order.slipUrl && (
                      <a href={order.slipUrl} target="_blank" rel="noopener noreferrer" className="block mt-2 text-xs text-[#d4af37] hover:text-[#f3e5ab] hover:underline flex items-center gap-1 transition-colors">
                        <ImageIcon size={12}/> ดูสลิป
                      </a>
                    )}
                    {order.status === 'PROCESSING' && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={async () => {
                          if(window.confirm('ยืนยันอนุมัติสลิปนี้?')) {
                            await approveSlip(order.orderNo);
                            window.location.reload();
                          }
                        }} className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-colors shadow-sm" title="อนุมัติ">
                          <Check size={16} />
                        </button>
                        <button onClick={async () => {
                          const reason = window.prompt('ระบุเหตุผลที่ปฏิเสธสลิปนี้:');
                          if(reason) {
                            await rejectSlip(order.orderNo, reason);
                            window.location.reload();
                          }
                        }} className="p-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded hover:bg-rose-500/20 transition-colors shadow-sm" title="ปฏิเสธ">
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              
              {!isLoading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-[#a3a3a3]">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
