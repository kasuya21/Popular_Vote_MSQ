import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, CheckCircle2, AlertCircle, FileText, Trash2, XCircle } from 'lucide-react';
import { getAdminPayments, deleteAdminPayment } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['adminPayments'],
    queryFn: getAdminPayments
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPayments'] });
      // We also need to invalidate candidates since vote count changed
      queryClient.invalidateQueries({ queryKey: ['adminCandidates'] });
    },
    onError: (error) => {
      alert('เกิดข้อผิดพลาดในการลบ: ' + (error.response?.data?.message || error.message));
    }
  });

  const filteredOrders = orders.filter(order => {
    const matchStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchSearch = order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
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
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium"><XCircle size={14} /> ยกเลิกแล้ว</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[#a3a3a3] text-xs font-medium">{status}</span>;
    }
  };

  const handleDelete = (orderNo) => {
    if (window.confirm(`คำเตือน: การลบรายการนี้จะหักคะแนนคืนจากผู้สมัครทันที ยืนยันการลบรายการ ${orderNo} หรือไม่?`)) {
      deleteMutation.mutate(orderNo);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#f5f5f5]">Log การเพิ่มคะแนน</h1>
          <p className="text-[#a3a3a3] text-sm mt-1">ประวัติการชำระเงินและการเพิ่มคะแนนโหวต (สามารถลบเพื่อหักคะแนนคืนได้)</p>
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
              placeholder="ค้นหาเลขออเดอร์, ชื่อลูกค้า..." 
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
              <option value="CANCELLED">ยกเลิก (CANCELLED)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#050505]/50 text-[#a3a3a3] text-xs uppercase tracking-wider border-b border-[#d4af37]/20">
                <th className="px-6 py-3 font-medium">รหัสรายการ / เวลา</th>
                <th className="px-6 py-3 font-medium">ชื่อลูกค้า</th>
                <th className="px-6 py-3 font-medium">ผู้สมัครที่ได้รับโหวต</th>
                <th className="px-6 py-3 font-medium">ยอดเงิน</th>
                <th className="px-6 py-3 font-medium">สถานะ</th>
                <th className="px-6 py-3 font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-[#a3a3a3]">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : filteredOrders.map(order => (
                <tr key={order.id} className={`hover:bg-[#d4af37]/10 transition-colors ${order.status === 'CANCELLED' ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <p className="font-mono font-bold text-[#c0c0c0]">{order.orderNo}</p>
                    <p className="text-xs text-[#a3a3a3]">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#f5f5f5]">{order.customerName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#f5f5f5]">{order.candidate?.nickname}</p>
                    <p className={`text-xs font-medium ${order.status === 'CANCELLED' ? 'text-rose-400 line-through' : 'text-[#d4af37]'}`}>
                      +{order.expectedVoteAmount} โหวต
                    </p>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#d4af37]">
                    ฿{Number(order.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4">
                    {order.status === 'PAID' && (
                      <button 
                        onClick={() => handleDelete(order.orderNo)}
                        disabled={deleteMutation.isPending}
                        className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm group disabled:opacity-50" 
                        title="ลบรายการและหักคะแนน"
                      >
                        {deleteMutation.isPending ? <LoadingSpinner small /> : <Trash2 size={16} className="group-hover:scale-110 transition-transform"/>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              
              {!isLoading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-[#a3a3a3]">
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
