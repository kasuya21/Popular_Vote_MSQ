/**
 * PromptPay QR Code Generator
 * Generates an EMV Merchant QR Code payload for PromptPay.
 */

function crc16ccitt(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function tlv(id, value) {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * Generate a PromptPay EMV QR payload string.
 * @param {string} target - Phone number (10 digits) or tax/national ID (13 digits)
 * @param {number} amount - Fixed payment amount in THB
 * @returns {string} EMV QR payload string
 */
export function generatePromptPayPayload(target, amount) {
  let id = target.replace(/[^0-9]/g, '');
  // Phone: 10 digits starting with 0 → prepend 0066
  if (id.startsWith('0') && id.length === 10) {
    id = '0066' + id.slice(1);
  } else {
    // National / tax ID: keep as-is but prepend '00'
    id = '00' + id;
  }

  const merchantAccountInfo =
    tlv('00', 'A000000677010111') + // AID for PromptPay
    tlv('01', id);

  const payload = [
    tlv('00', '01'),                        // Payload Format Indicator
    tlv('01', '12'),                        // Point of Initiation (12 = dynamic QR)
    tlv('29', merchantAccountInfo),         // Merchant Account Information
    tlv('53', '764'),                       // Transaction Currency (THB)
    tlv('54', Number(amount).toFixed(2)),   // Transaction Amount
    tlv('58', 'TH'),                        // Country Code
    '6304',                                 // CRC placeholder
  ].join('');

  return payload + crc16ccitt(payload);
}

import QRCode from 'qrcode';

/**
 * Draw the PromptPay QR code onto an HTML Canvas element.
 * Uses the 'qrcode' npm package.
 * @param {HTMLCanvasElement} canvas 
 * @param {string} payload - EMV payload string
 * @param {number} [size=260] - Canvas size in pixels
 */
export function drawPromptPayQR(canvas, payload, size = 260) {
  return new Promise((resolve, reject) => {
    QRCode.toCanvas(canvas, payload, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }, function (error) {
      if (error) reject(error);
      else resolve();
    });
  });
}
