import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AppContext = createContext(null);

const getStoredAuth = () => {
  try { return JSON.parse(localStorage.getItem('jawhara_auth')); }
  catch { return null; }
};

export const AppProvider = ({ children }) => {
  const [products, setProducts]       = useState([]);
  const [orders, setOrders]           = useState([]);
  const [users, setUsers]             = useState([]);
  const [coupons, setCoupons]         = useState([]);
  const [categories, setCategories]   = useState([]);
  const [siteContent, setSiteContent] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [auth, setAuth]               = useState(getStoredAuth);
  const [cart, setCart]               = useState([]);

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
    setAuth(null);
    localStorage.removeItem('jawhara_auth');
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
    return updated;
  };

  /* ── Cart ── */
  const addToCart = (product) =>
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      return ex
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }];
    });

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const updateCartQty = (id, qty) =>
    setCart(prev => qty <= 0
      ? prev.filter(i => i.id !== id)
      : prev.map(i => i.id === id ? { ...i, qty } : i)
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
    clearCart();
    return saved;
  };

  return (
    <AppContext.Provider value={{
      products, orders, users, coupons, categories, siteContent, loading, error, auth,
      login, logout,
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
