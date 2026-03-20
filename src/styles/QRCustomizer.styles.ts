import type { QRType } from '../services/api';

// ── Wrapper général ──────────────────────────────────────────
export const wrapper = 'bg-gray-50 rounded-3xl p-4 sm:p-6 md:p-8';

// ── Header ───────────────────────────────────────────────────
export const header = 'flex items-center gap-3 mb-6';
export const headerIcon = 'w-10 h-10 flex items-center justify-center bg-dark rounded-full';
export const headerTitle = 'font-display font-bold text-lg text-dark';
export const headerSubtitle = 'text-gray-400 text-xs';

// ── Layout 2 colonnes ─────────────────────────────────────────
export const layout = 'flex flex-col lg:flex-row gap-6 lg:gap-8';
export const formColumn = 'flex-1 min-w-0';
export const previewColumn = 'lg:w-64 flex-shrink-0 flex flex-col items-center justify-start';

// ── Sélecteur de type ─────────────────────────────────────────
export const typeGrid = 'grid grid-cols-2 gap-3 mb-6';
export const typeBtn = (active: boolean) =>
  `flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
    active
      ? 'bg-dark text-white shadow-md'
      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
  }`;

// ── Formulaire ────────────────────────────────────────────────
export const fieldGroup = 'space-y-4';
export const fieldGrid2 = 'grid grid-cols-1 sm:grid-cols-2 gap-4';
export const label = 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block';
export const input = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-800 bg-white';
export const inputSelect = `${input} cursor-pointer`;
export const inputTextarea = `${input} resize-none`;
export const inputLinkWrapper = 'relative';
export const inputLinkPrefix = 'absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm';
export const inputLink = 'w-full border border-gray-200 rounded-xl pl-20 pr-4 py-3 text-sm focus:outline-none focus:border-gray-800 bg-white';
export const charCount = 'text-xs text-gray-400 text-right mt-1';
export const linkHint = 'text-xs text-gray-400 mt-2';

// ── Section médicale dépliable ────────────────────────────────
export const medicalToggle = (open: boolean) =>
  `w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer mt-2 ${
    open
      ? 'bg-rose-50 text-rose-700 border border-rose-200'
      : 'bg-gray-100 text-gray-500 border border-gray-200 hover:border-gray-400'
  }`;
export const medicalBadge = 'ml-auto text-[10px] uppercase tracking-wider font-semibold bg-white/60 px-2 py-0.5 rounded-full';
export const medicalSection = 'space-y-4 bg-rose-50/40 border border-rose-100 rounded-xl p-4 mt-1';

// ── Bouton Sauvegarder ────────────────────────────────────────
export const saveBtn = (saved: boolean, disabled: boolean) =>
  `w-full mt-6 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  } ${saved ? 'bg-green-500 text-white' : 'bg-dark text-white hover:bg-opacity-90'}`;
export const saveBtnSpinner = 'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin';
export const saveError = 'mt-4 text-red-500 text-xs text-center';
export const footerNote = 'text-center text-xs text-gray-400 mt-6';
export const addToCartBtn = 'w-full mt-3 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 bg-primary text-white hover:bg-pink-600 shadow-md';

// ── Aperçu QR Code ────────────────────────────────────────────
export const previewCard = 'w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center gap-4 lg:sticky lg:top-24';
export const previewTitle = 'text-xs font-semibold text-gray-500 uppercase tracking-wide';
export const previewImgWrapper = 'relative w-48 h-48 flex items-center justify-center';
export const previewImg = 'w-full h-full rounded-xl';
export const previewEmpty = 'w-full h-full rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2';
export const previewEmptyIcon = 'ri-qr-code-line text-4xl text-gray-300';
export const previewEmptyText = 'text-xs text-gray-400 text-center px-4';
export const previewSummary = 'w-full space-y-1 border-t border-gray-100 pt-3';
export const previewSummaryLine = 'text-xs text-gray-600 truncate';
export const previewSummaryLineClamp = 'text-xs text-gray-600 line-clamp-3';
export const previewFooter = 'text-xs text-gray-400 text-center leading-relaxed';
export const previewFooterProductName = 'font-medium text-gray-600';

// ── Utilitaire : classe du bouton de type selon état ─────────
export const typeBtnIcon = (icon: string) => `${icon} text-base`;

// Ré-export du type pour éviter un import croisé dans le composant
export type { QRType };
