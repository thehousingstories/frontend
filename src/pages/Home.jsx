import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BadgeCheck, CalendarCheck, Check, Clock, Home as HomeIcon, Loader2, MapPinned, RefreshCw, Search, ShieldCheck, Sparkles, Star, Wallet, X } from 'lucide-react';
import { api } from '../api';
import { Footer, Header } from '../components/Layout';
import PropertyCard, { PropertySkeletons } from '../components/PropertyCard';
import { CountUp, Reveal, useProperties, useToast } from '../hooks';
import { useAuth } from '../auth.jsx';
import ReelsSection from '../components/Reels.jsx';
import { openCheckout } from '../payment';
import PayNotice from '../components/PayNotice';
import { BROKERAGE_PERCENT } from '../utils';
import SEO from '../components/SEO';


export default function Home() {
  const navigate = useNavigate();
  const { items, loading, error, retry } = useProperties('&featured=true');
  const [heroQ, setHeroQ] = useState('');
  const toast = useToast();
  const { customer, openAuth, refresh: refreshAuth } = useAuth();
  const [cfg, setCfg] = useState({ fee: 299, singleFee: 149 });
  const [reels, setReels] = useState([]);
  const [buying, setBuying] = useState(false);
  const [passDone, setPassDone] = useState(false);
  const fee = cfg.fee;
  const singleFee = cfg.singleFee;
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => { api('/testimonials').then(setTestimonials).catch(() => { }); }, []);
  useEffect(() => { api('/config').then(setCfg).catch(() => { }); }, []);
  useEffect(() => { api('/reels').then(setReels).catch(() => { }); }, []);
  useEffect(() => { api('/stats').then(setStats).catch(() => { }); }, []);

  const featured = items.slice(0, 6);

  // Buy the unlimited pass right from the landing page
  async function startPass(c) {
    if (c.schedulingPaid) { toast('Your unlimited visit pass is already active.'); return; }
    setBuying(true);
    try {
      const order = await api('/bookings/pass-order', { method: 'POST', as: 'customer' });
      await openCheckout({
        order, customer: c, description: 'Unlimited visit pass (all properties)',
        onDismiss: () => setBuying(false),
        onFail: (m) => { toast(m, 'error'); setBuying(false); },
        onSuccess: async (response) => {
          try {
            await api('/bookings/verify-payment', { method: 'POST', as: 'customer', body: JSON.stringify(response) });
            await refreshAuth(); setPassDone(true);
          } catch (ex) { toast(ex.message, 'error'); }
          finally { setBuying(false); }
        },
      });
    } catch (ex) { toast(ex.message, 'error'); setBuying(false); }
  }
  const buyPass = () => (customer ? startPass(customer) : openAuth({ mode: 'signup', onSuccess: (c) => startPass(c) }));
  const hasPass = !!customer?.schedulingPaid;
  const goSearch = (e) => { e.preventDefault(); navigate(`/properties${heroQ.trim() ? `?q=${encodeURIComponent(heroQ.trim())}` : ''}`); };

  return (
    <>
      <SEO
        title="Flats for Rent in Bangalore"
        description="Find flats, houses and rental properties in Bangalore. Explore available homes by locality, rent, BHK, furnishing and amenities."
        path="/"
      />

      <Header />
      <main>
        <section className="hero">
          <div className="hero-overlay" />
          <span className="blob blob-a" /><span className="blob blob-b" />
          <div className="hero-content">
            <div className="eyebrow light anim-up" style={{ '--d': '0ms' }}><span /> A MORE HUMAN WAY TO FIND HOME</div>
            <h1 className="anim-up" style={{ '--d': '120ms' }}>Every home has<br />a <em>story.</em> Find yours.</h1>
            <p className="anim-up" style={{ '--d': '240ms' }}>Thoughtful spaces. Honest guidance. A home that feels like you.</p>
            <form className="hero-search anim-up" style={{ '--d': '360ms' }} onSubmit={goSearch}>
              <MapPinned size={19} />
              <input value={heroQ} onChange={(e) => setHeroQ(e.target.value)} placeholder="Search a locality — Indiranagar, HSR, Whitefield…" aria-label="Search homes" />
              <button type="submit">Search <ArrowRight size={16} /></button>
            </form>
            <div className="hero-chips anim-up" style={{ '--d': '480ms' }}>
              <span><ShieldCheck size={16} /> Verified listings</span>
              <span><Wallet size={16} /> Visits from ₹{singleFee}</span>
              <span><Clock size={16} /> Visits 8 AM – 9 PM</span>
            </div>
          </div>
          <div className="hero-caption">GOOD HOMES. GOOD STORIES.</div>
        </section>

        <section className="stats-band" aria-label="Our numbers">
          {[
            ['Homes rented out by us', stats?.rentedOut ?? 0],
            ['Happy customers', stats?.happyCustomers ?? 0],
            ['Total visitors', stats?.visitors ?? 0],
          ].map(([label, value], i) => (
            <Reveal key={label} delay={i * 120} className="stat-item">
              <strong><CountUp value={value} suffix={value > 0 ? '+' : ''} /></strong>
              <span>{label}</span>
            </Reveal>
          ))}
        </section>

        <section className="section homes-section" id="homes">
          <Reveal className="section-heading">
            <div><div className="eyebrow"><span /> FEATURED HOMES</div><h2>Handpicked homes<br /><em>worth coming home to.</em></h2></div>
            <Link to="/properties" className="button button-outline">View all properties <ArrowRight size={16} /></Link>
          </Reveal>

          {error ? (
            <div className="empty-state"><h3>We couldn’t load the homes</h3><p>{error}</p><button className="button button-dark" onClick={retry}><RefreshCw size={16} /> Try again</button></div>
          ) : loading ? (
            <div className="property-grid"><PropertySkeletons n={3} /></div>
          ) : featured.length === 0 ? (
            <div className="empty-state"><HomeIcon size={34} /><h3>Featured homes are coming soon</h3><p>Browse everything we have available right now.</p><Link className="button button-dark" to="/properties">Browse all properties <ArrowRight size={16} /></Link></div>
          ) : (
            <>
              <div className="property-grid">{featured.map((p, i) => <PropertyCard key={p._id} p={p} index={i} />)}</div>
              <div className="center"><Link to="/properties" className="button button-dark">See all properties <ArrowRight size={16} /></Link></div>
            </>
          )}
        </section>

        <ReelsSection reels={reels} />

        <section className="section plan-section" id="how">
          <Reveal className="section-heading center-heading"><div><div className="eyebrow"><span /> SIMPLE, HONEST PRICING</div><h2>Book a visit for ₹{singleFee},<br /><em>or unlock them all.</em></h2></div></Reveal>
          <div className="plans-grid">
            <Reveal className="plan-card light">
              <span className="plan-badge">SINGLE VISIT</span>
              <div className="plan-price"><sup>₹</sup>{singleFee}<small>per property</small></div>
              <ul>
                <li><Check size={17} /> Schedule a visit to one property</li>
                <li><Check size={17} /> Choose your own date and time, 8 AM to 9 PM</li>
                <li><Check size={17} /> Pay only for the home you like</li>
              </ul>
              <Link to="/properties" className="button button-outline full">Choose a property <ArrowRight size={17} /></Link>
            </Reveal>

            <Reveal delay={150} className="plan-card featured">
              <span className="plan-badge">BEST VALUE · UNLIMITED</span>
              <div className="plan-price"><sup>₹</sup>{fee}<small>one-time</small></div>
              <ul>
                <li><Check size={17} /> Visit unlimited properties</li>
                <li><Check size={17} /> No per-property charges, ever</li>
                <li><Check size={17} /> Track every visit and payment in your account</li>
              </ul>
              {hasPass ? (
                <div className="pass-active"><BadgeCheck size={20} /> Your pass is active <Link to="/properties">Browse homes →</Link></div>
              ) : (
                <button className="button button-accent full" onClick={buyPass} disabled={buying}>
                  {buying ? <><Loader2 size={17} className="spin" /> Please wait…</> : <>Get unlimited pass <ArrowRight size={17} /></>}
                </button>
              )}
            </Reveal>
          </div>
          <PayNotice className="center-notice" />
          <Reveal className="plan-brokerage-note"><b>{BROKERAGE_PERCENT}% brokerage</b> is charged only when you finalise a home through us.</Reveal>
          <div className="plan-minis">
            {[[Search, 'Browse freely', 'Photos and reels, no payment.'], [CalendarCheck, 'Pick your time', 'Any date and time that suits you.'], [Sparkles, 'Message us', 'Send your visit details on WhatsApp.']].map(([Icon, t, d], i) => (
              <Reveal key={t} delay={i * 100} className="plan-mini"><span className="how-icon"><Icon size={20} /></span><div><b>{t}</b><small>{d}</small></div></Reveal>
            ))}
          </div>
        </section>

        {passDone && (
          <div className="modal-back" role="dialog" aria-modal="true" onClick={() => setPassDone(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close icon-btn" onClick={() => setPassDone(false)} aria-label="Close"><X size={18} /></button>
              <div className="check-anim"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" /><path d="M14 27l8 8 16-17" /></svg></div>
              <h2>Your pass is active!</h2>
              <p>You can now visit as many properties as you like. Pick a home, choose your date and time, and message us on WhatsApp.</p>
              <div className="modal-actions"><Link className="button button-dark" to="/properties" onClick={() => setPassDone(false)}>Browse properties</Link><Link className="button button-outline" to="/account" onClick={() => setPassDone(false)}>My account</Link></div>
            </div>
          </div>
        )}

        <section className="story-section" id="story">
          <Reveal className="story-image"><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85" alt="Warm sunlit living room" loading="lazy" /><span className="image-note">A home is a feeling.</span></Reveal>
          <Reveal className="story-copy" delay={150}>
            <div className="eyebrow"><span /> THE HOUSING STORIES</div>
            <h2>Less scrolling.<br /><em>More belonging.</em></h2>
            <p>Finding a home should feel exciting, not exhausting. We bring together carefully presented properties, straightforward information, and real people who listen to what you need.</p>
            <p>Because the right home is more than square feet and a pin on a map. It’s where your next chapter begins.</p>
            <a className="text-link" href="#contact">Let’s find your story <ArrowRight size={17} /></a>
          </Reveal>
        </section>

        {testimonials.length > 0 && (
          <section className="section testimonials" id="testimonials">
            <Reveal className="section-heading"><div><div className="eyebrow"><span /> KIND WORDS</div><h2>Stories from<br /><em>our people.</em></h2></div><p>Every move matters. Here’s what customers say about finding their place with us.</p></Reveal>
            <div className="testimonial-grid">
              {testimonials.map((t, i) => (
                <Reveal as="article" delay={i * 100} className="testimonial-card" key={t._id}>
                  <div className="stars">{Array.from({ length: t.rating || 5 }).map((_, k) => <Star key={k} size={15} fill="currentColor" />)}</div>
                  <p>“{t.message}”</p>
                  <div className="testimonial-person"><span>{(t.name || 'H').split(' ').map((x) => x[0]).join('').slice(0, 2)}</span><div><b>{t.name}</b><small>{t.role || 'Happy customer'}</small></div></div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        <section className="cta-section" id="contact">
          <Reveal><div className="eyebrow light"><span /> YOUR NEXT CHAPTER</div><h2>Let’s find a place<br />that feels like <em>you.</em></h2><p>Tell us what home looks like to you. We’ll help you take the next step.</p></Reveal>
          <Reveal delay={150}><a className="button button-light" href="mailto:thehousingstories@gmail.com">Start a conversation <ArrowUpRight size={17} /></a></Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
