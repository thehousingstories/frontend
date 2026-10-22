import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, House, Instagram, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../auth.jsx';

export function Brand({ sub = 'FIND A PLACE TO BELONG' }) {
  return (
    <Link to="/" className="brand">
      <span className="brand-mark"><House size={20} /></span>
      <span>THE HOUSING <b>STORIES</b><small>{sub}</small></span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { customer, openAuth, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <Brand />
      <button className="mobile-menu icon-btn" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? 'nav-links open' : 'nav-links'}>
        <Link to="/properties" onClick={() => setOpen(false)}>All properties</Link>
        <Link to="/#how" onClick={() => setOpen(false)}>Visit plan</Link>
        <Link to="/#story" onClick={() => setOpen(false)}>Our story</Link>
        <Link to="/#testimonials" onClick={() => setOpen(false)}>Stories</Link>
        {customer ? (
          <>
            <Link className="nav-account" to="/account" onClick={() => setOpen(false)}><span className="avatar">{customer.name?.[0]?.toUpperCase() || 'U'}</span>My account</Link>
            <button className="nav-logout" onClick={() => { logout(); setOpen(false); }}><LogOut size={16} /> Log out</button>
          </>
        ) : (
          <button className="nav-login" onClick={() => { setOpen(false); openAuth({ mode: 'login' }); }}>Log in / Sign up</button>
        )}
        <Link className="nav-cta" to="/#contact" onClick={() => setOpen(false)}>Talk to us <ArrowUpRight size={16} /></Link>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <Brand />
      <span className="footer-tag">Thoughtfully finding home, one story at a time.</span>
      <div className="footer-links">
        <a href="https://instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17} /></a>
        <a href="mailto:hello@thehousingstories.in">Contact</a>
        <Link to="/admin">Admin</Link>
      </div>
      <small className="copyright">© {new Date().getFullYear()} The Housing Stories</small>
    </footer>
  );
}

/* Scrolls to #hash targets after route changes and resets scroll on new pages */
export function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}
