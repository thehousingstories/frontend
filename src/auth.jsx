import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ArrowRight, Loader2, Mail, Phone, ShieldCheck, User, X } from 'lucide-react';
import { api, clearCustomerToken, getCustomerToken, setCustomerToken } from './api';
import { useToast } from './hooks.jsx';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [ready, setReady] = useState(!getCustomerToken());
  const [modal, setModal] = useState(null); // { mode, onSuccess }

  const refresh = useCallback(async () => {
    if (!getCustomerToken()) { setCustomer(null); setReady(true); return null; }
    try {
      const d = await api('/account/me', { as: 'customer' });
      setCustomer(d.customer); setReady(true); return d.customer;
    } catch { setCustomer(null); setReady(true); return null; }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const out = () => setCustomer(null);
    window.addEventListener('ths-customer-logout', out);
    return () => window.removeEventListener('ths-customer-logout', out);
  }, []);

  const logout = () => { clearCustomerToken(); setCustomer(null); };
  const openAuth = (opts = {}) => setModal({ mode: opts.mode || 'login', onSuccess: opts.onSuccess });
  const onAuthed = (token, c) => {
    setCustomerToken(token); setCustomer(c);
    const cb = modal?.onSuccess; setModal(null); cb?.(c);
  };

  return (
    <AuthCtx.Provider value={{ customer, ready, refresh, logout, openAuth, setCustomer }}>
      {children}
      {modal && <AuthModal initialMode={modal.mode} onClose={() => setModal(null)} onAuthed={onAuthed} />}
    </AuthCtx.Provider>
  );
}

function AuthModal({ initialMode, onClose, onAuthed }) {
  const toast = useToast();
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState('form'); // form | otp
  const [f, setF] = useState({ name: '', email: '', phone: '' });
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [cool, setCool] = useState(0);
  const codeRef = useRef(null);

  useEffect(() => { if (cool > 0) { const t = setTimeout(() => setCool((c) => c - 1), 1000); return () => clearTimeout(t); } }, [cool]);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  useEffect(() => { if (step === 'otp') codeRef.current?.focus(); }, [step]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function sendOtp(e) {
    e?.preventDefault(); setErr(''); setBusy(true);
    try {
      const d = await api('/account/otp/request', { method: 'POST', body: JSON.stringify({ ...f, mode }) });
      setStep('otp'); setCode(''); setCool(d.resendIn || 45);
    } catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  }

  async function verify(e) {
    e?.preventDefault(); if (code.length !== 6 || busy) return;
    setErr(''); setBusy(true);
    try {
      const d = await api('/account/otp/verify', { method: 'POST', body: JSON.stringify({ email: f.email, code }) });
      toast(`Welcome, ${d.customer.name.split(' ')[0]}!`);
      onAuthed(d.token, d.customer);
    } catch (ex) { setErr(ex.message); setBusy(false); }
  }
  // verify automatically as soon as the 6th digit is entered
  useEffect(() => { if (code.length === 6) verify(); }, [code]); // eslint-disable-line

  const switchMode = (m) => { setMode(m); setErr(''); };

  return (
    <div className="modal-back" role="dialog" aria-modal="true" aria-label="Log in or sign up" onClick={onClose}>
      <div className="modal auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>

        {step === 'form' ? (
          <>
            <div className="eyebrow"><span /> {mode === 'signup' ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK'}</div>
            <h2>{mode === 'signup' ? 'Sign up' : 'Log in'}</h2>
            <p className="auth-sub">{mode === 'signup' ? 'Create an account to schedule visits and track your payments.' : 'We’ll email you a 6-digit code. No password needed.'}</p>
            <div className="auth-tabs">
              <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Log in</button>
              <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')}>Sign up</button>
            </div>
            <form onSubmit={sendOtp} className="auth-form">
              {mode === 'signup' && <label>Full name<div className="input-icon"><User size={17} /><input required value={f.name} onChange={set('name')} placeholder="Your name" autoComplete="name" /></div></label>}
              <label>Email address<div className="input-icon"><Mail size={17} /><input required type="email" value={f.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" /></div></label>
              {mode === 'signup' && <label>Mobile number<div className="input-icon"><Phone size={17} /><input required type="tel" inputMode="tel" value={f.phone} onChange={set('phone')} placeholder="+91 98765 43210" autoComplete="tel" /></div></label>}
              {err && <p className="form-error" role="alert">{err}</p>}
              <button className="button button-dark full" disabled={busy}>{busy ? <><Loader2 size={16} className="spin" /> Sending code…</> : <>Send OTP to email <ArrowRight size={16} /></>}</button>
            </form>
          </>
        ) : (
          <>
            <div className="otp-icon"><ShieldCheck size={30} /></div>
            <h2>Check your email</h2>
            <p className="auth-sub">We sent a 6-digit code to<br /><b>{f.email}</b></p>
            <p className="auth-sub">Didn't receive the code? Please check your Spam folder.</p>
            <form onSubmit={verify} className="auth-form">
              <input ref={codeRef} className="otp-input" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="••••••" maxLength={6} aria-label="6-digit code" />
              {err && <p className="form-error" role="alert">{err}</p>}
              <button className="button button-dark full" disabled={busy || code.length !== 6}>{busy ? <><Loader2 size={16} className="spin" /> Verifying…</> : <>Verify & continue <ArrowRight size={16} /></>}</button>
            </form>
            <div className="otp-links">
              <button type="button" disabled={cool > 0 || busy} onClick={sendOtp}>{cool > 0 ? `Resend code in ${cool}s` : 'Resend code'}</button>
              <button type="button" onClick={() => { setStep('form'); setErr(''); setCode(''); }}>Change email</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
