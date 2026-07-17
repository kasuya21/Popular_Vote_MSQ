import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, RefreshCw, ChevronRight, UploadCloud, Download } from 'lucide-react';
import { getOrderByNo, checkPaymentStatus, uploadSlip, triggerMockWebhook } from '../services/api';
import { generatePromptPayPayload, drawPromptPayQR } from '../utils/promptpay';

const PROMPTPAY_ID = import.meta.env.VITE_PROMPTPAY_ID || '0831542243';
const POLL_INTERVAL_MS = 30_000; // auto-poll every 30 seconds while PROCESSING

const Payment = () => {
  const { orderNo } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPaidOverlay, setShowPaidOverlay] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false); // true when admin fully approved
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  const qrCanvasRef = useRef(null);

  const generateQR = useCallback(async (amount) => {
    if (!qrCanvasRef.current) return;
    try {
      const payload = generatePromptPayPayload(PROMPTPAY_ID, Number(amount));
      await drawPromptPayQR(qrCanvasRef.current, payload, 260);
    } catch (err) {
      console.error('QR generation error:', err);
    }
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await getOrderByNo(orderNo);
        setOrder(orderData);
        setStatus(orderData.status);

        // Restore overlay if customer revisits page after uploading
        if (orderData.status === 'PROCESSING') setShowPaidOverlay(true);
        if (orderData.status === 'PAID') { setShowPaidOverlay(true); setPaidSuccess(true); }

        if (orderData.status === 'PENDING') {
          const createdAt = new Date(orderData.createdAt).getTime();
          const expiresAt = createdAt + 15 * 60 * 1000;
          const now = new Date().getTime();
          if (now > expiresAt) {
            setStatus('EXPIRED');
          } else {
            setTimeLeft(Math.floor((expiresAt - now) / 1000));
          }
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNo]);

  useEffect(() => {
    if (order && status === 'PENDING') {
      setTimeout(() => generateQR(order.amount), 150);
    }
  }, [order, status, generateQR]);

  useEffect(() => {
    if (status !== 'PENDING' || timeLeft <= 0) {
      if (timeLeft <= 0 && status === 'PENDING') setStatus('EXPIRED');
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, status]);

  useEffect(() => {
    return () => { if (filePreview) URL.revokeObjectURL(filePreview); };
  }, [filePreview]);

  // ─── Auto-poll every 30s while PROCESSING (waiting for admin approval) ───
  useEffect(() => {
    if (status !== 'PROCESSING') return;

    const poll = setInterval(async () => {
      try {
        const updatedOrder = await checkPaymentStatus(orderNo);
        if (updatedOrder.status === 'PAID') {
          setOrder(updatedOrder);
          setStatus('PAID');
          setPaidSuccess(true);
          setShowPaidOverlay(true);
          clearInterval(poll);
          setTimeout(() => navigate('/ranking'), 3000);
        }
      } catch (err) {
        console.error('Auto-poll error:', err);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(poll);
  }, [status, orderNo, navigate]);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      const updatedOrder = await checkPaymentStatus(orderNo);
      setOrder(updatedOrder);
      setStatus(updatedOrder.status);
      if (updatedOrder.status === 'PROCESSING') {
        setShowPaidOverlay(true);
      }
      if (updatedOrder.status === 'PAID') {
        setShowPaidOverlay(true);
        setPaidSuccess(true);
        setTimeout(() => navigate('/ranking'), 3000);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith('image/')) {
        alert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (เช่น JPG, PNG)');
        e.target.value = '';
        setFile(null); setFilePreview(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์สลิปต้องไม่เกิน 5MB');
        e.target.value = '';
        setFile(null); setFilePreview(null);
        return;
      }
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!window.confirm('คุณตรวจสอบสลิปและจำนวนเงินเรียบร้อยแล้วใช่หรือไม่?')) return;
    setIsUploading(true);
    try {
      const updatedOrder = await uploadSlip(orderNo, file);
      setOrder(updatedOrder);
      setStatus(updatedOrder.status);
      // Show success overlay on the QR code
      setShowPaidOverlay(true);
    } catch (error) {
      console.error('Error uploading slip:', error);
      alert('ไม่สามารถอัปโหลดสลิปได้ กรุณาลองใหม่');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `promptpay-${orderNo}.png`;
    link.href = qrCanvasRef.current.toDataURL('image/png');
    link.click();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-violet-600"></span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">ไม่พบรายการโหวต</h2>
        <p className="text-slate-500 mt-2">เลขออเดอร์อาจไม่ถูกต้องหรือหมดอายุแล้ว</p>
        <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-violet-100 text-violet-700 rounded-full font-medium hover:bg-violet-200 transition-colors">
          กลับหน้าแรก
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/60 overflow-hidden relative">
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500 opacity-20 pointer-events-none" />

        <div className="relative p-6 sm:p-12">
          {status === 'PENDING' && (
            <div className="flex flex-col items-center">
              <div className="w-full flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">ชำระเงิน</h1>
                  <p className="text-sm font-medium text-slate-500 mt-1">Ref: {order.orderNo}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold mb-2">
                    <Clock size={14} className={timeLeft < 300 ? 'text-rose-500 animate-pulse' : ''} />
                    <span className={timeLeft < 300 ? 'text-rose-600' : ''}>{formatTime(timeLeft)}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">เวลาที่เหลือ</span>
                </div>
              </div>
              
              {/* Receipt-like Amount Area */}
              <div className="w-full bg-slate-50/80 rounded-3xl p-6 mb-8 text-center border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                <p className="text-sm font-medium text-slate-500 mb-2">ยอดเงินที่ต้องชำระ (บาท)</p>
                <p className="text-5xl font-black text-slate-800 tracking-tight">
                  {Number(order.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="relative group mb-8">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div
                  className={`bg-white p-6 rounded-[2rem] border-2 relative flex flex-col items-center justify-center transition-all duration-500 ${
                    showPaidOverlay ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]' : 'border-slate-100 shadow-xl'
                  }`}
                >
                  <div className="mb-4 bg-slate-800 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> PromptPay
                  </div>
                  
                  <div className="relative" style={{ width: 260, height: 260 }}>
                    <canvas ref={qrCanvasRef} width={260} height={260} className={`rounded-xl transition-all duration-500 ${showPaidOverlay ? 'opacity-20 blur-md scale-95' : 'scale-100'}`} />

                    {/* Paid Overlay Animation */}
                    {showPaidOverlay && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ animation: 'qrSuccessIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                        <style>{`
                          @keyframes qrSuccessIn {
                            0% { opacity: 0; transform: scale(0.5) translateY(20px); }
                            100% { opacity: 1; transform: scale(1) translateY(0); }
                          }
                          @keyframes float {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-5px); }
                          }
                        `}</style>
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-2xl bg-gradient-to-tr from-emerald-400 to-teal-300"
                          style={{ animation: 'float 3s ease-in-out infinite' }}>
                          <CheckCircle2 size={50} className="text-white" strokeWidth={3} />
                        </div>
                        {paidSuccess ? (
                          <>
                            <p className="text-emerald-600 font-black text-xl tracking-tight">โหวตสำเร็จ!</p>
                            <p className="text-emerald-500/80 text-sm font-medium mt-1">กำลังไปหน้าอันดับ...</p>
                          </>
                        ) : (
                          <>
                            <p className="text-teal-600 font-black text-xl tracking-tight">รับสลิปแล้ว</p>
                            <p className="text-teal-500/80 text-sm font-medium mt-1">รอแอดมินตรวจสอบ</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Download QR button */}
              <button
                onClick={handleDownloadQR}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 font-semibold mb-10 px-6 py-2.5 rounded-full bg-slate-50 hover:bg-violet-50 transition-all shadow-sm border border-slate-200 hover:border-violet-200"
              >
                <Download size={16} />
                บันทึก QR Code
              </button>
              
              {/* Upload Slip Area */}
              <div className="w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">แนบหลักฐานการโอนเงิน</span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <div className="relative group cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    title=" "
                  />
                  <div className={`w-full rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8
                    ${filePreview ? 'border-violet-400 bg-violet-50/50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-violet-300'}`}
                  >
                    {filePreview ? (
                      <div className="flex flex-col items-center">
                        <div className="relative mb-3">
                          <img src={filePreview} alt="Slip Preview" className="h-40 object-contain rounded-xl shadow-md border border-white" />
                          <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white text-white">
                            <CheckCircle2 size={16} strokeWidth={3} />
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-violet-600">แตะเพื่อเปลี่ยนรูปภาพ</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                          <UploadCloud size={28} className="text-violet-500" />
                        </div>
                        <p className="text-base font-bold text-slate-700 mb-1">อัปโหลดสลิปที่นี่</p>
                        <p className="text-xs text-slate-400 font-medium">รองรับ JPG, PNG ขนาดไม่เกิน 5MB</p>
                      </>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={handleUpload}
                  disabled={isUploading || !file}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_25px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 active:translate-y-0 text-lg"
                >
                  {isUploading ? (
                    <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> กำลังส่งข้อมูล...</>
                  ) : (
                    <>ยืนยันการชำระเงิน <ChevronRight size={20} /></>
                  )}
                </button>

                {/* Dev Only */}
                {process.env.NODE_ENV === 'development' && (
                  <button 
                    onClick={async () => {
                      try {
                        await triggerMockWebhook(order.providerReference, order.amount);
                        alert('จำลองการยิง Webhook สำเร็จ!');
                        setTimeout(() => handleCheckStatus(), 1500);
                      } catch (error) {
                        console.error(error);
                      }
                    }}
                    className="w-full mt-4 py-2 text-slate-400 hover:text-slate-600 text-xs font-medium flex justify-center items-center gap-1 opacity-50 hover:opacity-100 transition-opacity"
                  >
                    🛠️ Mock Webhook (Dev Mode)
                  </button>
                )}
              </div>
            </div>
          )}

          {status === 'PROCESSING' && (
            <div className="py-10 flex flex-col items-center text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-full flex items-center justify-center relative shadow-lg">
                  <Clock size={48} className="text-blue-500 animate-[spin_4s_linear_infinite]" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-3">กำลังตรวจสอบสลิป</h2>
              <p className="text-slate-500 mb-8 font-medium max-w-sm">
                ระบบได้รับสลิปของคุณแล้ว แอดมินกำลังตรวจสอบความถูกต้อง อาจใช้เวลาสักครู่...
              </p>
              
              <div className="w-full bg-slate-50 rounded-2xl p-5 mb-8 text-left border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <RefreshCw size={20} className="text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">ระบบเช็กให้อัตโนมัติ</p>
                  <p className="text-xs text-slate-500">คุณสามารถออกจากหน้านี้ได้เลย</p>
                </div>
              </div>

              <button 
                onClick={handleCheckStatus}
                disabled={isChecking}
                className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-lg hover:shadow-xl"
              >
                {isChecking ? (
                  <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> กำลังโหลด...</>
                ) : (
                  <>เช็กสถานะด้วยตัวเอง</>
                )}
              </button>
            </div>
          )}

          {status === 'PAID' && (
            <div className="py-10 flex flex-col items-center text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-30"></div>
                <div className="w-28 h-28 bg-gradient-to-tr from-emerald-400 to-teal-400 rounded-full flex items-center justify-center relative shadow-2xl border-4 border-white">
                  <CheckCircle2 size={56} className="text-white" strokeWidth={3} />
                </div>
              </div>
              <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">โหวตสำเร็จ!</h2>
              <p className="text-slate-500 mb-10 font-medium text-lg">ขอบคุณที่ร่วมสนับสนุน {order.candidateName}</p>
              
              <div className="w-full bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-3xl p-6 mb-10 border border-violet-100 shadow-inner">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-violet-200/50">
                  <span className="text-violet-600/80 font-semibold text-sm">เลขออเดอร์</span>
                  <span className="font-mono text-violet-900 font-bold bg-white px-3 py-1 rounded-lg shadow-sm text-sm">{order.orderNo}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-violet-600/80 font-semibold text-sm">แพ็กเกจ</span>
                  <span className="font-bold text-violet-900">{order.package.name}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-violet-600/80 font-semibold text-sm">ได้รับคะแนน</span>
                  <span className="font-black text-fuchsia-600 text-2xl">+{order.package.voteAmount} <span className="text-base font-bold text-fuchsia-600/80">โหวต</span></span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Link to="/" className="flex-1 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl transition-all border-2 border-slate-200 text-center">
                  กลับหน้าแรก
                </Link>
                <Link to="/ranking" className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold rounded-2xl transition-all shadow-[0_8px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_25px_rgba(124,58,237,0.4)] flex items-center justify-center gap-2">
                  ดูอันดับคะแนน <ChevronRight size={20} />
                </Link>
              </div>
            </div>
          )}

          {status === 'EXPIRED' && (
            <div className="py-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <AlertCircle size={48} className="text-rose-500" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-3">หมดเวลาชำระเงิน</h2>
              <p className="text-slate-500 mb-10 font-medium">รายการนี้หมดอายุเนื่องจากไม่ได้รับการชำระเงินภายในเวลาที่กำหนด</p>
              <Link to="/candidates" className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2">
                <RefreshCw size={18} /> เริ่มทำรายการใหม่
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
