// ── ShopFilters ───────────────────────────────────────────────────────────────

export const wrapper      = 'bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm';
export const container    = 'max-w-7xl mx-auto px-6 py-4';
export const row          = 'flex flex-wrap items-center gap-4 justify-between';
export const catGroup     = 'flex items-center gap-2';
export const catBtn       = (active: boolean) => `flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${active ? 'bg-dark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`;
export const catIconBox   = 'w-4 h-4 flex items-center justify-center';
export const rightGroup   = 'flex items-center gap-3';
export const sizeGroup    = 'flex items-center gap-1 bg-gray-100 rounded-full px-1 py-1';
export const sizeBtn      = (active: boolean) => `px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${active ? 'bg-white text-dark shadow-sm' : 'text-gray-500 hover:text-dark'}`;
export const sortWrapper  = 'relative';
export const sortSelect   = 'appearance-none bg-gray-100 text-gray-700 text-sm px-4 py-2 pr-8 rounded-full cursor-pointer focus:outline-none hover:bg-gray-200 transition-all';
export const sortArrow    = 'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 flex items-center justify-center';
export const resultsCount = 'text-sm text-gray-400 whitespace-nowrap';
