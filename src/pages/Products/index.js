import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  const { products, loading, error, addToCart, cartTotalQty } = useApp();
  const [activeCat, setActiveCat] = useState('all');
  const [addedId,   setAddedId]   = useState(null);

  const filtered = activeCat === 'all'
    ? products
    : products.filter(p => p.category === activeCat);

  const handleAdd = (product) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <>
      <Seo
        title="المنتجات"
        description="تشكيلة متكاملة من المناديل الورقية — مناديل وجه، رولات مطبخ، محارم جيب، مناشف ورق، مناديل مائدة."
        keywords="منتجات الجوهرة، مناديل وجه، رولات مطبخ، محارم جيب، مناشف ورق"
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
            <div className="products-loading" role="status">
              <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
              <span>جاري تحميل المنتجات...</span>
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

              <div className="products-grid" role="list">
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
                      <div className="product-specs">
                        {p.specs?.map((s, i) => <span key={i} className="product-spec">{s}</span>)}
                      </div>
                      <div className="product-footer">
                        <div className="product-price">
                          {Number(p.price).toFixed(3)} <span>د.ك</span>
                        </div>
                        <button
                          className={`btn btn-sm ${addedId === p.id ? 'btn-green' : 'btn-primary'}`}
                          onClick={() => handleAdd(p)}
                          aria-label={`إضافة ${p.name} إلى السلة`}
                        >
                          {addedId === p.id
                            ? <><i className="fas fa-check" aria-hidden="true"></i> تمت الإضافة</>
                            : <><i className="fas fa-cart-plus" aria-hidden="true"></i> أضف</>
                          }
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

      {/* Cart float button */}
      {cartTotalQty > 0 && (
        <Link to="/cart" className="cart-float-btn" aria-label={`السلة — ${cartTotalQty} منتج`}>
          <i className="fas fa-shopping-cart" aria-hidden="true"></i>
          السلة
          <span className="cart-count" aria-hidden="true">{cartTotalQty}</span>
        </Link>
      )}
    </>
  );
};

export default Products;
