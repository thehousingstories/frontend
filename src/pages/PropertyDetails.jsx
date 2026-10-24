import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BadgeCheck, Bath, BedDouble, CalendarDays, CheckCircle2, LogIn, Loader2, MapPin, MessageCircle, Phone, ShieldCheck, Sofa, X } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../auth.jsx';
import { Footer, Header } from '../components/Layout';
import { PropertyImage } from '../components/PropertyCard';
import Reel from '../components/Reel';
import PayNotice from '../components/PayNotice';
import { useToast } from '../hooks.jsx';
import { openCheckout } from '../payment';
import { buildWhatsAppMessage, fmtDate, money, planLabel, whatsappLink } from '../utils';
import SEO from '../components/SEO';


const todayUTC = () => new Date(new Date().toISOString().slice(0, 10));
const isoDay = (offset = 0) => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };

export default function PropertyDetails() {
  const { id } = useParams();
  const toast = useToast();
  const { customer, openAuth } = useAuth();
  const [p, setP] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | missing
  const [active, setActive] = useState(0);
  const [cfg, setCfg] = useState({ whatsapp: '', phone: '', fee: 299, singleFee: 149 });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [done, setDone] = useState(null);      // popup after booking: { booking }
  const [myBookings, setMyBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ preferredDate: '', preferredTime: '', note: '' });

  const hasPass = !!customer?.schedulingPaid;
  const { fee, singleFee } = cfg;

  useEffect(() => {
    setState('loading'); setActive(0); setShowForm(false);
    api(`/properties/${id}`).then((d) => { setP(d); setState('ready'); }).catch(() => setState('missing'));
    api('/config').then(setCfg).catch(() => { });
  }, [id]);

  // This customer's bookings (to show an existing visit for this property)
  useEffect(() => {
    if (!customer) { setMyBookings([]); return; }
    api('/account/bookings', { as: 'customer' }).then(setMyBookings).catch(() => { });
  }, [customer?.id, refresh]); // eslint-disable-line

  const available = p?.status === 'Available';
 const myVisit = myBookings.find((b) => b.property?._id === (p?._id || id) && b.paymentStatus === 'Paid'
    && ['Requested', 'Confirmed'].includes(b.bookingStatus) && new Date(b.preferredDate) >= todayUTC());

 const payload = () => JSON.stringify({
  propertyId: p?._id || id,
  preferredDate: form.preferredDate,
  preferredTime: form.preferredTime,
  note: form.note,
});
  const needSlot = () => {
    if (!form.preferredDate || !form.preferredTime) { setErr('Please choose a date and a time for your visit.'); return true; }
    if (form.preferredTime < '08:00' || form.preferredTime > '21:00') { setErr('Visits are available between 8:00 AM and 9:00 PM.'); return true; }
    return false;
  };
  const waUrl = (b) => (cfg.whatsapp && p && customer
    ? whatsappLink(cfg.whatsapp, buildWhatsAppMessage({ property: p, customer, date: b.preferredDate, time: b.preferredTime, bookingId: b._id, note: b.note, plan: planLabel(b) })) : '');
  const finish = (booking) => { setDone({ booking }); setShowForm(false); setRefresh((r) => r + 1); };

  // No pass: pay the single-visit fee for this property
  async function payAndSchedule(e) {
    e.preventDefault(); setErr('');
    if (needSlot()) return;
    setBusy(true);
    try {
      const res = await api('/bookings/schedule', { method: 'POST', as: 'customer', body: payload() });
      if (!res.requiresPayment) { finish(res.booking); setBusy(false); return; }
      await openCheckout({
        order: res, customer, description: `Single property visit — ${p.title}`,
        onDismiss: () => { setBusy(false); setErr('Payment was not completed. Choose your date and time and try again whenever you’re ready.'); },
        onFail: (m) => { setErr(m); setBusy(false); },
        onSuccess: async (response) => {
          try {
            await api('/bookings/verify-payment', { method: 'POST', as: 'customer', body: JSON.stringify(response) });
            finish({ ...res.booking, paymentStatus: 'Paid', plan: 'single', amountPaid: singleFee });
          } catch (ex) { setErr(ex.message); }
          finally { setBusy(false); }
        },
      });
    } catch (ex) { setErr(ex.message); toast(ex.message, 'error'); setBusy(false); }
  }

  // Pass holders: book the slot and open WhatsApp with every detail pre-filled
  async function confirmOnWhatsApp() {
    setErr('');
    if (needSlot()) return;
    if (!cfg.whatsapp) { setErr('WhatsApp is not set up yet. Please use the Call button.'); return; }
    const win = window.open('', '_blank'); // opened at the click so browsers don't block it
    setBusy(true);
    try {
      const res = await api('/bookings/schedule', { method: 'POST', as: 'customer', body: payload() });
      if (win) win.location.href = waUrl(res.booking);
      finish(res.booking);
    } catch (ex) { win?.close(); setErr(ex.message); toast(ex.message, 'error'); }
    finally { setBusy(false); }
  }

  if (state === 'loading') return (<><Header /><main className="details-page"><div className="details-layout"><div><div className="sk sk-hero" /><div className="sk sk-line w60 tall" style={{ marginTop: 24 }} /><div className="sk sk-line w80" /></div><div className="sk sk-card" /></div></main><Footer /></>);
  if (state === 'missing') return (<><Header /><div className="not-found"><h1>That story isn’t here.</h1><p>This property may have been rented, sold or removed.</p><Link className="button button-dark" to="/properties"><ArrowLeft size={16} /> Back to homes</Link></div><Footer /></>);

  const images = p.images?.length ? p.images : [];
  const isRent = p.listingType !== 'Sale';

  const picker = (
    <>
      <div className="two-col">
        <label>Visit date<input type="date" required min={isoDay(0)} max={isoDay(60)} value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} /></label>
        <label>Your time<input type="time" required min="08:00" max="21:00" step="900" value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} /></label>
      </div>
      <small className="slot-hint">Choose any date and time that suits you, between 8:00 AM and 9:00 PM.</small>
      <label>Anything we should know?<textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows="2" placeholder="Optional note" /></label>
    </>
  );

  const contactButtons = (url) => (
    <div className="contact-actions">
      {url ? <a className="button button-whatsapp full" href={url} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Send details on WhatsApp</a> : <p className="muted small">WhatsApp number isn’t set up yet.</p>}
      {cfg.phone && <a className="button button-outline full" href={`tel:${cfg.phone}`}><Phone size={17} /> Call us</a>}
    </div>
  );

  return (
    <>

      <SEO
        title={`${p.bedrooms} BHK ${p.propertyType} for ${p.listingType === 'Sale' ? 'Sale' : 'Rent'} in ${p.locality}, ${p.city || 'Bengaluru'}`}
        description={`${p.title}. ${p.description} Rent: ${money(p.rent)}${p.listingType === 'Rent' ? ' per month' : ''}. Located in ${p.locality}, ${p.city || 'Bengaluru'}.`}
        path={`/property/${p._id}`}
        image={p.images?.[0]}
      />
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

            <div className={`fee-note ${hasPass ? 'paid' : ''}`}>
              {hasPass ? <BadgeCheck size={22} /> : <CalendarDays size={22} />}
              <span>
                <b>{hasPass ? 'Your unlimited pass is active' : 'Book a visit to this property'}</b>
                <small>{hasPass ? 'Pick your date and time, then message us on WhatsApp. No more payments.' : `Pay ${money(singleFee)} for this visit only.`}</small>
              </span>
            </div>

            {!available ? (
              <div className="unavailable">This property is currently <b>{p.status.toLowerCase()}</b>. Browse other available homes.</div>
            ) : !customer ? (
              <div className="login-gate">
                <p>Log in or sign up with your email to book a visit. You can pay {money(singleFee)} per visit, or get the unlimited pass for {money(fee)}.</p>
                <button className="button button-accent full" onClick={() => openAuth({ mode: 'signup' })}><LogIn size={17} /> Sign up to book a visit</button>
                <button className="button button-outline full" onClick={() => openAuth({ mode: 'login' })}>I already have an account</button>
              </div>
            ) : myVisit && !showForm ? (
              <div className="my-visit">
                <div className="my-visit-head"><CheckCircle2 size={20} /> <b>Your visit is booked</b></div>
                <p><CalendarDays size={15} /> {fmtDate(myVisit.preferredDate)} at <b>{myVisit.preferredTime}</b></p>
                {contactButtons(waUrl(myVisit))}
                <button className="button-ghost" onClick={() => setShowForm(true)}>Book another time</button>
                <Link to="/account" className="booking-as-link">Track it in My account →</Link>
              </div>
            ) : (
              <form onSubmit={payAndSchedule} className="booking-form">
                <p className="booking-as">Booking as <b>{customer.name}</b> · {customer.phone} <Link to="/account">Edit</Link></p>
                {picker}
                {err && <p className="form-error" role="alert">{err}</p>}
                {hasPass ? (
                  <div className="contact-actions">
                    <button type="button" className="button button-whatsapp full" onClick={confirmOnWhatsApp} disabled={busy}>
                      {busy ? <><Loader2 size={17} className="spin" /> Please wait…</> : <><MessageCircle size={18} /> Send details on WhatsApp</>}
                    </button>
                    {cfg.phone && <a className="button button-outline full" href={`tel:${cfg.phone}`}><Phone size={17} /> Call us</a>}
                  </div>
                ) : (
                  <>
                    <button className="button button-accent full" type="submit" disabled={busy}>
                      {busy ? <><Loader2 size={17} className="spin" /> Please wait…</> : <>Pay {money(singleFee)} & book this visit <ArrowRight size={17} /></>}
                    </button>
                    <small className="secure-note"><ShieldCheck size={14} /> Secure payment via Razorpay.</small>
                    <PayNotice />
                    <div className="upsell">Visiting several homes? <Link to="/#how">Get the unlimited pass for {money(fee)} →</Link></div>
                  </>
                )}
              </form>
            )}
          </aside>
        </div>
      </main>

      {available && <a href="#schedule" className="mobile-book-bar"><span><b>{money(p.rent)}</b>{isRent && <small>/mo</small>}</span><span className="button button-accent">{!customer ? 'Log in to book' : hasPass ? 'Book via WhatsApp' : `Book visit ${money(singleFee)}`}</span></a>}

      {done && (
        <div className="modal-back" role="dialog" aria-modal="true" onClick={() => setDone(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close icon-btn" onClick={() => setDone(null)} aria-label="Close"><X size={18} /></button>
            <div className="check-anim"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" /><path d="M14 27l8 8 16-17" /></svg></div>
            <h2>{done.booking.plan === 'single' ? 'Payment received!' : 'Visit booked!'}</h2>
            <p><b>{p.title}</b><br />{fmtDate(done.booking.preferredDate)} at {done.booking.preferredTime}</p>
            <p className="modal-note">{done.booking.plan === 'single' ? `Your ${money(singleFee)} single-visit payment is done.` : 'Your slot is reserved with your unlimited pass.'} Send us the details on WhatsApp to finish up. You can track this visit in <Link to="/account">My account</Link>.</p>
            {contactButtons(waUrl(done.booking))}
            <button className="button-ghost" onClick={() => setDone(null)}>Close</button>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
