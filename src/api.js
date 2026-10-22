const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Admin and customer sessions are stored separately
export const getToken = () => localStorage.getItem('ths_admin_token');
export const clearToken = () => localStorage.removeItem('ths_admin_token');
export const getCustomerToken = () => localStorage.getItem('ths_customer_token');
export const setCustomerToken = (t) => localStorage.setItem('ths_customer_token', t);
export const clearCustomerToken = () => localStorage.removeItem('ths_customer_token');

// api(path, { as: 'customer' }) sends the customer's token; otherwise the admin token (if any) is sent.
export async function api(path, options = {}) {
  const { as, ...opts } = options;
  const isCustomer = as === 'customer';
  const isForm = opts.body instanceof FormData;
  const headers = { ...(isForm ? {} : { 'Content-Type': 'application/json' }), ...(opts.headers || {}) };
  const token = isCustomer ? getCustomerToken() : getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API}${path}`, { ...opts, headers });
  } catch {
    throw new Error('Cannot reach the server. Please check your connection and try again.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token && path !== '/auth/login') {
      if (isCustomer) { clearCustomerToken(); window.dispatchEvent(new Event('ths-customer-logout')); }
      else { clearToken(); window.dispatchEvent(new Event('ths-logout')); }
    }
    const err = new Error(data.message || 'Request failed');
    err.status = response.status;
    throw err;
  }
  return data;
}
export { API };
