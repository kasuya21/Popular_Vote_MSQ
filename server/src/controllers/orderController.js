const crypto = require('crypto');
const prisma = require('../utils/prisma');
const AppError = require('../utils/errors');
const { createOrderSchema } = require('../validators/schemas');
const { hashContactInfo, generateIdempotencyKey, verifyWebhookSignature } = require('../utils/crypto');
const { sendSlipReceivedEmail } = require('../services/emailService');

// --- PUBLIC APIs ---

exports.createOrder = async (req, res, next) => {
  try {
    const data = createOrderSchema.shape.body.parse(req.body);
    
    // Check if candidate and package exist and are active
    const candidate = await prisma.candidate.findFirst({
      where: { id: data.candidateId, isActive: true, isDeleted: false }
    });
    if (!candidate) return next(new AppError('Candidate not found or inactive', 404));

    const pkg = await prisma.votePackage.findFirst({
      where: { id: data.packageId, isActive: true }
    });
    if (!pkg) return next(new AppError('Package not found or inactive', 404));

    const idempotencyKey = generateIdempotencyKey(data.candidateId, data.packageId, data.customerContact);

    // Check if order already exists in the recent time window (idempotency check)
    const existingOrder = await prisma.order.findUnique({ where: { idempotencyKey } });
    if (existingOrder) {
      return res.status(200).json({ success: true, data: existingOrder });
    }

    // Generate unique order number
    const orderNo = `SMV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    // Generate expiresAt (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const providerReference = `REF-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    
    // Generate PromptPay QR Code via promptpay.io with fixed amount
    const promptpayId = process.env.PROMPTPAY_ID || '0812345678'; // Default fallback
    const qrCodeUrl = `https://promptpay.io/${promptpayId}/${Number(pkg.price).toFixed(2)}.png`;

    const customerContactHash = hashContactInfo(data.customerContact);

    const order = await prisma.order.create({
      data: {
        orderNo,
        idempotencyKey,
        candidateId: data.candidateId,
        packageId: data.packageId,
        customerName: data.customerName,
        customerContact: data.customerContact, // Masked later in UI
        customerContactHash,
        amount: pkg.price,
        expectedVoteAmount: pkg.voteAmount,
        status: 'PENDING',
        paymentProvider: 'MOCK_PROMPTPAY',
        providerReference,
        qrCodeUrl,
        expiresAt
      },
      include: {
        candidate: { select: { nickname: true, fullName: true } },
        package: { select: { title: true, voteAmount: true } } // wait, package field is 'title' in DB, I'll map it to 'name' in response for backward compatibility
      }
    });

    // Map title to name for frontend compatibility
    const mappedOrder = {
      ...order,
      candidateName: order.candidate.nickname,
      package: { ...order.package, name: order.package.title }
    };

    res.status(201).json({ success: true, data: mappedOrder });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const { orderNo } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { orderNo },
      include: {
        candidate: { select: { nickname: true, fullName: true } },
        package: { select: { title: true, voteAmount: true } }
      }
    });

    if (!order) return next(new AppError('Order not found', 404));

    // Optional check: if pending and past expiration, update status
    if (order.status === 'PENDING' && new Date() > new Date(order.expiresAt)) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'EXPIRED' }
      });
      order.status = 'EXPIRED';
    }

    const mappedOrder = {
      ...order,
      candidateName: order.candidate.nickname,
      package: { ...order.package, name: order.package.title }
    };

    res.status(200).json({ success: true, data: mappedOrder });
  } catch (error) {
    next(error);
  }
};

// --- MOCK WEBHOOK FOR DEVELOPMENT ---

exports.mockWebhook = async (req, res, next) => {
  try {
    const { providerReference, amount } = req.body;
    
    const order = await prisma.order.findUnique({ where: { providerReference } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Generate signature for the payload to simulate real gateway
    const payload = {
      eventId: `EVT-${Date.now()}`,
      providerReference: order.providerReference,
      amount: amount || Number(order.amount),
      currency: 'THB',
      status: 'SUCCESS'
    };
    
    const signature = crypto
      .createHmac('sha256', process.env.PAYMENT_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    // Simulate sending HTTP POST to our own webhook
    const axios = require('axios');
    const webhookUrl = `http://localhost:${process.env.PORT || 5000}/api/payments/webhook`;
    
    // Execute asynchronously
    axios.post(webhookUrl, payload, {
      headers: { 'x-signature': signature }
    }).catch(err => console.error("Mock webhook failed:", err.message));

    res.status(200).json({ success: true, message: 'Webhook triggered' });
  } catch (error) {
    next(error);
  }
};

// --- ACTUAL WEBHOOK ENDPOINT ---

exports.handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-signature'];
    const payload = req.body;

    // 1. Verify Signature
    if (!verifyWebhookSignature(JSON.stringify(payload), signature, process.env.PAYMENT_SECRET)) {
      await prisma.paymentWebhookLog.create({
        data: {
          provider: 'MOCK_PROMPTPAY',
          providerEventId: payload.eventId || null,
          payload: payload,
          signatureValid: false,
          processingError: 'Invalid signature'
        }
      });
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // 2. Idempotency Check
    const existingLog = await prisma.paymentWebhookLog.findUnique({
      where: {
        provider_providerEventId: {
          provider: 'MOCK_PROMPTPAY',
          providerEventId: payload.eventId
        }
      }
    });

    if (existingLog && existingLog.isProcessed) {
      return res.status(200).json({ success: true, message: 'Webhook already processed' });
    }

    let webhookLog;
    if (!existingLog) {
      webhookLog = await prisma.paymentWebhookLog.create({
        data: {
          provider: 'MOCK_PROMPTPAY',
          providerEventId: payload.eventId,
          payload: payload,
          signatureValid: true
        }
      });
    } else {
      webhookLog = existingLog;
    }

    // 3. Find Order & Validate
    const order = await prisma.order.findUnique({
      where: { providerReference: payload.providerReference }
    });

    if (!order) {
      await prisma.paymentWebhookLog.update({
        where: { id: webhookLog.id },
        data: { processingError: 'Order not found' }
      });
      return res.status(200).json({ success: true }); // Acknowledge anyway
    }

    if (order.status === 'PAID') {
      await prisma.paymentWebhookLog.update({
        where: { id: webhookLog.id },
        data: { isProcessed: true, processingError: 'Order already PAID' }
      });
      return res.status(200).json({ success: true });
    }

    // Amount validation
    if (Number(payload.amount) !== Number(order.amount)) {
      await prisma.paymentWebhookLog.update({
        where: { id: webhookLog.id },
        data: { processingError: 'Amount mismatch' }
      });
      // In a real system, you might set Order status to PARTIALLY_PAID or FAILED
      return res.status(200).json({ success: true });
    }

    // 4. Prisma Transaction: Atomically update everything
    await prisma.$transaction(async (tx) => {
      // Create Transaction
      const transaction = await tx.paymentTransaction.create({
        data: {
          orderId: order.id,
          provider: 'MOCK_PROMPTPAY',
          providerEventId: payload.eventId,
          providerTransactionId: `TX-${Date.now()}`,
          providerReference: payload.providerReference,
          amount: payload.amount,
          status: 'PAID',
          paidAt: new Date(),
          signatureValid: true
        }
      });

      // Update Order
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID', paidAt: new Date() }
      });

      // Create Vote
      await tx.vote.create({
        data: {
          candidateId: order.candidateId,
          orderId: order.id,
          quantity: order.expectedVoteAmount
        }
      });

      // Increment Candidate Vote Count
      await tx.candidate.update({
        where: { id: order.candidateId },
        data: { voteCount: { increment: order.expectedVoteAmount } }
      });

      // Mark webhook as processed
      await tx.paymentWebhookLog.update({
        where: { id: webhookLog.id },
        data: { isProcessed: true, providerTransactionId: transaction.providerTransactionId }
      });
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false });
  }
};

exports.getOrdersByEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) return next(new AppError('Email is required', 400));

    const contactHash = hashContactInfo(email);

    const orders = await prisma.order.findMany({
      where: { customerContactHash: contactHash },
      orderBy: { createdAt: 'desc' },
      include: {
        candidate: { select: { nickname: true, fullName: true, profileImage: true, candidateNumber: true } },
        package: { select: { title: true, voteAmount: true } }
      }
    });

    // Expire pending orders past their time
    const now = new Date();
    const mapped = orders.map(o => {
      let status = o.status;
      if (status === 'PENDING' && o.expiresAt && now > new Date(o.expiresAt)) {
        status = 'EXPIRED';
      }
      return {
        ...o,
        status,
        candidateName: o.candidate?.nickname,
        candidateNumber: o.candidate?.candidateNumber,
        profileImage: o.candidate?.profileImage,
        package: { ...o.package, name: o.package?.title }
      };
    });

    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
};

// --- MANUAL SLIP APPROVAL ---

exports.uploadSlip = async (req, res, next) => {
  try {
    const { orderNo } = req.params;
    if (!req.file) return next(new AppError('No slip uploaded', 400));

    const order = await prisma.order.findUnique({
      where: { orderNo },
      include: {
        candidate: { select: { nickname: true } },
        package: { select: { title: true, voteAmount: true } }
      }
    });
    if (!order) return next(new AppError('Order not found', 404));
    
    if (order.status !== 'PENDING') {
      return next(new AppError(`Cannot upload slip for order in ${order.status} status`, 400));
    }

    const updatedOrder = await prisma.order.update({
      where: { orderNo },
      data: {
        slipUrl: req.file.path,
        status: 'PROCESSING'
      }
    });

    // Send confirmation email (fire-and-forget — won't block response)
    if (order.customerContact) {
      sendSlipReceivedEmail({
        to: order.customerContact,
        customerName: order.customerName,
        orderNo: order.orderNo,
        candidateName: order.candidate?.nickname || 'ผู้สมัคร',
        packageName: order.package?.title || 'แพ็กเกจ',
        voteAmount: order.package?.voteAmount || 0,
        amount: order.amount,
      }).catch(err => console.error('[Email] Failed to send slip receipt:', err.message));
    }

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

exports.approveSlip = async (req, res, next) => {
  try {
    const { orderNo } = req.params;
    
    const order = await prisma.order.findUnique({ where: { orderNo } });
    if (!order) return next(new AppError('Order not found', 404));
    
    if (order.status !== 'PROCESSING') {
      return next(new AppError(`Cannot approve order in ${order.status} status`, 400));
    }

    await prisma.$transaction(async (tx) => {
      // Update Order
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID', paidAt: new Date() }
      });

      // Create Vote
      await tx.vote.create({
        data: {
          candidateId: order.candidateId,
          orderId: order.id,
          quantity: order.expectedVoteAmount
        }
      });

      // Increment Candidate Vote Count
      await tx.candidate.update({
        where: { id: order.candidateId },
        data: { voteCount: { increment: order.expectedVoteAmount } }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          adminId: req.admin.id,
          action: 'APPROVE_SLIP',
          entityType: 'Order',
          entityId: order.id,
          orderId: order.id
        }
      });
    });

    res.status(200).json({ success: true, message: 'Order approved and votes added' });
  } catch (error) {
    next(error);
  }
};

exports.rejectSlip = async (req, res, next) => {
  try {
    const { orderNo } = req.params;
    const { reason } = req.body;
    
    const order = await prisma.order.findUnique({ where: { orderNo } });
    if (!order) return next(new AppError('Order not found', 404));
    
    if (order.status !== 'PROCESSING') {
      return next(new AppError(`Cannot reject order in ${order.status} status`, 400));
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { 
        status: 'FAILED',
        failureMessage: reason || 'Slip rejected by admin'
      }
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'REJECT_SLIP',
        entityType: 'Order',
        entityId: order.id,
        orderId: order.id,
        afterData: { reason }
      }
    });

    res.status(200).json({ success: true, message: 'Order rejected' });
  } catch (error) {
    next(error);
  }
};
