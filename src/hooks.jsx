// import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
// import { CheckCircle2, AlertCircle, X } from 'lucide-react';

// /* Scroll-reveal wrapper: fades/slides content in when it enters the viewport */
// export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
//   const ref = useRef(null);
//   const [shown, setShown] = useState(false);
//   useEffect(() => {
//     const el = ref.current;
//     if (!el) return;
//     if (!('IntersectionObserver' in window)) { setShown(true); return; }
//     const io = new IntersectionObserver(([entry]) => {
//       if (entry.isIntersecting) { setShown(true); io.disconnect(); }
//     }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
//     io.observe(el);
//     return () => io.disconnect();
//   }, []);
//   return (
//     <Tag ref={ref} className={`reveal ${shown ? 'is-visible' : ''} ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>
//       {children}
//     </Tag>
//   );
// }

// /* Toasts */
// const ToastCtx = createContext(() => {});
// export const useToast = () => useContext(ToastCtx);
// export function ToastProvider({ children }) {
//   const [items, setItems] = useState([]);
//   const push = useCallback((message, type = 'success') => {
//     const id = Math.random().toString(36).slice(2);
//     setItems((x) => [...x, { id, message, type }]);
//     setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 4200);
//   }, []);
//   return (
//     <ToastCtx.Provider value={push}>
//       {children}
//       <div className="toast-stack" aria-live="polite">
//         {items.map((t) => (
//           <div key={t.id} className={`toast ${t.type}`}>
//             {t.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
//             <span>{t.message}</span>
//             <button aria-label="Dismiss" onClick={() => setItems((x) => x.filter((i) => i.id !== t.id))}><X size={14} /></button>
//           </div>
//         ))}
//       </div>
//     </ToastCtx.Provider>
//   );
// }

// export function useProperties(params = '') {
//   const [state, setState] = useState({ items: [], loading: true, error: '' });
//   const [tick, setTick] = useState(0);
//   useEffect(() => {
//     let alive = true;
//     setState((s) => ({ ...s, loading: true, error: '' }));
//     import('./api').then(({ api }) =>
//       api(`/properties?limit=50${params}`)
//         .then((d) => alive && setState({ items: d.items || [], loading: false, error: '' }))
//         .catch((e) => alive && setState({ items: [], loading: false, error: e.message }))
//     );
//     return () => { alive = false; };
//   }, [params, tick]);
//   return { ...state, retry: () => setTick((t) => t + 1) };
// }


import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

/* Scroll-reveal wrapper: fades/slides content in when it enters the viewport */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setShown(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${shown ? 'is-visible' : ''} ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

/* Toasts */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setItems((x) => [...x, { id, message, type }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{t.message}</span>
            <button aria-label="Dismiss" onClick={() => setItems((x) => x.filter((i) => i.id !== t.id))}><X size={14} /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useProperties(params = '') {
  const [state, setState] = useState({ items: [], loading: true, error: '' });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    import('./api').then(({ api }) =>
      api(`/properties?limit=50${params}`)
        .then((d) => alive && setState({ items: d.items || [], loading: false, error: '' }))
        .catch((e) => alive && setState({ items: [], loading: false, error: e.message }))
    );
    return () => { alive = false; };
  }, [params, tick]);
  return { ...state, retry: () => setTick((t) => t + 1) };
}

/* Animated number that counts up when scrolled into view */
export function CountUp({ value = 0, duration = 1600, suffix = '' }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setGo(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!go) return;
    let raf; const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go, value, duration]);
  return <span ref={ref}>{n.toLocaleString('en-IN')}{suffix}</span>;
}