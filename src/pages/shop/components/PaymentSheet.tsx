import { useState, useEffect, useCallback } from 'react';
import {
  PaymentRequestButtonElement,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { PaymentRequest } from '@stripe/stripe-js';
import { createPaymentIntent, type QRProfileData } from '../../../services/api';
import * as S from '../../../styles/PaymentSheet.styles';

interface PaymentSheetProps {
  totalAmount: number;          // en euros (ex: 29.90)
  totalItems: number;
  onSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
  onClose: () => void;
  qrProfile?: QRProfileData | null;
}

const PaymentSheet = ({ totalAmount, totalItems, onSuccess, onBack, onClose, qrProfile }: PaymentSheetProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [walletAvailable, setWalletAvailable] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const amountCents = Math.round(totalAmount * 100);

  // 1. Créer le PaymentIntent côté serveur
  useEffect(() => {
    let cancelled = false;
    createPaymentIntent(amountCents)
      .then((res) => {
        if (!cancelled) {
          setClientSecret(res.clientSecret);
          setPaymentIntentId(res.paymentIntentId);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erreur de paiement');
      });
    return () => { cancelled = true; };
  }, [amountCents]);

  // 2. Configurer la Payment Request API (Apple Pay / Google Pay)
  useEffect(() => {
    if (!stripe || !clientSecret) return;

    const pr = stripe.paymentRequest({
      country: 'FR',
      currency: 'eur',
      total: {
        label: `SafeKids — ${totalItems} article${totalItems > 1 ? 's' : ''}`,
        amount: amountCents,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setWalletAvailable(true);
      }
    });

    pr.on('paymentmethod', async (ev) => {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: ev.paymentMethod.id },
        { handleActions: false },
      );

      if (confirmError) {
        ev.complete('fail');
        setError(confirmError.message ?? 'Échec du paiement');
      } else if (paymentIntent?.status === 'requires_action') {
        ev.complete('success');
        const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
        if (actionError) {
          setError(actionError.message ?? 'Authentification échouée');
        } else {
          setSuccess(true);
          onSuccess(paymentIntent.id);
        }
      } else {
        ev.complete('success');
        setSuccess(true);
        onSuccess(paymentIntent?.id ?? paymentIntentId ?? '');
      }
    });
  }, [stripe, clientSecret, amountCents, totalItems, onSuccess, paymentIntentId]);

  // 3. Paiement par carte bancaire classique
  const handleCardPayment = useCallback(async () => {
    if (!stripe || !elements || !clientSecret) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setLoading(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (confirmError) {
      setError(confirmError.message ?? 'Échec du paiement');
      setLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      setSuccess(true);
      setLoading(false);
      onSuccess(paymentIntent.id);
    } else {
      setError('Paiement non finalisé. Veuillez réessayer.');
      setLoading(false);
    }
  }, [stripe, elements, clientSecret, onSuccess]);

  // 4. Paiement PayPal (redirection)
  const handlePayPalPayment = useCallback(async () => {
    if (!stripe || !clientSecret || !paymentIntentId) return;

    setLoading(true);
    setError(null);

    // Sauvegarder le contexte pour le retour de redirection
    sessionStorage.setItem('safekids-paypal-checkout', JSON.stringify({
      paymentIntentId,
      qrProfile: qrProfile ?? null,
    }));

    const { error: paypalError } = await stripe.confirmPayPalPayment(clientSecret, {
      return_url: `${window.location.origin}/shop`,
    });

    if (paypalError) {
      setError(paypalError.message ?? 'Échec du paiement PayPal');
      setLoading(false);
      sessionStorage.removeItem('safekids-paypal-checkout');
    }
    // Si pas d'erreur, l'utilisateur est redirigé vers PayPal
  }, [stripe, clientSecret, paymentIntentId, qrProfile]);

  // ── Succès ──
  if (success) {
    return (
      <div className={S.successBox}>
        <div className={S.successIcon}>
          <i className="ri-check-line text-3xl text-emerald-500"></i>
        </div>
        <h3 className={S.successTitle}>Paiement confirmé !</h3>
        <p className={S.successText}>
          Votre commande a été enregistrée. Vous recevrez un email de confirmation.
        </p>
        <button onClick={onClose} className={S.successBtn}>
          Continuer mes achats
        </button>
      </div>
    );
  }

  return (
    <div className={S.wrapper}>
      {/* Header */}
      <div className={S.header}>
        <button onClick={onBack} className={S.backBtn}>
          <i className="ri-arrow-left-line text-lg"></i>
        </button>
        <div className="flex-1">
          <h2 className={S.title}>Paiement sécurisé</h2>
          <p className="text-xs text-gray-400">Choisissez votre mode de paiement</p>
        </div>
        <button onClick={onClose} className={S.closeBtn}>
          <i className="ri-close-line text-xl text-gray-500"></i>
        </button>
      </div>

      {/* Body */}
      <div className={S.body}>
        {/* Récapitulatif */}
        <div className={S.summary}>
          <div className={S.summaryRow}>
            <span>{totalItems} article{totalItems > 1 ? 's' : ''}</span>
            <span>{totalAmount.toFixed(2)} €</span>
          </div>
          <div className={S.summaryRow}>
            <span>Livraison</span>
            <span className="text-emerald-500 font-medium">Gratuite</span>
          </div>
          <div className={S.summaryTotal}>
            <span>Total</span>
            <span>{totalAmount.toFixed(2)} €</span>
          </div>
        </div>

        {/* Paiement express */}
        <div className={S.section}>
          <p className={S.sectionTitle}>Paiement express</p>
          <div className={S.walletArea}>
            {/* Apple Pay / Google Pay */}
            {walletAvailable && paymentRequest && (
              <PaymentRequestButtonElement
                options={{
                  paymentRequest,
                  style: {
                    paymentRequestButton: {
                      type: 'default',
                      theme: 'dark',
                      height: '48px',
                    },
                  },
                }}
              />
            )}

            {/* PayPal */}
            <button
              onClick={handlePayPalPayment}
              disabled={loading || !clientSecret}
              className={`${S.walletBtn} ${S.paypalBtn}`}
            >
              <i className="ri-paypal-fill text-lg"></i>
              PayPal
            </button>
          </div>
          <div className={S.divider}>
            <span className={S.dividerLine}></span>
            <span>ou payer par carte</span>
            <span className={S.dividerLine}></span>
          </div>
        </div>

        {/* Carte bancaire */}
        <div className={S.section}>
          <p className={S.sectionTitle}>Carte bancaire</p>
          <div className={S.stripeArea}>
            <div className={S.stripeElement}>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#1A1A1A',
                      fontFamily: 'Inter, sans-serif',
                      '::placeholder': { color: '#9CA3AF' },
                    },
                    invalid: { color: '#EF4444' },
                  },
                  hidePostalCode: true,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={S.footer}>
        {error && <p className={S.errorMsg}>{error}</p>}
        <button
          onClick={handleCardPayment}
          disabled={loading || !clientSecret}
          className={S.payBtn(loading || !clientSecret)}
        >
          {loading ? (
            <><div className={S.spinner}></div> Traitement…</>
          ) : (
            <><i className="ri-lock-line"></i> Payer {totalAmount.toFixed(2)} €</>
          )}
        </button>
        <p className={S.secureNote}>
          <i className="ri-shield-check-line"></i>
          Paiement sécurisé — PayPal, Apple Pay, Google Pay, CB
        </p>
      </div>
    </div>
  );
};

export default PaymentSheet;
