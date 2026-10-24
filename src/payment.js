import { loadRazorpay } from './utils';

// Opens the Razorpay checkout window for an order created by the backend.
export async function openCheckout({ order, customer, description, onSuccess, onDismiss, onFail }) {
  const Razorpay = await loadRazorpay();
  const rzp = new Razorpay({
    key: order.keyId, amount: order.amount, currency: order.currency, order_id: order.orderId,
    name: 'The Housing Stories', description,
    prefill: { name: customer.name, email: customer.email, contact: customer.phone },
    theme: { color: '#0f766e' },
    modal: { ondismiss: () => onDismiss?.() },
    handler: (response) => onSuccess(response),
  });
  rzp.on?.('payment.failed', (r) => onFail?.(r?.error?.description || 'Payment failed. Please try again.'));
  rzp.open();
}
