import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchProduct, fetchProducts, type Product, type QRProfileData } from '../../services/api';
import ProductGallery from './components/ProductGallery';
import QRCustomizer from './components/QRCustomizer';
import CartDrawer from '../shop/components/CartDrawer';
import * as S from '../../styles/product.page.styles';

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

const colorMap: Record<string, string> = {
  // Couleurs de base
  Rose:           'bg-pink-400',
  Violet:         'bg-purple-400',
  Corail:         'bg-orange-400',
  Bleu:           'bg-sky-400',
  Vert:           'bg-green-400',
  Noir:           'bg-gray-900',
  Jaune:          'bg-yellow-400',
  Blanc:          'bg-gray-100 border border-gray-300',
  Gris:           'bg-gray-400',
  Rouge:          'bg-red-500',
  // Variantes
  'Rose Pâle':    'bg-pink-200',
  Doré:           'bg-yellow-300',
  'Bleu Marine':  'bg-blue-900',
  'Vert Forêt':   'bg-green-800',
  'Vert Menthe':  'bg-emerald-300',
  Beige:          'bg-amber-100 border border-amber-200',
  'Arc-en-Ciel':  'bg-gradient-to-r from-pink-400 via-yellow-300 to-sky-400',
  Pastel:         'bg-purple-200',
  Néon:           'bg-lime-400',
  'Bleu Nuit':    'bg-indigo-900',
  'Gris Argent':  'bg-slate-400',
  'Noir Cosmos':  'bg-slate-900',
  'Blanc Crème':  'bg-amber-50 border border-amber-100',
  'Gris Perle':   'bg-slate-300',
  Nude:           'bg-orange-100 border border-orange-200',
  'Rouge Noël':   'bg-red-700',
  Or:             'bg-yellow-400',
  'Vert Sapin':   'bg-green-900',
};

const wristSizeGuide = [
  { size: 'XS', wrist: '12,0 – 13,5 cm', bracelet: '14 – 15 cm' },
  { size: 'S', wrist: '13,5 – 15,0 cm', bracelet: '15 – 16,5 cm' },
  { size: 'M', wrist: '15,0 – 16,5 cm', bracelet: '16,5 – 18 cm' },
  { size: 'L', wrist: '16,5 – 18,0 cm', bracelet: '18 – 19,5 cm' },
  { size: 'XL', wrist: '18,0 – 19,5 cm', bracelet: '19,5 – 21 cm' },
  { size: 'XXL', wrist: '19,5 – 21,0 cm', bracelet: '21 – 22,5 cm' },
];

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('qrkids-cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    const numId = Number(id);
    if (isNaN(numId)) { setNotFound(true); setLoadingProduct(false); return; }
    setLoadingProduct(true);
    fetchProduct(numId)
      .then((p) => {
        setProduct(p);
        setSelectedColor(p.colors[0]);
        setSelectedSize(p.sizes[1] ?? p.sizes[0]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return fetchProducts();
      })
      .then((all) => setOtherProducts(all.filter((p) => p.id !== numId)))
      .catch(() => setNotFound(true))
      .finally(() => setLoadingProduct(false));
  }, [id]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loadingProduct) {
    return (
      <div className={S.loadingPage}>
        <div className={S.loadingSpinner}></div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className={S.notFoundPage}>
        <p className={S.notFoundText}>Produit introuvable</p>
        <Link to="/" className={S.notFoundLink}>
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = () => {
    if (!product) return;
    const cartKey = getCartKey(product.id, selectedColor, selectedSize);
    setCartItems((prev) => {
      const existing = prev.find((item) => getCartKey(item.id, item.color, item.size) === cartKey);
      const updated = existing
        ? prev.map((item) => getCartKey(item.id, item.color, item.size) === cartKey ? { ...item, quantity: item.quantity + quantity } : item)
        : [...prev, { id: product.id, name: product.name, price: product.price, image: product.image, quantity, color: selectedColor, size: selectedSize }];
      localStorage.setItem('qrkids-cart', JSON.stringify(updated));
      return updated;
    });
    setAddedToCart(true);
    setIsCartOpen(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleUpdateQuantity = (cartKey: string, qty: number) => {
    setCartItems((prev) => {
      const updated = qty <= 0
        ? prev.filter((item) => getCartKey(item.id, item.color, item.size) !== cartKey)
        : prev.map((item) => getCartKey(item.id, item.color, item.size) === cartKey ? { ...item, quantity: qty } : item);
      localStorage.setItem('qrkids-cart', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveCart = (cartKey: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => getCartKey(item.id, item.color, item.size) !== cartKey);
      localStorage.setItem('qrkids-cart', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className={S.page}>
      {/* Navbar */}
      <nav className={S.nav(scrolled)}>
        <div className={S.navContainer}>
          <Link to="/" className={S.logoWrapper}>
            <div className={S.logoIcon}>
              <i className="ri-qr-code-line text-white text-xl"></i>
            </div>
            <span className={S.logoText}>QR Kids</span>
          </Link>
          <div className={S.navRight}>
            <Link to="/#products" className={S.navLink}>
              Produits
            </Link>
            <Link to="/#features" className={S.navLink}>
              Fonctionnalités
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className={S.cartBtn}
            >
              <i className="ri-shopping-bag-line"></i>
              Panier
              {totalCartItems > 0 && (
                <span className="bg-pink-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ml-1">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className={S.breadcrumbBar}>
        <nav className={S.breadcrumbInner}>
          <Link to="/" className={S.breadcrumbLink}>Accueil</Link>
          <i className="ri-arrow-right-s-line"></i>
          <Link to="/#products" className={S.breadcrumbLink}>Produits</Link>
          <i className="ri-arrow-right-s-line"></i>
          <span className="text-dark font-medium">{product.name}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className={S.mainContent}>
        <div className={S.productGrid}>
          {/* Left: Gallery */}
          <div>
            <ProductGallery image={product.image} name={product.name} category={product.category} selectedColor={selectedColor} />
          </div>

          {/* Right: Product Info */}
          <div className={S.infoCol}>
            {/* Badge + Title */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={S.categoryBadge(product.category)}>
                  {product.category === 'girl' ? 'Fille' : product.category === 'boy' ? 'Garçon' : 'Unisexe'}
                </span>
                {product.oldPrice && (
                  <span className={S.promoBadge}>Promo</span>
                )}
              </div>
              <h1 className={S.heading}>{product.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <div className={S.starsRow}>
                  {[1,2,3,4,5].map((s) => (
                    <i key={s} className="ri-star-fill text-yellow-400 text-sm"></i>
                  ))}
                </div>
                <span className={S.ratingsText}>4.9 (128 avis)</span>
              </div>
              <div className={S.priceRow}>
                <span className={S.price}>{product.price.toFixed(2)} €</span>
                {product.oldPrice && (
                  <span className={S.oldPrice}>{product.oldPrice.toFixed(2)} €</span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className={S.description}>{product.description}</p>

            {/* Features */}
            <div className={S.featuresGrid}>
              {product.features.map((f, i) => (
                <div key={i} className={S.featureRow}>
                  <div className={S.featureIconBox}>
                    <i className="ri-check-line text-green-500 font-bold"></i>
                  </div>
                  {f}
                </div>
              ))}
            </div>

            {/* Color Selector */}
            <div>
              <p className={S.colorLabel}>
                Couleur : <span className="font-normal text-gray-500">{selectedColor}</span>
              </p>
              <div className={S.colorsRow}>
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    className={S.colorBtn(selectedColor === color, colorMap[color] ?? 'bg-gray-300')}
                  />
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <p className="text-sm font-semibold text-dark mb-3">Taille</p>
              <div className={S.sizeRow}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={S.sizeBtn(selectedSize === size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className={S.sizeHint}>S : 3–5 ans · M : 6–9 ans · L : 10–14 ans</p>
            </div>

            {/* Guide tailles poignet */}
            <div className={S.wristGuideCard}>
              <button
                onClick={() => setShowSizeGuide((v) => !v)}
                className="flex items-center gap-2 w-full text-left"
              >
                <i className="ri-ruler-line text-pink-500"></i>
                <h3 className={S.wristGuideTitle}>Guide des tailles de poignet</h3>
                <i className={`ml-auto text-gray-400 transition-transform duration-200 ${showSizeGuide ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}`}></i>
              </button>
              {showSizeGuide && <div className={S.wristGuideTableWrap}>
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
              }
              {showSizeGuide && <p className={S.wristGuideHint}>
                Mesurez juste au-dessus de l’os du poignet, sans serrer. Entre deux tailles, choisissez la plus grande pour plus de confort.
              </p>}
            </div>

            {/* Quantity + Add to Cart */}
            <div className={S.addToCartRow}>
              <div className={S.qtyWrapper}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={S.qtyBtn}
                >
                  <i className="ri-subtract-line"></i>
                </button>
                <span className={S.qtyValue}>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className={S.qtyBtn}
                >
                  <i className="ri-add-line"></i>
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={S.addBtn(addedToCart)}
              >
                {addedToCart ? (
                  <><i className="ri-check-line text-lg"></i> Ajouté au panier !</>
                ) : (
                  <><i className="ri-shopping-bag-line text-lg"></i> Ajouter au panier</>
                )}
              </button>
            </div>

            {/* Stock */}
            <div className={S.stockRow}>
              <div className={S.stockDot(product.stock > 10)}></div>
              <span className={S.stockText(product.stock > 10)}>
                {product.stock > 10 ? `En stock (${product.stock} disponibles)` : `Plus que ${product.stock} en stock !`}
              </span>
            </div>

            {/* Delivery */}
            <div className={S.deliveryRow}>
              <div className={S.deliveryItem}>
                <div className={S.deliveryIconBox}><i className="ri-truck-line text-dark"></i></div>
                Livraison gratuite
              </div>
              <div className={S.deliveryItem}>
                <div className={S.deliveryIconBox}><i className="ri-refresh-line text-dark"></i></div>
                Retour 30 jours
              </div>
              <div className={S.deliveryItem}>
                <div className={S.deliveryIconBox}><i className="ri-shield-check-line text-dark"></i></div>
                Paiement sécurisé
              </div>
            </div>
          </div>
        </div>

        {/* QR Customizer Section */}
        <div className={S.qrSection}>
          <div className={S.qrHeader}>
            <p className={S.qrEyebrow}>ÉTAPE SUIVANTE</p>
            <h2 className={S.qrTitle}>Programmez votre QR Code</h2>
            <p className={S.qrSubtitle}>
              Avant de finaliser votre commande, personnalisez les informations qui seront encodées dans le QR Code de votre bracelet.
            </p>
          </div>
          <div className={S.qrWrapper}>
            <QRCustomizer productName={product.name} productId={product.id} />
          </div>
        </div>

        {/* Other Products */}
        <div className={S.relatedSection}>
          <h2 className={S.relatedTitle}>Vous aimerez aussi</h2>
          <div className={S.relatedGrid} data-product-shop>
            {otherProducts.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className={S.relatedLink}
              >
                <div className={S.relatedImgBox(p.category)}>
                  <img src={p.image} alt={p.name} className={S.relatedImg} />
                </div>
                <div className={S.relatedInfoRow}>
                  <div>
                    <h3 className={S.relatedName}>{p.name}</h3>
                    <span className={S.relatedPrice}>{p.price.toFixed(2)} €</span>
                  </div>
                  <span className={S.relatedBtn}>Voir détails</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer simple */}
      <footer className={S.footerEl}>
        <div className={S.footerInner}>
          <Link to="/" className={S.footerLogo}>
            <div className={S.footerLogoIcon}>
              <i className="ri-qr-code-line text-white text-sm"></i>
            </div>
            <span className={S.footerLogoText}>QR Kids</span>
          </Link>
          <p className={S.footerCopyright}>© {new Date().getFullYear()} QR Kids. Tous droits réservés.</p>
          <div className={S.footerLinks}>
            <a href="#" className={S.footerLink}>CGV</a>
            <a href="#" className={S.footerLink}>Confidentialité</a>
            <a href="#" className={S.footerLink}>Contact</a>
          </div>
        </div>
      </footer>

      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveCart}
        onCheckout={(_qrProfile: QRProfileData) => setIsCartOpen(false)}
      />
    </div>
  );
};

export default ProductPage;
