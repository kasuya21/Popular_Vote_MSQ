import React, { useState } from 'react';
import {
  Search, Package, Calendar, Clock, AlertCircle,
  CheckCircle2, ChevronRight, Mail, Star, RefreshCw
} from 'lucide-react';
import { getOrdersByEmail } from '../services/api';
import { resolveImageUrl } from '../utils/imageUtils';
import ImageWithRetry from '../components/ImageWithRetry';
import { Link } from 'react-router-dom';

const statusConfig = {
  PAID: {
    label: 'โหวตสำเร็จ',
    icon: CheckCircle2,
    pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
    card: 'border-emerald-500/30',
  },
  PROCESSING: {
    label: 'รอแอดมินตรวจสอบ',
    icon: Clock,
    pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400 animate-pulse',
    card: 'border-blue-500/30',
  },
  PENDING: {
    label: 'รอชำระเงิน',
    icon: Clock,
    pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400 animate-pulse',
    card: 'border-amber-500/30',
  },
  EXPIRED: {
    label: 'หมดอายุ',
    icon: AlertCircle,
    pill: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dot: 'bg-rose-400',
    card: 'border-rose-500/30',
  },
  FAILED: {
    label: 'ถูกปฏิเสธ',
    icon: AlertCircle,
    pill: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dot: 'bg-rose-400',
    card: 'border-rose-500/30',
  },
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const OrderCard = ({ order }) => {
  const cfg = statusConfig[order.status] || statusConfig.EXPIRED;
  const Icon = cfg.icon;
  const isPending = order.status === 'PENDING';
  const isPaid = order.status === 'PAID';

  return (
    <div className={`glass-card p-5 border ${cfg.card} relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}>
      {/* Top accent strip */}
      <div className={`absolute top-0 left-0 w-full h-1 ${isPaid ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : isPending ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-slate-500 to-slate-600'}`} />

      <div className="flex items-start gap-4 mt-1">
        {/* Candidate avatar */}
        <div className="shrink-0">
          {order.profileImage ? (
            <ImageWithRetry src={resolveImageUrl(order.profileImage)} alt={order.candidateName} className="w-14 h-14 rounded-xl object-cover shadow-sm border border-slate-700" fallback="https://placehold.co/40x40/1a1730/e8dfc8?text=?" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-[#d4af37]/10 flex items-center justify-center border border-[#d4af37]/20">
              <Star size={24} className="text-[#d4af37]" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <p className="text-xs font-mono text-slate-400">{order.orderNo}</p>
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>

          <p className="font-bold text-[#f5f5f5] text-base leading-tight">
            {order.candidateName}
            <span className="text-slate-400 font-normal text-sm ml-1">No.{order.candidateNumber}</span>
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Package size={13} className="text-[#d4af37]" />
              {order.package?.name} · <span className="text-[#f3e5ab] font-semibold">+{order.package?.voteAmount} โหวต</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {formatDate(order.createdAt)}
            </span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
            <span className="text-[#f5f5f5] font-bold">฿{Number(order.amount).toFixed(2)}</span>
            {isPending && (
              <Link
                to={`/payment/${order.orderNo}`}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 btn-primary-gradient rounded-lg transition-colors shadow-sm text-[#050505]"
              >
                ชำระเงิน <ChevronRight size={14} />
              </Link>
            )}
            {order.status === 'PROCESSING' && (
              <Link
                to={`/payment/${order.orderNo}`}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
              >
                ดูสถานะ <ChevronRight size={14} />
              </Link>
            )}
            {isPaid && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                <CheckCircle2 size={14} /> บันทึกคะแนนแล้ว
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TrackOrder = () => {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    setOrders(null);
    try {
      const data = await getOrdersByEmail(email);
      setOrders(data);
    } catch {
      setError('ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบอีเมลอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const pending = orders?.filter(o => o.status === 'PENDING') || [];
  const processing = orders?.filter(o => o.status === 'PROCESSING') || [];
  const paid = orders?.filter(o => o.status === 'PAID') || [];
  const other = orders?.filter(o => !['PENDING', 'PROCESSING', 'PAID'].includes(o.status)) || [];

  return (
    <div className="max-w-3xl mx-auto py-10 md:py-16 px-4">
      {/* Header */}
      <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center justify-center p-3 bg-[#d4af37]/10 rounded-2xl text-[#d4af37] mb-4 shadow-inner border border-[#d4af37]/20">
          <Search size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#f5f5f5] mb-3">รายการโหวตของฉัน</h1>
        <p className="text-slate-400 text-lg font-medium">กรอกอีเมลที่ใช้สมัครเพื่อดูประวัติการโหวตทั้งหมด</p>
      </div>

      {/* Search Form */}
      <div className="glass-card p-6 md:p-8 mb-8 relative overflow-hidden border border-[#d4af37]/30">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#aa8529] via-[#d4af37] to-[#f3e5ab] opacity-70" />
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3.5 bg-[#0a0a0a]/50 backdrop-blur-sm rounded-xl border border-[#d4af37]/20 focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] focus:bg-[#050505] text-[#f5f5f5] transition-all shadow-sm font-medium outline-none placeholder:text-slate-500"
              placeholder="อีเมลที่ใช้สั่งโหวต เช่น example@email.com"
            />
          </div>
          <button
            type="submit"
            disabled={!email || loading}
            className="py-3.5 px-6 btn-primary-gradient rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-[#050505]"
          >
            {loading ? (
              <><span className="loading loading-spinner loading-sm" /> กำลังค้นหา...</>
            ) : (
              <><Search size={18} /> ค้นหารายการ</>
            )}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50/80 border border-rose-200 text-rose-700 p-4 rounded-2xl flex gap-3 text-sm font-medium mb-6 animate-in fade-in">
          <AlertCircle size={20} className="shrink-0 text-rose-500 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Results */}
      {orders !== null && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
          {orders.length === 0 ? (
            <div className="text-center py-16 glass-card border-[#d4af37]/20">
              <Search size={48} className="mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400 font-medium">ไม่พบรายการโหวตสำหรับอีเมลนี้</p>
            </div>
          ) : (
            <>
              {/* Summary chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-sm font-semibold text-slate-300">
                  ทั้งหมด {orders.length} รายการ
                </span>
                {paid.length > 0 && (
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-sm font-semibold text-emerald-400">
                    ✅ สำเร็จ {paid.length}
                  </span>
                )}
                {processing.length > 0 && (
                  <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm font-semibold text-blue-400">
                    🔄 รอตรวจสอบ {processing.length}
                  </span>
                )}
                {pending.length > 0 && (
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm font-semibold text-amber-400">
                    ⏳ รอชำระ {pending.length}
                  </span>
                )}
              </div>

              {/* PENDING section */}
              {pending.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock size={14} /> รอชำระเงิน
                  </h2>
                  <div className="space-y-3">
                    {pending.map(o => <OrderCard key={o.id} order={o} />)}
                  </div>
                </div>
              )}

              {/* PROCESSING section */}
              {processing.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <RefreshCw size={14} /> รอแอดมินตรวจสอบสลิป
                  </h2>
                  <div className="space-y-3">
                    {processing.map(o => <OrderCard key={o.id} order={o} />)}
                  </div>
                </div>
              )}

              {/* PAID section */}
              {paid.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CheckCircle2 size={14} /> โหวตสำเร็จ
                  </h2>
                  <div className="space-y-3">
                    {paid.map(o => <OrderCard key={o.id} order={o} />)}
                  </div>
                </div>
              )}

              {/* Other (EXPIRED, FAILED) */}
              {other.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <AlertCircle size={14} /> รายการอื่น ๆ
                  </h2>
                  <div className="space-y-3">
                    {other.map(o => <OrderCard key={o.id} order={o} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
