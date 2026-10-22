import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BadgeCheck, Bath, BedDouble, CalendarDays, CheckCircle2, LogIn, Loader2, MapPin, MessageCircle, Phone, Ruler, ShieldCheck, Sofa, X } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../auth.jsx';
import { Footer, Header } from '../components/Layout';
import { PropertyImage } from '../components/PropertyCard';
import Reel from '../components/Reel';
import { useToast } from '../hooks.jsx';
import { buildWhatsAppMessage, fmtDate, loadRazorpay, money, whatsappLink } from '../utils';

export default function PropertyDetails() {
  const { id } = useParams();
  const toast = useToast();
  const { customer, openAuth, refresh: refreshAuth } = useAuth();
  const [p, setP] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | missing
  const [active, setActive] = useState(0);
  const [cfg, setCfg] = useState({ whatsapp: '', phone: '', fee: 299 });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [days, setDays] = useState(null);
  const [slots, setSlots] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [done, setDone] = useState(null); // { bookingId, date, time, note, free }
  const [form, setForm] = useState({ preferredDate: '', preferredTime: '', note: '' });

  const paid = !!customer?.schedulingPaid;
  const fee = cfg.fee;

  useEffect(() => {
    setState('loading'); setActive(0);
    api(`/properties/${id}`).then((d) => { setP(d); setState('ready'); }).catch(() => setState('missing'));
    api('/config').then(setCfg).catch(() => {});
  }, [id]);

  // Next 14 days: auto-select the first day that still has free slots
  useEffect(() => {
    let alive = true;
    api(`/bookings/availability?propertyId=${id}`, { as: 'customer' }).then((d) => {
      if (!alive) return;
      setDays(d.days);
      const first = d.days.find((x) => x.available > 0);
      setForm((f) => (f.preferredDate && d.days.some((x) => x.date === f.preferredDate && x.available > 0) ? f : { ...f, preferredDate: first ? first.date : '', preferredTime: '' }));
    }).catch(() => alive && setDays([]));
    return () => { alive = false; };
  }, [id, refresh, customer?.id]);

  // Time slots for the chosen date (booked ones come back as not available)
  useEffect(() => {
    if (!form.preferredDate) { setSlots(null); return; }
    let alive = true;
    setSlotsLoading(true);
    api(`/bookings/slots?propertyId=${id}&date=${form.preferredDate}`, { as: 'customer' })
      .then((d) => {
        if (!alive) return;
        setSlots(d.slots);
        setForm((f) => (d.slots.some((s) => s.time === f.preferredTime && s.available) ? f : { ...f, preferredTime: '' }));
      })
      .catch((e) => alive && setErr(e.message))
      .finally(() => alive && setSlotsLoading(false));
    return () => { alive = false; };
  }, [form.preferredDate, id, refresh, customer?.id]);

  const available = p?.status === 'Available';
  const payload = () => JSON.stringify({ propertyId: id, preferredDate: form.preferredDate, preferredTime: form.preferredTime, note: form.note });
  const needSlot = () => { if (!form.preferredDate || !form.preferredTime) { setErr('Please choose a date and an available time slot.'); return true; } return false; };
  const finish = (bookingId, free) => { setDone({ bookingId, date: form.preferredDate, time: form.preferredTime, note: form.note, free }); setRefresh((r) => r + 1); };

  // First visit: create the booking, then take the one-time payment
  async function payAndSchedule(e) {
    e.preventDefault(); setErr('');
    if (needSlot()) return;
    setBusy(true);
    try {
      const res = await api('/bookings/schedule', { method: 'POST', as: 'customer', body: payload() });
      if (!res.requiresPayment) { await refreshAuth(); finish(res.booking._id, true); setBusy(false); return; }

      const Razorpay = await loadRazorpay();
      const rzp = new Razorpay({
        key: res.keyId, amount: res.amount, currency: res.currency, order_id: res.orderId,
        name: 'The Housing Stories', description: 'One-time visit pass (valid for all properties)',
        prefill: { name: customer.name, email: customer.email, contact: customer.phone },
        theme: { color: '#0f766e' },
        modal: { ondismiss: () => { setBusy(false); setErr('Payment was not completed. Choose a slot and try again whenever you’re ready.'); } },
        handler: async (response) => {
          try {
            await api('/bookings/verify-payment', { method: 'POST', as: 'customer', body: JSON.stringify(response) });
            await refreshAuth();
            finish(res.booking._id, false);
          } catch (ex) { setErr(ex.message); }
          finally { setBusy(false); }
        },
      });
      rzp.on?.('payment.failed', (r) => { setErr(r?.error?.description || 'Payment failed. Please try again.'); setBusy(false); });
      rzp.open();
    } catch (ex) { setErr(ex.message); toast(ex.message, 'error'); setBusy(false); }
  }

  // After payment: book the slot and open WhatsApp with every detail pre-filled
  async function confirmOnWhatsApp() {
    setErr('');
    if (needSlot()) return;
    if (!cfg.whatsapp) { setErr('WhatsApp is not set up yet. Please use the Call button.'); return; }
    const win = window.open('', '_blank'); // opened right at the click so browsers don't block it
    setBusy(true);
    try {
      const res = await api('/bookings/schedule', { method: 'POST', as: 'customer', body: payload() });
      const url = whatsappLink(cfg.whatsapp, buildWhatsAppMessage({ property: p, customer, date: form.preferredDate, time: form.preferredTime, bookingId: res.booking._id, note: form.note }));
      if (win) win.location.href = url;
      finish(res.booking._id, true);
    } catch (ex) { win?.close(); setErr(ex.message); toast(ex.message, 'error'); }
    finally { setBusy(false); }
  }

  const doneLink = done && cfg.whatsapp
    ? whatsappLink(cfg.whatsapp, buildWhatsAppMessage({ property: p, customer, date: done.date, time: done.time, bookingId: done.bookingId, note: done.note })) : '';

  if (state === 'loading') return (<><Header /><main className="details-page"><div className="details-layout"><div><div className="sk sk-hero" /><div className="sk sk-line w60 tall" style={{ marginTop: 24 }} /><div className="sk sk-line w80" /></div><div className="sk sk-card" /></div></main><Footer /></>);
  if (state === 'missing') return (<><Header /><div className="not-found"><h1>That story isn’t here.</h1><p>This property may have been rented, sold or removed.</p><Link className="button button-dark" to="/properties"><ArrowLeft size={16} /> Back to homes</Link></div><Footer /></>);

  const images = p.images?.length ? p.images : [];
  const isRent = p.listingType !== 'Sale';

  const picker = (
    <>
      <div className="slot-field">
        <span className="field-label">Choose a date</span>
        {days === null ? <div className="date-strip">{Array.from({ length: 6 }).map((_, i) => <span key={i} className="sk date-sk" />)}</div>
          : days.length === 0 ? <p className="slot-hint">Couldn’t load dates. Please refresh the page.</p>
          : days.every((d) => d.available === 0) ? <p className="slot-hint">All dates are fully booked for the next 2 weeks.</p>
          : <div className="date-strip">{days.map((d) => {
              const dt = new Date(d.date);
              return (
                <button type="button" key={d.date} disabled={d.available === 0} className={`date-chip ${form.preferredDate === d.date ? 'active' : ''}`} onClick={() => setForm({ ...form, preferredDate: d.date, preferredTime: '' })}>
                  <small>{dt.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' })}</small>
                  <b>{dt.toLocaleDateString('en-IN', { day: 'numeric', timeZone: 'UTC' })}</b>
                  <small>{dt.toLocaleDateString('en-IN', { month: 'short', timeZone: 'UTC' })}</small>
                  <em>{d.available === 0 ? 'Full' : `${d.available} free`}</em>
                </button>
              );
            })}</div>}
      </div>
      <div className="slot-field">
        <span className="field-label">Available time slots <small>(8:00 AM – 9:00 PM)</small></span>
        {!form.preferredDate ? <p className="slot-hint">Pick a date to see the time slots.</p>
          : slotsLoading ? <div className="slot-grid">{Array.from({ length: 8 }).map((_, i) => <span key={i} className="sk slot-sk" />)}</div>
          : slots && slots.every((x) => !x.available) ? <p className="slot-hint">No slots left on this day. Please try another date.</p>
          : <div className="slot-grid">{slots?.map((x) => (
              <button type="button" key={x.time} disabled={!x.available} title={x.available ? '' : 'Not available'} className={`slot ${form.preferredTime === x.time ? 'active' : ''}`} onClick={() => setForm({ ...form, preferredTime: x.time })}>{x.time}</button>
            ))}</div>}
        <small className="slot-hint">Each visit is 30 minutes, with a 15-minute gap between visits.</small>
      </div>
      <label>Anything we should know?<textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows="2" placeholder="Optional note" /></label>
    </>
  );

  return (
    <>
      <Header />
      <main className="details-page">
        <Link to="/properties" className="back-link"><ArrowLeft size={15} /> Back to homes</Link>
        <div className="details-layout">
          <div className="details-main">
            <div className="gallery">
              <div className="gallery-main"><PropertyImage key={active} className="detail-main-image fade-in" src={images[active]} alt={p.title} /></div>
              {images.length > 1 && (
                <div className="thumbs">{images.map((src, i) => (
                  <button key={src + i} className={i === active ? 'active' : ''} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`}><img src={src} alt="" loading="lazy" /></button>
                ))}</div>
              )}
            </div>
            <Reel url={p.instagramReelUrl} />
            <div className="details-copy">
              <div className="eyebrow"><span /> {p.propertyType} · {p.locality}</div>
              <h1>{p.title}</h1>
              <p className="address"><MapPin size={16} /> {p.address || `${p.locality}, ${p.city || 'Bengaluru'}`}</p>
              <div className="fact-grid">
                <div><BedDouble size={20} /><b>{p.bedrooms}</b><small>Bedrooms</small></div>
                <div><Bath size={20} /><b>{p.bathrooms}</b><small>Bathrooms</small></div>
                {p.areaSqFt ? <div><Ruler size={20} /><b>{p.areaSqFt}</b><small>Sq. ft.</small></div> : null}
                <div><Sofa size={20} /><b>{p.furnishing}</b><small>Furnishing</small></div>
              </div>
              <h3>About this home</h3>
              <p className="long-description">{p.description}</p>
              {p.amenities?.length > 0 && (<><h3>What makes it special</h3><div className="amenities">{p.amenities.map((a) => <span key={a}><CheckCircle2 size={14} />{a}</span>)}</div></>)}
            </div>
          </div>

          <aside className="booking-card" id="schedule">
            <div className="price-line"><strong>{money(p.rent)}</strong>{isRent && <span>/ month</span>}</div>
            {isRent && p.deposit > 0 && <p className="deposit-line">Security deposit: {money(p.deposit)}</p>}

            <div className={`fee-note ${paid ? 'paid' : ''}`}>
              {paid ? <BadgeCheck size={22} /> : <CalendarDays size={22} />}
              <span>
                <b>{paid ? 'Your visit pass is active' : 'Book a property visit'}</b>
                <small>{paid ? 'Pick a slot and message us on WhatsApp. No more payments.' : `One-time fee of ${money(fee)} — pay once, visit unlimited homes.`}</small>
              </span>
            </div>

            {!available ? (
              <div className="unavailable">This property is currently <b>{p.status.toLowerCase()}</b>. Browse other available homes.</div>
            ) : !customer ? (
              <div className="login-gate">
                <p>Log in or sign up with your email to book a visit and track your payments and visits.</p>
                <button className="button button-accent full" onClick={() => openAuth({ mode: 'signup' })}><LogIn size={17} /> Sign up to book a visit</button>
                <button className="button button-outline full" onClick={() => openAuth({ mode: 'login' })}>I already have an account</button>
              </div>
            ) : (
              <form onSubmit={payAndSchedule} className="booking-form">
                <p className="booking-as">Booking as <b>{customer.name}</b> · {customer.phone} <Link to="/account">Edit</Link></p>
                {picker}
                {err && <p className="form-error" role="alert">{err}</p>}
                {paid ? (
                  <div className="contact-actions">
                    <button type="button" className="button button-whatsapp full" onClick={confirmOnWhatsApp} disabled={busy}>
                      {busy ? <><Loader2 size={17} className="spin" /> Please wait…</> : <><MessageCircle size={18} /> Send details on WhatsApp</>}
                    </button>
                    {cfg.phone && <a className="button button-outline full" href={`tel:${cfg.phone}`}><Phone size={17} /> Call us</a>}
                  </div>
                ) : (
                  <>
                    <button className="button button-accent full" type="submit" disabled={busy}>
                      {busy ? <><Loader2 size={17} className="spin" /> Please wait…</> : <>Pay {money(fee)} once & book <ArrowRight size={17} /></>}
                    </button>
                    <small className="secure-note"><ShieldCheck size={14} /> Secure payment via Razorpay. Charged one time only.</small>
                  </>
                )}
              </form>
            )}
          </aside>
        </div>
      </main>

      {available && <a href="#schedule" className="mobile-book-bar"><span><b>{money(p.rent)}</b>{isRent && <small>/mo</small>}</span><span className="button button-accent">{!customer ? 'Log in to book' : paid ? 'Book via WhatsApp' : 'Book a visit'}</span></a>}

      {done && (
        <div className="modal-back" role="dialog" aria-modal="true" onClick={() => setDone(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close icon-btn" onClick={() => setDone(null)} aria-label="Close"><X size={18} /></button>
            <div className="check-anim"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" /><path d="M14 27l8 8 16-17" /></svg></div>
            <h2>{done.free ? 'Visit booked!' : 'Payment received!'}</h2>
            <p><b>{p.title}</b><br />{fmtDate(done.date)} at {done.time}</p>
            <p className="modal-note">{done.free ? 'Your slot is reserved.' : `Your one-time ${money(fee)} pass is active for every property.`} Send us the details on WhatsApp to finish up. You can track this visit in <Link to="/account">My account</Link>.</p>
            <div className="contact-actions">
              {doneLink ? <a className="button button-whatsapp full" href={doneLink} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Send details on WhatsApp</a> : <p className="muted small">WhatsApp number isn’t set up yet.</p>}
              {cfg.phone && <a className="button button-outline full" href={`tel:${cfg.phone}`}><Phone size={17} /> Call us</a>}
              <button className="button-ghost" onClick={() => setDone(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
