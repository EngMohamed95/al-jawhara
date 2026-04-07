const IS_PROD = process.env.NODE_ENV === 'production';
const h = { 'Content-Type': 'application/json' };

const req = async (path, opts = {}) => {
  const url = IS_PROD
    ? `/api/?path=${encodeURIComponent(path)}`
    : `http://localhost:3001/${path}`;

  const res = await fetch(url, { headers: h, ...opts });
  if (!res.ok) throw new Error(`API ${res.status}`);
  if (opts.method === 'DELETE') return null;
  return res.json();
};

const api = {
  // Products
  getProducts:    ()       => req('products'),
  createProduct:  (data)   => req('products',      { method: 'POST',   body: JSON.stringify(data) }),
  updateProduct:  (id, d)  => req(`products/${id}`,{ method: 'PUT',    body: JSON.stringify(d) }),
  deleteProduct:  (id)     => req(`products/${id}`,{ method: 'DELETE' }),

  // Orders
  getOrders:    ()      => req('orders'),
  createOrder:  (data)  => req('orders',       { method: 'POST', body: JSON.stringify(data) }),
  updateOrder:  (id, d) => req(`orders/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
  deleteOrder:  (id)    => req(`orders/${id}`, { method: 'DELETE' }),

  // Users
  getUsers:    ()      => req('users'),
  createUser:  (data)  => req('users',        { method: 'POST',   body: JSON.stringify(data) }),
  updateUser:  (id, d) => req(`users/${id}`,  { method: 'PUT',    body: JSON.stringify(d) }),
  deleteUser:  (id)    => req(`users/${id}`,  { method: 'DELETE' }),
  findUser:    (uname) => req(`users?username=${encodeURIComponent(uname)}`),

  // Site Content
  getSiteContent:    ()     => req('siteContent/1'),
  updateSiteContent: (data) => req('siteContent/1', { method: 'PUT', body: JSON.stringify(data) }),

  // Categories
  getCategories:    ()       => req('categories'),
  createCategory:   (data)   => req('categories',       { method: 'POST',   body: JSON.stringify(data) }),
  updateCategory:   (id, d)  => req(`categories/${id}`, { method: 'PUT',    body: JSON.stringify(d) }),
  deleteCategory:   (id)     => req(`categories/${id}`, { method: 'DELETE' }),

  // Coupons
  getCoupons:    ()       => req('coupons'),
  createCoupon:  (data)   => req('coupons',       { method: 'POST',   body: JSON.stringify(data) }),
  updateCoupon:  (id, d)  => req(`coupons/${id}`, { method: 'PUT',    body: JSON.stringify(d) }),
  deleteCoupon:  (id)     => req(`coupons/${id}`, { method: 'DELETE' }),

  // Orders status update
  updateOrderStatus: (id, status) => req(`orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

export default api;
