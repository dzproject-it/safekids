const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  badge: string | null;
  popularity: number;
  image: string;
  colors: string[];
  sizes: string[];
  description: string;
  features: string[];
  stock: number;
}

export interface ProductFilters {
  category?: string;
  sort?: string;
  size?: string;
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.size) params.set('size', filters.size);

  const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
  if (!res.ok) throw new Error('Erreur lors du chargement des produits');
  return res.json() as Promise<Product[]>;
}

export async function fetchProduct(id: number): Promise<Product> {
  const res = await fetch(`${API_URL}/api/products/${id}`);
  if (res.status === 404) throw new Error('Produit introuvable');
  if (!res.ok) throw new Error('Erreur lors du chargement du produit');
  return res.json() as Promise<Product>;
}

// ── Commandes ──────────────────────────────────────────────────

export interface OrderItem {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  color?: string;
  size?: string;
}

export interface QRProfileData {
  qrType: 'contact' | 'medical';
  payload: Record<string, string>;
}

export interface OrderPayload {
  items: OrderItem[];
  totalAmount: number;
  customerEmail?: string;
  customerName?: string;
  qrProfile?: QRProfileData;
  paymentIntentId?: string;
}

export interface OrderConfirmation {
  id: number;
  status: string;
  totalAmount: number;
  qrProfileId?: number | null;
  createdAt: string;
}

export async function createOrder(payload: OrderPayload): Promise<OrderConfirmation> {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? 'Erreur lors de la commande');
  }
  return res.json() as Promise<OrderConfirmation>;
}

// ── Profils QR Code ────────────────────────────────────────────

export type QRType = 'contact' | 'medical' | 'text' | 'link';

export interface QRProfilePayload {
  productId?: number;
  qrType: QRType;
  payload: Record<string, string>;
}

export interface QRProfileConfirmation {
  id: number;
  qrType: QRType;
  createdAt?: string;
  updatedAt?: string;
}

export async function saveQRProfile(data: QRProfilePayload): Promise<QRProfileConfirmation> {
  const res = await fetch(`${API_URL}/api/qr-profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? 'Erreur lors de la sauvegarde');
  }
  return res.json() as Promise<QRProfileConfirmation>;
}

export async function fetchQRProfile(id: number): Promise<{ id: number; qrType: QRType; payload: Record<string, string> }> {
  const res = await fetch(`${API_URL}/api/qr-profiles/${id}`);
  if (res.status === 404) throw new Error('Profil QR introuvable');
  if (!res.ok) throw new Error('Erreur lors du chargement du profil QR');
  return res.json();
}

export async function fetchQRProfileByProduct(productId: number): Promise<{ id: number; qrType: QRType; payload: Record<string, string> } | null> {
  const res = await fetch(`${API_URL}/api/qr-profiles/by-product/${productId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Erreur lors du chargement du profil QR');
  return res.json();
}

// ── Paiements Stripe ───────────────────────────────────────────

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export async function createPaymentIntent(amountCents: number): Promise<PaymentIntentResponse> {
  const res = await fetch(`${API_URL}/api/payments/create-payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountCents, currency: 'eur' }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? 'Erreur de création du paiement');
  }
  return res.json() as Promise<PaymentIntentResponse>;
}

// ── Admin ──────────────────────────────────────────────────────

function adminHeaders(): Record<string, string> {
  const token = sessionStorage.getItem('safekids-admin-token') ?? '';
  return { 'Content-Type': 'application/json', 'x-admin-token': token };
}

export interface AdminOrder {
  id: number;
  status: string;
  totalAmount: number;
  customerEmail: string | null;
  customerName: string | null;
  itemCount: number;
  createdAt: string;
}

export interface AdminOrderDetail extends Omit<AdminOrder, 'itemCount'> {
  items: Array<{
    id: number;
    productId: number | null;
    name: string;
    unitPrice: number;
    quantity: number;
    color: string | null;
    size: string | null;
  }>;
  qrProfile: { id: number; qrType: string; payload: Record<string, string> } | null;
}

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminStats {
  totalOrders: number;
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}

export async function fetchAdminOrders(
  params: { page?: number; limit?: number; status?: string; search?: string } = {},
): Promise<{ orders: AdminOrder[]; pagination: AdminPagination }> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.status) qs.set('status', params.status);
  if (params.search) qs.set('search', params.search);
  const res = await fetch(`${API_URL}/api/admin/orders?${qs}`, { headers: adminHeaders() });
  if (res.status === 401) throw new Error('Non autorisé');
  if (!res.ok) throw new Error('Erreur chargement commandes');
  return res.json();
}

export async function fetchAdminOrder(id: number): Promise<AdminOrderDetail> {
  const res = await fetch(`${API_URL}/api/admin/orders/${id}`, { headers: adminHeaders() });
  if (res.status === 401) throw new Error('Non autorisé');
  if (res.status === 404) throw new Error('Commande introuvable');
  if (!res.ok) throw new Error('Erreur chargement commande');
  return res.json();
}

export async function updateOrderStatus(id: number, status: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify({ status }),
  });
  if (res.status === 401) throw new Error('Non autorisé');
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? 'Erreur mise à jour statut');
  }
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${API_URL}/api/admin/stats`, { headers: adminHeaders() });
  if (res.status === 401) throw new Error('Non autorisé');
  if (!res.ok) throw new Error('Erreur chargement statistiques');
  return res.json();
}
