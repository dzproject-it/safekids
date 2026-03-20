// ── ProductGallery ────────────────────────────────────────────────────────────

export const wrapper          = 'flex flex-col gap-4';
export const mainImgContainer = (bg: string) => `${bg} rounded-3xl overflow-hidden relative flex items-center justify-center cursor-zoom-in h-64 sm:h-80 md:h-[420px] lg:h-[480px]`;
export const mainImg          = 'w-full h-full object-contain drop-shadow-2xl transition-all duration-300 hover:scale-105';
export const zoomHint         = 'absolute bottom-4 right-4 bg-white/80 rounded-full px-3 py-1 flex items-center gap-1 text-xs text-gray-600';
export const thumbnailRow     = 'flex gap-3';
export const thumbnail        = (bg: string, selected: boolean) => `${bg} rounded-xl overflow-hidden w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center cursor-pointer border-2 transition-all ${selected ? 'border-gray-800 scale-105 shadow-md' : 'border-transparent hover:border-gray-400'}`;
export const thumbnailImg     = 'w-full h-full object-contain p-2';
export const lightbox         = 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 sm:p-8';
export const lightboxContent  = (bg: string) => `${bg} rounded-3xl p-8 max-w-lg w-full`;
export const lightboxImg      = 'w-full h-auto object-contain drop-shadow-2xl';
export const lightboxClose    = 'absolute top-6 right-6 text-white text-4xl cursor-pointer';
export const colorOverlay     = 'absolute inset-0 rounded-3xl pointer-events-none transition-all duration-500';

export const categoryBg = (category: string) => {
  switch (category) {
    case 'girl':    return 'bg-pink-100';
    case 'boy':     return 'bg-blue-100';
    case 'adult':   return 'bg-stone-100';
    case 'medical': return 'bg-red-50';
    default:        return 'bg-yellow-100';
  }
};
