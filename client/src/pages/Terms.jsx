import React from 'react';
import { Book, CreditCard, Shield, Mail } from 'lucide-react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24">
      <div className="text-center mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#d4a017', fontFamily: "'Cinzel', serif" }}>
          Rules & Regulations
        </p>
        <h1 className="text-3xl md:text-5xl font-black mb-4 text-[#e8dfc8]" style={{ fontFamily: "'Philosopher', serif" }}>
          กติกาและเงื่อนไข
        </h1>
        <p style={{ color: 'rgba(232,223,200,0.5)' }}>
          ข้อกำหนดการใช้งาน การโหวต และการชำระเงิน
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1: Voting Rules */}
        <section className="rounded-3xl p-6 md:p-8"
          style={{ background: 'rgba(23,17,56,0.7)', border: '1px solid rgba(232,223,200,0.1)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid rgba(232,223,200,0.08)' }}>
            <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'rgba(192,132,252,0.15)', border: '1px solid rgba(192,132,252,0.3)', color: '#c084fc' }}>
              <Book size={24} />
            </div>
            <h2 className="text-2xl font-bold text-[#e8dfc8]" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.05em' }}>
              กติกาการโหวต
            </h2>
          </div>
          <div className="space-y-4 leading-relaxed" style={{ color: 'rgba(232,223,200,0.7)' }}>
            <p>1. การโหวตรายการ MSQ 2026 เป็นการโหวตแบบเสียค่าใช้จ่าย โดยผู้โหวตสามารถซื้อแพ็กเกจโหวตได้ตามที่ระบบกำหนด</p>
            <p>2. สามารถโหวตให้ผู้สมัครได้ไม่จำกัดจำนวนครั้ง และไม่จำกัดผู้สมัคร</p>
            <p>3. คะแนนจะถูกนับเมื่อการชำระเงินได้รับการ <strong style={{ color: '#c084fc' }}>ยืนยันแล้วเท่านั้น</strong></p>
            <p>4. การตัดสินของคณะกรรมการถือเป็นที่สิ้นสุด</p>
          </div>
        </section>

        {/* Section 2: Payment */}
        <section className="rounded-3xl p-6 md:p-8"
          style={{ background: 'rgba(23,17,56,0.7)', border: '1px solid rgba(232,223,200,0.1)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid rgba(232,223,200,0.08)' }}>
            <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'rgba(77,208,196,0.15)', border: '1px solid rgba(77,208,196,0.3)', color: '#4dd0c4' }}>
              <CreditCard size={24} />
            </div>
            <h2 className="text-2xl font-bold text-[#e8dfc8]" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.05em' }}>
              วิธีชำระเงิน
            </h2>
          </div>
          <div className="space-y-4 leading-relaxed" style={{ color: 'rgba(232,223,200,0.7)' }}>
            <p>1. ระบบรองรับการชำระเงินผ่าน <strong className="text-[#e8dfc8]">PromptPay QR Code</strong> เท่านั้น</p>
            <p>2. เมื่อสร้างรายการโหวตแล้ว ระบบจะแสดง QR Code ซึ่งมีอายุการใช้งาน <strong style={{ color: '#fb7185' }}>15 นาที</strong></p>
            <p>3. หาก QR Code หมดอายุ กรุณาทำรายการโหวตใหม่</p>
            <p>4. หลังสแกนชำระเงินผ่านแอปธนาคารสำเร็จ กรุณากดปุ่ม "ตรวจสอบสถานะการชำระเงิน" ในหน้าระบบเพื่อให้ระบบอัปเดตคะแนน</p>
          </div>
        </section>

        {/* Section 3: Policy */}
        <section className="rounded-3xl p-6 md:p-8"
          style={{ background: 'rgba(23,17,56,0.7)', border: '1px solid rgba(232,223,200,0.1)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid rgba(232,223,200,0.08)' }}>
            <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'rgba(251,113,133,0.15)', border: '1px solid rgba(251,113,133,0.3)', color: '#fb7185' }}>
              <Shield size={24} />
            </div>
            <h2 className="text-2xl font-bold text-[#e8dfc8]" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.05em' }}>
              นโยบายคะแนนและการคืนเงิน
            </h2>
          </div>
          <div className="space-y-5 leading-relaxed" style={{ color: 'rgba(232,223,200,0.7)' }}>
            <div className="p-5 rounded-xl border" style={{ background: 'rgba(251,113,133,0.05)', border: '1px solid rgba(251,113,133,0.2)', color: '#fb7185' }}>
              <strong className="block mb-2 font-bold tracking-wide">การขอคืนเงิน (Refund Policy)</strong>
              <span className="text-sm">ระบบไม่สามารถคืนเงินได้ในทุกกรณี (No Refund) กรุณาตรวจสอบข้อมูลผู้สมัครและแพ็กเกจให้ถูกต้องก่อนดำเนินการชำระเงิน</span>
            </div>
            <p>1. หากพบปัญหาในการทำรายการ หรือชำระเงินแล้วคะแนนไม่อัปเดตภายใน 1 ชั่วโมง กรุณาติดต่อผู้จัดงานพร้อมแนบหลักฐาน (สลิปโอนเงิน และ เลขออเดอร์)</p>
            <p>2. ผู้จัดงานขอสงวนสิทธิ์ในการหักคะแนน หากตรวจพบการทุจริตในระบบ หรือการปลอมแปลงหลักฐานการชำระเงิน</p>
          </div>
        </section>

        {/* Section 4: Contact */}
        <section className="rounded-3xl p-6 md:p-8"
          style={{ background: 'rgba(23,17,56,0.7)', border: '1px solid rgba(232,223,200,0.1)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid rgba(232,223,200,0.08)' }}>
            <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'rgba(240,201,75,0.15)', border: '1px solid rgba(240,201,75,0.3)', color: '#f0c94b' }}>
              <Mail size={24} />
            </div>
            <h2 className="text-2xl font-bold text-[#e8dfc8]" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.05em' }}>
              ติดต่อผู้จัดงาน
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 p-5 rounded-2xl" style={{ background: 'rgba(232,223,200,0.03)', border: '1px solid rgba(232,223,200,0.08)' }}>
              <span className="text-xs tracking-widest uppercase block mb-2" style={{ color: 'rgba(232,223,200,0.4)', fontFamily: "'Cinzel', serif" }}>Organizer</span>
              <span className="text-[#e8dfc8] font-medium">สโมสรนักศึกษาคณะวิทยาศาสตร์</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Terms;
