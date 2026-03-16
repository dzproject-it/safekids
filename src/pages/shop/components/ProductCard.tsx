import { Link } from 'react-router-dom';
import * as S from '../../../styles/ProductCard.styles';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  badge: string | null;
  image: string;
  colors: string[];
  sizes: string[];
  stock: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const getCategoryBg = S.categoryBg;
const getBadgeColor = S.badgeColor;

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <div className={S.card}>
      {/* Image */}
      <Link to={`/product/${product.id}`} className={S.imgLink}>
        <div className={S.imgContainer(getCategoryBg(product.category))}>
          <img
            src={product.image}
            alt={product.name}
            className={S.img}
          />
          {product.badge && (
            <span className={S.badgeEl(getBadgeColor(product.badge))}>{product.badge}</span>
          )}
          {discount && (
            <span className={S.discountBadge}>-{discount}%</span>
          )}
          {product.stock <= 15 && (
            <div className={S.stockWarning}>
              <div className={S.stockDot}></div>
              <span className={S.stockText}>Plus que {product.stock} en stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className={S.info}>
        <Link to={`/product/${product.id}`}>
          <h3 className={S.nameEl}>{product.name}</h3>
        </Link>

        {/* Colors */}
        <div className={S.colorsRow}>
          {product.colors.slice(0, 3).map((color) => (
            <span key={color} className={S.colorTag}>{color}</span>
          ))}
          {product.colors.length > 3 && (
            <span className="text-xs text-gray-400">+{product.colors.length - 3}</span>
          )}
        </div>

        {/* Price */}
        <div className={S.priceRow}>
          <span className={S.price}>{product.price.toFixed(2)} €</span>
          {product.oldPrice && (
            <span className={S.oldPrice}>{product.oldPrice.toFixed(2)} €</span>
          )}
        </div>

        {/* Add to cart */}
        <button onClick={() => onAddToCart(product)} className={S.addBtn}>
          <div className={S.addBtnIcon}>
            <i className="ri-shopping-bag-line text-sm"></i>
          </div>
          Ajouter au panier
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
