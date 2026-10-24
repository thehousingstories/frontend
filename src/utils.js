export const money = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n || 0));

export const PROPERTY_TYPES = ['Apartment', 'Villa', 'Independent House', 'PG/Co-living', 'Studio', 'Commercial'];
export const BROKERAGE_PERCENT = 60; // brokerage shown on the landing page

export function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(window.Razorpay);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(window.Razorpay);
    s.onerror = () => reject(new Error('Could not load the payment window. Check your connection.'));
    document.body.appendChild(s);
  });
}

const SAVED_KEY = 'ths_saved';
export const getSaved = () => { try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); } catch { return []; } };
export const toggleSaved = (id) => {
  const list = getSaved();
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next.includes(id);
};

// Visit dates are stored as UTC midnight of the chosen day, so always format them in UTC
export const fmtDate = (d, withYear = true) =>
  new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}), timeZone: 'UTC' });

export const shortId = (id) => String(id || '').slice(-6).toUpperCase();

// WhatsApp message sent to the business with every detail of the visit
export function buildWhatsAppMessage({ property, customer, date, time, bookingId, note, plan }) {
  const isRent = property.listingType !== 'Sale';
  const lines = [
    'Hello The Housing Stories! 👋',
    'I would like to confirm my property visit.',
    '',
    `🏠 Property: ${property.title}`,
    `📍 Location: ${[property.locality, property.city].filter(Boolean).join(', ')}`,
    `💰 ${isRent ? 'Rent' : 'Price'}: ${money(property.rent)}${isRent ? '/month' : ''}`,
    `🔗 Link: ${window.location.origin}/property/${property._id}`,
    '',
    `📅 Date: ${fmtDate(date)}`,
    `⏰ Time: ${time}`,
    '',
    `👤 Name: ${customer.name}`,
    `📞 Mobile: ${customer.phone}`,
    `✉️ Email: ${customer.email}`,
  ];
  if (plan) lines.push(`💳 Plan: ${plan}`);
  if (bookingId) lines.push(`🧾 Booking ID: ${shortId(bookingId)}`);
  if (note) lines.push(`📝 Note: ${note}`);
  return lines.join('\n');
}
export const whatsappLink = (number, message) => `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

// Short label for a booking's plan (used in WhatsApp messages and the account page)
export const planLabel = (b) => (b?.plan === 'single' ? `Single visit (${money(b.amountPaid)} paid)` : 'Unlimited visit pass');

// WhatsApp message for the one-page quick payment
export function buildQuickMessage({ name, phone, amount, paymentId, ref, paidAt, token }) {
  return [
    'Hello The Housing Stories! 👋',
    `I have paid ${money(amount)}.`,
    '',
    `👤 Name: ${name}`,
    `📞 Mobile: ${phone}`,
    `💳 Payment ID: ${paymentId}`,
    `🧾 Ref: ${ref}`,
    `📅 Paid on: ${new Date(paidAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    '',
    ...(token ? [`🔗 Receipt: ${window.location.origin}/receipt/${token}`] : []),
  ].join('\n');
}

// Draws a payment receipt image in the browser (no libraries) so the customer can attach it in WhatsApp
export async function makeReceiptBlob({ name, phone, amount, paymentId, ref, paidAt }) {
  try { await document.fonts?.ready; } catch { /* ignore */ }
  const W = 720, H = 960;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  const sans = "'DM Sans', Arial, sans-serif", serif = "'Playfair Display', Georgia, serif";
  const rr = (px, py, w, h, r) => { x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath(); };
  const fit = (text, maxW, size, weight) => { let s = size; x.font = `${weight} ${s}px ${sans}`; while (x.measureText(text).width > maxW && s > 12) { s -= 1; x.font = `${weight} ${s}px ${sans}`; } return text; };

  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0a3d44'); g.addColorStop(1, '#0f766e');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = '#fffaf2'; rr(40, 50, W - 80, H - 100, 36); x.fill();

  x.textAlign = 'center';
  x.fillStyle = '#0f766e'; x.font = `700 22px ${sans}`; x.fillText('THE HOUSING STORIES', W / 2, 120);
  x.fillStyle = '#5d727a'; x.font = `600 15px ${sans}`; x.fillText('PAYMENT RECEIPT', W / 2, 150);

  x.fillStyle = '#e6f6f3'; x.beginPath(); x.arc(W / 2, 235, 50, 0, Math.PI * 2); x.fill();
  x.strokeStyle = '#0f766e'; x.lineWidth = 9; x.lineCap = 'round'; x.lineJoin = 'round';
  x.beginPath(); x.moveTo(W / 2 - 22, 236); x.lineTo(W / 2 - 6, 253); x.lineTo(W / 2 + 25, 218); x.stroke();

  x.fillStyle = '#0a3d44'; x.font = `600 84px ${serif}`; x.fillText(money(amount), W / 2, 385);
  x.fillStyle = '#0f766e'; x.font = `700 20px ${sans}`; x.fillText('PAID SUCCESSFULLY', W / 2, 428);

  x.strokeStyle = '#eadfce'; x.lineWidth = 2; x.setLineDash([8, 8]);
  x.beginPath(); x.moveTo(90, 470); x.lineTo(W - 90, 470); x.stroke(); x.setLineDash([]);

  const when = new Date(paidAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  [['Name', name], ['Mobile', phone], ['Payment ID', paymentId], ['Reference', ref], ['Date', when]].forEach(([k, v], i) => {
    const y = 535 + i * 72;
    x.textAlign = 'left'; x.fillStyle = '#5d727a'; x.font = `600 18px ${sans}`; x.fillText(k, 90, y);
    x.textAlign = 'right'; x.fillStyle = '#0d2b33'; fit(String(v || '-'), 380, 22, 700); x.fillText(String(v || '-'), W - 90, y);
  });

  x.textAlign = 'center'; x.fillStyle = '#5d727a'; x.font = `500 16px ${sans}`;
  x.fillText('Property visit charge · thehousingstories.in', W / 2, 890);
  return new Promise((resolve) => c.toBlob(resolve, 'image/png'));
}
