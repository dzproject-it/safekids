import { useState, useEffect } from 'react';
import { type QRProfileData, fetchQRProfileByProduct } from '../../../services/api';
import PaymentSheet from './PaymentSheet';
import * as S from '../../../styles/CartDrawer.styles';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (cartKey: string, qty: number) => void;
  onRemove: (cartKey: string) => void;
  onCheckout: (qrProfile: QRProfileData, paymentIntentId: string) => void;
  checkoutLoading?: boolean;
  checkoutError?: string | null;
  checkoutSuccess?: number | null;
}

const CartDrawer = ({ isOpen, items, onClose, onUpdateQuantity, onRemove, onCheckout, checkoutLoading, checkoutError, checkoutSuccess }: CartDrawerProps) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const [step, setStep] = useState<'cart' | 'payment'>('cart');
  const [pendingQRProfile, setPendingQRProfile] = useState<QRProfileData | null>(null);

  useEffect(() => {
    if (!isOpen) { setStep('cart'); setPendingQRProfile(null); }
  }, [isOpen]);

  // Passer au paiement : récupérer silencieusement le profil QR sauvegardé depuis la page produit
  const handleGoToPayment = async () => {
    let profile: QRProfileData = { qrType: 'contact', payload: {} };
    if (items.length > 0) {
      try {
        const saved = await fetchQRProfileByProduct(items[0].id);
        if (saved) profile = saved;
      } catch { /* ignore */ }
    }
    setPendingQRProfile(profile);
    setStep('payment');
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    if (pendingQRProfile) {
      onCheckout(pendingQRProfile, paymentIntentId);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className={S.overlay} onClick={onClose} />}

      {/* Drawer */}
      <div className={S.drawer(isOpen)}>

        {/* ── STEP : Panier ────────────────────────────────────── */}
        {step === 'cart' && (
          <>
            {/* Header */}
            <div className={S.header}>
              <div className={S.titleRow}>
                <div className={S.titleIcon}>
                  <i className="ri-shopping-bag-line text-xl text-dark"></i>
                </div>
                <h2 className={S.title}>Mon Panier</h2>
                {totalItems > 0 && (
                  <span className={S.countBadge}>{totalItems}</span>
                )}
              </div>
              <button onClick={onClose} className={S.closeBtn}>
                <i className="ri-close-line text-xl text-gray-500"></i>
              </button>
            </div>

            {/* Items */}
            <div className={S.itemsArea}>
              {items.length === 0 ? (
                <div className={S.emptyState}>
                  <div className={S.emptyIconBox}>
                    <i className="ri-shopping-bag-line text-3xl text-gray-300"></i>
                  </div>
                  <p className={S.emptyTitle}>Votre panier est vide</p>
                  <p className={S.emptySubtitle}>Ajoutez des bracelets pour commencer</p>
                </div>
              ) : (
                <div className={S.itemList}>
                  {items.map((item) => {
                    const cartKey = `${item.id}-${item.color ?? ''}-${item.size ?? ''}`;
                    return (
                      <div key={cartKey} className={S.item}>
                        <div className={S.itemImgBox}>
                          <img src={item.image} alt={item.name} className={S.itemImg} />
                        </div>
                        <div className={S.itemInfo}>
                          <p className={S.itemName}>{item.name}</p>
                          {(item.color || item.size) && (
                            <div className={S.itemMeta}>
                              {item.color && <span className={S.itemTag}>{item.color}</span>}
                              {item.size && <span className={S.itemTag}>Taille {item.size}</span>}
                            </div>
                          )}
                          <p className={S.itemPrice}>{item.price.toFixed(2)} €</p>
                          <div className={S.itemActions}>
                            <div className={S.qtyBox}>
                              <button onClick={() => onUpdateQuantity(cartKey, item.quantity - 1)} className={S.qtyBtn}>
                                <i className="ri-subtract-line text-xs"></i>
                              </button>
                              <span className={S.qtyValue}>{item.quantity}</span>
                              <button onClick={() => onUpdateQuantity(cartKey, item.quantity + 1)} className={S.qtyBtn}>
                                <i className="ri-add-line text-xs"></i>
                              </button>
                            </div>
                            <button onClick={() => onRemove(cartKey)} className={S.removeBtn}>
                              <i className="ri-delete-bin-line text-sm"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className={S.footer}>
                <div className={S.totals}>
                  <div className={S.totalRow}>
                    <span>Sous-total ({totalItems} article{totalItems > 1 ? 's' : ''})</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                  <div className={S.totalRow}>
                    <span>Livraison</span>
                    <span className="text-emerald-500 font-medium">Gratuite</span>
                  </div>
                  <div className={S.totalFinal}>
                    <span>Total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                </div>
                <button onClick={handleGoToPayment} className={S.checkoutBtn}>
                  <i className="ri-bank-card-line text-base"></i>
                  Passer au paiement — {total.toFixed(2)} €
                  <i className="ri-arrow-right-line text-base ml-auto"></i>
                </button>
                <p className={S.secureNote}>
                  <i className="ri-lock-line"></i>
                  Paiement sécurisé par Stripe
                </p>
              </div>
            )}
          </>
        )}

        {/* ── STEP : Paiement ──────────────────────────────────── */}
        {step === 'payment' && (
          <PaymentSheet
            totalAmount={total}
            totalItems={totalItems}
            onSuccess={handlePaymentSuccess}
            onBack={() => setStep('cart')}
            onClose={onClose}
            qrProfile={pendingQRProfile}
          />
        )}
      </div>
    </>
  );
};

export default CartDrawer;
