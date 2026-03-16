// ── Hero ──────────────────────────────────────────────────────────────────────

export const section         = 'relative h-screen min-h-[1024px] w-full overflow-hidden';
export const nav             = (scrolled: boolean) => `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`;
export const navContainer    = 'max-w-7xl mx-auto px-6 py-4 flex items-center justify-between';
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
export const content         = 'w-full max-w-4xl mx-auto px-6 text-center';
export const heading         = 'font-display font-black text-white text-6xl md:text-7xl lg:text-8xl leading-tight mb-6';
export const subheading      = 'font-display italic text-white text-3xl md:text-4xl mb-8 opacity-90';
export const description     = 'text-white text-lg md:text-xl mb-12 opacity-90 max-w-2xl mx-auto leading-relaxed';
export const heroBtn         = 'inline-flex items-center space-x-3 bg-white text-dark px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all transform hover:scale-105 whitespace-nowrap cursor-pointer';
export const heroBtnIcon     = 'w-10 h-10 bg-primary rounded-full flex items-center justify-center';
export const scrollIndicator = 'absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce';
