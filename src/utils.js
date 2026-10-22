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
export function buildWhatsAppMessage({ property, customer, date, time, bookingId, note }) {
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
  if (bookingId) lines.push(`🧾 Booking ID: ${shortId(bookingId)}`);
  if (note) lines.push(`📝 Note: ${note}`);
  return lines.join('\n');
}
export const whatsappLink = (number, message) => `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
