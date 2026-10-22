import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Building2, CalendarDays, CheckCircle2, ClipboardList, Eye, EyeOff, House, ImagePlus, LayoutDashboard, Loader2, LogOut, MessageSquareQuote, Pencil, Plus, Trash2, Users, Wallet, X } from 'lucide-react';
import { api, clearToken } from '../api';
import { PropertyImage } from '../components/PropertyCard';
import { useToast } from '../hooks';
import { PROPERTY_TYPES, money } from '../utils';

const emptyForm = {
  title: '', description: '', propertyType: 'Apartment', listingType: 'Rent', rent: '', deposit: '', bedrooms: 2, bathrooms: 1,
  areaSqFt: '', furnishing: 'Semi-furnished', address: '', locality: '', city: 'Bengaluru', images: [], instagramReelUrl: '',
  amenities: '', featured: false, status: 'Available', isPublished: true,
};

export function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    try { const d = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); localStorage.setItem('ths_admin_token', d.token); onLogin(true); }
    catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  }
  return (
    <div className="login-screen">
      <Link to="/" className="brand"><span className="brand-mark"><House size={21} /></span><span>THE HOUSING <b>STORIES</b><small>ADMINISTRATION</small></span></Link>
      <form className="login-card" onSubmit={submit}>
        <div className="eyebrow"><span /> ADMIN WORKSPACE</div>
        <h1>Welcome<br /><em>back.</em></h1>
        <p>Sign in to manage your property stories.</p>
        <label>Email address<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label>
        <label>Password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
        {err && <p className="form-error">{err}</p>}
        <button className="button button-dark full" disabled={busy}>{busy ? <><Loader2 size={16} className="spin" /> Signing in…</> : <>Sign in <ArrowRight size={17} /></>}</button>
        <Link className="back-home" to="/">← Return to website</Link>
      </form>
    </div>
  );
}

export default function Admin({ onLogout }) {
  const toast = useToast();
  const fileRef = useRef(null);
  const [tab, setTab] = useState('overview');
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bookingFilter, setBookingFilter] = useState('All');

  async function load() {
    try {
      const [p, b, c, t] = await Promise.all([api('/properties/admin/all'), api('/bookings/admin/all'), api('/bookings/admin/customers'), api('/testimonials/admin/all')]);
      setProperties(p); setBookings(b); setCustomers(c); setTestimonials(t);
    } catch (e) { toast(e.message, 'error'); }
  }
  useEffect(() => { load(); }, []); // eslint-disable-line

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const reset = () => { setEditing(null); setForm(emptyForm); setUrlInput(''); };
  function edit(p) {
    setEditing(p._id);
    setForm({ ...emptyForm, ...p, images: p.images || [], amenities: (p.amenities || []).join(', ') });
    setTab('properties'); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function upload(files) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      [...files].forEach((f) => fd.append('images', f));
      const d = await api('/uploads', { method: 'POST', body: fd });
      setForm((f) => ({ ...f, images: [...f.images, ...d.urls] }));
      toast(`${d.urls.length} image${d.urls.length > 1 ? 's' : ''} uploaded`);
    } catch (e) { toast(e.message, 'error'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }
  const addUrl = () => {
    const u = urlInput.trim();
    if (!/^https?:\/\//i.test(u)) { toast('Enter a valid image URL starting with http(s)://', 'error'); return; }
    setForm({ ...form, images: [...form.images, u] }); setUrlInput('');
  };
  const removeImage = (i) => setForm({ ...form, images: form.images.filter((_, k) => k !== i) });
  const makeCover = (i) => { const imgs = [...form.images]; const [x] = imgs.splice(i, 1); setForm({ ...form, images: [x, ...imgs] }); };

  async function saveProperty(e) {
    e.preventDefault(); setSaving(true);
    const { _id, __v, createdAt, updatedAt, slug, ...rest } = form;
    const payload = {
      ...rest, rent: Number(form.rent), deposit: Number(form.deposit || 0), bedrooms: Number(form.bedrooms || 0), bathrooms: Number(form.bathrooms || 0), areaSqFt: Number(form.areaSqFt || 0),
      amenities: String(form.amenities).split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      await api(editing ? `/properties/${editing}` : '/properties', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      toast(editing ? 'Property updated' : 'Property published'); reset(); load();
    } catch (ex) { toast(ex.message, 'error'); } finally { setSaving(false); }
  }
  async function delProperty(id) {
    if (!confirm('Delete this property permanently?')) return;
    try { await api(`/properties/${id}`, { method: 'DELETE' }); toast('Property deleted'); load(); } catch (e) { toast(e.message, 'error'); }
  }
  async function togglePublish(p) {
    try { await api(`/properties/${p._id}`, { method: 'PUT', body: JSON.stringify({ isPublished: !p.isPublished }) }); toast(p.isPublished ? 'Hidden from website' : 'Published to website'); load(); } catch (e) { toast(e.message, 'error'); }
  }
  async function saveTestimonial(e) {
    e.preventDefault(); const f = e.currentTarget;
    try { await api('/testimonials', { method: 'POST', body: JSON.stringify({ name: f.name.value, role: f.role.value, message: f.message.value, rating: Number(f.rating.value), isPublished: true }) }); f.reset(); toast('Testimonial added'); load(); } catch (ex) { toast(ex.message, 'error'); }
  }
  async function delTestimonial(id) {
    if (!confirm('Delete this testimonial?')) return;
    try { await api(`/testimonials/${id}`, { method: 'DELETE' }); load(); } catch (e) { toast(e.message, 'error'); }
  }
  async function setStatus(id, bookingStatus) {
    try { await api(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ bookingStatus }) }); toast('Status updated'); load(); } catch (e) { toast(e.message, 'error'); }
  }

  const stats = useMemo(() => ({
    active: properties.filter((p) => p.status === 'Available' && p.isPublished).length,
    visits: bookings.length,
    upcoming: bookings.filter((b) => ['Requested', 'Confirmed'].includes(b.bookingStatus) && new Date(b.preferredDate) >= new Date(new Date().toDateString())).length,
    payers: customers.filter((c) => c.schedulingPaid).length,
    revenue: customers.reduce((s, c) => s + (c.amountPaid || 0), 0),
  }), [properties, bookings, customers]);
  const shownBookings = bookings.filter((b) => bookingFilter === 'All' || b.bookingStatus === bookingFilter);
  const navItems = [['overview', 'Overview', LayoutDashboard], ['properties', 'Properties', Building2], ['bookings', 'Visits', ClipboardList], ['customers', 'Customers', Users], ['testimonials', 'Stories', MessageSquareQuote]];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="brand"><span className="brand-mark"><House size={20} /></span><span>THE HOUSING <b>STORIES</b><small>ADMIN WORKSPACE</small></span></Link>
        <div className="admin-nav-label">WORKSPACE</div>
        <nav>{navItems.map(([key, label, Icon]) => (
          <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}><Icon size={18} />{label}{key === 'bookings' && bookings.length > 0 && <span className="nav-count">{bookings.length}</span>}</button>
        ))}</nav>
        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={() => { clearToken(); onLogout(); }}><LogOut size={17} /> Sign out</button>
          <Link to="/" className="view-site">View website <ArrowUpRight size={15} /></Link>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar"><div><span className="admin-mobile-label">THE HOUSING STORIES</span><h1>{navItems.find((x) => x[0] === tab)?.[1]}</h1></div><span className="admin-status"><i /> System online</span></header>
        <div className="admin-content" key={tab}>
          {tab === 'overview' && (<>
            <div className="admin-welcome"><div><div className="eyebrow light"><span /> YOUR PROPERTY DESK</div><h2>Good work starts<br />with a <em>good story.</em></h2><p>Here’s what’s happening across your listings.</p></div><button className="button button-light" onClick={() => { reset(); setTab('properties'); }}><Plus size={17} /> Add property</button></div>
            <div className="stats-grid">
              <div className="stat-card"><span>Live listings</span><Building2 /><strong>{stats.active}</strong><small>Published &amp; available</small></div>
              <div className="stat-card"><span>Upcoming visits</span><CalendarDays /><strong>{stats.upcoming}</strong><small>{stats.visits} total requests</small></div>
              <div className="stat-card"><span>Pass holders</span><CheckCircle2 /><strong>{stats.payers}</strong><small>Paid the one-time fee</small></div>
              <div className="stat-card"><span>Fees collected</span><Wallet /><strong>{money(stats.revenue)}</strong><small>One-time scheduling fees</small></div>
            </div>
            <section className="admin-panel"><div className="panel-heading"><div><h3>Recent properties</h3><p>Your latest inventory updates</p></div><button className="text-link" onClick={() => setTab('properties')}>Manage all <ArrowRight size={15} /></button></div>
              {properties.slice(0, 5).map((p) => (<div className="admin-list-row" key={p._id}><PropertyImage className="row-img" src={p.images?.[0]} alt="" /><div className="admin-row-title"><b>{p.title}</b><small>{p.locality} · {money(p.rent)}{p.listingType === 'Rent' ? '/month' : ''}</small></div><span className={`status-pill ${p.status === 'Available' ? 'green' : ''}`}>{p.status}</span><button className="icon-btn" onClick={() => edit(p)} aria-label="Edit"><Pencil size={16} /></button></div>))}
              {!properties.length && <p className="muted pad">No properties yet. Add your first listing to get started.</p>}
            </section>
          </>)}

          {tab === 'properties' && (<>
            <div className="admin-page-heading"><div><h2>{editing ? 'Edit property' : 'Property inventory'}</h2><p>Create, update, publish, and manage your listings.</p></div>{editing && <button className="button button-outline" onClick={reset}>Cancel edit</button>}</div>
            <form className="admin-form panel" onSubmit={saveProperty}>
              <h3>{editing ? 'Property details' : 'Add a new property'}</h3>
              <div className="form-grid">
                <label>Property title<input required value={form.title} onChange={set('title')} /></label>
                <label>Locality<input required value={form.locality} onChange={set('locality')} /></label>
                <label>Property type<select value={form.propertyType} onChange={set('propertyType')}>{PROPERTY_TYPES.map((x) => <option key={x}>{x}</option>)}</select></label>
                <label>Listing type<select value={form.listingType} onChange={set('listingType')}><option>Rent</option><option>Sale</option></select></label>
                <label>{form.listingType === 'Sale' ? 'Sale price (₹)' : 'Monthly rent (₹)'}<input required type="number" min="0" value={form.rent} onChange={set('rent')} /></label>
                <label>Security deposit (₹)<input type="number" min="0" value={form.deposit} onChange={set('deposit')} /></label>
                <label>Bedrooms<input type="number" min="0" value={form.bedrooms} onChange={set('bedrooms')} /></label>
                <label>Bathrooms<input type="number" min="0" value={form.bathrooms} onChange={set('bathrooms')} /></label>
                <label>Area (sq. ft.)<input type="number" min="0" value={form.areaSqFt} onChange={set('areaSqFt')} /></label>
                <label>Furnishing<select value={form.furnishing} onChange={set('furnishing')}>{['Furnished', 'Semi-furnished', 'Unfurnished'].map((x) => <option key={x}>{x}</option>)}</select></label>
                <label className="wide">Full address<input required value={form.address} onChange={set('address')} /></label>
                <label className="wide">Description<textarea required rows="4" value={form.description} onChange={set('description')} /></label>

                <div className="wide image-manager">
                  <span className="field-label">Photos <small>(first photo is the cover)</small></span>
                  {form.images.length > 0 && <div className="image-grid">{form.images.map((src, i) => (
                    <div className="image-tile" key={src + i}><img src={src} alt="" />{i === 0 ? <em>Cover</em> : <button type="button" className="mk-cover" onClick={() => makeCover(i)}>Make cover</button>}<button type="button" className="rm" onClick={() => removeImage(i)} aria-label="Remove image"><X size={14} /></button></div>
                  ))}</div>}
                  <div className="image-actions">
                    <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
                    <button type="button" className="button button-outline" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? <><Loader2 size={16} className="spin" /> Uploading…</> : <><ImagePlus size={16} /> Upload photos</>}</button>
                    <div className="url-add"><input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="…or paste an image URL" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }} /><button type="button" onClick={addUrl}>Add</button></div>
                  </div>
                </div>

                <label className="wide">Instagram Reel URL<input type="url" placeholder="https://www.instagram.com/reel/..." value={form.instagramReelUrl} onChange={set('instagramReelUrl')} /><small>Shown on the public property page.</small></label>
                <label className="wide">Amenities (comma-separated)<input value={form.amenities} onChange={set('amenities')} placeholder="Lift, Balcony, Security, Parking" /></label>
                <label>Status<select value={form.status} onChange={set('status')}>{['Available', 'Reserved', 'Rented', 'Sold'].map((x) => <option key={x}>{x}</option>)}</select></label>
                <label>Publication<select value={String(form.isPublished)} onChange={(e) => setForm({ ...form, isPublished: e.target.value === 'true' })}><option value="true">Published</option><option value="false">Draft / hidden</option></select></label>
                <label className="check-label"><input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Feature on homepage</label>
              </div>
              <button className="button button-dark" type="submit" disabled={saving || uploading}>{saving ? <><Loader2 size={16} className="spin" /> Saving…</> : <>{editing ? 'Save changes' : 'Publish property'} <ArrowRight size={16} /></>}</button>
            </form>
            <section className="admin-panel"><div className="panel-heading"><div><h3>All properties</h3><p>{properties.length} listings in your inventory</p></div></div>
              {properties.map((p) => (<div className="admin-list-row" key={p._id}><PropertyImage className="row-img" src={p.images?.[0]} alt="" /><div className="admin-row-title"><b>{p.title}</b><small>{p.locality} · {money(p.rent)}{p.listingType === 'Rent' ? '/month' : ''}{!p.isPublished && ' · Hidden'}</small></div><span className={`status-pill ${p.status === 'Available' ? 'green' : ''}`}>{p.status}</span>
                <button className="icon-btn" onClick={() => togglePublish(p)} aria-label={p.isPublished ? 'Hide' : 'Publish'} title={p.isPublished ? 'Hide from website' : 'Publish'}>{p.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                <button className="icon-btn" onClick={() => edit(p)} aria-label="Edit"><Pencil size={16} /></button>
                <button className="icon-btn danger" onClick={() => delProperty(p._id)} aria-label="Delete"><Trash2 size={16} /></button></div>))}
              {!properties.length && <p className="muted pad">No properties yet.</p>}
            </section>
          </>)}

          {tab === 'bookings' && (
            <section className="admin-panel"><div className="panel-heading"><div><h3>Property visit requests</h3><p>Scheduled visits across all customers.</p></div>
              <select className="mini-select" value={bookingFilter} onChange={(e) => setBookingFilter(e.target.value)}>{['All', 'Requested', 'Confirmed', 'Completed', 'Cancelled'].map((x) => <option key={x}>{x}</option>)}</select></div>
              <div className="table-scroll"><table><thead><tr><th>Customer</th><th>Property</th><th>Visit</th><th>Pass</th><th>Status</th></tr></thead><tbody>
                {shownBookings.map((b) => (<tr key={b._id}><td><b>{b.customerName}</b><small>{b.customerEmail}<br />{b.customerPhone}</small></td><td>{b.property?.title || 'Property removed'}{b.note && <small>“{b.note}”</small>}</td><td>{new Date(b.preferredDate).toLocaleDateString('en-IN')}<small>{b.preferredTime}</small></td><td><span className={`status-pill ${b.paymentStatus === 'Paid' ? 'green' : ''}`}>{b.paymentStatus === 'Paid' ? 'Active' : b.paymentStatus}</span></td>
                  <td><select value={b.bookingStatus} onChange={(e) => setStatus(b._id, e.target.value)}>{['Requested', 'Confirmed', 'Completed', 'Cancelled'].map((x) => <option key={x}>{x}</option>)}</select></td></tr>))}
              </tbody></table>{!shownBookings.length && <p className="muted pad">No visit requests yet.</p>}</div></section>
          )}

          {tab === 'customers' && (
            <section className="admin-panel"><div className="panel-heading"><div><h3>Customers</h3><p>Each customer pays the scheduling fee only once.</p></div></div>
              <div className="table-scroll"><table><thead><tr><th>Customer</th><th>Contact</th><th>One-time pass</th><th>Visits</th></tr></thead><tbody>
                {customers.map((c) => (<tr key={c._id}><td><b>{c.name}</b></td><td>{c.email}<small>{c.phone}</small></td><td><span className={`status-pill ${c.schedulingPaid ? 'green' : ''}`}>{c.schedulingPaid ? `Paid ${money(c.amountPaid)}` : 'Not paid'}</span>{c.paidAt && <small>{new Date(c.paidAt).toLocaleDateString('en-IN')}</small>}</td><td>{bookings.filter((b) => (b.customer?._id || b.customer) === c._id).length}</td></tr>))}
              </tbody></table>{!customers.length && <p className="muted pad">No customers yet.</p>}</div></section>
          )}

          {tab === 'testimonials' && (<>
            <form className="panel testimonial-form" onSubmit={saveTestimonial}><h3>Add a customer story</h3>
              <div className="form-grid"><label>Name<input required name="name" /></label><label>Short description<input name="role" placeholder="Found a home in 5 days" /></label><label>Rating<select name="rating" defaultValue="5"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></label><label className="wide">Testimonial<textarea required name="message" rows="3" /></label></div>
              <button className="button button-dark">Add testimonial <Plus size={16} /></button></form>
            <section className="admin-panel"><div className="panel-heading"><div><h3>Published stories</h3><p>Shown on the homepage</p></div></div>
              {testimonials.map((t) => (<div className="admin-list-row" key={t._id}><div className="admin-row-title"><b>{t.name} · {'★'.repeat(t.rating || 5)}</b><small>{t.message}</small></div><button className="icon-btn danger" onClick={() => delTestimonial(t._id)} aria-label="Delete"><Trash2 size={16} /></button></div>))}
              {!testimonials.length && <p className="muted pad">No testimonials yet.</p>}</section>
          </>)}
        </div>
      </main>
    </div>
  );
}
