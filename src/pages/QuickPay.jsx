import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, Loader2, MessageCircle, Phone, Share2, ShieldCheck, User } from 'lucide-react';
import { api } from '../api';
import { Footer, Header } from '../components/Layout';
import { openCheckout } from '../payment';
import PayNotice from '../components/PayNotice';
import { buildQuickMessage, makeReceiptBlob, money, whatsappLink } from '../utils';

export default function QuickPay() {
  const [cfg, setCfg] = useState({ whatsapp: '', phone: '', quickFee: 99 });
  const [f, setF] = useState({ name: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null);   // payment summary after success
  const [count, setCount] = useState(null); // auto-open countdown
  const [receipt, setReceipt] = useState(null); // { url, file }

  useEffect(() => { api('/config').then(setCfg).catch(() => {}); }, []);

  const waUrl = done && cfg.whatsapp ? whatsappLink(cfg.whatsapp, buildQuickMessage(done)) : '';
  const canShare = !!(receipt && navigator.canShare?.({ files: [receipt.file] }));

  const saveReceipt = (r = receipt, ref = done?.ref) => {
    if (!r) return;
    const a = document.createElement('a');
    a.href = r.url; a.download = `receipt-${ref}.png`;
    document.body.appendChild(a); a.click(); a.remove();
  };
  const shareReceipt = async () => {
    try { await navigator.share({ files: [receipt.file], text: buildQuickMessage(done) }); } catch { /* cancelled */ }
  };

  // After payment: count down, then open WhatsApp with the message ready
  useEffect(() => {
    if (count === null || !waUrl) return;
    if (count <= 0) { window.location.href = waUrl; return; }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, waUrl]);

  async function pay(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const order = await api('/quick/order', { method: 'POST', body: JSON.stringify(f) });
      await openCheckout({
        order, customer: { name: f.name, email: '', phone: f.phone }, description: 'The Housing Stories',
        onDismiss: () => { setBusy(false); setErr('Payment was not completed. You can try again.'); },
        onFail: (m) => { setErr(m); setBusy(false); },
        onSuccess: async (response) => {
          try {
            const d = await api('/quick/verify', { method: 'POST', body: JSON.stringify(response) });
            const blob = await makeReceiptBlob(d.payment);
            const r = { url: URL.createObjectURL(blob), file: new File([blob], `receipt-${d.payment.ref}.png`, { type: 'image/png' }) };
            setReceipt(r); setDone(d.payment); setCount(6);
            saveReceipt(r, d.payment.ref); // saved to the customer's phone so it's ready to attach
          } catch (ex) { setErr(ex.message); }
          finally { setBusy(false); }
        },
      });
    } catch (ex) { setErr(ex.message); setBusy(false); }
  }

  return (
    <>
      <Header />
      <main className="quick-page">
        <div className="quick-card">
          {done ? (
            <div className="quick-done">
              <div className="check-anim"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" /><path d="M14 27l8 8 16-17" /></svg></div>
              <h1>Payment received!</h1>
              <p className="quick-sub">Thank you, {done.name.split(' ')[0]}. Your payment of <b>{money(done.amount)}</b> is confirmed.</p>
              {receipt && <img className="receipt-img" src={receipt.url} alt="Payment receipt" />}
              <div className="receipt-actions">
                <button type="button" className="button button-outline small" onClick={() => saveReceipt()}><Download size={15} /> Save receipt</button>
                {canShare && <button type="button" className="button button-outline small" onClick={shareReceipt}><Share2 size={15} /> Share receipt</button>}
              </div>
              {waUrl ? (
                <>
                  <a className="button button-whatsapp full" href={waUrl}><MessageCircle size={18} /> Open WhatsApp now</a>
                  {count !== null && count > 0 && <p className="countdown">Opening WhatsApp in {count}… <button type="button" onClick={() => setCount(null)}>Stay here</button></p>}
                  <p className="quick-hint">Your details and a <b>receipt link</b> are already in the message. Just press <b>Send</b>. You can also attach the receipt image with the 📎.</p>
                </>
              ) : <p className="quick-hint">We’ll contact you on {done.phone}.</p>}
              {cfg.phone && <a className="button button-outline full" href={`tel:${cfg.phone}`}><Phone size={17} /> Call us</a>}
              <Link to="/" className="button-ghost">Back to home</Link>
            </div>
          ) : (
            <>
              <div className="eyebrow"><span /> THE HOUSING STORIES</div>
              <div className="quick-price"><sup>₹</sup>{cfg.quickFee}</div>
              <h1>Quick payment</h1>
              <p className="quick-sub">Enter your name and mobile number, then pay. After payment, WhatsApp opens so you can send us your details.</p>
              <form onSubmit={pay} className="auth-form">
                <label>Your name<div className="input-icon"><User size={17} /><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Full name" autoComplete="name" /></div></label>
                <label>Mobile number<div className="input-icon"><Phone size={17} /><input required type="tel" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+91 98765 43210" autoComplete="tel" /></div></label>
                {err && <p className="form-error" role="alert">{err}</p>}
                <button className="button button-accent full" disabled={busy}>
                  {busy ? <><Loader2 size={17} className="spin" /> Please wait…</> : <>Pay {money(cfg.quickFee)} <ArrowRight size={17} /></>}
                </button>
                <small className="secure-note"><ShieldCheck size={14} /> Secure payment via Razorpay</small>
                <PayNotice />
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
