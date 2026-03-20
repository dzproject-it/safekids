import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, type Product } from '../../../services/api';
import * as S from '../../../styles/Products.styles';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
  }, []);

  return (
    <section id="products" className={S.section}>
      <div className={S.container}>
        {/* Header */}
        <div className="mb-16">
          <p className={S.eyebrow}>NOS COLLECTIONS</p>
          <h2 className={S.heading}>
            Bracelets QR Code<br />
            Pour Toute La Famille
          </h2>
        </div>

        {/* Products Grid */}
        <div className={S.grid} data-product-shop>
          {products.map((product, index) => (
            <Link key={product.id} to={`/product/${product.id}`} className={S.productLink}>
              {/* Image Container */}
              <div className={S.imgContainer(S.categoryBg(product.category))}>
                <img src={product.image} alt={product.name} className={S.productImg} />
                {product.oldPrice && <div className={S.promoBadge}>PROMO</div>}
              </div>

              {/* Product Info */}
              <div className={S.infoWrapper}>
                <h3 className={S.productName}>{product.name}</h3>
                <div className={S.priceRow}>
                  <span className={S.price}>{product.price.toFixed(2)} €</span>
                  {product.oldPrice && (
                    <span className={S.oldPrice}>{product.oldPrice.toFixed(2)} €</span>
                  )}
                </div>

                {/* Action Button */}
                {index === 0 ? (
                  <div className={S.primaryBtn}>PERSONNALISER</div>
                ) : (
                  <div className={S.secondaryBtn}>VOIR DÉTAILS</div>
                )}

                <p className={S.deliveryNote}>Livraison gratuite</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
