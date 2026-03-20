// ── Products (home) ───────────────────────────────────────────────────────────

export const section      = 'py-12 sm:py-16 md:py-24 bg-white';
export const container    = 'max-w-7xl mx-auto px-4 sm:px-6';
export const eyebrow      = 'text-gray-400 text-sm font-medium tracking-wider uppercase mb-4';
export const heading      = 'font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-dark leading-tight';
export const grid         = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8';
export const productLink  = 'group cursor-pointer block';
export const imgContainer = (bg: string) => `${bg} rounded-3xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 overflow-hidden relative h-48 sm:h-64 md:h-80 lg:h-96 flex items-center justify-center transition-transform duration-300 group-hover:scale-105`;
export const productImg   = 'w-full h-full object-contain drop-shadow-2xl';
export const promoBadge   = 'absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold';
export const infoWrapper  = 'text-center';
export const productName  = 'font-display font-semibold text-xl text-dark mb-2';
export const priceRow     = 'flex items-center justify-center space-x-2 mb-4';
export const price        = 'text-2xl font-bold text-dark';
export const oldPrice     = 'text-lg text-gray-400 line-through';
export const primaryBtn   = 'w-full bg-dark text-white py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all whitespace-nowrap cursor-pointer text-center';
export const secondaryBtn = 'w-full border-2 border-dark text-dark py-3 rounded-full font-semibold hover:bg-dark hover:text-white transition-all whitespace-nowrap cursor-pointer text-center';
export const deliveryNote = 'text-gray-400 text-xs mt-3';

export const categoryBg = (category: string) => {
  switch (category) {
    case 'girl':    return 'bg-pink-100';
    case 'boy':     return 'bg-sky-100';
    case 'adult':   return 'bg-stone-100';
    case 'medical': return 'bg-red-50';
    default:        return 'bg-yellow-100';
  }
};
