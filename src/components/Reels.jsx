import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight, Instagram, Play, X } from 'lucide-react';
import { Reveal } from '../hooks.jsx';

const igCode = (url = '') => url.match(/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/)?.[1];

function ReelCard({ reel, onOpen }) {
  const isIg = reel.source === 'instagram';
  const vref = useRef(null);

  // Uploaded videos autoplay (muted, looping) while the card is on screen, and pause when it scrolls away
  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    v.muted = true;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.6 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <button className="reel-card" onClick={onOpen} aria-label={`Play reel: ${reel.title}`}>
      {isIg ? (
        reel.posterUrl ? <img src={reel.posterUrl} alt="" loading="lazy" /> : <div className="reel-bg"><Instagram size={42} /></div>
      ) : (
        <video ref={vref} src={`${reel.videoUrl}#t=0.1`} poster={reel.posterUrl || undefined} muted loop playsInline preload="metadata" />
      )}
      <span className="reel-shade" />
      <span className="reel-play"><Play size={22} fill="currentColor" /></span>
      {isIg && <span className="reel-tag"><Instagram size={13} /> Instagram</span>}
      <span className="reel-info"><b>{reel.title}</b>{reel.property?.locality && <small>{reel.property.locality}</small>}</span>
    </button>
  );
}

function ReelViewer({ reels, index, setIndex, onClose }) {
  const reel = reels[index];
  const videoRef = useRef(null);
  const prev = () => setIndex((index - 1 + reels.length) % reels.length);
  const next = () => setIndex((index + 1) % reels.length);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }); // eslint-disable-line

    // Autoplay with sound; if the browser blocks that, fall back to muted autoplay
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
  }, [index]);

  const code = igCode(reel.instagramUrl);
  return (
    <div className="reel-viewer" role="dialog" aria-modal="true" aria-label={reel.title} onClick={onClose}>
      <button className="rv-close icon-btn" onClick={onClose} aria-label="Close"><X size={22} /></button>
      {reels.length > 1 && <button className="rv-nav left" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous reel"><ChevronLeft size={26} /></button>}
      <div className="rv-stage" onClick={(e) => e.stopPropagation()}>
        <div className="rv-frame" key={reel._id}>
          {reel.source === 'instagram' && code ? (
            <iframe title={reel.title} src={`https://www.instagram.com/reel/${code}/embed`} allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
          ) : (
            <video ref={videoRef} src={reel.videoUrl} poster={reel.posterUrl || undefined} controls autoPlay playsInline loop />
          )}
        </div>
        <div className="rv-caption">
          <h3>{reel.title}</h3>
          {reel.caption && <p>{reel.caption}</p>}
          {reel.property && <Link className="button button-accent small" to={`/property/${reel.property._id}`} onClick={onClose}>View {reel.property.title} <ArrowUpRight size={15} /></Link>}
        </div>
      </div>
      {reels.length > 1 && <button className="rv-nav right" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next reel"><ChevronRight size={26} /></button>}
    </div>
  );
}

export default function ReelsSection({ reels }) {
  const [open, setOpen] = useState(null);
  const rowRef = useRef(null);
  if (!reels?.length) return null; // nothing to show until reels are added in admin
  const scroll = (dir) => rowRef.current?.scrollBy({ left: dir * 480, behavior: 'smooth' });
  const playable = reels.filter((r) => r.source !== 'instagram'); // only uploaded videos play on the website
  const openReel = (r) => {
    if (r.source === 'instagram') window.open(r.instagramUrl, '_blank', 'noopener,noreferrer');
    else setOpen(playable.indexOf(r));
  };
  return (
    <section className="section reels-section" id="reels">
      <Reveal className="section-heading">
        <div><div className="eyebrow"><span /> HOME TOURS</div><h2>Watch before<br /><em>you visit.</em></h2></div>
        <div className="reel-arrows"><button className="icon-btn" onClick={() => scroll(-1)} aria-label="Scroll left"><ChevronLeft /></button><button className="icon-btn" onClick={() => scroll(1)} aria-label="Scroll right"><ChevronRight /></button></div>
      </Reveal>
      <div className="reels-row" ref={rowRef}>
         {reels.map((r) => <ReelCard key={r._id} reel={r} onOpen={() => openReel(r)} />)}
      </div>
      {open !== null && <ReelViewer reels={reels} index={open} setIndex={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}
