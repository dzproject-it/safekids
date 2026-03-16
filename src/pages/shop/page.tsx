import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, createOrder, type Product, type QRProfileData } from '../../services/api';
import ShopFilters from './components/ShopFilters';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import * as S from '../../styles/shop.page.styles';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
}

const getCartKey = (id: number, color?: string, size?: string) =>
  `${id}-${color ?? ''}-${size ?? ''}`;

const wristSizeGuide = [
  { size: 'XS', wrist: '12,0 – 13,5 cm', bracelet: '14 – 15 cm' },
  { size: 'S', wrist: '13,5 – 15,0 cm', bracelet: '15 – 16,5 cm' },
  { size: 'M', wrist: '15,0 – 16,5 cm', bracelet: '16,5 – 18 cm' },
  { size: 'L', wrist: '16,5 – 18,0 cm', bracelet: '18 – 19,5 cm' },
  { size: 'XL', wrist: '18,0 – 19,5 cm', bracelet: '19,5 – 21 cm' },
  { size: 'XXL', wrist: '19,5 – 21,0 cm', bracelet: '21 – 22,5 cm' },
];

const ShopPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSort, setActiveSort] = useState('popularity');
  const [activeSize, setActiveSize] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('qrkids-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setAllProducts)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('qrkids-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (activeSize !== 'all') {
      result = result.filter((p) => p.sizes.includes(activeSize));
    }

    switch (activeSort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'new':
        result = result.filter((p) => p.badge === 'NOUVEAU').concat(result.filter((p) => p.badge !== 'NOUVEAU'));
        break;
      default:
        result.sort((a, b) => b.popularity - a.popularity);
    }

    return result;
  }, [allProducts, activeCategory, activeSort, activeSize]);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product: { id: number; name: string; price: number; image: string; colors: string[]; sizes: string[] }) => {
    const color = product.colors[0];
    const size = product.sizes[0];
    const cartKey = getCartKey(product.id, color, size);
    setCartItems((prev) => {
      const existing = prev.find((item) => getCartKey(item.id, item.color, item.size) === cartKey);
      if (existing) {
        return prev.map((item) =>
          getCartKey(item.id, item.color, item.size) === cartKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1, color, size }];
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartKey: string, qty: number) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((item) => getCartKey(item.id, item.color, item.size) !== cartKey));
    } else {
      setCartItems((prev) =>
        prev.map((item) => getCartKey(item.id, item.color, item.size) === cartKey ? { ...item, quantity: qty } : item)
      );
    }
  };

  const handleRemove = (cartKey: string) => {
    setCartItems((prev) => prev.filter((item) => getCartKey(item.id, item.color, item.size) !== cartKey));
  };

  const handleCheckout = async (qrProfile: QRProfileData) => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    setCheckoutSuccess(null);
    try {
      const order = await createOrder({
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          unitPrice: item.price,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        })),
        totalAmount: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        qrProfile,
      });
      setCheckoutSuccess(order.id);
      setCartItems([]);
      localStorage.removeItem('qrkids-cart');
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Erreur lors de la commande');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={S.loadingPage}>
        <div className={S.loadingInner}>
          <div className={S.loadingSpinner}></div>
          <p className={S.loadingText}>Chargement des produits…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={S.errorPage}>
        <div className={S.errorInner}>
          <i className="ri-error-warning-line text-4xl text-red-400"></i>
          <p className="text-dark font-semibold">Impossible de charger les produits</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={S.page}>
      {/* Top Navigation */}
      <nav className={S.nav}>
        <div className={S.navContainer}>
          <Link to="/" className={S.logo}>
            <div className={S.logoIcon}><i className="ri-qr-code-line text-white text-lg"></i></div>
            <span className={S.logoText}>QR Kids</span>
          </Link>
          <div className={S.navLinks}>
            <Link to="/" className={S.navLink}>Accueil</Link>
            <Link to="/#products" className={S.navLink}>Produits</Link>
            <Link to="/#features" className={S.navLink}>Fonctionnalités</Link>
            <Link to="/#testimonials" className={S.navLink}>Avis</Link>
            <span className="text-primary font-semibold">Boutique</span>
          </div>
          <button onClick={() => setIsCartOpen(true)} className={S.cartBtn}>
            <div className={S.cartIconBox}><i className="ri-shopping-bag-line text-sm"></i></div>
            Panier
            {totalCartItems > 0 && (
              <span className={S.cartBadge}>{totalCartItems}</span>
            )}
          </button>
        </div>
      </nav>

      {/* Page Header */}
      <div className={S.pageHeader}>
        <div className={S.pageHeaderInner}>
          <div className={S.breadcrumb}>
            <Link to="/" className={S.breadcrumbLink}>Accueil</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-dark font-medium">Boutique</span>
          </div>
          <div className={S.headerRow}>
            <div>
              <h1 className={S.headerTitle}>Notre Boutique</h1>
              <p className={S.headerSubtitle}>Découvrez tous nos bracelets QR Code pour enfants</p>
            </div>
            <div className={S.headerMeta}>
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-truck-line text-gray-400"></i></div>
              <span>Livraison gratuite dès 30 €</span>
              <span className="text-gray-200">|</span>
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-shield-check-line text-gray-400"></i></div>
              <span>Retours sous 30 jours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ShopFilters
        activeCategory={activeCategory}
        activeSort={activeSort}
        activeSize={activeSize}
        priceRange={priceRange}
        onCategoryChange={setActiveCategory}
        onSortChange={setActiveSort}
        onSizeChange={setActiveSize}
        onPriceChange={setPriceRange}
        totalResults={filteredProducts.length}
      />

      {/* Guide de tailles poignet */}
      <section className={S.wristGuideSection}>
        <div className={S.wristGuideHeader}>
          <i className="ri-ruler-line text-pink-500"></i>
          <h2 className={S.wristGuideTitle}>Guide des tailles de poignet</h2>
        </div>
        <div className={S.wristGuideTableWrap}>
          <table className={S.wristGuideTable}>
            <thead>
              <tr>
                <th className={S.wristGuideHeadCell}>Taille</th>
                <th className={S.wristGuideHeadCell}>Tour de poignet</th>
                <th className={S.wristGuideHeadCell}>Bracelet conseillé</th>
              </tr>
            </thead>
            <tbody>
              {wristSizeGuide.map((row) => (
                <tr key={row.size} className={S.wristGuideRow}>
                  <td className={S.wristGuideCellStrong}>{row.size}</td>
                  <td className={S.wristGuideCell}>{row.wrist}</td>
                  <td className={S.wristGuideCell}>{row.bracelet}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={S.wristGuideHint}>
          Mesurez juste au-dessus de l’os du poignet, sans serrer. Si vous hésitez entre deux tailles, prenez la plus grande.
        </p>
      </section>

      {/* Products Grid */}
      <div className={S.productsArea}>
        {filteredProducts.length === 0 ? (
          <div className={S.emptyState}>
            <div className={S.emptyIconBox}>
              <i className="ri-search-line text-3xl text-gray-300"></i>
            </div>
            <p className={S.emptyTitle}>Aucun produit trouvé</p>
            <p className={S.emptySubtitle}>Essayez de modifier vos filtres</p>
            <button
              onClick={() => { setActiveCategory('all'); setActiveSize('all'); }}
              className={S.resetBtn}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className={S.grid} data-product-shop>
            {filteredProducts.map((product) => (
              <div key={product.id} className="relative">
                {addedId === product.id && (
                  <div className={S.addedOverlay}>
                    <div className={S.addedInner}>
                      <div className={S.addedCheck}>
                        <i className="ri-check-line text-white text-lg"></i>
                      </div>
                      <span className={S.addedText}>Ajouté !</span>
                    </div>
                  </div>
                )}
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
        onCheckout={handleCheckout}
        checkoutLoading={checkoutLoading}
        checkoutError={checkoutError}
        checkoutSuccess={checkoutSuccess}
      />
    </div>
  );
};

export default ShopPage;
