import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, CheckCircle2, Store, User, Heart, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { getAdminCandidates, getAdminPackages, createPOSOrder } from '../../services/api';
import { resolveImageUrl } from '../../utils/imageUtils';
import ImageWithRetry from '../../components/ImageWithRetry';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminPOS = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // Cart state: array of { id, candidate, package, quantity }
  const [cart, setCart] = useState([]);
  
  const [customerName, setCustomerName] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading: loadingCandidates } = useQuery({
    queryKey: ['adminCandidates'],
    queryFn: getAdminCandidates
  });

  const { data: packages = [], isLoading: loadingPackages } = useQuery({
    queryKey: ['adminPackages'],
    queryFn: getAdminPackages
  });

  const activeCandidates = candidates.filter(c => c.isActive && !c.isDeleted);
  const filteredCandidates = activeCandidates.filter(c => {
    const matchesSearch = c.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) || c.candidateNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const activePackages = packages.filter(p => p.isActive);

  // Cart operations
  const handleAddPackage = (pkg) => {
    if (!selectedCandidate) {
      alert("กรุณาเลือกผู้สมัครที่ต้องการเพิ่มโหวตก่อน");
      return;
    }
    
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.candidate.id === selectedCandidate.id && item.package.id === pkg.id);
      if (existingIndex > -1) {
        const newCart = [...prev];
        // Must create a new object to avoid mutating state directly (prevents double-counting in Strict Mode)
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + 1
        };
        return newCart;
      }
      return [...prev, { id: Date.now().toString() + Math.random(), candidate: selectedCandidate, package: pkg, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (Number(item.package.price) * item.quantity), 0);
  const totalVotes = cart.reduce((sum, item) => sum + (item.package.voteAmount * item.quantity), 0);

  const handleCheckout = async (paymentMethod) => {
    if (cart.length === 0) return;
    
    if (window.confirm(`ยืนยันการรับชำระเงิน จำนวนรวม ฿${totalAmount.toLocaleString()} (โหวตทั้งหมด ${totalVotes.toLocaleString()} VOTE) ใช่หรือไม่?`)) {
      setIsCheckingOut(true);
      try {
        // We use Promise.all to submit each cart item as a separate order
        // This is highly efficient and keeps the Order DB schema intact
        await Promise.all(cart.map(item => 
          createPOSOrder({
            candidateId: item.candidate.id,
            packageId: item.package.id,
            quantity: item.quantity,
            paymentMethod,
            customerName: customerName.trim()
          })
        ));
        
        // Refresh candidates list for updated vote count
        queryClient.invalidateQueries({ queryKey: ['adminCandidates'] });
        
        // Reset form
        setSelectedCandidate(null);
        setCart([]);
        setCustomerName('');
        
        // Show Toast
        setToastMessage('สั่งซื้อโหวตสำเร็จ! ระบบได้เพิ่มคะแนนให้ผู้สมัครแล้ว');
        setTimeout(() => setToastMessage(''), 3000);
      } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
      } finally {
        setIsCheckingOut(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#f5f5f5]">POS Walk-in</h1>
          <p className="text-[#a3a3a3] text-sm mt-1">ขายโหวตหน้างานสำหรับผู้ที่ Walk-in (รองรับระบบตะกร้าสินค้า)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
        {/* Left Side: Candidates & Packages */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Candidates Selection */}
          <div className="rounded-2xl border border-[#d4af37]/20 p-4 shadow-sm" style={{ background: 'linear-gradient(135deg, rgba(10,10,10,0.95), rgba(20,20,20,0.9))' }}>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-4 border-b border-[#d4af37]/20 pb-4">
              <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-[0.15em] shrink-0">1. เลือกผู้สมัคร</h3>
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="ค้นหาชื่อ, หมายเลข..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#d4af37]/30 bg-[#050505] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 text-sm text-[#f5f5f5] placeholder-slate-600"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 w-full overflow-x-auto pb-4 mb-2 scrollbar-thin scrollbar-thumb-[#d4af37]/30">
              {['ALL', 'STAR', 'MOON', 'QUEEN'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 ${categoryFilter === cat ? 'bg-[#d4af37] text-[#050505]' : 'bg-[#050505] text-[#c0c0c0] border border-[#d4af37]/30 hover:border-[#d4af37]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[40vh] overflow-y-auto pr-2 pb-2">
              {loadingCandidates ? (
                <div className="col-span-full py-10 text-center"><LoadingSpinner /></div>
              ) : filteredCandidates.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedCandidate(c)}
                  className={`cursor-pointer rounded-xl border p-2 flex flex-col items-center gap-2 transition-all hover:scale-[1.02] ${selectedCandidate?.id === c.id ? 'border-[#d4af37] bg-[#d4af37]/20 shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-[#d4af37]/20 bg-[#050505] hover:border-[#d4af37]/50'}`}
                >
                  <ImageWithRetry 
                    src={resolveImageUrl(c.profileImage)} 
                    alt={c.nickname} 
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-[#d4af37]/50" 
                    fallback="https://placehold.co/64x64/1a1730/e8dfc8?text=?" 
                  />
                  <div className="text-center w-full">
                    <p className="font-bold text-[#f5f5f5] text-xs truncate w-full" title={c.nickname}>{c.nickname}</p>
                    <p className="text-[10px] text-[#d4af37]">No. {c.candidateNumber}</p>
                  </div>
                </div>
              ))}
              {!loadingCandidates && filteredCandidates.length === 0 && (
                <div className="col-span-full py-10 text-center text-[#a3a3a3]">
                  ไม่พบผู้สมัคร
                </div>
              )}
            </div>
          </div>

          {/* Packages Selection */}
          <div className="rounded-2xl border border-[#d4af37]/20 p-4 shadow-sm relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #101010, #050505)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-[80px] pointer-events-none" />
            <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-[0.15em] mb-4 border-b border-[#d4af37]/20 pb-4 relative z-10">2. เลือกแพ็กเกจ (คลิกเพื่อเพิ่มลงตะกร้า)</h3>
            
            {!selectedCandidate && (
              <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm z-20 flex flex-col justify-center items-center rounded-2xl">
                <User size={32} className="text-[#a3a3a3] mb-2" />
                <p className="text-[#f5f5f5] font-medium text-sm">กรุณาเลือกผู้สมัครด้านบนก่อน</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 relative z-10">
              {loadingPackages ? (
                <div className="col-span-full py-4 text-center"><LoadingSpinner /></div>
              ) : activePackages.map(p => (
                <div 
                  key={p.id}
                  onClick={() => handleAddPackage(p)}
                  className="cursor-pointer flex flex-col justify-center p-3 rounded-xl border-2 bg-[#151515] border-[#d4af37]/10 text-[#f5f5f5] hover:border-[#d4af37] hover:bg-[#1a1a1a] hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all duration-300 transform active:scale-95"
                >
                  <p className="font-black text-base mb-1 text-[#d4af37]">฿{Number(p.price).toLocaleString()}</p>
                  <div className="flex justify-between items-end mt-1">
                    <p className="font-bold text-xs text-[#f5f5f5] truncate pr-1">{p.title}</p>
                    <p className="text-[10px] font-bold text-[#a3a3a3] whitespace-nowrap">{p.voteAmount.toLocaleString()} VOTE</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Checkout Cart */}
        <div className="xl:col-span-2 space-y-4 h-full flex flex-col min-h-[600px]">
          <div className="rounded-3xl border border-[#d4af37]/30 flex-1 shadow-2xl flex flex-col relative overflow-hidden" 
            style={{ background: 'linear-gradient(180deg, #0f0f0f 0%, #050505 100%)' }}>
            
            {/* Background glowing effects */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="p-5 border-b border-[#d4af37]/20 relative z-10 flex items-center justify-between bg-black/20">
              <h2 className="text-xl font-black text-[#f5f5f5] flex items-center gap-2 tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
                <Store className="text-[#d4af37]" size={24} /> ตะกร้าสินค้า
              </h2>
              <span className="bg-[#d4af37] text-black text-xs font-bold px-2 py-1 rounded-md">
                {cart.length} รายการ
              </span>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 relative z-10 scrollbar-thin scrollbar-thumb-[#d4af37]/30">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#a3a3a3] opacity-60">
                  <ShoppingCart size={48} className="mb-4 text-[#555]" />
                  <p className="text-sm font-medium">ยังไม่มีแพ็กเกจในตะกร้า</p>
                  <p className="text-xs mt-1">คลิกเลือกแพ็กเกจด้านซ้ายเพื่อเพิ่ม</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-[#151515] border border-[#d4af37]/20 rounded-xl p-3 flex flex-col gap-2 shadow-sm hover:border-[#d4af37]/40 transition-colors">
                    {/* Item header: Candidate */}
                    <div className="flex justify-between items-center border-b border-[#333] pb-2">
                      <div className="flex items-center gap-2">
                        <ImageWithRetry 
                          src={resolveImageUrl(item.candidate.profileImage)} 
                          alt={item.candidate.nickname} 
                          className="w-6 h-6 rounded-full object-cover border border-[#d4af37]" 
                          fallback="https://placehold.co/24x24/1a1730/e8dfc8?text=?" 
                        />
                        <span className="text-xs font-bold text-[#f5f5f5]">
                          {item.candidate.nickname} <span className="text-[#a3a3a3] font-normal text-[10px] ml-1">No. {item.candidate.candidateNumber}</span>
                        </span>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-rose-500/70 hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-rose-500/10">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Item body: Package & Qty */}
                    <div className="flex justify-between items-center pt-1">
                      <div>
                        <p className="text-sm font-bold text-[#d4af37]">{item.package.title}</p>
                        <p className="text-[10px] text-emerald-400 font-medium">+{item.package.voteAmount.toLocaleString()} โหวต</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <p className="font-bold text-[#f5f5f5] text-sm">฿{(Number(item.package.price) * item.quantity).toLocaleString()}</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-[#050505] rounded-lg border border-[#333] p-0.5">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#333] rounded transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold w-4 text-center text-[#d4af37]">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#333] rounded transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Footer */}
            <div className="p-5 border-t border-[#d4af37]/20 relative z-10 bg-[#0a0a0a]/90 backdrop-blur-md">
              <div className="mb-4">
                <label className="block text-[10px] font-bold text-[#d4af37] mb-1.5 uppercase tracking-[0.1em]">ข้อมูลลูกค้า (ทางเลือก)</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-[#d4af37]/50" size={14} />
                  <input 
                    type="text" 
                    placeholder="ระบุชื่อลูกค้า..." 
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#d4af37]/20 bg-[#050505] focus:outline-none focus:border-[#d4af37] text-xs text-[#f5f5f5] placeholder-[#555] transition-colors"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-[#101010] p-4 rounded-xl border border-[#d4af37]/20 mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#a3a3a3] text-xs">คะแนนโหวตรวม</span>
                  <span className="text-emerald-400 font-bold text-sm">+{totalVotes.toLocaleString()} VOTE</span>
                </div>
                <div className="flex justify-between items-end border-t border-[#333] pt-2 mt-2">
                  <span className="text-[#d4af37] font-bold text-sm">ยอดชำระสุทธิ</span>
                  <span className="text-2xl font-black text-[#f5f5f5]">฿{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  disabled={cart.length === 0 || isCheckingOut}
                  onClick={() => handleCheckout('CASH')}
                  className="relative overflow-hidden group bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-black py-4 px-2 rounded-xl transition-all disabled:opacity-50 disabled:grayscale flex justify-center items-center gap-2 shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  {isCheckingOut ? <LoadingSpinner small /> : (
                    <>
                      <CheckCircle2 size={20} />
                      <span className="text-lg tracking-wide">ยืนยันการชำระเงิน</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-success shadow-lg text-[#050505] font-bold bg-emerald-400 border-none flex items-center gap-2 px-6">
            <CheckCircle2 size={24} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPOS;
