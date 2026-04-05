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
  const [siteContent, setSiteContent] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [auth, setAuth]               = useState(getStoredAuth);

  /* ── Fetch all data ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, ords, usrs, content] = await Promise.all([
        api.getProducts(),
        api.getOrders(),
        api.getUsers(),
        api.getSiteContent(),
      ]);
      setProducts(prods);
      setOrders(ords);
      setUsers(usrs);
      setSiteContent(content);
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

  /* ── Site Content ── */
  const saveSiteContent = async (data) => {
    const updated = await api.updateSiteContent({ id: 1, ...data });
    setSiteContent(updated);
    return updated;
  };

  return (
    <AppContext.Provider value={{
      products, orders, users, siteContent, loading, error, auth,
      login, logout,
      addProduct, updateProduct, deleteProduct,
      addUser, updateUser, deleteUser,
      saveSiteContent,
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
