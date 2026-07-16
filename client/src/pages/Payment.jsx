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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">การชำระเงิน</h1>
        <p className="text-slate-500 font-mono">Ref: {order.orderNo}</p>
      </div>

      <div className="glass-card overflow-hidden">
        {status === 'PENDING' && (
          <div className="p-6 md:p-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 font-medium text-sm mb-8">
              <Clock size={16} />
              <span>รอการชำระเงิน</span>
            </div>
            
            {/* QR Code Canvas */}
            <div
              className={`bg-white p-3 rounded-2xl border-2 shadow-sm mb-3 relative flex items-center justify-center transition-all duration-500 ${
                showPaidOverlay ? 'border-green-400' : 'border-slate-200'
              }`}
              style={{ width: 292, height: 292 }}
            >
              <canvas ref={qrCanvasRef} width={260} height={260} className={`rounded-lg transition-all duration-500 ${showPaidOverlay ? 'opacity-30 blur-sm' : ''}`} />

              {/* Paid overlay */}
              {showPaidOverlay && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm" style={{ animation: 'qrSuccessIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                  <style>{`
                    @keyframes qrSuccessIn {
                      0% { opacity: 0; transform: scale(0.6); }
                      100% { opacity: 1; transform: scale(1); }
                    }
                  `}</style>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3 shadow-lg"
                    style={{ animation: 'qrSuccessIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both', backgroundColor: paidSuccess ? '#dcfce7' : '#d1fae5' }}>
                    <CheckCircle2 size={44} className={paidSuccess ? 'text-emerald-500' : 'text-green-500'} strokeWidth={2.5} />
                  </div>
                  {paidSuccess ? (
                    <>
                      <p className="text-emerald-700 font-bold text-base">โหวตสำเร็จ! 🎉</p>
                      <p className="text-emerald-600 text-xs mt-1">กำลังไปหน้าอันดับ...</p>
                    </>
                  ) : (
                    <>
                      <p className="text-green-700 font-bold text-base">รับสลิปแล้ว ✅</p>
                      <p className="text-green-600 text-xs mt-1">รอแอดมินตรวจสอบ</p>
                      <p className="text-slate-400 text-xs mt-0.5">ระบบเช็กให้อัตโนมัติทุก 30 วิ</p>
                    </>
                  )}
                </div>
              )}

              <div className={`absolute inset-0 border-4 rounded-xl m-1.5 pointer-events-none transition-colors duration-500 ${showPaidOverlay ? 'border-green-400' : 'border-violet-500'}`} />
            </div>

            {/* Download QR */}
            <button
              onClick={handleDownloadQR}
              className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 font-medium mb-8 px-4 py-1.5 rounded-full border border-violet-200 hover:bg-violet-50 transition-all"
            >
              <Download size={14} />
              ดาวน์โหลด QR Code
            </button>
            
            <div className="text-center mb-8 w-full max-w-sm">
              <p className="text-slate-500 mb-1">ยอดเงินที่ต้องชำระ</p>
              <p className="text-4xl font-extrabold text-violet-700 mb-6">฿{Number(order.amount).toFixed(2)}</p>
              
              <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center mb-6">
                <span className="text-slate-500 text-sm font-medium">QR หมดอายุใน</span>
                <span className={`text-xl font-bold font-mono ${timeLeft < 300 ? 'text-rose-500' : 'text-slate-800'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              {/* Slip Upload */}
              <div className="w-full mb-6 text-left">
                <label className="block text-sm font-medium text-slate-700 mb-2">อัปโหลดสลิปโอนเงิน</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input file-input-bordered file-input-primary w-full" 
                />
                {filePreview && (
                  <div className="mt-4 p-3 border border-slate-200 rounded-xl bg-slate-50">
                    <p className="text-xs text-slate-500 mb-2 text-center">ตัวอย่างสลิปที่เลือก</p>
                    <img src={filePreview} alt="Slip Preview" className="max-h-48 mx-auto rounded-lg object-contain shadow-sm border border-slate-200" />
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleUpload}
                disabled={isUploading || !file}
                className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:bg-slate-300 mb-4"
              >
                {isUploading ? (
                  <><span className="loading loading-spinner loading-sm"></span> กำลังอัปโหลด...</>
                ) : (
                  <><UploadCloud size={18} /> ยืนยันการชำระเงิน</>
                )}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">หรือสำหรับการทดสอบ</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button 
                onClick={async () => {
                  try {
                    await triggerMockWebhook(order.providerReference, order.amount);
                    alert('จำลองการยิง Webhook สำเร็จ! ระบบจะโหลดสถานะใหม่ใน 2 วินาที...');
                    setTimeout(() => handleCheckStatus(), 2000);
                  } catch (error) {
                    console.error(error);
                    alert('เกิดข้อผิดพลาดในการจำลอง Webhook');
                  }
                }}
                className="w-full mt-2 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm"
              >
                🛠️ จำลองจ่ายเงินสำเร็จ (Auto Webhook)
              </button>
            </div>
            
            <p className="text-sm text-slate-400 text-center max-w-sm">
              เมื่อโอนเงินสำเร็จ กรุณาแนบสลิปและกดยืนยันการชำระเงิน
            </p>
          </div>
        )}

        {status === 'PROCESSING' && (
          <div className="p-8 md:p-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Clock size={40} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">อัปโหลดสลิปสำเร็จ</h2>
            <p className="text-slate-500 mb-4">ระบบได้รับสลิปของคุณแล้ว กรุณารอแอดมินตรวจสอบความถูกต้อง (อาจใช้เวลา 5-15 นาที)</p>
            <p className="text-sm text-slate-400 mb-8">คุณสามารถออกจากหน้านี้และกลับมาตรวจสอบสถานะภายหลังได้ที่เมนู "ตรวจสอบสถานะ"</p>
            <button 
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="w-full max-w-xs py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:bg-slate-400"
            >
              {isChecking ? (
                <><span className="loading loading-spinner loading-sm"></span> กำลังตรวจสอบ...</>
              ) : (
                <><RefreshCw size={18} /> โหลดสถานะล่าสุด</>
              )}
            </button>
          </div>
        )}

        {status === 'PAID' && (
          <div className="p-8 md:p-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">โหวตสำเร็จ!</h2>
            <p className="text-slate-500 mb-8">ขอบคุณที่ร่วมสนับสนุน {order.candidateName}</p>
            <div className="w-full max-w-sm bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-500 text-sm">เลขออเดอร์</span>
                <span className="font-mono text-slate-700 text-sm">{order.orderNo}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-500 text-sm">แพ็กเกจ</span>
                <span className="font-medium text-slate-700">{order.package.name}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="text-slate-500 font-medium">ได้รับคะแนน</span>
                <span className="font-bold text-violet-600 text-lg">+{order.package.voteAmount} โหวต</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link to="/" className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">
                กลับหน้าแรก
              </Link>
              <Link to="/ranking" className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-1">
                ดูอันดับคะแนน <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        )}

        {status === 'EXPIRED' && (
          <div className="p-8 md:p-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle size={40} className="text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">QR Code หมดอายุ</h2>
            <p className="text-slate-500 mb-8">รายการนี้หมดอายุเนื่องจากไม่ได้รับการชำระเงินภายในเวลาที่กำหนด</p>
            <Link to="/candidates" className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors shadow-md">
              สร้างรายการโหวตใหม่
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
