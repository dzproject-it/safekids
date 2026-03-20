import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  fetchAdminOrders,
  fetchAdminOrder,
  fetchAdminStats,
  updateOrderStatus,
  type AdminOrder,
  type AdminOrderDetail,
  type AdminPagination,
  type AdminStats,
} from '../../services/api';
import * as s from '../../styles/admin.page.styles';
import { generateOrderPDF } from './generateOrderPDF';

const CONTACT_LABELS: Record<string, string> = {
  parentName: 'Parent / Tuteur',
  phone1: 'Téléphone principal',
  phone2: 'Téléphone secondaire',
  address: 'Adresse',
};
const MEDICAL_LABELS: Record<string, string> = {
  childName: 'Prénom enfant',
  birthDate: 'Date de naissance',
  bloodType: 'Groupe sanguin',
  allergies: 'Allergies',
  doctor: 'Médecin traitant',
  doctorPhone: 'Tél. médecin',
};

function buildQRContent(qrType: string, payload: Record<string, unknown>): string {
  if (qrType === 'contact') {
    const medicalParts = [
      payload.childName   ? `Enfant : ${payload.childName}` : '',
      payload.birthDate   ? `Né(e) le : ${payload.birthDate}` : '',
      payload.bloodType   ? `Groupe sanguin : ${payload.bloodType}` : '',
      payload.allergies   ? `Allergies : ${payload.allergies}` : '',
      payload.doctor      ? `Médecin : ${payload.doctor}` : '',
      payload.doctorPhone ? `Tél. médecin : ${payload.doctorPhone}` : '',
    ].filter(Boolean).join('\\n');

    const noteLines = [
      '⚠️ BRACELET SAFEKIDS ⚠️',
      payload.parentName ? `Contact : ${payload.parentName}` : '',
      payload.phone1 ? `Tél : ${payload.phone1}` : '',
      payload.phone2 ? `Tél 2 : ${payload.phone2}` : '',
      payload.address ? `Adresse : ${payload.address}` : '',
      medicalParts ? `\\n--- FICHE MÉDICALE ---\\n${medicalParts}` : '',
    ].filter(Boolean).join('\\n');

    return [
      'BEGIN:VCARD', 'VERSION:3.0',
      `FN:${payload.parentName || 'Parent/Tuteur'}`,
      payload.childName ? `ORG:SafeKids - ${payload.childName}` : 'ORG:SafeKids',
      payload.phone1  ? `TEL;TYPE=CELL:${payload.phone1}` : '',
      payload.phone2  ? `TEL;TYPE=WORK:${payload.phone2}` : '',
      payload.address ? `ADR:;;${payload.address};;;;` : '',
      `NOTE:${noteLines}`,
      'END:VCARD',
    ].filter(Boolean).join('\n');
  }
  if (qrType === 'text' && payload.text) return String(payload.text);
  return Object.entries(payload).map(([k, v]) => `${k}: ${v}`).join('\n');
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(
    () => !!sessionStorage.getItem('safekids-admin-token'),
  );
  const [tokenInput, setTokenInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Data
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pagination, setPagination] = useState<AdminPagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Detail modal
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // QR Code image
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedOrder?.qrProfile) { setQrDataUrl(null); return; }
    const content = buildQRContent(selectedOrder.qrProfile.qrType, selectedOrder.qrProfile.payload as Record<string, unknown>);
    QRCode.toDataURL(content, { width: 160, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [selectedOrder]);

  // ── Auth ──────────────────────────────────────────────────────
  const handleLogin = async () => {
    setLoginError('');
    sessionStorage.setItem('safekids-admin-token', tokenInput);
    try {
      await fetchAdminStats();
      setAuthenticated(true);
    } catch {
      sessionStorage.removeItem('safekids-admin-token');
      setLoginError('Token invalide');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('safekids-admin-token');
    setAuthenticated(false);
  };

  // ── Data loading ──────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminOrders({
        page: currentPage,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      if (err instanceof Error && err.message === 'Non autorisé') {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery]);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadOrders();
      loadStats();
    }
  }, [authenticated, loadOrders, loadStats]);

  // ── Order detail ──────────────────────────────────────────────
  const openOrder = async (id: number) => {
    try {
      const detail = await fetchAdminOrder(id);
      setSelectedOrder(detail);
      setNewStatus(detail.status);
      setModalOpen(true);
    } catch { /* silent */ }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || newStatus === selectedOrder.status) return;
    setUpdating(true);
    try {
      await updateOrderStatus(selectedOrder.id, newStatus);
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      loadOrders();
      loadStats();
    } catch { /* silent */ }
    finally { setUpdating(false); }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  // ── Bon de commande ───────────────────────────────────────────
  const handleGeneratePDF = () => {
    if (!selectedOrder) return;
    generateOrderPDF(selectedOrder);
  };

  // ── Search debounce ───────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // ── Login screen ──────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className={s.loginPage}>
        <div className={s.loginCard}>
          <div className="flex justify-center mb-4">
            <div className={s.sidebarLogoIcon}>SK</div>
          </div>
          <h1 className={s.loginTitle}>Administration SafeKids</h1>
          {loginError && <p className={s.loginError}>{loginError}</p>}
          <input
            className={s.loginInput}
            type="password"
            placeholder="Token d'administration"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button className={s.loginBtn} onClick={handleLogin}>
            Connexion
          </button>
        </div>
      </div>
    );
  }

  // ── Format helpers ────────────────────────────────────────────
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className={s.page}>
      {/* Mobile toggle */}
      <button className={s.mobileToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={sidebarOpen ? s.sidebarMobileOpen : s.sidebarMobile + ' lg:translate-x-0'}>
        <div className={s.sidebarHeader}>
          <div className={s.sidebarLogo}>
            <div className={s.sidebarLogoIcon}>SK</div>
            <span className={s.sidebarLogoText}>SafeKids Admin</span>
          </div>
        </div>
        <nav className={s.sidebarNav}>
          <div className={s.sidebarLinkActive}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Commandes
          </div>
          <a href="/" className={s.sidebarLink}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
            </svg>
            Retour au site
          </a>
        </nav>
        <div className={s.sidebarFooter}>
          <button onClick={handleLogout} className="hover:text-white transition-colors cursor-pointer">
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className={s.mainMobile}>
        <div className={s.topBar}>
          <div>
            <h1 className={s.topTitle}>Gestion des commandes</h1>
            <p className={s.topSubtitle}>{pagination.total} commande{pagination.total > 1 ? 's' : ''} au total</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className={s.statsGrid}>
            <div className={s.statCard}>
              <p className={s.statLabel}>Total</p>
              <p className={s.statValue}>{stats.totalOrders}</p>
            </div>
            <div className={s.statCard}>
              <p className={s.statLabel}>En attente</p>
              <p className={s.statValue}>{stats.pending}</p>
            </div>
            <div className={s.statCard}>
              <p className={s.statLabel}>Confirmées</p>
              <p className={s.statValue}>{stats.confirmed}</p>
            </div>
            <div className={s.statCard}>
              <p className={s.statLabel}>Expédiées</p>
              <p className={s.statValue}>{stats.shipped}</p>
            </div>
            <div className={s.statCard}>
              <p className={s.statLabel}>Livrées</p>
              <p className={s.statValue}>{stats.delivered}</p>
            </div>
            <div className={s.statCard}>
              <p className={s.statLabel}>Chiffre d'affaires</p>
              <p className={s.statRevenue}>{fmt(stats.totalRevenue)}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={s.filtersBar}>
          <input
            className={s.searchInput}
            type="text"
            placeholder="Rechercher par nom, email ou n° de commande…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <select
            className={s.filterSelect}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">Tous les statuts</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>{s.statusLabels[st]}</option>
            ))}
          </select>
        </div>

        {/* Orders table */}
        <div className={s.tableWrap}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className={s.emptyState}>
              <div className={s.emptyIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className={s.emptyTitle}>Aucune commande</p>
              <p className={s.emptySubtitle}>Les commandes apparaîtront ici.</p>
            </div>
          ) : (
            <>
              <table className={s.table}>
                <thead className={s.thead}>
                  <tr>
                    <th className={s.th}>N°</th>
                    <th className={s.th}>Client</th>
                    <th className={s.th}>Statut</th>
                    <th className={s.th}>Articles</th>
                    <th className={s.th}>Montant</th>
                    <th className={s.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className={s.tr} onClick={() => openOrder(order.id)}>
                      <td className={s.tdId}>#{order.id}</td>
                      <td className={s.td}>
                        <div className="font-medium">{order.customerName || '—'}</div>
                        <div className="text-xs text-gray-400">{order.customerEmail || '—'}</div>
                      </td>
                      <td className={s.td}>
                        <span className={s.badge(order.status)}>{s.statusLabels[order.status] || order.status}</span>
                      </td>
                      <td className={s.td}>{order.itemCount}</td>
                      <td className={s.tdAmount}>{fmt(order.totalAmount)}</td>
                      <td className={s.tdDate}>{fmtDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className={s.paginationWrap}>
                <span className={s.paginationInfo}>
                  Page {pagination.page} / {pagination.totalPages} · {pagination.total} résultat{pagination.total > 1 ? 's' : ''}
                </span>
                <div className={s.paginationBtns}>
                  <button
                    className={s.pageBtn}
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    ← Préc.
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(currentPage - 2, pagination.totalPages - 4));
                    const p = start + i;
                    if (p > pagination.totalPages) return null;
                    return (
                      <button
                        key={p}
                        className={p === currentPage ? s.pageBtnActive : s.pageBtn}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    className={s.pageBtn}
                    disabled={currentPage >= pagination.totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Suiv. →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Order detail modal */}
      {modalOpen && selectedOrder && (
        <div className={s.modalOverlay} onClick={closeModal}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>Commande #{selectedOrder.id}</h2>
              <button className={s.modalClose} onClick={closeModal}>✕</button>
            </div>

            <div className={s.modalBody}>
              {/* Info */}
              <div className={s.modalSection}>
                <h3 className={s.modalSectionTitle}>Informations</h3>
                <div className={s.modalInfoGrid}>
                  <div>
                    <p className={s.modalInfoLabel}>Client</p>
                    <p className={s.modalInfoValue}>{selectedOrder.customerName || '—'}</p>
                  </div>
                  <div>
                    <p className={s.modalInfoLabel}>Email</p>
                    <p className={s.modalInfoValue}>{selectedOrder.customerEmail || '—'}</p>
                  </div>
                  <div>
                    <p className={s.modalInfoLabel}>Date</p>
                    <p className={s.modalInfoValue}>{fmtDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p className={s.modalInfoLabel}>Statut</p>
                    <div className="flex items-center gap-2">
                      <select
                        className={s.statusSelect}
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>{s.statusLabels[st]}</option>
                        ))}
                      </select>
                      {newStatus !== selectedOrder.status && (
                        <button
                          className="px-3 py-1 bg-primary text-white text-xs rounded-lg font-medium disabled:opacity-50"
                          onClick={handleStatusUpdate}
                          disabled={updating}
                        >
                          {updating ? '…' : 'Valider'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Profile */}
              {selectedOrder.qrProfile && (() => {
                const p = selectedOrder.qrProfile.payload as Record<string, string>;
                const contactEntries = Object.entries(CONTACT_LABELS).filter(([k]) => p[k]);
                const medicalEntries = Object.entries(MEDICAL_LABELS).filter(([k]) => p[k]);
                return (
                  <div className={s.modalSection}>
                    <h3 className={s.modalSectionTitle}>Profil QR Code</h3>
                    <div className="bg-gray-50 rounded-xl p-4 flex gap-4">
                      {/* Infos textuelles */}
                      <div className="flex-1 min-w-0 space-y-3">
                        {contactEntries.length > 0 && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1.5">Contact d'urgence</p>
                            <div className="space-y-1">
                              {contactEntries.map(([k, label]) => (
                                <div key={k} className="flex gap-2 text-xs">
                                  <span className="text-gray-400 min-w-[110px] shrink-0">{label} :</span>
                                  <span className="text-dark font-medium">{p[k]}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {medicalEntries.length > 0 && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-rose-400 mb-1.5">Fiche médicale</p>
                            <div className="space-y-1">
                              {medicalEntries.map(([k, label]) => (
                                <div key={k} className="flex gap-2 text-xs">
                                  <span className="text-gray-400 min-w-[110px] shrink-0">{label} :</span>
                                  <span className="text-dark font-medium">{p[k]}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedOrder.qrProfile.qrType === 'text' && p.text && (
                          <p className="text-xs text-dark">{p.text}</p>
                        )}
                      </div>
                      {/* QR Code image */}
                      {qrDataUrl && (
                        <div className="shrink-0 flex flex-col items-center gap-1">
                          <img src={qrDataUrl} alt="QR Code" className="w-28 h-28 rounded-lg border border-gray-200" />
                          <span className="text-[10px] text-gray-400">QR Code</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Items */}
              <div className={s.modalSection}>
                <h3 className={s.modalSectionTitle}>Articles</h3>
                <div>
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className={s.itemRow}>
                      <div>
                        <p className={s.itemName}>{item.name}</p>
                        <p className={s.itemMeta}>
                          {item.quantity} × {fmt(item.unitPrice)}
                          {item.color && ` · ${item.color}`}
                          {item.size && ` · ${item.size}`}
                        </p>
                      </div>
                      <p className={s.itemPrice}>{fmt(item.unitPrice * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className={s.totalRow}>
                  <span className={s.totalLabel}>Total</span>
                  <span className={s.totalValue}>{fmt(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className={s.modalActions}>
              <button className={s.btnPrimary} onClick={handleGeneratePDF}>
                📄 Bon de commande
              </button>
              <button className={s.btnSecondary} onClick={closeModal}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
