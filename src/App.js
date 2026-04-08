import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar  from './components/Navbar';
import Footer  from './components/Footer';
import Home     from './pages/Home';
import About    from './pages/About';
import Products from './pages/Products';
import Clients  from './pages/Clients';
import Contact  from './pages/Contact';
import Dashboard    from './pages/Dashboard';
import Login        from './pages/Login';
import Cart         from './pages/Cart';
import Checkout     from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import ProductDetail from './pages/ProductDetail';
import NotFound    from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const { auth } = useApp();
  return auth ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="app">
      {!isLogin && <Navbar />}
      <main>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/about"     element={<About />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products"  element={<Products />} />
          <Route path="/clients"   element={<Clients />} />
          <Route path="/contact"   element={<Contact />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/cart"          element={<Cart />} />
          <Route path="/checkout"      element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*"              element={<NotFound />} />
        </Routes>
      </main>
      {!isLogin && <Footer />}
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AppProvider>
          <Router>
            <AppContent />
          </Router>
        </AppProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
