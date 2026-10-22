import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, CalendarDays, CreditCard, Loader2, LogOut, MapPin, MessageCircle, Pencil, Phone, Search, Trash2 } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../auth.jsx';
import { Footer, Header } from '../components/Layout';
import { PropertyImage } from '../components/PropertyCard';
import { useToast } from '../hooks.jsx';
import { buildWhatsAppMessage, fmtDate, money, shortId, whatsappLink } from '../utils';

const FILTERS = ['All', 'Upcoming', 'Completed', 'Cancelled'];
const todayUTC = () => new Date(new Date().toISOString().slice(0, 10));

export default function Account() {
  const { customer, ready, openAuth, logout, setCustomer } = useAuth();
  const toast = useToast();
  const [bookings, setBookings] = useState(null);
  const [cfg, setCfg] = useState({ whatsapp: '', phone: '', fee: 299 });
  const [filter, setFilter] = useState('All');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { api('/config').then(setCfg).catch(() => {}); }, []);
  const load = () => api('/account/bookings', { as: 'customer' }).then(setBookings).catch((e) => { setBookings([]); toast(e.message, 'error'); });
  useEffect(() => { if (customer) load(); else setBookings(null); }, [customer?.id]); // eslint-disable-line

  const isUpcoming = (b) => ['Requested', 'Confirmed'].includes(b.bookingStatus) && new Date(b.preferredDate) >= todayUTC();
  const shown = useMemo(() => (bookings || []).filter((b) => {
    if (filter === 'Upcoming') return isUpcoming(b);
    if (filter === 'Completed') return b.bookingStatus === 'Completed';
    if (filter === 'Cancelled') return b.bookingStatus === 'Cancelled';
    return true;
  }), [bookings, filter]); // eslint-disable-line
  const upcomingCount = (bookings || []).filter(isUpcoming).length;

  async function saveProfile(e) {
    e.preventDefault(); setSaving(true);
    try { const d = await api('/account/me', { method: 'PATCH', as: 'customer', body: JSON.stringify(form) }); setCustomer(d.customer); setEditing(false); toast('Profile updated'); }
    catch (ex) { toast(ex.message, 'error'); } finally { setSaving(false); }
  }
  async function cancel(b) {
    if (!confirm('Cancel this visit?')) return;
    try { await api(`/account/bookings/${b._id}/cancel`, { method: 'PATCH', as: 'customer' }); toast('Visit cancelled'); load(); }
    catch (e) { toast(e.message, 'error'); }
  }
  const waLink = (b) => whatsappLink(cfg.whatsapp, buildWhatsAppMessage({ property: b.property, customer, date: b.preferredDate, time: b.preferredTime, bookingId: b._id, note: b.note }));

  if (!ready) return (<><Header /><main className="account-page"><div className="sk sk-card" /></main><Footer /></>);
  if (!customer) return (
    <><Header />
      <main className="account-page"><div className="empty-state"><CalendarDays size={34} /><h3>Log in to see your account</h3><p>Track your payments and scheduled property visits in one place.</p>
        <div className="row-gap"><button className="button button-dark" onClick={() => openAuth({ mode: 'login' })}>Log in</button><button className="button button-outline" onClick={() => openAuth({ mode: 'signup' })}>Create account</button></div></div></main>
      <Footer /></>
  );

  return (
    <>
      <Header />
      <main className="account-page">
        <section className="account-hero">
          <span className="avatar big">{customer.name?.[0]?.toUpperCase()}</span>
          <div><div className="eyebrow light"><span /> MY ACCOUNT</div><h1>Hi, {customer.name.split(' ')[0]}</h1><p>{customer.email}</p></div>
          <button className="button button-light" onClick={logout}><LogOut size={16} /> Log out</button>
        </section>

        <div className="account-grid">
          <aside className="account-side">
            <div className="panel">
              <div className="panel-top"><h3>Profile</h3>{!editing && <button className="icon-btn" aria-label="Edit profile" onClick={() => { setForm({ name: customer.name, phone: customer.phone }); setEditing(true); }}><Pencil size={16} /></button>}</div>
              {editing ? (
                <form onSubmit={saveProfile} className="booking-form">
                  <label>Full name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                  <label>Mobile number<input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
                  <div className="row-gap"><button className="button button-dark" disabled={saving}>{saving ? <Loader2 size={15} className="spin" /> : 'Save'}</button><button type="button" className="button button-outline" onClick={() => setEditing(false)}>Cancel</button></div>
                </form>
              ) : (
                <dl className="profile-list">
                  <div><dt>Name</dt><dd>{customer.name}</dd></div>
                  <div><dt>Email</dt><dd>{customer.email} {customer.emailVerified && <span className="verified"><BadgeCheck size={14} /> Verified</span>}</dd></div>
                  <div><dt>Mobile</dt><dd>{customer.phone}</dd></div>
                </dl>
              )}
            </div>

            <div className={`panel pass-card ${customer.schedulingPaid ? 'active' : ''}`}>
              <div className="panel-top"><h3>Visit pass</h3><span className={`status-pill ${customer.schedulingPaid ? 'green' : ''}`}>{customer.schedulingPaid ? 'Active' : 'Not purchased'}</span></div>
              {customer.schedulingPaid ? (
                <>
                  <p className="pass-line"><CreditCard size={18} /> One-time payment of <b>{money(customer.amountPaid)}</b></p>
                  <dl className="profile-list">
                    <div><dt>Paid on</dt><dd>{customer.paidAt ? new Date(customer.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</dd></div>
                    {customer.paymentId && <div><dt>Payment ID</dt><dd className="mono">{customer.paymentId}</dd></div>}
                  </dl>
                  <p className="muted small">Your pass covers every property. You’ll never pay this again.</p>
                </>
              ) : (
                <><p className="muted">Pay {money(cfg.fee)} once when you schedule your first visit. After that, every visit is free.</p><Link to="/properties" className="button button-accent full">Browse properties</Link></>
              )}
            </div>
          </aside>

          <section className="account-visits">
            <div className="visits-head">
              <div><h2>My property visits</h2><p className="muted">{bookings ? `${bookings.length} total · ${upcomingCount} upcoming` : 'Loading…'}</p></div>
              <div className="chip-row">{FILTERS.map((x) => <button key={x} className={filter === x ? 'active' : ''} onClick={() => setFilter(x)}>{x}</button>)}</div>
            </div>

            {bookings === null ? <div className="sk" style={{ height: 150, borderRadius: 18 }} />
              : shown.length === 0 ? <div className="empty-state"><Search size={30} /><h3>{bookings.length ? 'No visits in this view' : 'No visits yet'}</h3><p>{bookings.length ? 'Try another filter.' : 'Find a home you love and schedule your first visit.'}</p>{!bookings.length && <Link to="/properties" className="button button-dark">Browse properties</Link>}</div>
              : shown.map((b) => (
                <article className="visit-card" key={b._id}>
                  <Link to={b.property ? `/property/${b.property._id}` : '#'} className="visit-img"><PropertyImage src={b.property?.images?.[0]} alt="" /></Link>
                  <div className="visit-body">
                    <div className="visit-top">
                      <h3>{b.property?.title || 'Property no longer listed'}</h3>
                      <span className={`status-pill ${b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Completed' ? 'green' : b.bookingStatus === 'Cancelled' ? 'red' : ''}`}>{b.paymentStatus === 'Pending' ? 'Awaiting payment' : b.bookingStatus}</span>
                    </div>
                    {b.property && <p className="visit-loc"><MapPin size={14} /> {b.property.locality}, {b.property.city}</p>}
                    <p className="visit-when"><CalendarDays size={15} /> {fmtDate(b.preferredDate)} · <b>{b.preferredTime}</b> <small>· ID {shortId(b._id)}</small></p>
                    <div className="visit-actions">
                      {isUpcoming(b) && b.paymentStatus === 'Paid' && b.property && cfg.whatsapp && <a className="button button-whatsapp small" href={waLink(b)} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a>}
                      {isUpcoming(b) && b.paymentStatus === 'Paid' && cfg.phone && <a className="button button-outline small" href={`tel:${cfg.phone}`}><Phone size={15} /> Call</a>}
                      {isUpcoming(b) && <button className="button-ghost danger" onClick={() => cancel(b)}><Trash2 size={15} /> Cancel visit</button>}
                    </div>
                  </div>
                </article>
              ))}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
