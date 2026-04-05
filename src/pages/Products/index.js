import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Seo from '../../components/Seo';
import './index.css';

const categories = [
  { id: 'all',     label: 'الكل',            icon: 'fa-border-all' },
  { id: 'facial',  label: 'مناديل الوجه',    icon: 'fa-face-smile' },
  { id: 'rolls',   label: 'الرولات',          icon: 'fa-scroll' },
  { id: 'pocket',  label: 'محارم الجيب',      icon: 'fa-briefcase' },
  { id: 'towels',  label: 'المناشف',          icon: 'fa-hand-sparkles' },
  { id: 'napkins', label: 'مناديل المائدة',   icon: 'fa-utensils' },
  { id: 'family',  label: 'عروض العائلة',     icon: 'fa-box-open' },
];

const Products = () => {
  const { products, loading, error } = useApp();
  const [activeCat, setActiveCat]   = useState('all');
  const [cart, setCart]             = useState([]);
  const [cartOpen, setCartOpen]     = useState(false);
  const [addedId, setAddedId]       = useState(null);

  const filtered = activeCat === 'all'
    ? products
    : products.filter(p => p.category === activeCat);

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      return ex
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }];
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const total    = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <Seo
        title="المنتجات"
        description="تشكيلة متكاملة من المناديل الورقية — مناديل وجه، رولات مطبخ، محارم جيب، مناشف ورق، مناديل مائدة."
        keywords="منتجات الجوهرة، مناديل وجه، رولات مطبخ، محارم جيب، مناشف ورق، tissue paper"
      />

      <header className="page-header">
        <div className="container">
          <div className="page-header-content">
            <div className="page-header-icon" aria-hidden="true"><i className="fas fa-box-open"></i></div>
            <h1>منتجاتنا</h1>
            <p>تشكيلة متكاملة من المناديل الورقية عالية الجودة</p>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">

          {loading && (
            <div className="products-loading" role="status" aria-live="polite">
              <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
              <span>جاري تحميل المنتجات من قاعدة البيانات...</span>
            </div>
          )}

          {error && !loading && (
            <div className="products-error" role="alert">
              <i className="fas fa-circle-exclamation" aria-hidden="true"></i>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="filters" role="group" aria-label="تصفية حسب الفئة">
                {categories.map(c => (
                  <button
                    key={c.id}
                    className={`filter-btn${activeCat === c.id ? ' active' : ''}`}
                    onClick={() => setActiveCat(c.id)}
                    aria-pressed={activeCat === c.id}
                  >
                    <i className={`fas ${c.icon}`} aria-hidden="true" style={{ marginLeft: '6px' }}></i>
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="products-grid" role="list" aria-label="قائمة المنتجات">
                {filtered.length === 0 ? (
                  <div className="no-products">
                    <i className="fas fa-box-open" aria-hidden="true"></i>
                    <p>لا توجد منتجات في هذه الفئة</p>
                  </div>
                ) : filtered.map(p => (
                  <article key={p.id} className="product-card" role="listitem">
                    <div className="product-card-img" aria-hidden="true">
                      {p.badge && <span className="product-badge">{p.badge}</span>}
                      {p.icon}
                    </div>
                    <div className="product-card-body">
                      <h2 className="product-name">{p.name}</h2>
                      <p className="product-description">{p.desc}</p>
                      <div className="product-specs" aria-label="مواصفات المنتج">
                        {p.specs?.map((s, i) => <span key={i} className="product-spec">{s}</span>)}
                      </div>
                      <div className="product-footer">
                        <div className="product-price">
                          {Number(p.price).toFixed(3)} <span>د.ك</span>
                        </div>
                        <button
                          className={`btn btn-sm ${addedId === p.id ? 'btn-green' : 'btn-primary'}`}
                          onClick={() => addToCart(p)}
                          aria-label={`إضافة ${p.name} إلى السلة`}
                        >
                          {addedId === p.id
                            ? <><i className="fas fa-check" aria-hidden="true"></i> تمت الإضافة</>
                            : <><i className="fas fa-cart-plus" aria-hidden="true"></i> أضف</>}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Cart float */}
      {cart.length > 0 && (
        <button className="cart-float-btn" onClick={() => setCartOpen(!cartOpen)} aria-label={`فتح السلة — ${totalQty} منتج`}>
          <i className="fas fa-shopping-cart" aria-hidden="true"></i>
          السلة
          <span className="cart-count" aria-hidden="true">{totalQty}</span>
        </button>
      )}

      {/* Cart sidebar */}
      <aside className={`cart-sidebar${cartOpen ? ' open' : ''}`} aria-label="سلة الطلبات" aria-hidden={!cartOpen}>
        <div className="cart-header">
          <span><i className="fas fa-shopping-cart" aria-hidden="true" style={{ marginLeft: '8px' }}></i>سلة الطلبات</span>
          <button className="cart-close-btn" onClick={() => setCartOpen(false)} aria-label="إغلاق السلة">
            <i className="fas fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <i className="fas fa-cart-shopping cart-empty-icon" aria-hidden="true"></i>
              السلة فارغة
            </div>
          ) : cart.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-icon" aria-hidden="true">{item.icon}</div>
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">{(item.price * item.qty).toFixed(3)} د.ك × {item.qty}</div>
              </div>
              <button className="cart-item-remove" onClick={() => removeFromCart(item.id)} aria-label={`حذف ${item.name}`}>
                <i className="fas fa-trash-can" aria-hidden="true"></i>
              </button>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="cart-total">
            <div className="cart-total-row">
              <span>الإجمالي:</span>
              <span className="cart-total-value">{total.toFixed(3)} د.ك</span>
            </div>
            <button className="btn btn-green cart-order-btn">
              <i className="fas fa-paper-plane" aria-hidden="true"></i>إرسال الطلب
            </button>
            <button className="cart-clear-btn" onClick={() => setCart([])}>مسح السلة</button>
          </div>
        )}
      </aside>

      {cartOpen && <div className="cart-overlay" onClick={() => setCartOpen(false)} aria-hidden="true" />}
    </>
  );
};

export default Products;
