import { useState, useMemo } from 'react';
import './ProductImageSlider.css'; // Let's put styles in a dedicated stylesheet or index.css, wait! Placing them in index.css is safer, or we can make a dedicated CSS. Dedicated is cleaner!

const ProductImageSlider = ({ images = [], alt = 'Product Image' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const uniqueImages = useMemo(() => {
    const list = [];
    images.forEach(img => {
      if (img && typeof img === 'string' && !list.includes(img)) {
        list.push(img);
      }
    });
    return list;
  }, [images]);

  if (uniqueImages.length === 0) {
    return (
      <div className="prod-slider-fallback">
        <i className="fas fa-box-open"></i>
      </div>
    );
  }

  if (uniqueImages.length === 1) {
    return (
      <img
        src={uniqueImages[0]}
        alt={alt}
        className="prod-slider-single-img"
        loading="lazy"
      />
    );
  }

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? uniqueImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(prev => (prev === uniqueImages.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  };

  return (
    <div className="prod-slider-container">
      {/* Slide track */}
      <div className="prod-slider-track">
        {uniqueImages.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`${alt} - ${idx + 1}`}
            className={`prod-slider-img ${idx === currentIndex ? 'active' : ''}`}
            loading="lazy"
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button className="prod-slider-btn prev" onClick={handlePrev} aria-label="Previous image">
        <i className="fas fa-chevron-right"></i>
      </button>
      <button className="prod-slider-btn next" onClick={handleNext} aria-label="Next image">
        <i className="fas fa-chevron-left"></i>
      </button>

      {/* Dots Indicator */}
      <div className="prod-slider-dots">
        {uniqueImages.map((_, idx) => (
          <button
            key={idx}
            className={`prod-slider-dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={(e) => handleDotClick(e, idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductImageSlider;
