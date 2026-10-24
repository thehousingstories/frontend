import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, Download } from 'lucide-react';
import { api } from '../api';
import { Footer, Header } from '../components/Layout';
import { makeReceiptBlob, money } from '../utils';

// Public receipt page, opened from the link inside the customer's WhatsApp message
export default function Receipt() {
  const { token } = useParams();
  const [state, setState] = useState('loading'); // loading | ready | missing
  const [p, setP] = useState(null);
  const [img, setImg] = useState('');

  useEffect(() => {
    api(`/quick/receipt/${token}`)
      .then(async (d) => {
        setP(d.payment);
        const blob = await makeReceiptBlob(d.payment);
        setImg(URL.createObjectURL(blob));
        setState('ready');
      })
      .catch(() => setState('missing'));
  }, [token]);

  return (
    <>
      <Header />
      <main className="quick-page">
        <div className="quick-card">
          {state === 'loading' && <div className="sk" style={{ height: 320, borderRadius: 16 }} />}
          {state === 'missing' && (<><h1>Receipt not found</h1><p className="quick-sub">This receipt link is invalid.</p><Link to="/" className="button button-dark">Back to home</Link></>)}
          {state === 'ready' && (
            <div className="quick-done">
              <div className="eyebrow" style={{ justifyContent: 'center' }}><span /> VERIFIED PAYMENT</div>
              <h1>Payment receipt</h1>
              <p className="quick-sub"><BadgeCheck size={16} style={{ verticalAlign: '-3px', color: 'var(--teal)' }} /> Confirmed in The Housing Stories payment records.</p>
              <img className="receipt-img" src={img} alt="Payment receipt" />
              <dl className="quick-summary">
                <div><dt>Name</dt><dd>{p.name}</dd></div>
                <div><dt>Mobile</dt><dd>{p.phone}</dd></div>
                <div><dt>Amount</dt><dd>{money(p.amount)}</dd></div>
                <div><dt>Payment ID</dt><dd className="mono">{p.paymentId}</dd></div>
                <div><dt>Paid on</dt><dd>{new Date(p.paidAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</dd></div>
              </dl>
              <a className="button button-outline full" href={img} download={`receipt-${p.ref}.png`}><Download size={16} /> Download receipt image</a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
