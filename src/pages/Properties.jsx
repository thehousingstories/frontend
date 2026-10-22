import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Home as HomeIcon, RefreshCw, Search } from 'lucide-react';
import { Footer, Header } from '../components/Layout';
import PropertyCard, { PropertySkeletons } from '../components/PropertyCard';
import { Reveal, useProperties } from '../hooks';
import { PROPERTY_TYPES } from '../utils';

const BUDGETS = [['', 'Any budget'], ['15000', 'Up to ₹15,000'], ['30000', 'Up to ₹30,000'], ['50000', 'Up to ₹50,000'], ['100000', 'Up to ₹1,00,000'], ['10000000', 'Up to ₹1 Cr']];

export default function Properties() {
  const [params] = useSearchParams();
  const { items, loading, error, retry } = useProperties();
  const [q, setQ] = useState(params.get('q') || '');
  const [listing, setListing] = useState('All');
  const [type, setType] = useState('All');
  const [budget, setBudget] = useState('');
  const [sort, setSort] = useState('featured');

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = items.filter((p) =>
      (!term || `${p.title} ${p.locality} ${p.city} ${p.address}`.toLowerCase().includes(term)) &&
      (listing === 'All' || p.listingType === listing) &&
      (type === 'All' || p.propertyType === type) &&
      (!budget || p.rent <= Number(budget)));
    if (sort === 'low') list = [...list].sort((a, b) => a.rent - b.rent);
    if (sort === 'high') list = [...list].sort((a, b) => b.rent - a.rent);
    return list;
  }, [items, q, listing, type, budget, sort]);

  const hasFilters = q || listing !== 'All' || type !== 'All' || budget;
  const clear = () => { setQ(''); setListing('All'); setType('All'); setBudget(''); };

  return (
    <>
      <Header />
      <main className="section listing-page">
        <Reveal className="section-heading">
          <div><div className="eyebrow"><span /> ALL PROPERTIES</div><h2>Find your <em>space.</em></h2></div>
          <p>Every available home, in one place. Filter by what matters to you.</p>
        </Reveal>

        <div className="filter-bar">
          <div className="search-bar">
            <Search size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search locality, property…" aria-label="Search" />
            {hasFilters && <button type="button" className="clear-btn" onClick={clear}>Clear</button>}
          </div>
          <div className="seg" role="tablist" aria-label="Listing type">
            {['All', 'Rent', 'Sale'].map((x) => (
              <button key={x} role="tab" aria-selected={listing === x} className={listing === x ? 'active' : ''} onClick={() => setListing(x)}>{x === 'All' ? 'All' : `For ${x.toLowerCase()}`}</button>
            ))}
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Property type"><option value="All">All types</option>{PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          <select value={budget} onChange={(e) => setBudget(e.target.value)} aria-label="Budget">{BUDGETS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort"><option value="featured">Featured first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
        </div>

        {!loading && !error && items.length > 0 && <p className="result-count">{filtered.length} {filtered.length === 1 ? 'home' : 'homes'} found</p>}

        {error ? (
          <div className="empty-state"><h3>We couldn’t load the homes</h3><p>{error}</p><button className="button button-dark" onClick={retry}><RefreshCw size={16} /> Try again</button></div>
        ) : loading ? (
          <div className="property-grid"><PropertySkeletons n={6} /></div>
        ) : items.length === 0 ? (
          <div className="empty-state"><HomeIcon size={34} /><h3>New homes are on the way</h3><p>We’re adding fresh listings. Please check back soon.</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Search size={32} /><h3>No homes match yet</h3><p>Try another locality, budget or property type.</p><button className="button button-outline" onClick={clear}>Reset filters</button></div>
        ) : (
          <div className="property-grid">{filtered.map((p, i) => <PropertyCard key={p._id} p={p} index={i} />)}</div>
        )}
      </main>
      <Footer />
    </>
  );
}