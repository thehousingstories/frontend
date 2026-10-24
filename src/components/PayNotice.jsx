import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

// Shown next to every payment button
export default function PayNotice({ className = '' }) {
  return (
    <p className={`pay-notice ${className}`}>
      <AlertCircle size={15} />
      <span><b>All payments are non-refundable.</b> By paying you agree to our <Link to="/terms">Terms</Link> and <Link to="/refund-policy">Refund Policy</Link>.</span>
    </p>
  );
}
