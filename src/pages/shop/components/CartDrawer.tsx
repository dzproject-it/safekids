import { useState, useEffect } from 'react';
import type { QRProfileData } from '../../../services/api';
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
  onCheckout: (qrProfile: QRProfileData) => void;
  checkoutLoading?: boolean;
  checkoutError?: string | null;
  checkoutSuccess?: number | null;
}

interface QRForm {
  qrType: 'contact' | 'medical';
  parentName: string;
  phone1: string;
  phone2: string;
  address: string;
  childName: string;
  birthDate: string;
  bloodType: string;
  allergies: string;
  doctor: string;
  doctorPhone: string;
}

const defaultQRForm: QRForm = {
  qrType: 'contact',
  parentName: '', phone1: '', phone2: '', address: '',
  childName: '', birthDate: '', bloodType: '', allergies: '', doctor: '', doctorPhone: '',
};

const CartDrawer = ({ isOpen, items, onClose, onUpdateQuantity, onRemove, onCheckout, checkoutLoading, checkoutError, checkoutSuccess }: CartDrawerProps) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const [step, setStep] = useState<'cart' | 'qr'>('cart');
  const [qrForm, setQrForm] = useState<QRForm>(defaultQRForm);

  useEffect(() => {
    if (!isOpen) { setStep('cart'); setQrForm(defaultQRForm); }
  }, [isOpen]);

  const handleConfirmOrder = () => {
    const payload: Record<string, string> = qrForm.qrType === 'contact'
      ? { parentName: qrForm.parentName, phone1: qrForm.phone1, phone2: qrForm.phone2, address: qrForm.address }
      : { childName: qrForm.childName, birthDate: qrForm.birthDate, bloodType: qrForm.bloodType, allergies: qrForm.allergies, doctor: qrForm.doctor, doctorPhone: qrForm.doctorPhone };
    onCheckout({ qrType: qrForm.qrType, payload });
  };

  const set = (field: keyof QRForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setQrForm((prev) => ({ ...prev, [field]: e.target.value }));

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
                <button onClick={() => setStep('qr')} className={S.checkoutBtn}>
                  <i className="ri-qr-code-line text-base"></i>
                  Configurer les QR Codes — {total.toFixed(2)} €
                  <i className="ri-arrow-right-line text-base ml-auto"></i>
                </button>
                <p className={S.secureNote}>
                  <i className="ri-lock-line"></i>
                  Personnalisez chaque bracelet avant de commander
                </p>
              </div>
            )}
          </>
        )}

        {/* ── STEP : Configuration QR Code ─────────────────────── */}
        {step === 'qr' && (
          <div className={S.qrStep}>
            {/* Header */}
            <div className={S.qrStepHeader}>
              <button onClick={() => setStep('cart')} className={S.qrBackBtn}>
                <i className="ri-arrow-left-line text-lg"></i>
              </button>
              <div className="flex-1">
                <h2 className={S.qrStepTitle}>Informations QR Code</h2>
                <p className="text-xs text-gray-400">Encodées dans chaque bracelet commandé</p>
              </div>
              <button onClick={onClose} className={S.closeBtn}>
                <i className="ri-close-line text-xl text-gray-500"></i>
              </button>
            </div>

            {/* Body */}
            <div className={S.qrStepBody}>
              {/* Type selector */}
              <div>
                <p className={S.qrSectionTitle}>Type d'informations</p>
                <div className={S.qrTypeRow}>
                  <button onClick={() => setQrForm((p) => ({ ...p, qrType: 'contact' }))} className={S.qrTypeBtn(qrForm.qrType === 'contact')}>
                    <i className="ri-phone-line"></i> Contact urgence
                  </button>
                  <button onClick={() => setQrForm((p) => ({ ...p, qrType: 'medical' }))} className={S.qrTypeBtn(qrForm.qrType === 'medical')}>
                    <i className="ri-heart-pulse-line"></i> Fiche médicale
                  </button>
                </div>
              </div>

              {/* Formulaire Contact */}
              {qrForm.qrType === 'contact' && (
                <div className={S.qrFieldGroup}>
                  <p className={S.qrSectionTitle}>Contact d'urgence</p>
                  <div>
                    <label className={S.qrLabel}>Nom du parent / tuteur</label>
                    <input className={S.qrInput} type="text" value={qrForm.parentName} onChange={set('parentName')} placeholder="Ex : Marie Dupont" />
                  </div>
                  <div className={S.qrGrid2}>
                    <div>
                      <label className={S.qrLabel}>Téléphone principal</label>
                      <input className={S.qrInput} type="tel" value={qrForm.phone1} onChange={set('phone1')} placeholder="+33 6 12 34 56 78" />
                    </div>
                    <div>
                      <label className={S.qrLabel}>Téléphone secondaire</label>
                      <input className={S.qrInput} type="tel" value={qrForm.phone2} onChange={set('phone2')} placeholder="+33 6 98 76 54 32" />
                    </div>
                  </div>
                  <div>
                    <label className={S.qrLabel}>Adresse (optionnel)</label>
                    <input className={S.qrInput} type="text" value={qrForm.address} onChange={set('address')} placeholder="12 rue des Lilas, Paris" />
                  </div>
                </div>
              )}

              {/* Formulaire Médical */}
              {qrForm.qrType === 'medical' && (
                <div className={S.qrFieldGroup}>
                  <p className={S.qrSectionTitle}>Fiche médicale de l'enfant</p>
                  <div className={S.qrGrid2}>
                    <div>
                      <label className={S.qrLabel}>Prénom de l'enfant</label>
                      <input className={S.qrInput} type="text" value={qrForm.childName} onChange={set('childName')} placeholder="Ex : Emma" />
                    </div>
                    <div>
                      <label className={S.qrLabel}>Date de naissance</label>
                      <input className={S.qrInput} type="date" value={qrForm.birthDate} onChange={set('birthDate')} />
                    </div>
                  </div>
                  <div className={S.qrGrid2}>
                    <div>
                      <label className={S.qrLabel}>Groupe sanguin</label>
                      <select className={S.qrInput} value={qrForm.bloodType} onChange={set('bloodType')}>
                        <option value="">Inconnu</option>
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((g) => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={S.qrLabel}>Allergies</label>
                      <input className={S.qrInput} type="text" value={qrForm.allergies} onChange={set('allergies')} placeholder="Arachides, latex…" />
                    </div>
                  </div>
                  <div className={S.qrGrid2}>
                    <div>
                      <label className={S.qrLabel}>Médecin traitant</label>
                      <input className={S.qrInput} type="text" value={qrForm.doctor} onChange={set('doctor')} placeholder="Dr. Martin" />
                    </div>
                    <div>
                      <label className={S.qrLabel}>Tél. médecin</label>
                      <input className={S.qrInput} type="tel" value={qrForm.doctorPhone} onChange={set('doctorPhone')} placeholder="+33 1 23 45 67 89" />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
                <i className="ri-shield-check-line text-base flex-shrink-0 mt-0.5"></i>
                <span>Ces informations seront encodées dans le QR Code de votre bracelet. Elles sont visibles par toute personne qui scannerait le bracelet.</span>
              </div>
            </div>

            {/* Footer */}
            <div className={S.qrStepFooter}>
              {checkoutError && <p className={S.errorMsg + ' mb-3'}>{checkoutError}</p>}
              {checkoutSuccess ? (
                <div className={S.successBox}>
                  <i className="ri-check-double-line text-emerald-500 text-lg"></i>
                  <p className="text-emerald-700 text-sm font-semibold mt-1">Commande #{checkoutSuccess} confirmée !</p>
                </div>
              ) : (
                <>
                  <button onClick={handleConfirmOrder} disabled={checkoutLoading || false} className={S.qrConfirmBtn}>
                    {checkoutLoading
                      ? <><div className={S.spinner}></div> Traitement...</>
                      : <><i className="ri-check-line"></i> Confirmer la commande — {total.toFixed(2)} €</>
                    }
                  </button>
                  <p onClick={handleConfirmOrder} className={S.qrSkipBtn}>
                    Passer cette étape (sans QR Code personnalisé)
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
