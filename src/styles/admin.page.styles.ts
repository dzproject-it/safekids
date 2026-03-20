// ── Admin page styles ─────────────────────────────────────────────────────────

export const page              = 'min-h-screen bg-gray-50';
export const sidebar           = 'fixed inset-y-0 left-0 w-64 bg-dark text-white flex flex-col z-50';
export const sidebarHeader     = 'px-6 py-5 border-b border-white/10';
export const sidebarLogo       = 'flex items-center gap-3';
export const sidebarLogoIcon   = 'w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm';
export const sidebarLogoText   = 'font-display font-bold text-lg';
export const sidebarNav        = 'flex-1 px-3 py-4 space-y-1';
export const sidebarLink       = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer';
export const sidebarLinkActive = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-primary text-white font-medium';
export const sidebarFooter     = 'px-6 py-4 border-t border-white/10 text-xs text-gray-400';

export const main              = 'ml-64 p-6 lg:p-8';
export const topBar            = 'flex items-center justify-between mb-8';
export const topTitle          = 'font-display font-bold text-2xl text-dark';
export const topSubtitle       = 'text-sm text-gray-400 mt-1';

// Stats cards
export const statsGrid         = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-8';
export const statCard          = 'bg-white rounded-xl p-4 border border-gray-100 shadow-sm';
export const statLabel         = 'text-xs text-gray-400 font-medium uppercase tracking-wide';
export const statValue         = 'text-2xl font-bold text-dark mt-1';
export const statRevenue       = 'text-2xl font-bold text-emerald-600 mt-1';

// Filters bar
export const filtersBar        = 'flex flex-wrap items-center gap-3 mb-6';
export const searchInput       = 'flex-1 w-full sm:min-w-[200px] px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';
export const filterSelect      = 'px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer';

// Table
export const tableWrap         = 'bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto';
export const table             = 'w-full text-sm min-w-[600px]';
export const thead             = 'bg-gray-50 border-b border-gray-100';
export const th                = 'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide';
export const tr                = 'border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer';
export const td                = 'px-4 py-3.5 text-gray-700';
export const tdId              = 'px-4 py-3.5 font-mono text-xs font-semibold text-gray-500';
export const tdAmount          = 'px-4 py-3.5 font-semibold text-dark';
export const tdDate            = 'px-4 py-3.5 text-xs text-gray-400';

// Status badges
export const badge = (status: string) => {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';
  switch (status) {
    case 'pending':    return `${base} bg-amber-100 text-amber-700`;
    case 'confirmed':  return `${base} bg-blue-100 text-blue-700`;
    case 'shipped':    return `${base} bg-purple-100 text-purple-700`;
    case 'delivered':  return `${base} bg-emerald-100 text-emerald-700`;
    case 'cancelled':  return `${base} bg-red-100 text-red-700`;
    default:           return `${base} bg-gray-100 text-gray-700`;
  }
};

export const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

// Pagination
export const paginationWrap    = 'flex items-center justify-between px-4 py-3 border-t border-gray-100';
export const paginationInfo    = 'text-xs text-gray-400';
export const paginationBtns    = 'flex items-center gap-1';
export const pageBtn           = 'px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
export const pageBtnActive     = 'px-3 py-1.5 text-xs rounded-lg bg-primary text-white font-medium';

// Order detail modal
export const modalOverlay      = 'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4';
export const modal             = 'bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto';
export const modalHeader       = 'flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100';
export const modalTitle        = 'font-display font-bold text-lg text-dark';
export const modalClose        = 'w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-gray-400';
export const modalBody         = 'px-4 sm:px-6 py-5 space-y-6';
export const modalSection      = 'space-y-2';
export const modalSectionTitle = 'text-xs font-semibold text-gray-400 uppercase tracking-wide';
export const modalInfoGrid     = 'grid grid-cols-2 gap-4';
export const modalInfoLabel    = 'text-xs text-gray-400';
export const modalInfoValue    = 'text-sm font-medium text-dark';
export const itemRow           = 'flex items-center justify-between py-2 border-b border-gray-50 last:border-0';
export const itemName          = 'text-sm text-dark font-medium';
export const itemMeta          = 'text-xs text-gray-400';
export const itemPrice         = 'text-sm font-semibold text-dark';
export const totalRow          = 'flex items-center justify-between pt-3 border-t border-gray-200';
export const totalLabel        = 'font-semibold text-dark';
export const totalValue        = 'text-lg font-bold text-primary';

// Status selector in modal
export const statusSelect      = 'px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer';

// Modal actions
export const modalActions      = 'flex items-center gap-3 px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50';
export const btnPrimary        = 'px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer';
export const btnSecondary      = 'px-5 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer';

// Login
export const loginPage         = 'min-h-screen flex items-center justify-center bg-gray-50';
export const loginCard         = 'bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm border border-gray-100';
export const loginTitle        = 'font-display font-bold text-xl text-dark text-center mb-6';
export const loginInput        = 'w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all mb-4';
export const loginBtn          = 'w-full px-4 py-3 bg-dark text-white rounded-lg text-sm font-semibold hover:bg-primary transition-colors cursor-pointer';
export const loginError        = 'text-sm text-red-500 text-center mb-4';

// Empty state
export const emptyState        = 'flex flex-col items-center justify-center py-16 text-center';
export const emptyIcon         = 'w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300';
export const emptyTitle        = 'font-semibold text-dark mb-1';
export const emptySubtitle     = 'text-sm text-gray-400';

// Mobile sidebar toggle
export const mobileToggle      = 'lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-dark text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer';

// Responsive
export const mainMobile        = 'p-4 lg:ml-64 lg:p-8';
export const sidebarMobile     = 'fixed inset-y-0 left-0 w-64 bg-dark text-white flex flex-col z-50 transform -translate-x-full lg:translate-x-0 transition-transform';
export const sidebarMobileOpen = 'fixed inset-y-0 left-0 w-64 bg-dark text-white flex flex-col z-50 transform translate-x-0 transition-transform';
