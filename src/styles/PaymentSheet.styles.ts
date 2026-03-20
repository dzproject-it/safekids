// ── PaymentSheet ──────────────────────────────────────────────────────────────

export const wrapper       = 'flex flex-col h-full';
export const header        = 'flex items-center gap-3 px-6 py-5 border-b border-gray-100';
export const backBtn       = 'w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all cursor-pointer text-gray-500';
export const title         = 'font-display font-bold text-base text-dark';
export const closeBtn      = 'w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all cursor-pointer ml-auto';
export const body          = 'flex-1 overflow-y-auto px-6 py-5 space-y-5';

export const summary       = 'bg-gray-50 rounded-2xl p-4 space-y-2';
export const summaryRow    = 'flex justify-between text-sm text-gray-500';
export const summaryTotal  = 'flex justify-between font-bold text-dark text-lg pt-2 border-t border-gray-200';

export const section       = 'space-y-3';
export const sectionTitle  = 'text-xs font-bold uppercase tracking-wider text-gray-400';

export const walletArea    = 'space-y-3';
export const walletBtn     = 'w-full py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 border-2 disabled:opacity-50 disabled:cursor-not-allowed';
export const applePayBtn   = 'bg-black text-white border-black hover:bg-gray-900';
export const googlePayBtn  = 'bg-white text-dark border-gray-200 hover:border-gray-400';
export const paypalBtn     = 'bg-[#0070BA] text-white border-[#0070BA] hover:bg-[#005C99]';
export const walletIcon    = 'w-5 h-5 flex items-center justify-center';
export const divider       = 'flex items-center gap-3 text-xs text-gray-400';
export const dividerLine   = 'flex-1 h-px bg-gray-200';

export const stripeArea    = 'space-y-3';
export const stripeElement = 'border border-gray-200 rounded-xl px-4 py-3 bg-white focus-within:border-gray-800 transition-colors';

export const footer        = 'px-6 py-5 border-t border-gray-100 space-y-3';
export const payBtn        = (disabled: boolean) => `w-full py-4 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${disabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-dark text-white hover:bg-primary cursor-pointer'}`;
export const spinner       = 'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin';
export const errorMsg      = 'text-red-500 text-xs text-center';
export const secureNote    = 'text-center text-xs text-gray-400 flex items-center justify-center gap-1';

export const successBox    = 'flex flex-col items-center justify-center h-full text-center gap-4 px-6';
export const successIcon   = 'w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center';
export const successTitle  = 'font-display font-bold text-xl text-dark';
export const successText   = 'text-sm text-gray-500 max-w-xs';
export const successBtn    = 'px-8 py-3 bg-dark text-white rounded-full font-semibold text-sm hover:bg-primary transition-all cursor-pointer';
