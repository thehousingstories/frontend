import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Bath, BedDouble, Heart, House, MapPin, Ruler } from 'lucide-react';
import { getSaved, money, toggleSaved } from '../utils';

export function PropertyImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className={`img-fallback ${className}`}><House size={34} /></div>;
  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

export default function PropertyCard({ p, index = 0 }) {
  const [saved, setSaved] = useState(() => getSaved().includes(p._id));
  const isRent = p.listingType !== 'Sale';
  return (
    <article className="property-card" style={{ '--i': index }}>
      <Link className="property-image" to={`/property/${p.slug || p._id}`}>
        <PropertyImage src={p.images?.[0]} alt={p.title} />
        <span className="image-tag">{p.propertyType || 'Home'}</span>
        <span className={`listing-tag ${isRent ? 'rent' : 'sale'}`}>{isRent ? 'For rent' : 'For sale'}</span>
        <button
          className={`save-btn ${saved ? 'saved' : ''}`}
          aria-label={saved ? 'Remove from saved' : 'Save property'}
          onClick={(e) => { e.preventDefault(); setSaved(toggleSaved(p._id)); }}
        ><Heart size={17} /></button>
      </Link>
      <div className="property-body">
        <div className="property-location"><MapPin size={14} />{p.locality}, {p.city || 'Bengaluru'}</div>
        <Link to={`/property/${p.slug || p._id}`} className="property-title">{p.title}</Link>
        <div className="property-specs">
          <span><BedDouble size={16} />{p.bedrooms ?? 0} beds</span>
          <span><Bath size={16} />{p.bathrooms ?? 0} baths</span>
          {/* {p.areaSqFt ? <span><Ruler size={16} />{p.areaSqFt} sq.ft</span> : null} */}
        </div>
        <div className="property-foot">
          <div>
            <strong>{money(p.rent)}{isRent && <small>/month</small>}</strong>
            {isRent && p.deposit ? <small>Deposit {money(p.deposit)}</small> : <small>{p.furnishing}</small>}
          </div>
          <Link to={`/property/${p.slug || p._id}`}className="round-arrow" aria-label={`View ${p.title}`}><ArrowUpRight size={19} /></Link>
        </div>
      </div>
    </article>
  );
}

export function PropertySkeletons({ n = 3 }) {
  return Array.from({ length: n }).map((_, i) => (
    <div className="property-card skeleton-card" key={i}>
      <div className="sk sk-img" /><div className="property-body"><div className="sk sk-line w40" /><div className="sk sk-line w80 tall" /><div className="sk sk-line w60" /></div>
    </div>
  ));
}
