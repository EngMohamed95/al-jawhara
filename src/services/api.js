const IS_PROD = process.env.NODE_ENV === 'production';
const h = { 'Content-Type': 'application/json' };

const req = async (path, opts = {}) => {
  let method = opts.method || 'GET';
  const fetchOpts = { ...opts };


  // Tunnel PUT and DELETE over POST in production to bypass Nginx/Server 405 blocks
  let isTunneled = false;
  if (IS_PROD && (method === 'PUT' || method === 'DELETE')) {
    fetchOpts.method = 'POST';
    isTunneled = true;
  }

  const url = IS_PROD
    ? `/api/index.php?path=${encodeURIComponent(path)}${isTunneled ? `&_method=${method}` : ''}`
    : `http://localhost:3001/${path}`;

  const res = await fetch(url, { headers: h, ...fetchOpts });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${text.slice(0, 300)}`);
  }
  if (opts.method === 'DELETE') return null;
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    throw new Error(`Invalid JSON response from API: ${text.slice(0, 300)}`);
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Failed to parse API JSON: ${text.slice(0, 300)}`);
  }
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

  // Clients
  getClients:    ()       => req('clients'),
  createClient:  (data)   => req('clients',       { method: 'POST',   body: JSON.stringify(data) }),
  updateClient:  (id, d)  => req(`clients/${id}`, { method: 'PUT',    body: JSON.stringify(d) }),
  deleteClient:  (id)     => req(`clients/${id}`, { method: 'DELETE' }),

  // Coupons
  getCoupons:    ()       => req('coupons'),
  createCoupon:  (data)   => req('coupons',       { method: 'POST',   body: JSON.stringify(data) }),
  updateCoupon:  (id, d)  => req(`coupons/${id}`, { method: 'PUT',    body: JSON.stringify(d) }),
  deleteCoupon:  (id)     => req(`coupons/${id}`, { method: 'DELETE' }),

  // Orders status update
  updateOrderStatus: (id, status) => req(`orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Media Library
  getMedia: async () => {
    if (IS_PROD) {
      const res = await fetch('/api/media.php');
      if (!res.ok) throw new Error('Failed to load media');
      return await res.json();
    } else {
      const res = await fetch('http://localhost:3001/media');
      if (!res.ok) return { files: [] };
      const items = await res.json();
      return { files: items };
    }
  },
  deleteMediaFile: async (name, type) => {
    if (IS_PROD) {
      const res = await fetch(`/api/media.php?file=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete file');
      return await res.json();
    } else {
      try {
        const res1 = await fetch('http://localhost:3001/media');
        if (res1.ok) {
          const items = await res1.json();
          const found = items.find(x => x.name === name);
          if (found) {
            await fetch(`http://localhost:3001/media/${found.id}`, { method: 'DELETE' });
          }
        }
      } catch (e) {}
      return { success: true };
    }
  },
};

export default api;
