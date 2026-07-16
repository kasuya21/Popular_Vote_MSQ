import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowLeft, QrCode, Heart, Star, Moon, Crown } from 'lucide-react';
import { createOrder } from '../services/api';
import { resolveImageUrl } from '../utils/imageUtils';
import ImageWithRetry from '../components/ImageWithRetry';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [formData, setFormData] = useState({ voterName: '', contactInfo: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (!location.state?.candidate || !location.state?.selectedPackage) {
      navigate('/candidates', { replace: true });
      return;
    }
    setCandidate(location.state.candidate);
    setSelectedPackage(location.state.selectedPackage);
  }, [location, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms || !formData.contactInfo) return;
    setIsSubmitting(true);
    try {
      const order = await createOrder({
        candidateId: candidate.id,
        packageId: selectedPackage.id,
        customerName: formData.voterName || 'ไม่ระบุชื่อ',
        customerContact: formData.contactInfo
      });
      navigate(`/payment/${order.orderNo}`);
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      setIsSubmitting(false);
    }
  };

  if (!candidate || !selectedPackage) return null;

  const isStar = candidate.category === 'STAR';
  const isQueen = candidate.category === 'QUEEN';
  const isMoon = candidate.category === 'MOON';
  const Icon = isStar ? Star : isQueen ? Crown : Moon;

  let accentColor = '#f0c94b';
  let badgeLabel = 'ดาว · Star';
  let badgeStyle = { background: 'rgba(240,201,75,0.15)', border: '1px solid rgba(240,201,75,0.4)', color: '#f0c94b' };
  let iconClass = 'text-[#f0c94b] fill-[#f0c94b]';

  if (isMoon) {
    accentColor = '#4dd0c4';
    badgeLabel = 'เดือน · Moon';
    badgeStyle = { background: 'rgba(77,208,196,0.15)', border: '1px solid rgba(77,208,196,0.4)', color: '#4dd0c4' };
    iconClass = 'text-[#4dd0c4] fill-[#4dd0c4]';
  } else if (isQueen) {
    accentColor = '#c084fc';
    badgeLabel = 'ควีน · Queen';
    badgeStyle = { background: 'rgba(192,132,252,0.15)', border: '1px solid rgba(192,132,252,0.4)', color: '#c084fc' };
    iconClass = 'text-[#c084fc] fill-[#c084fc]';
  }

  const canSubmit = acceptedTerms && formData.contactInfo && !isSubmitting;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 font-medium mb-8 transition-colors"
        style={{ color: 'rgba(232,223,200,0.55)' }}
        onMouseEnter={e => e.currentTarget.style.color = accentColor}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,223,200,0.55)'}
      >
        <ArrowLeft size={20} /> ย้อนกลับ
      </button>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-[#e8dfc8] mb-2" style={{ fontFamily: "'Philosopher', serif" }}>
          ตรวจสอบและชำระเงิน
        </h1>
        <p style={{ color: 'rgba(232,223,200,0.45)' }}>กรุณาตรวจสอบข้อมูลและดำเนินการชำระเงินเพื่อบันทึกคะแนนโหวต</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Order Summary — Left */}
        <div className="lg:col-span-2 order-2 lg:order-1 space-y-4">
          {/* Candidate card */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(23,17,56,0.7)', border: `1px solid ${accentColor}30`, backdropFilter: 'blur(12px)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(232,223,200,0.4)', fontFamily: "'Cinzel', serif" }}>
              สรุปรายการโหวต
            </p>

            {/* Candidate info */}
            <div className="flex items-center gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid rgba(232,223,200,0.08)' }}>
              <div className="relative">
                <ImageWithRetry
                  src={resolveImageUrl(candidate.profileImage)}
                  alt={candidate.nickname}
                  className="w-16 h-20 object-cover rounded-xl shadow-lg"
                  style={{ border: `2px solid ${accentColor}50` }}
                  fallback="https://placehold.co/64x80/1a1730/e8dfc8?text=?"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 mb-2 w-fit" style={{ ...badgeStyle, fontFamily: "'Cinzel', serif" }}>
                  <Icon size={9} className={iconClass} /> {badgeLabel}
                </span>
                <p className="font-black text-[#e8dfc8] text-lg" style={{ fontFamily: "'Philosopher', serif" }}>{candidate.nickname}</p>
                <p className="text-xs" style={{ color: 'rgba(232,223,200,0.45)' }}>No. {candidate.candidateNumber} · {candidate.faculty}</p>
              </div>
            </div>

            {/* Package details */}
            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: 'rgba(232,223,200,0.5)' }}>แพ็กเกจ</span>
                <span className="font-medium text-[#e8dfc8]">{selectedPackage.title}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: 'rgba(232,223,200,0.5)' }}>คะแนนที่ได้รับ</span>
                <span className="font-bold flex items-center gap-1" style={{ color: accentColor }}>
                  <Heart size={12} className="fill-current" /> {selectedPackage.voteAmount} โหวต
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-end pt-4" style={{ borderTop: `1px solid ${accentColor}20` }}>
              <span className="text-sm font-medium" style={{ color: 'rgba(232,223,200,0.6)' }}>ยอดชำระ</span>
              <span className="text-3xl font-black text-[#e8dfc8]" style={{ fontFamily: "'Cinzel', serif" }}>
                ฿{Number(selectedPackage.price).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Security notice */}
          <div className="rounded-2xl p-4 flex gap-3 text-sm" style={{ background: 'rgba(77,208,196,0.07)', border: '1px solid rgba(77,208,196,0.2)' }}>
            <Shield size={18} className="shrink-0 mt-0.5" style={{ color: '#4dd0c4' }} />
            <p style={{ color: 'rgba(232,223,200,0.6)' }}>ระบบการชำระเงินปลอดภัย คะแนนจะถูกอัปเดตอัตโนมัติเมื่อทำรายการสำเร็จ</p>
          </div>
        </div>

        {/* Form — Right */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="rounded-2xl p-6 md:p-8" style={{ background: 'rgba(23,17,56,0.7)', border: '1px solid rgba(232,223,200,0.1)', backdropFilter: 'blur(12px)' }}>
            <form onSubmit={handleSubmit}>
              <h3 className="text-lg font-bold text-[#e8dfc8] mb-6" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.05em' }}>
                ข้อมูลผู้โหวต
              </h3>

              <div className="space-y-5 mb-7">
                {/* Voter name */}
                <div>
                  <label htmlFor="voterName" className="block text-sm font-medium mb-2" style={{ color: 'rgba(232,223,200,0.7)' }}>
                    ชื่อเล่น / นามแฝง <span className="font-normal text-xs" style={{ color: 'rgba(232,223,200,0.35)' }}>(ไม่ระบุได้)</span>
                  </label>
                  <input
                    type="text"
                    id="voterName"
                    name="voterName"
                    value={formData.voterName}
                    onChange={handleInputChange}
                    placeholder="เช่น แฟนคลับตัวยง"
                    className="w-full px-4 py-3 rounded-xl text-[#e8dfc8] placeholder-[rgba(232,223,200,0.25)] transition-all outline-none"
                    style={{ background: 'rgba(232,223,200,0.05)', border: '1px solid rgba(232,223,200,0.15)' }}
                    onFocus={e => { e.target.style.border = `1px solid ${accentColor}60`; e.target.style.boxShadow = `0 0 0 3px ${accentColor}15`; }}
                    onBlur={e => { e.target.style.border = '1px solid rgba(232,223,200,0.15)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Contact email */}
                <div>
                  <label htmlFor="contactInfo" className="block text-sm font-medium mb-2" style={{ color: 'rgba(232,223,200,0.7)' }}>
                    อีเมลเพื่อรับใบเสร็จ <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="contactInfo"
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleInputChange}
                    required
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 rounded-xl text-[#e8dfc8] placeholder-[rgba(232,223,200,0.25)] transition-all outline-none"
                    style={{ background: 'rgba(232,223,200,0.05)', border: '1px solid rgba(232,223,200,0.15)' }}
                    onFocus={e => { e.target.style.border = `1px solid ${accentColor}60`; e.target.style.boxShadow = `0 0 0 3px ${accentColor}15`; }}
                    onBlur={e => { e.target.style.border = '1px solid rgba(232,223,200,0.15)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <p className="mt-1.5 text-xs" style={{ color: 'rgba(232,223,200,0.3)' }}>ข้อมูลนี้จะถูกเก็บเป็นความลับและใช้สำหรับอ้างอิงรายการเท่านั้น</p>
                </div>
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl mb-7 transition-colors"
                style={{ border: `1px solid ${acceptedTerms ? accentColor + '40' : 'rgba(232,223,200,0.1)'}`, background: acceptedTerms ? `${accentColor}08` : 'transparent' }}>
                <div className="flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded"
                    style={{ accentColor }}
                    checked={acceptedTerms}
                    onChange={() => setAcceptedTerms(!acceptedTerms)}
                  />
                </div>
                <p className="text-sm" style={{ color: 'rgba(232,223,200,0.6)' }}>
                  ฉันได้อ่านและยอมรับ{' '}
                  <Link to="/terms" target="_blank" className="font-medium hover:underline" style={{ color: accentColor }}>
                    กติกาการโหวตและนโยบายการคืนเงิน
                  </Link>
                  {' '}และรับทราบว่าคะแนนจะถูกเพิ่มหลังระบบยืนยันการชำระเงินสำเร็จเท่านั้น
                </p>
              </label>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-4 rounded-xl text-lg font-bold transition-all duration-300 flex items-center justify-center gap-2"
                style={canSubmit ? {
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                  color: '#0d0818',
                  boxShadow: `0 8px 30px ${accentColor}35`,
                } : {
                  background: 'rgba(232,223,200,0.06)',
                  color: 'rgba(232,223,200,0.25)',
                  cursor: 'not-allowed',
                }}
                onMouseEnter={e => { if (canSubmit) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { if (canSubmit) e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm" style={{ color: '#0d0818' }}></span>
                    กำลังสร้างรายการ...
                  </>
                ) : (
                  <>
                    <QrCode size={20} />
                    สร้าง QR เพื่อชำระเงิน
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
