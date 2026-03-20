// ── Hero ──────────────────────────────────────────────────────────────────────

export const section         = 'relative h-screen min-h-[640px] sm:min-h-[800px] md:min-h-[1024px] w-full overflow-hidden';
export const nav             = (scrolled: boolean) => `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`;
export const navContainer    = 'max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between';
export const logoWrapper     = 'flex items-center space-x-2';
export const logoIcon        = 'w-10 h-10 bg-primary rounded-full flex items-center justify-center';
export const logoText        = (scrolled: boolean) => `font-display font-bold text-xl ${scrolled ? 'text-dark' : 'text-white'}`;
export const navLinks        = (scrolled: boolean) => `hidden md:flex items-center space-x-8 ${scrolled ? 'text-dark' : 'text-white'}`;
export const navLink         = 'hover:text-primary transition-colors cursor-pointer';
export const navLinkShop     = (scrolled: boolean) => `hover:text-primary transition-colors cursor-pointer font-medium ${scrolled ? 'text-dark' : 'text-white'}`;
export const orderBtn        = 'px-6 py-2 bg-primary text-white rounded-full hover:bg-opacity-90 transition-all whitespace-nowrap cursor-pointer';
export const menuBtn         = 'md:hidden cursor-pointer';
export const menuIcon        = (scrolled: boolean) => `ri-menu-line text-2xl ${scrolled ? 'text-dark' : 'text-white'}`;
export const bgWrapper       = 'absolute inset-0';
export const bgImg           = 'w-full h-full object-cover object-top';
export const bgOverlay       = 'absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40';
export const contentWrapper  = 'relative h-full flex items-center justify-center';
export const content         = 'w-full max-w-4xl mx-auto px-4 sm:px-6 text-center';
export const heading         = 'font-display font-black text-white text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight mb-4 md:mb-6';
export const subheading      = 'font-display italic text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-6 md:mb-8 opacity-90';
export const description     = 'text-white text-base md:text-lg lg:text-xl mb-8 md:mb-12 opacity-90 max-w-2xl mx-auto leading-relaxed px-2';
export const heroBtn         = 'inline-flex items-center space-x-2 sm:space-x-3 bg-white text-dark px-5 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-xs sm:text-sm md:text-lg hover:shadow-2xl transition-all transform hover:scale-105 whitespace-nowrap cursor-pointer';
export const heroBtnIcon     = 'w-10 h-10 bg-primary rounded-full flex items-center justify-center';
export const scrollIndicator = 'absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce';

// ── Menu mobile ──
export const mobileMenu      = (open: boolean) => `md:hidden fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-6 transition-all duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`;
export const mobileMenuLink  = 'text-dark text-xl font-medium hover:text-primary transition-colors cursor-pointer';
export const mobileMenuBtn   = 'px-8 py-3 bg-primary text-white rounded-full font-semibold text-lg cursor-pointer';
export const mobileCloseBtn  = 'absolute top-5 right-6 text-dark text-3xl cursor-pointer';
