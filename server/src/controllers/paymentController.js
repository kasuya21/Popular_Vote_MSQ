const prisma = require('../utils/prisma');
const AppError = require('../utils/errors');
const { updatePaymentNoteSchema, processRefundSchema } = require('../validators/schemas');

exports.getPayments = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        candidate: { select: { nickname: true, fullName: true, category: true } },
        package: { select: { title: true } }
      }
    });

    // Mask sensitive contact info for non-SUPER_ADMINs if needed
    // The system design says to mask it. We'll mask it here.
    const maskedOrders = orders.map(order => {
      let contact = order.customerContact;
      if (contact && req.admin.role !== 'SUPER_ADMIN') {
        contact = contact.length > 4 ? `***-***-${contact.slice(-4)}` : '***';
      }
      return {
        ...order,
        customerContact: contact
      };
    });

    res.status(200).json({ success: true, data: maskedOrders });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentDetail = async (req, res, next) => {
  try {
    const { orderNo } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNo },
      include: {
        candidate: { select: { nickname: true, fullName: true, category: true } },
        package: { select: { title: true } },
        transactions: { orderBy: { createdAt: 'desc' } },
        refunds: true,
        auditLogs: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!order) return next(new AppError('Order not found', 404));

    // Mask data
    if (req.admin.role !== 'SUPER_ADMIN') {
      if (order.customerContact) {
        order.customerContact = order.customerContact.length > 4 
          ? `***-***-${order.customerContact.slice(-4)}` 
          : '***';
      }
      order.transactions = order.transactions.map(tx => ({
        ...tx,
        rawRequestPayload: undefined,
        rawResponsePayload: undefined,
        rawWebhookPayload: undefined
      }));
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.updatePaymentNote = async (req, res, next) => {
  try {
    const { orderNo } = req.params;
    const { internalNote } = updatePaymentNoteSchema.shape.body.parse(req.body);

    const order = await prisma.order.update({
      where: { orderNo },
      data: { internalNote }
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE_ORDER_NOTE',
        entityType: 'Order',
        entityId: order.id,
        afterData: { internalNote }
      }
    });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.getReconciliation = async (req, res, next) => {
  try {
    // Find all orders that are PAID but have no associated Vote (Discrepancy)
    // Or orders that are PENDING but have a successful transaction
    
    const ordersPaidWithoutVote = await prisma.order.findMany({
      where: {
        status: 'PAID',
        vote: null
      },
      include: { transactions: true }
    });

    const ordersPendingWithPaidTransaction = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        transactions: {
          some: { status: 'PAID' }
        }
      },
      include: { transactions: true }
    });

    res.status(200).json({
      success: true,
      data: {
        paidWithoutVote: ordersPaidWithoutVote,
        pendingWithPaidTx: ordersPendingWithPaidTransaction
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getRefunds = async (req, res, next) => {
  try {
    const refunds = await prisma.refund.findMany({
      orderBy: { requestedAt: 'desc' },
      include: {
        order: { select: { orderNo: true, amount: true } },
        requestedByAdmin: { select: { name: true } },
        approvedByAdmin: { select: { name: true } }
      }
    });

    res.status(200).json({ success: true, data: refunds });
  } catch (error) {
    next(error);
  }
};
