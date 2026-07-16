const nodemailer = require('nodemailer');

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password (not your real password)
    },
  });

  return transporter;
}

/**
 * Send a "slip received" confirmation email to the customer.
 */
async function sendSlipReceivedEmail({ to, customerName, orderNo, candidateName, packageName, voteAmount, amount }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('[Email] EMAIL_USER or EMAIL_APP_PASSWORD not set — skipping email.');
    return;
  }

  const displayName = customerName && customerName !== 'ไม่ระบุชื่อ' ? customerName : 'คุณลูกค้า';
  const formattedAmount = Number(amount).toLocaleString('th-TH', { minimumFractionDigits: 2 });

  const html = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ยืนยันการส่งสลิป</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f8f7ff; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(109,40,217,0.08); }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 800; }
    .header p { color: #e9d5ff; margin: 6px 0 0; font-size: 14px; }
    .check { width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 32px; }
    .body { padding: 32px; }
    .greeting { font-size: 16px; color: #334155; margin-bottom: 24px; line-height: 1.6; }
    .card { background: #f8f7ff; border-radius: 14px; padding: 20px 24px; margin-bottom: 24px; border: 1px solid #e9d5ff; }
    .card-title { font-size: 11px; font-weight: 700; color: #7c3aed; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 14px; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #ede9fe; }
    .row:last-child { border-bottom: none; }
    .label { font-size: 13px; color: #64748b; }
    .value { font-size: 14px; font-weight: 700; color: #1e293b; text-align: right; }
    .amount-row { margin-top: 12px; padding: 14px 20px; background: linear-gradient(135deg, #1e1b4b, #312e81); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
    .amount-label { color: #c7d2fe; font-size: 14px; }
    .amount-value { color: #fde68a; font-size: 22px; font-weight: 900; font-family: monospace; }
    .notice { background: #fefce8; border: 1px solid #fde047; border-radius: 12px; padding: 14px 18px; font-size: 13px; color: #713f12; line-height: 1.6; margin-bottom: 24px; }
    .footer { background: #f1f5f9; text-align: center; padding: 20px 32px; font-size: 12px; color: #94a3b8; }
    .order-no { font-family: monospace; font-size: 12px; color: #7c3aed; background: #f3f0ff; padding: 2px 8px; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="check">✅</div>
      <h1>ได้รับสลิปการโหวตแล้ว!</h1>
      <p>กรุณารอแอดมินตรวจสอบ 5-15 นาที</p>
    </div>
    <div class="body">
      <p class="greeting">
        สวัสดี <strong>${displayName}</strong> 👋<br/>
        เราได้รับสลิปการโหวตของคุณเรียบร้อยแล้ว ทีมงานจะตรวจสอบและบันทึกคะแนนให้ในเร็ว ๆ นี้ครับ
      </p>

      <div class="card">
        <div class="card-title">📋 รายละเอียดรายการ</div>
        <div class="row">
          <span class="label">หมายเลขออเดอร์</span>
          <span class="value order-no">${orderNo}</span>
        </div>
        <div class="row">
          <span class="label">โหวตให้</span>
          <span class="value">${candidateName}</span>
        </div>
        <div class="row">
          <span class="label">แพ็กเกจ</span>
          <span class="value">${packageName}</span>
        </div>
        <div class="row">
          <span class="label">จำนวนคะแนน</span>
          <span class="value" style="color:#7c3aed;">+${voteAmount} โหวต</span>
        </div>
        <div class="amount-row">
          <span class="amount-label">ยอดชำระเงิน</span>
          <span class="amount-value">฿${formattedAmount}</span>
        </div>
      </div>

      <div class="notice">
        ⏳ <strong>ขั้นตอนถัดไป:</strong> ทีมงานจะตรวจสอบสลิปและบันทึกคะแนนให้ภายใน 5–15 นาที
        คุณสามารถตรวจสอบสถานะได้ที่เมนู <strong>"รายการโหวตของฉัน"</strong> บนเว็บไซต์
      </div>
    </div>
    <div class="footer">
      อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ<br/>
      หากมีข้อสงสัยติดต่อทีมงานผ่านช่องทางโซเชียล
    </div>
  </div>
</body>
</html>
  `.trim();

  await getTransporter().sendMail({
    from: `"ระบบโหวต SMV" <${process.env.EMAIL_USER}>`,
    to,
    subject: `✅ ได้รับสลิปแล้ว | ออเดอร์ ${orderNo}`,
    html,
  });

  console.log(`[Email] Slip receipt sent to ${to} for order ${orderNo}`);
}

module.exports = { sendSlipReceivedEmail };
