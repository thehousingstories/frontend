// import React, { useEffect, useMemo, useState } from 'react';
// import { Link, useSearchParams } from 'react-router-dom';
// import { ArrowRight, ArrowUpRight, CalendarCheck, Home as HomeIcon, MapPinned, RefreshCw, Search, ShieldCheck, Sparkles, Star, Wallet } from 'lucide-react';
// import { api } from '../api';
// import { Footer, Header } from '../components/Layout';
// import PropertyCard, { PropertySkeletons } from '../components/PropertyCard';
// import { Reveal, useProperties } from '../hooks';
// import { PROPERTY_TYPES, money } from '../utils';

// const BUDGETS = [
//   ['', 'Any budget'], ['15000', 'Up to ₹15,000'], ['30000', 'Up to ₹30,000'], ['50000', 'Up to ₹50,000'],
//   ['100000', 'Up to ₹1,00,000'], ['10000000', 'Up to ₹1 Cr'],
// ];

// export default function Home() {
//   const [params] = useSearchParams();
//   const { items, loading, error, retry } = useProperties();
//   const [q, setQ] = useState(params.get('q') || '');
//   const [heroQ, setHeroQ] = useState('');
//   const [listing, setListing] = useState('All');
//   const [type, setType] = useState('All');
//   const [budget, setBudget] = useState('');
//   const [sort, setSort] = useState('featured');
//   const [fee, setFee] = useState(299);
//   const [testimonials, setTestimonials] = useState([]);

//   useEffect(() => { api('/testimonials').then(setTestimonials).catch(() => {}); }, []);
//   useEffect(() => { api('/bookings/fee').then((d) => setFee(d.fee)).catch(() => {}); }, []);

//   const filtered = useMemo(() => {
//     const term = q.trim().toLowerCase();
//     let list = items.filter((p) =>
//       (!term || `${p.title} ${p.locality} ${p.city} ${p.address}`.toLowerCase().includes(term)) &&
//       (listing === 'All' || p.listingType === listing) &&
//       (type === 'All' || p.propertyType === type) &&
//       (!budget || p.rent <= Number(budget)));
//     if (sort === 'low') list = [...list].sort((a, b) => a.rent - b.rent);
//     if (sort === 'high') list = [...list].sort((a, b) => b.rent - a.rent);
//     return list;
//   }, [items, q, listing, type, budget, sort]);

//   const localities = new Set(items.map((p) => p.locality)).size;
//   const goSearch = (e) => {
//     e.preventDefault();
//     setQ(heroQ);
//     document.getElementById('homes')?.scrollIntoView({ behavior: 'smooth' });
//   };
//   const hasFilters = q || listing !== 'All' || type !== 'All' || budget;
//   const clear = () => { setQ(''); setHeroQ(''); setListing('All'); setType('All'); setBudget(''); };

//   return (
//     <>
//       <Header />
//       <main>
//         <section className="hero">
//           <div className="hero-overlay" />
//           <span className="blob blob-a" /><span className="blob blob-b" />
//           <div className="hero-content">
//             <div className="eyebrow light anim-up" style={{ '--d': '0ms' }}><span /> A MORE HUMAN WAY TO FIND HOME</div>
//             <h1 className="anim-up" style={{ '--d': '120ms' }}>Every home has<br />a <em>story.</em> Find yours.</h1>
//             <p className="anim-up" style={{ '--d': '240ms' }}>Thoughtful spaces. Honest guidance. A home that feels like you.</p>
//             <form className="hero-search anim-up" style={{ '--d': '360ms' }} onSubmit={goSearch}>
//               <MapPinned size={19} />
//               <input value={heroQ} onChange={(e) => setHeroQ(e.target.value)} placeholder="Search a locality — Indiranagar, HSR, Whitefield…" aria-label="Search homes" />
//               <button type="submit">Search <ArrowRight size={16} /></button>
//             </form>
//             <div className="hero-chips anim-up" style={{ '--d': '480ms' }}>
//               <span><ShieldCheck size={16} /> Verified listings</span>
//               <span><Wallet size={16} /> Pay ₹{fee} once, ever</span>
//               {items.length > 0 && <span><HomeIcon size={16} /> {items.length} homes live</span>}
//             </div>
//           </div>
//           <div className="hero-caption">GOOD HOMES. GOOD STORIES.</div>
//         </section>

//         <section className="trust-strip">
//           {[['01', 'People-first', 'property guidance'], ['02', 'Verified details', 'and clear pricing'], ['03', 'Visits that work', 'around your life']].map(([n, a, b], i) => (
//             <Reveal key={n} delay={i * 100} className="trust-item"><strong>{n}</strong><span>{a}<br />{b}</span></Reveal>
//           ))}
//           <Reveal delay={300} className="trust-quote">“Home is not a place.<br /><em>It’s how it feels.</em>”</Reveal>
//         </section>

//         <section className="section homes-section" id="homes">
//           <Reveal className="section-heading">
//             <div><div className="eyebrow"><span /> FIND YOUR SPACE</div><h2>Homes worth<br /><em>coming home to.</em></h2></div>
//             <p>Explore considered spaces for every chapter of your life.</p>
//           </Reveal>

//           <Reveal className="filters">
//             <div className="search-bar">
//               <Search size={19} />
//               <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by locality, property or city…" aria-label="Search" />
//               {hasFilters && <button type="button" className="clear-btn" onClick={clear}>Clear</button>}
//             </div>
//             <div className="filter-row">
//               <div className="seg" role="tablist" aria-label="Listing type">
//                 {['All', 'Rent', 'Sale'].map((x) => (
//                   <button key={x} role="tab" aria-selected={listing === x} className={listing === x ? 'active' : ''} onClick={() => setListing(x)}>{x === 'All' ? 'All' : `For ${x.toLowerCase()}`}</button>
//                 ))}
//               </div>
//               <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Property type"><option value="All">All types</option>{PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
//               <select value={budget} onChange={(e) => setBudget(e.target.value)} aria-label="Budget">{BUDGETS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
//               <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort"><option value="featured">Featured first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
//             </div>
//           </Reveal>

//           {!loading && !error && items.length > 0 && <p className="result-count">{filtered.length} {filtered.length === 1 ? 'home' : 'homes'} found{localities > 1 ? ` across ${localities} localities` : ''}</p>}

//           {error ? (
//             <div className="empty-state"><h3>We couldn’t load the homes</h3><p>{error}</p><button className="button button-dark" onClick={retry}><RefreshCw size={16} /> Try again</button></div>
//           ) : loading ? (
//             <div className="property-grid"><PropertySkeletons n={3} /></div>
//           ) : items.length === 0 ? (
//             <div className="empty-state"><HomeIcon size={34} /><h3>New homes are on the way</h3><p>We’re adding fresh listings. Tell us what you’re looking for and we’ll find it for you.</p><a className="button button-dark" href="mailto:hello@thehousingstories.in">Tell us what you need <ArrowUpRight size={16} /></a></div>
//           ) : filtered.length === 0 ? (
//             <div className="empty-state"><Search size={32} /><h3>No homes match yet</h3><p>Try another locality, budget or property type.</p><button className="button button-outline" onClick={clear}>Reset filters</button></div>
//           ) : (
//             <div className="property-grid">{filtered.map((p, i) => <PropertyCard key={p._id} p={p} index={i} />)}</div>
//           )}
//           <div className="center"><a href="#contact" className="button button-outline">Can’t find your home? Talk to us <ArrowRight size={16} /></a></div>
//         </section>

//         <section className="section how-section" id="how">
//           <Reveal className="section-heading center-heading"><div><div className="eyebrow"><span /> SIMPLE, HONEST PRICING</div><h2>Pay once.<br /><em>Visit as many as you like.</em></h2></div></Reveal>
//           <div className="how-grid">
//             {[
//               [Search, 'Browse freely', 'Explore every listing, photo and Reel without signing up or paying anything.'],
//               [CalendarCheck, `Schedule your first visit`, `A one-time ₹${fee} scheduling fee unlocks visits. You pay it once — not per property.`],
//               [Sparkles, 'Visit unlimited homes', 'After that, schedule visits to any other home for free. No repeat charges.'],
//             ].map(([Icon, title, text], i) => (
//               <Reveal key={title} delay={i * 120} className="how-card"><span className="how-icon"><Icon size={22} /></span><span className="how-num">0{i + 1}</span><h3>{title}</h3><p>{text}</p></Reveal>
//             ))}
//           </div>
//         </section>

//         <section className="story-section" id="story">
//           <Reveal className="story-image"><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85" alt="Warm sunlit living room" loading="lazy" /><span className="image-note">A home is a feeling.</span></Reveal>
//           <Reveal className="story-copy" delay={150}>
//             <div className="eyebrow"><span /> THE HOUSING STORIES</div>
//             <h2>Less scrolling.<br /><em>More belonging.</em></h2>
//             <p>Finding a home should feel exciting, not exhausting. We bring together carefully presented properties, straightforward information, and real people who listen to what you need.</p>
//             <p>Because the right home is more than square feet and a pin on a map. It’s where your next chapter begins.</p>
//             <a className="text-link" href="#contact">Let’s find your story <ArrowRight size={17} /></a>
//             <div className="story-stat"><Sparkles size={21} /><span><b>Thoughtfully chosen homes</b><small>Quality over quantity, always.</small></span></div>
//           </Reveal>
//         </section>

//         {testimonials.length > 0 && (
//           <section className="section testimonials" id="testimonials">
//             <Reveal className="section-heading"><div><div className="eyebrow"><span /> KIND WORDS</div><h2>Stories from<br /><em>our people.</em></h2></div><p>Every move matters. Here’s what customers say about finding their place with us.</p></Reveal>
//             <div className="testimonial-grid">
//               {testimonials.map((t, i) => (
//                 <Reveal as="article" delay={i * 100} className="testimonial-card" key={t._id}>
//                   <div className="stars">{Array.from({ length: t.rating || 5 }).map((_, k) => <Star key={k} size={15} fill="currentColor" />)}</div>
//                   <p>“{t.message}”</p>
//                   <div className="testimonial-person"><span>{(t.name || 'H').split(' ').map((x) => x[0]).join('').slice(0, 2)}</span><div><b>{t.name}</b><small>{t.role || 'Happy customer'}</small></div></div>
//                 </Reveal>
//               ))}
//             </div>
//           </section>
//         )}

//         <section className="cta-section" id="contact">
//           <Reveal><div className="eyebrow light"><span /> YOUR NEXT CHAPTER</div><h2>Let’s find a place<br />that feels like <em>you.</em></h2><p>Tell us what home looks like to you. We’ll help you take the next step.</p></Reveal>
//           <Reveal delay={150}><a className="button button-light" href="mailto:hello@thehousingstories.in">Start a conversation <ArrowUpRight size={17} /></a></Reveal>
//         </section>
//       </main>
//       <Footer />
//     </>
//   );
// }


import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CalendarCheck, Check, Clock, Home as HomeIcon, MapPinned, RefreshCw, Search, ShieldCheck, Sparkles, Star, Wallet } from 'lucide-react';
import { api } from '../api';
import { Footer, Header } from '../components/Layout';
import PropertyCard, { PropertySkeletons } from '../components/PropertyCard';
import { CountUp, Reveal, useProperties } from '../hooks';
import { BROKERAGE_PERCENT } from '../utils';

export default function Home() {
  const navigate = useNavigate();
  const { items, loading, error, retry } = useProperties('&featured=true');
  const [heroQ, setHeroQ] = useState('');
  const [fee, setFee] = useState(299);
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => { api('/testimonials').then(setTestimonials).catch(() => {}); }, []);
  useEffect(() => { api('/bookings/fee').then((d) => setFee(d.fee)).catch(() => {}); }, []);
  useEffect(() => { api('/stats').then(setStats).catch(() => {}); }, []);

  const featured = items.slice(0, 6);
  const goSearch = (e) => { e.preventDefault(); navigate(`/properties${heroQ.trim() ? `?q=${encodeURIComponent(heroQ.trim())}` : ''}`); };

  return (
    <>
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
              <span><Wallet size={16} /> Visit plan ₹{fee} only</span>
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

        <section className="section plan-section" id="how">
          <Reveal className="section-heading center-heading"><div><div className="eyebrow"><span /> PROPERTY VISIT PLAN</div><h2>Book your property visit<br /><em>for just ₹{fee}.</em></h2></div></Reveal>
          <div className="plan-wrap">
            <div className="plan-steps">
              {[
                [Search, 'Browse freely', 'Explore every listing, photo and Reel without paying anything.'],
                [CalendarCheck, 'Pick a free time slot', 'Choose any open slot between 8:00 AM and 9:00 PM. Only available slots are shown.'],
                [Sparkles, `Pay ₹${fee} once`, 'One payment unlocks visits to every property. No repeat charges.'],
              ].map(([Icon, title, text], i) => (
                <Reveal key={title} delay={i * 120} className="plan-step"><span className="how-icon"><Icon size={22} /></span><div><h3>{title}</h3><p>{text}</p></div></Reveal>
              ))}
            </div>
            <Reveal delay={200} className="plan-card">
              <span className="plan-badge">VISIT PLAN</span>
              <div className="plan-price"><sup>₹</sup>{fee}<small>one-time</small></div>
              <ul>
                <li><Check size={17} /> Visit unlimited properties</li>
                <li><Check size={17} /> Choose from live, available time slots</li>
                <li><Check size={17} /> Visits any day, 8 AM to 9 PM</li>
                <li><Check size={17} /> No per-property charges</li>
              </ul>
              <div className="plan-brokerage"><b>{BROKERAGE_PERCENT}% brokerage</b><small>Charged only when you finalise a home through us.</small></div>
              <Link to="/properties" className="button button-accent full">Book a property visit <ArrowRight size={17} /></Link>
            </Reveal>
          </div>
        </section>

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
          <Reveal delay={150}><a className="button button-light" href="mailto:hello@thehousingstories.in">Start a conversation <ArrowUpRight size={17} /></a></Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}