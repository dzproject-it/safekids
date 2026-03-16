// ── ProductCard ───────────────────────────────────────────────────────────────

export const card         = 'group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col';
export const imgLink      = 'block relative overflow-hidden';
export const imgContainer = (bg: string) => `${bg} h-64 flex items-center justify-center relative`;
export const img          = 'w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105';
export const badgeEl      = (color: string) => `absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${color}`;
export const discountBadge = 'absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full bg-dark text-white';
export const stockWarning = 'absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5';
export const stockDot     = 'w-1.5 h-1.5 rounded-full bg-orange-400';
export const stockText    = 'text-xs text-gray-600 font-medium';
export const info         = 'p-4 flex flex-col flex-1';
export const nameEl       = 'font-display font-semibold text-dark text-sm leading-snug mb-2 hover:text-primary transition-colors cursor-pointer';
export const colorsRow    = 'flex items-center gap-1 mb-3';
export const colorTag     = 'text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full';
export const priceRow     = 'flex items-baseline gap-2 mb-4 mt-auto';
export const price        = 'text-xl font-bold text-dark';
export const oldPrice     = 'text-sm text-gray-400 line-through';
export const addBtn       = 'w-full bg-dark text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer';
export const addBtnIcon   = 'w-4 h-4 flex items-center justify-center';

export const categoryBg = (category: string) => {
  switch (category) {
    case 'girl':  return 'bg-pink-50';
    case 'boy':   return 'bg-sky-50';
    default:      return 'bg-yellow-50';
  }
};

export const badgeColor = (badge: string) => {
  switch (badge) {
    case 'PROMO':           return 'bg-primary text-white';
    case 'NOUVEAU':         return 'bg-emerald-500 text-white';
    case 'PACK':            return 'bg-amber-500 text-white';
    case 'ÉDITION LIMITÉE': return 'bg-purple-500 text-white';
    default:                return 'bg-gray-500 text-white';
  }
};
