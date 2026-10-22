import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BedDouble, Bath, MapPin, Menu, Search, ShieldCheck, Sparkles, X, Instagram, Heart, House, CalendarDays, LayoutDashboard, Building2, ClipboardList, MessageSquareQuote, LogOut, Plus, Trash2, Pencil, CheckCircle2 } from 'lucide-react';
import { api, API, getToken } from './api';

const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n || 0));
const demoProperties = [
 { _id:'demo1', title:'Sunlit 2 BHK in Indiranagar', locality:'Indiranagar', city:'Bengaluru', rent:32000, deposit:100000, bedrooms:2, bathrooms:2, areaSqFt:1180, furnishing:'Semi-furnished', propertyType:'Apartment', description:'A warm, thoughtfully planned home with generous natural light, a balcony, and quick access to cafes, parks, and metro connectivity.', images:['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85'], amenities:['Balcony','Lift','Security','Covered parking'], instagramReelUrl:'', featured:true },
 { _id:'demo2', title:'Quiet contemporary home', locality:'Whitefield', city:'Bengaluru', rent:28000, deposit:84000, bedrooms:2, bathrooms:2, areaSqFt:1050, furnishing:'Furnished', propertyType:'Apartment', description:'A calm, modern space close to tech parks and everyday essentials.', images:['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85'], amenities:['Gym','Pool','Security'], instagramReelUrl:'', featured:false },
 { _id:'demo3', title:'Minimal studio with a view', locality:'HSR Layout', city:'Bengaluru', rent:18000, deposit:50000, bedrooms:1, bathrooms:1, areaSqFt:620, furnishing:'Furnished', propertyType:'Studio', description:'A compact, airy studio designed for simple, comfortable city living.', images:['https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85'], amenities:['Power backup','Lift','Security'], instagramReelUrl:'', featured:false },
];
const demoTestimonials = [
 { name:'Aarav M.', role:'Found a home in 5 days', message:'The team understood what mattered to us and helped us shortlist without wasting weekends.', rating:5 },
 { name:'Nisha R.', role:'Moved to Bengaluru', message:'Clear communication, genuine listings, and a visit process that felt simple and transparent.', rating:5 },
 { name:'Karan S.', role:'Working professional', message:'The property details were useful and the team made the whole experience less stressful.', rating:5 },
];
function useProperties() {
 const [items,setItems] = useState(demoProperties), [loading,setLoading] = useState(true), [error,setError] = useState('');
 useEffect(()=>{ api('/properties').then(d=>setItems(d.items?.length ? d.items : demoProperties)).catch(()=>setError('Showing preview listings. Connect the backend and add properties to publish your live inventory.')).finally(()=>setLoading(false)); },[]);
 return {items,loading,error};
}
function Header() {
 const [open,setOpen] = useState(false);
 return <header className="site-header"><Link to="/" className="brand"><span className="brand-mark"><House size={21}/></span><span>THE HOUSING <b>STORIES</b><small>FIND A PLACE TO BELONG</small></span></Link>
 <button className="mobile-menu icon-btn" onClick={()=>setOpen(!open)} aria-label="Toggle navigation">{open?<X/>:<Menu/>}</button>
 <nav className={open?'nav-links open':'nav-links'}><a href="/#homes" onClick={()=>setOpen(false)}>Find a home</a><a href="/#story" onClick={()=>setOpen(false)}>Our story</a><a href="/#testimonials" onClick={()=>setOpen(false)}>Testimonials</a><a href="/#contact" onClick={()=>setOpen(false)}>Contact</a></nav></header>;
}
function PropertyCard({p}) {
 const image = p.images?.[0] || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80';
 return <article className="property-card"><Link className="property-image" to={`/property/${p._id}`}><img src={image} alt={p.title}/><span className="image-tag">{p.propertyType || 'Home'}</span><button className="save-btn" aria-label="Save property" onClick={e=>{e.preventDefault(); e.currentTarget.classList.toggle('saved')}}><Heart size={17}/></button></Link><div className="property-body"><div className="property-location"><MapPin size={14}/>{p.locality}, {p.city || 'Bengaluru'}</div><Link to={`/property/${p._id}`} className="property-title">{p.title}</Link><div className="property-specs"><span><BedDouble size={16}/>{p.bedrooms || 0} beds</span><span><Bath size={16}/>{p.bathrooms || 0} baths</span><span>{p.areaSqFt || '—'} sq.ft</span></div><div className="property-foot"><div><strong>{money(p.rent)}<small>/month</small></strong><small>Deposit {money(p.deposit)}</small></div><Link to={`/property/${p._id}`} className="round-arrow" aria-label={`View ${p.title}`}><ArrowUpRight size={19}/></Link></div></div></article>;
}
function Reel({url}) {
 if (!url) return null;
 const shortcode = url.match(/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/)?.[1];
 return <div className="reel-wrap">{shortcode ? <iframe title="Property Instagram Reel" src={`https://www.instagram.com/reel/${shortcode}/embed`} loading="lazy" allowFullScreen /> : null}<a href={url} target="_blank" rel="noreferrer"><Instagram size={16}/> Watch property Reel on Instagram <ArrowUpRight size={15}/></a></div>;
}
function Home() {
 const {items,loading,error} = useProperties(); const [q,setQ] = useState(''); const [type,setType] = useState('All');
 const filtered = useMemo(()=>items.filter(p=>(!q || `${p.title} ${p.locality} ${p.city}`.toLowerCase().includes(q.toLowerCase())) && (type==='All'||p.propertyType===type)),[items,q,type]);
 const [testimonials,setTestimonials] = useState(demoTestimonials);
 const [reels, setReels] = useState([]);

 useEffect(() => {
  fetch(`${API}/instagram/reels`)
    .then((res) => {
      if (!res.ok) throw new Error("Instagram feed unavailable");
      return res.json();
    })
    .then((data) => setReels(data.reels || []))
    .catch((err) => console.error(err));
}, []);

 useEffect(()=>{api('/testimonials').then(d=>{if(d.length)setTestimonials(d)}).catch(()=>{});},[]);
 return <><Header/><main><section className="hero"><div className="hero-overlay"></div><div className="hero-content"><div className="eyebrow light"><span></span> A MORE HUMAN WAY TO FIND HOME</div><h1>Every home has<br/>a <em>story.</em> Find yours.</h1><p>Thoughtful spaces. Honest guidance. A home that feels like you.</p><a className="button button-light" href="#homes">Explore homes <ArrowRight size={17}/></a><div className="hero-note"><span className="note-icon"><ShieldCheck size={18}/></span><span><b>Curated, not crowded</b><small>Homes selected with care</small></span></div></div><div className="hero-caption">GOOD HOMES. GOOD STORIES. <span>01 / 03</span></div></section>
 <section className="trust-strip"><div><strong>01</strong><span>People-first<br/>property guidance</span></div><div><strong>02</strong><span>Verified details<br/>and clear pricing</span></div><div><strong>03</strong><span>Visits that work<br/>around your life</span></div><div className="trust-quote">“Home is not a place.<br/><em>It’s how it feels.</em>”</div></section>
 <section className="section homes-section" id="homes"><div className="section-heading"><div><div className="eyebrow"><span></span> FIND YOUR SPACE</div><h2>Homes worth<br/><em>coming home to.</em></h2></div><p>Explore considered spaces for every chapter of your life.</p></div>
 <div className="search-bar"><Search size={19}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by locality, property or city..."/><select value={type} onChange={e=>setType(e.target.value)}><option>All</option>{['Apartment','Villa','Independent House','PG/Co-living','Studio','Commercial'].map(t=><option key={t}>{t}</option>)}</select><button onClick={()=>document.getElementById('property-grid')?.scrollIntoView({behavior:'smooth'})}>Search</button></div>
 {error&&<p className="notice">{error}</p>}{loading&&<p className="muted">Loading homes…</p>}
 <div className="property-grid" id="property-grid">{filtered.map(p=><PropertyCard key={p._id} p={p}/>)}{!filtered.length&&<div className="empty-state">No homes match that search yet. Try another locality or property type.</div>}</div>
 <div className="center"><a href="#contact" className="button button-outline">Can’t find your home? Talk to us <ArrowRight size={16}/></a></div></section>
<section className="section reels-section" id="instagram-reels">
  <div className="section-heading">
    <div>
      <div className="eyebrow">
        <span></span> FROM OUR INSTAGRAM
      </div>
      <h2>Watch our <em>Reels.</em></h2>
    </div>
    <p>Explore our latest property tours and home walkthroughs.</p>
  </div>

  <InstagramFeed />
</section>
 <section className="story-section" id="story"><div className="story-image"><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85" alt="Warm sunlit living room"/><span className="image-note">A home is a feeling.</span></div><div className="story-copy"><div className="eyebrow"><span></span> THE HOUSING STORIES</div><h2>Less scrolling.<br/><em>More belonging.</em></h2><p>Finding a home should feel exciting, not exhausting. We bring together carefully presented properties, straightforward information, and real people who listen to what you need.</p><p>Because the right home is more than square feet and a pin on a map. It’s where your next chapter begins.</p><a className="text-link" href="#contact">Let’s find your story <ArrowRight size={17}/></a><div className="story-stat"><Sparkles size={21}/><span><b>Thoughtfully chosen homes</b><small>Quality over quantity, always.</small></span></div></div></section>
 <section className="section testimonials" id="testimonials"><div className="section-heading"><div><div className="eyebrow"><span></span> KIND WORDS</div><h2>Stories from<br/><em>our people.</em></h2></div><p>Every move matters. Here’s what customers say about finding their place with us.</p></div><div className="testimonial-grid">{testimonials.map((t,i)=><article className="testimonial-card" key={t._id||i}><div className="stars">{'★'.repeat(t.rating||5)}</div><p>“{t.message}”</p><div className="testimonial-person"><span>{(t.name||'H').split(' ').map(x=>x[0]).join('').slice(0,2)}</span><div><b>{t.name}</b><small>{t.role||'Happy customer'}</small></div></div></article>)}</div></section>
 <section className="cta-section" id="contact"><div><div className="eyebrow light"><span></span> YOUR NEXT CHAPTER</div><h2>Let’s find a place<br/>that feels like <em>you.</em></h2><p>Tell us what home looks like to you. We’ll help you take the next step.</p></div><a className="button button-light" href="mailto:hello@thehousingstories.in">Start a conversation <ArrowUpRight size={17}/></a></section></main><Footer/></>;
}



function InstagramFeed() {
  const [reels, setReels] = useState([]);

  useEffect(() => {
    fetch(`${API}/instagram/reels`)
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch Reels");
        }

        setReels(data.reels || []);
      })
      .catch((err) => console.error("Instagram feed error:", err));
  }, []);

  if (!reels.length) return null;

  return (
    <div className="reels-carousel">
      {reels.map((reel) => (
        <a
          className="reel-card"
          key={reel.id}
          href={reel.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Watch Reel on Instagram"
        >
          {reel.thumbnail ? (
            <img
              src={reel.thumbnail}
              alt={reel.caption || "Property Reel"}
              className="reel-thumbnail-image"
              loading="lazy"
            />
          ) : (
            <div className="reel-thumbnail-fallback">
              Watch on Instagram
            </div>
          )}

          <span className="reel-play-icon">▶</span>
        </a>
      ))}
    </div>
  );
}



  
function Footer(){return <footer className="footer"><Link to="/" className="brand"><span className="brand-mark"><House size={20}/></span><span>THE HOUSING <b>STORIES</b><small>FIND A PLACE TO BELONG</small></span></Link><span>Thoughtfully finding home, one story at a time.</span><div><a href="https://instagram.com/" target="_blank" rel="noreferrer"><Instagram size={17}/></a><a href="mailto:hello@thehousingstories.in">Contact</a></div><small className="copyright">© {new Date().getFullYear()} The Housing Stories</small></footer>}
function PropertyDetails(){
 const {id}=useParams(), nav=useNavigate(); const [p,setP]=useState(demoProperties.find(x=>x._id===id)); const [err,setErr]=useState('');
 const [form,setForm]=useState({customerName:'',customerEmail:'',customerPhone:'',preferredDate:'',preferredTime:'11:00 AM',note:''});
 useEffect(()=>{api(`/properties/${id}`).then(setP).catch(()=>{});},[id]);
 const update=e=>setForm({...form,[e.target.name]:e.target.value});
 async function submit(e){e.preventDefault(); setErr(''); try{const order=await api('/bookings/create-order',{method:'POST',body:JSON.stringify({...form,propertyId:id})}); if(!order.orderId){setErr(order.message||'Payment setup is not complete.');return;} if(!window.Razorpay){const s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js';s.onload=()=>openCheckout(order);document.body.appendChild(s);}else openCheckout(order); function openCheckout(o){const r=new window.Razorpay({key:o.keyId,amount:o.amount,currency:o.currency,name:'The Housing Stories',description:'Property visit scheduling fee',order_id:o.orderId,handler:async response=>{try{await api('/bookings/verify-payment',{method:'POST',body:JSON.stringify({...response,bookingId:o.bookingId})});alert('Payment successful. Your visit request is confirmed.');nav('/');}catch(ex){setErr(ex.message)}},prefill:{name:form.customerName,email:form.customerEmail,contact:form.customerPhone},theme:{color:'#18372e'}});r.open();}}catch(ex){setErr(ex.message)}}
 if(!p)return <><Header/><div className="detail-loading">Loading property… If this is a preview listing, return to the home page and open another property.</div><Footer/></>;
 return <><Header/><main className="details-page"><Link to="/" className="back-link">← Back to homes</Link><div className="details-layout"><div><img className="detail-main-image" src={p.images?.[0]||demoProperties[0].images[0]} alt={p.title}/><Reel url={p.instagramReelUrl}/><div className="details-copy"><div className="eyebrow"><span></span> {p.propertyType} · {p.locality}</div><h1>{p.title}</h1><p><MapPin size={16}/> {p.address || `${p.locality}, ${p.city||'Bengaluru'}`}</p><p className="long-description">{p.description}</p><h3>What makes it special</h3><div className="amenities">{(p.amenities||[]).map(a=><span key={a}>{a}</span>)}</div></div></div><aside className="booking-card"><div className="price-line"><strong>{money(p.rent)}</strong><span>/ month</span></div><p className="deposit-line">Security deposit: {money(p.deposit)}</p><div className="booking-perks"><span><BedDouble size={17}/>{p.bedrooms} bedrooms</span><span><Bath size={17}/>{p.bathrooms} bathrooms</span><span>{p.areaSqFt} sq.ft.</span></div><div className="fee-note"><CalendarDays size={19}/><span><b>Schedule a property visit</b><small>One-time visit scheduling fee: ₹299</small></span></div><form onSubmit={submit} className="booking-form"><label>Full name<input required name="customerName" value={form.customerName} onChange={update} placeholder="Your name"/></label><label>Email address<input required type="email" name="customerEmail" value={form.customerEmail} onChange={update} placeholder="you@example.com"/></label><label>Phone number<input required pattern="[0-9+() -]{8,18}" name="customerPhone" value={form.customerPhone} onChange={update} placeholder="+91 98765 43210"/></label><label>Preferred visit date<input required type="date" min={new Date().toISOString().slice(0,10)} name="preferredDate" value={form.preferredDate} onChange={update}/></label><label>Preferred time<select name="preferredTime" value={form.preferredTime} onChange={update}>{['09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM'].map(t=><option key={t}>{t}</option>)}</select></label><label>Anything we should know? <textarea name="note" value={form.note} onChange={update} rows="2" placeholder="Optional note"/></label>{err&&<p className="form-error">{err}</p>}<button className="button button-dark full" type="submit">Pay ₹299 & request visit <ArrowRight size={17}/></button><small className="secure-note"><ShieldCheck size={14}/> Secure payment via Razorpay</small></form></aside></div></main><Footer/></>;
}
function AdminLogin({onLogin}){const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[err,setErr]=useState('');async function submit(e){e.preventDefault();setErr('');try{const d=await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})});localStorage.setItem('ths_admin_token',d.token);onLogin(true);}catch(e){setErr(e.message)}}return <div className="login-screen"><Link to="/" className="brand"><span className="brand-mark"><House size={21}/></span><span>THE HOUSING <b>STORIES</b><small>ADMINISTRATION</small></span></Link><form className="login-card" onSubmit={submit}><div className="eyebrow"><span></span> ADMIN WORKSPACE</div><h1>Welcome<br/><em>back.</em></h1><p>Sign in to manage your property stories.</p><label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input required type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{err&&<p className="form-error">{err}</p>}<button className="button button-dark full">Sign in <ArrowRight size={17}/></button><Link className="back-home" to="/">← Return to website</Link></form></div>}
function Admin({onLogout}) {
 const [tab,setTab]=useState('overview'),[properties,setProperties]=useState([]),[bookings,setBookings]=useState([]),[testimonials,setTestimonials]=useState([]),[notice,setNotice]=useState(''),[editing,setEditing]=useState(null),[form,setForm]=useState({title:'',description:'',propertyType:'Apartment',listingType:'Rent',rent:'',deposit:'',bedrooms:2,bathrooms:1,areaSqFt:'',furnishing:'Semi-furnished',address:'',locality:'',city:'Bengaluru',images:'',instagramReelUrl:'',amenities:'',featured:false,status:'Available',isPublished:true});
 async function load(){try{const [p,b,t]=await Promise.all([api('/properties/admin/all'),api('/bookings/admin/all'),api('/testimonials/admin/all')]);setProperties(p);setBookings(b);setTestimonials(t);}catch(e){setNotice(e.message)}}
 useEffect(()=>{load()},[]);
 function resetForm(){setEditing(null);setForm({title:'',description:'',propertyType:'Apartment',listingType:'Rent',rent:'',deposit:'',bedrooms:2,bathrooms:1,areaSqFt:'',furnishing:'Semi-furnished',address:'',locality:'',city:'Bengaluru',images:'',instagramReelUrl:'',amenities:'',featured:false,status:'Available',isPublished:true});}
 function edit(p){setEditing(p._id);setForm({...p,images:(p.images||[]).join('\n'),amenities:(p.amenities||[]).join(', ')});setTab('properties');window.scrollTo(0,0);}
 async function saveProperty(e){e.preventDefault();setNotice('');const payload={...form,rent:Number(form.rent),deposit:Number(form.deposit||0),bedrooms:Number(form.bedrooms||0),bathrooms:Number(form.bathrooms||0),areaSqFt:Number(form.areaSqFt||0),images:String(form.images).split('\n').map(s=>s.trim()).filter(Boolean),amenities:String(form.amenities).split(',').map(s=>s.trim()).filter(Boolean)};try{await api(editing?`/properties/${editing}`:'/properties',{method:editing?'PUT':'POST',body:JSON.stringify(payload)});setNotice(editing?'Property updated.':'Property created.');resetForm();load()}catch(e){setNotice(e.message)}}
 async function delProperty(id){if(!confirm('Delete this property?'))return;try{await api(`/properties/${id}`,{method:'DELETE'});load();setNotice('Property deleted.')}catch(e){setNotice(e.message)}}
 async function saveTestimonial(e){e.preventDefault();const f=e.currentTarget;const payload={name:f.name.value,role:f.role.value,message:f.message.value,rating:Number(f.rating.value),isPublished:true};try{await api('/testimonials',{method:'POST',body:JSON.stringify(payload)});f.reset();load();setNotice('Testimonial added.')}catch(e){setNotice(e.message)}}
 async function deleteTestimonial(id){if(!confirm('Delete this testimonial?'))return;try{await api(`/testimonials/${id}`,{method:'DELETE'});load()}catch(e){setNotice(e.message)}}
 const navItems=[['overview','Overview',LayoutDashboard],['properties','Properties',Building2],['bookings','Visit bookings',ClipboardList],['testimonials','Testimonials',MessageSquareQuote]];
 return <div className="admin-shell"><aside className="admin-sidebar"><Link to="/" className="brand"><span className="brand-mark"><House size={20}/></span><span>THE HOUSING <b>STORIES</b><small>ADMIN WORKSPACE</small></span></Link><div className="admin-nav-label">WORKSPACE</div><nav>{navItems.map(([key,label,Icon])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}><Icon size={18}/>{label}{key==='bookings'&&bookings.length>0&&<span className="nav-count">{bookings.length}</span>}</button>)}</nav><div className="sidebar-bottom"><div className="admin-profile"><span>TH</span><div><b>Administrator</b><small>Property management</small></div></div><button className="logout-btn" onClick={onLogout}><LogOut size={17}/> Sign out</button><Link to="/" className="view-site">View website <ArrowUpRight size={15}/></Link></div></aside><main className="admin-main"><header className="admin-topbar"><div><span className="admin-mobile-label">THE HOUSING STORIES</span><h1>{navItems.find(x=>x[0]===tab)?.[1]}</h1></div><span className="admin-status"><i/> System online</span></header><div className="admin-content">{notice&&<div className="admin-notice">{notice}<button onClick={()=>setNotice('')}><X size={15}/></button></div>}
 {tab==='overview'&&<><div className="admin-welcome"><div><div className="eyebrow light"><span></span> YOUR PROPERTY DESK</div><h2>Good work starts<br/>with a <em>good story.</em></h2><p>Here’s what’s happening across your listings.</p></div><button className="button button-light" onClick={()=>{resetForm();setTab('properties')}}><Plus size={17}/> Add property</button></div><div className="stats-grid"><div className="stat-card"><span>Active listings</span><Building2/><strong>{properties.filter(p=>p.status==='Available').length}</strong><small>Available properties</small></div><div className="stat-card"><span>Visit requests</span><CalendarDays/><strong>{bookings.length}</strong><small>All booking requests</small></div><div className="stat-card"><span>Paid bookings</span><CheckCircle2/><strong>{bookings.filter(b=>b.paymentStatus==='Paid').length}</strong><small>Payment verified</small></div><div className="stat-card"><span>Testimonials</span><MessageSquareQuote/><strong>{testimonials.length}</strong><small>Customer stories</small></div></div><section className="admin-panel"><div className="panel-heading"><div><h3>Recent properties</h3><p>Your latest inventory updates</p></div><button className="text-link" onClick={()=>setTab('properties')}>Manage all <ArrowRight size={15}/></button></div>{properties.slice(0,5).map(p=><div className="admin-list-row" key={p._id}><img src={p.images?.[0]||demoProperties[0].images[0]} alt=""/><div className="admin-row-title"><b>{p.title}</b><small>{p.locality} · {money(p.rent)}/month</small></div><span className={`status-pill ${p.status==='Available'?'green':''}`}>{p.status}</span><button className="icon-btn" onClick={()=>edit(p)}><Pencil size={16}/></button></div>)}{!properties.length&&<p className="muted pad">No properties yet. Add your first listing to get started.</p>}</section></>}
 {tab==='properties'&&<><div className="admin-page-heading"><div><h2>{editing?'Edit property':'Property inventory'}</h2><p>Create, update, publish, and manage your listings.</p></div>{editing&&<button className="button button-outline" onClick={resetForm}>Cancel edit</button>}</div><form className="admin-form panel" onSubmit={saveProperty}><h3>{editing?'Property details':'Add a new property'}</h3><div className="form-grid"><label>Property title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Locality<input required value={form.locality} onChange={e=>setForm({...form,locality:e.target.value})}/></label><label>Property type<select value={form.propertyType} onChange={e=>setForm({...form,propertyType:e.target.value})}>{['Apartment','Villa','Independent House','PG/Co-living','Studio','Commercial'].map(x=><option key={x}>{x}</option>)}</select></label><label>Listing type<select value={form.listingType} onChange={e=>setForm({...form,listingType:e.target.value})}><option>Rent</option><option>Sale</option></select></label><label>Monthly rent / price (₹)<input required type="number" min="0" value={form.rent} onChange={e=>setForm({...form,rent:e.target.value})}/></label><label>Security deposit (₹)<input type="number" min="0" value={form.deposit} onChange={e=>setForm({...form,deposit:e.target.value})}/></label><label>Bedrooms<input type="number" min="0" value={form.bedrooms} onChange={e=>setForm({...form,bedrooms:e.target.value})}/></label><label>Bathrooms<input type="number" min="0" value={form.bathrooms} onChange={e=>setForm({...form,bathrooms:e.target.value})}/></label><label>Area (sq. ft.)<input type="number" min="0" value={form.areaSqFt} onChange={e=>setForm({...form,areaSqFt:e.target.value})}/></label><label>Furnishing<select value={form.furnishing} onChange={e=>setForm({...form,furnishing:e.target.value})}>{['Furnished','Semi-furnished','Unfurnished'].map(x=><option key={x}>{x}</option>)}</select></label><label className="wide">Full address<input required value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label><label className="wide">Description<textarea required rows="4" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label className="wide">Image URLs (one per line)<textarea rows="3" placeholder="Paste Cloudinary or image URLs, one per line" value={form.images} onChange={e=>setForm({...form,images:e.target.value})}/><small>For this starter, use hosted image URLs. Cloudinary upload UI can be added once credentials are configured.</small></label><label className="wide">Instagram Reel URL<input type="url" placeholder="https://www.instagram.com/reel/..." value={form.instagramReelUrl} onChange={e=>setForm({...form,instagramReelUrl:e.target.value})}/><small>The Reel link appears on the public property detail page.</small></label><label className="wide">Amenities (comma-separated)<input value={form.amenities} onChange={e=>setForm({...form,amenities:e.target.value})} placeholder="Lift, Balcony, Security, Parking"/></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{['Available','Reserved','Rented','Sold'].map(x=><option key={x}>{x}</option>)}</select></label><label>Publication<select value={String(form.isPublished)} onChange={e=>setForm({...form,isPublished:e.target.value==='true'})}><option value="true">Published</option><option value="false">Draft / hidden</option></select></label><label className="check-label"><input type="checkbox" checked={!!form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Feature on homepage</label></div><button className="button button-dark" type="submit">{editing?'Save changes':'Publish property'} <ArrowRight size={16}/></button></form><section className="admin-panel"><div className="panel-heading"><div><h3>All properties</h3><p>{properties.length} listings in your inventory</p></div></div>{properties.map(p=><div className="admin-list-row" key={p._id}><img src={p.images?.[0]||demoProperties[0].images[0]} alt=""/><div className="admin-row-title"><b>{p.title}</b><small>{p.locality} · {money(p.rent)}/month</small></div><span className={`status-pill ${p.status==='Available'?'green':''}`}>{p.status}</span><button className="icon-btn" onClick={()=>edit(p)} aria-label="Edit"><Pencil size={16}/></button><button className="icon-btn danger" onClick={()=>delProperty(p._id)} aria-label="Delete"><Trash2 size={16}/></button></div>)}</section></>}
 {tab==='bookings'&&<section className="admin-panel"><div className="panel-heading"><div><h3>Property visit requests</h3><p>Review booking and payment status.</p></div></div><div className="table-scroll"><table><thead><tr><th>Customer</th><th>Property</th><th>Visit date</th><th>Fee</th><th>Payment</th><th>Booking status</th></tr></thead><tbody>{bookings.map(b=><tr key={b._id}><td><b>{b.customerName}</b><small>{b.customerEmail}<br/>{b.customerPhone}</small></td><td>{b.property?.title||'Property removed'}</td><td>{new Date(b.preferredDate).toLocaleDateString('en-IN')}<small>{b.preferredTime}</small></td><td>{money(b.visitFee)}</td><td><span className={`status-pill ${b.paymentStatus==='Paid'?'green':''}`}>{b.paymentStatus}</span></td><td><select value={b.bookingStatus} onChange={async e=>{try{await api(`/bookings/${b._id}/status`,{method:'PATCH',body:JSON.stringify({bookingStatus:e.target.value})});load()}catch(err){setNotice(err.message)}}}>{['Requested','Confirmed','Completed','Cancelled'].map(x=><option key={x}>{x}</option>)}</select></td></tr>)}</tbody></table>{!bookings.length&&<p className="muted pad">No visit requests yet.</p>}</div></section>}
 {tab==='testimonials'&&<><form className="panel testimonial-form" onSubmit={saveTestimonial}><h3>Add a customer story</h3><div className="form-grid"><label>Name<input required name="name"/></label><label>Short description<input name="role" placeholder="Found a home in 5 days"/></label><label>Rating<select name="rating"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></label><label className="wide">Testimonial<textarea required name="message" rows="3"/></label></div><button className="button button-dark">Add testimonial <Plus size={16}/></button></form><section className="admin-panel"><div className="panel-heading"><div><h3>Published stories</h3><p>Customer feedback shown on the homepage</p></div></div>{testimonials.map(t=><div className="admin-list-row testimonial-admin-row" key={t._id}><div className="admin-row-title"><b>{t.name} · {'★'.repeat(t.rating||5)}</b><small>{t.message}</small></div><button className="icon-btn danger" onClick={()=>deleteTestimonial(t._id)}><Trash2 size={16}/></button></div>)}</section></>}
 </div></main></div>;
}
export default function App(){const [logged,setLogged]=useState(!!getToken());return <Routes><Route path="/" element={<Home/>}/><Route path="/property/:id" element={<PropertyDetails/>}/><Route path="/admin" element={logged?<Admin onLogout={()=>{localStorage.removeItem('ths_admin_token');setLogged(false)}}/>:<AdminLogin onLogin={setLogged}/>}/><Route path="*" element={<><Header/><div className="not-found"><h1>That story isn’t here.</h1><Link className="button button-dark" to="/">Back to home <ArrowRight size={16}/></Link></div><Footer/></>}/></Routes>}
