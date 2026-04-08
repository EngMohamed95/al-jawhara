import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AppContext = createContext(null);

const getStoredAuth = () => {
  try { return JSON.parse(localStorage.getItem('jawhara_auth')); }
  catch { return null; }
};

const getStoredSiteContent = () => {
  try { return JSON.parse(localStorage.getItem('jawhara_site_content') || 'null'); }
  catch { return null; }
};

export const AppProvider = ({ children }) => {
  const [products, setProducts]       = useState([]);
  const [orders, setOrders]           = useState([]);
  const [users, setUsers]             = useState([]);
  const [coupons, setCoupons]         = useState([]);
  const [categories, setCategories]   = useState([]);
  const [siteContent, setSiteContent] = useState(getStoredSiteContent);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [auth, setAuth]               = useState(getStoredAuth);

  /* ── Cart — persisted per user in localStorage ── */
  const getCartKey  = (a) => `jawhara_cart_${a?.id || 'guest'}`;
  const getStoredCart = () => {
    try { return JSON.parse(localStorage.getItem(getCartKey(getStoredAuth()))) || []; }
    catch { return []; }
  };
  const [cart, setCartState] = useState(getStoredCart);

  const setCart = (updater) =>
    setCartState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem(getCartKey(getStoredAuth()), JSON.stringify(next)); } catch {}
      return next;
    });

  /* ── Fetch all data ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, ords, usrs, content, coups, cats] = await Promise.all([
        api.getProducts(),
        api.getOrders(),
        api.getUsers(),
        api.getSiteContent(),
        api.getCoupons(),
        api.getCategories(),
      ]);
      setProducts(prods);
      setOrders(ords);
      setUsers(usrs);
      setSiteContent(content);
      try { localStorage.setItem('jawhara_site_content', JSON.stringify(content)); } catch {}
      setCoupons(coups);
      setCategories(cats);
    } catch {
      setError('تعذر الاتصال بالخادم. تأكد من تشغيل قاعدة البيانات (npm start).');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Auth ── */
  const login = async (username, password) => {
    const matches = await api.findUser(username);
    const user = matches.find(u => u.username === username && u.password === password);
    if (!user) throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
    const { password: _, ...safe } = user;
    setAuth(safe);
    localStorage.setItem('jawhara_auth', JSON.stringify(safe));
    return safe;
  };

  const logout = () => {
    localStorage.removeItem(getCartKey(auth));
    setAuth(null);
    localStorage.removeItem('jawhara_auth');
    setCart([]);
  };

  /* ── Register new customer ── */
  const registerCustomer = async ({ name, username, password, phone, email }) => {
    const allUsers = await api.getUsers();
    if (allUsers.find(u => u.username === username))
      throw new Error('اسم المستخدم مستخدم بالفعل');
    if (email && allUsers.find(u => u.email === email))
      throw new Error('البريد الإلكتروني مستخدم بالفعل');

    const newUser = await api.createUser({
      name, username, password,
      phone: phone || '', email: email || '',
      role: 'customer',
      createdAt: new Date().toISOString(),
    });
    setUsers(prev => [...prev, newUser]);

    const { password: _, ...safe } = newUser;
    setAuth(safe);
    localStorage.setItem('jawhara_auth', JSON.stringify(safe));
    return safe;
  };

  /* ── Social login (Google / Facebook) ── */
  const socialLogin = async ({ name, email, uid, provider }) => {
    /* check if user already exists by uid or email */
    const allUsers = await api.getUsers();
    let user = allUsers.find(u => u.uid === uid) || allUsers.find(u => u.email && u.email === email);

    if (!user) {
      /* auto-create customer account */
      const username = (email ? email.split('@')[0] : uid).replace(/[^a-z0-9_]/gi, '_').toLowerCase();
      const base     = username;
      let   final    = base;
      let   i        = 1;
      while (allUsers.find(u => u.username === final)) { final = `${base}${i++}`; }

      user = await api.createUser({
        name,
        username: final,
        password: uid.slice(-8),
        email:    email || '',
        phone:    '',
        role:     'customer',
        uid,
        provider,
        createdAt: new Date().toISOString(),
      });
      setUsers(prev => [...prev, user]);
    }

    const { password: _, ...safe } = user;
    setAuth(safe);
    localStorage.setItem('jawhara_auth', JSON.stringify(safe));
    return safe;
  };

  /* ── Products ── */
  const addProduct    = async (d)     => { const n = await api.createProduct(d);      setProducts(p => [...p, n]); return n; };
  const updateProduct = async (id, d) => { const u = await api.updateProduct(id, d);  setProducts(p => p.map(x => x.id === id ? u : x)); return u; };
  const deleteProduct = async (id)    => { await api.deleteProduct(id);                setProducts(p => p.filter(x => x.id !== id)); };

  /* ── Users ── */
  const addUser    = async (d)     => { const n = await api.createUser(d);      setUsers(u => [...u, n]); return n; };
  const updateUser = async (id, d) => { const u = await api.updateUser(id, d);  setUsers(p => p.map(x => x.id === id ? u : x)); return u; };
  const deleteUser = async (id)    => { await api.deleteUser(id);                setUsers(p => p.filter(x => x.id !== id)); };

  /* ── Coupons ── */
  const addCoupon    = async (d)     => { const n = await api.createCoupon(d);      setCoupons(p => [...p, n]); return n; };
  const updateCoupon = async (id, d) => { const u = await api.updateCoupon(id, d);  setCoupons(p => p.map(x => x.id === id ? u : x)); return u; };
  const deleteCoupon = async (id)    => { await api.deleteCoupon(id);                setCoupons(p => p.filter(x => x.id !== id)); };

  /* ── Categories ── */
  const addCategory    = async (d)     => { const n = await api.createCategory(d);      setCategories(p => [...p, n]); return n; };
  const updateCategory = async (id, d) => { const u = await api.updateCategory(id, d);  setCategories(p => p.map(x => x.id === id ? u : x)); return u; };
  const deleteCategory = async (id)    => { await api.deleteCategory(id);                setCategories(p => p.filter(x => x.id !== id)); };

  /* ── Orders ── */
  const updateOrderStatus = async (id, status) => {
    const ord = orders.find(o => o.id === id);
    if (!ord) return;
    const updated = await api.updateOrder(id, { ...ord, status });
    setOrders(p => p.map(x => x.id === id ? updated : x));
    return updated;
  };

  /* ── Site Content ── */
  const saveSiteContent = async (data) => {
    const updated = await api.updateSiteContent({ id: 1, ...data });
    setSiteContent(updated);
    try { localStorage.setItem('jawhara_site_content', JSON.stringify(updated)); } catch {}
    return updated;
  };

  /* ── Cart ── */
  const addToCart = (product, qty = 1) => {
    const cartKey = product._cartKey || product.id;
    setCart(prev => {
      const ex = prev.find(i => (i._cartKey || i.id) === cartKey);
      return ex
        ? prev.map(i => (i._cartKey || i.id) === cartKey ? { ...i, qty: i.qty + qty } : i)
        : [...prev, { ...product, _cartKey: cartKey, qty }];
    });
  };

  const removeFromCart = (cartKey) => setCart(prev => prev.filter(i => (i._cartKey || i.id) !== cartKey));

  const updateCartQty = (cartKey, qty) =>
    setCart(prev => qty <= 0
      ? prev.filter(i => (i._cartKey || i.id) !== cartKey)
      : prev.map(i => (i._cartKey || i.id) === cartKey ? { ...i, qty } : i)
    );

  const clearCart = () => setCart([]);

  const cartTotal    = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartTotalQty = cart.reduce((s, i) => s + i.qty, 0);

  /* ── Submit Order ── */
  const submitOrder = async (orderData) => {
    const ref = 'ORD-' + Date.now();
    const order = {
      ref,
      ...orderData,
      items: cart,
      total: cartTotal.toFixed(3),
      status: 'pending',
      date: new Date().toLocaleDateString('ar-EG'),
    };
    const saved = await api.createOrder(order);
    setOrders(prev => [...prev, saved]);

    /* ── Auto-create customer account if new phone ── */
    try {
      const phone = orderData.phone?.replace(/\D/g, '') || '';
      if (phone) {
        const existing = users.find(u => u.phone?.replace(/\D/g, '') === phone);
        if (!existing) {
          const username = 'c_' + phone;
          const newUser = await api.createUser({
            name:     orderData.client || '',
            username,
            password: phone.slice(-4),     // كلمة المرور: آخر 4 أرقام
            phone:    orderData.phone,
            email:    orderData.email || '',
            role:     'customer',
            governorate: orderData.governorate || '',
            createdAt: new Date().toISOString(),
          });
          setUsers(prev => [...prev, newUser]);
        }
      }
    } catch {}

    clearCart();
    return saved;
  };

  return (
    <AppContext.Provider value={{
      products, orders, users, coupons, categories, siteContent, loading, error, auth,
      login, logout, socialLogin, registerCustomer,
      addProduct, updateProduct, deleteProduct,
      addUser, updateUser, deleteUser,
      addCoupon, updateCoupon, deleteCoupon,
      addCategory, updateCategory, deleteCategory,
      updateOrderStatus,
      saveSiteContent,
      cart, addToCart, removeFromCart, updateCartQty, clearCart,
      cartTotal, cartTotalQty,
      submitOrder,
      refresh: fetchAll,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
