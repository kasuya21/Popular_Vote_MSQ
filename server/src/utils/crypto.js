const crypto = require('crypto');

/**
 * Creates a deterministic hash of sensitive contact info (phone/email)
 * This allows us to search/verify orders without storing the actual phone number in plain text
 */
const hashContactInfo = (contactInfo) => {
  if (!contactInfo) return null;
  
  // Clean contact info: lowercase and remove spaces/dashes
  const cleaned = String(contactInfo).toLowerCase().replace(/[\s-]/g, '');
  
  // Use a salt from env or fallback
  const salt = process.env.PAYMENT_SECRET || 'starmoon-default-salt';
  
  return crypto.createHmac('sha256', salt)
    .update(cleaned)
    .digest('hex');
};

/**
 * Creates an idempotency key hash
 */
const generateIdempotencyKey = (candidateId, packageId, contactInfo) => {
  const timestamp = Date.now();
  // Group requests within a 5-minute window for identical parameters
  const timeWindow = Math.floor(timestamp / (5 * 60 * 1000));
  
  const raw = `${candidateId}:${packageId}:${contactInfo}:${timeWindow}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
};

/**
 * Verify Webhook Signature (Generic implementation)
 */
const verifyWebhookSignature = (payload, signature, secret) => {
  // In a real scenario (e.g. Omise), the signature verification might be different
  // Here we use a standard HMAC SHA256 verification
  if (!signature || !payload) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

module.exports = {
  hashContactInfo,
  generateIdempotencyKey,
  verifyWebhookSignature
};
