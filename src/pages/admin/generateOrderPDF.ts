import QRCode from 'qrcode';
import type { AdminOrderDetail } from '../../services/api';

/**
 * Reconstruit le contenu vCard / texte à partir du payload QR stocké en base.
 */
function buildQRContentFromPayload(qrType: string, payload: Record<string, unknown>): string {
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
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${payload.parentName || 'Parent/Tuteur'}`,
      payload.childName ? `ORG:SafeKids - ${payload.childName}` : 'ORG:SafeKids',
      payload.phone1  ? `TEL;TYPE=CELL:${payload.phone1}` : '',
      payload.phone2  ? `TEL;TYPE=WORK:${payload.phone2}` : '',
      payload.address ? `ADR:;;${payload.address};;;;` : '',
      `NOTE:${noteLines}`,
      'END:VCARD',
    ].filter(Boolean).join('\n');
  }
  if (qrType === 'text' && payload.text) {
    return String(payload.text);
  }
  // Fallback: JSON des infos
  return Object.entries(payload).map(([k, v]) => `${k}: ${v}`).join('\n');
}

const STATUS_FR: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Génère un PDF pour un seul article d'une commande.
 */
async function generateSingleItemPDF(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsPDF: any,
  order: AdminOrderDetail,
  item: AdminOrderDetail['items'][number],
  itemIndex: number,
  totalItems: number,
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const marginL = 20;
  const marginR = 20;
  const contentW = pageW - marginL - marginR;
  let y = 20;

  const orderNum = String(order.id).padStart(5, '0');
  const articleLabel = totalItems > 1 ? ` — Article ${itemIndex + 1}/${totalItems}` : '';

  // ── Header band ──────────────────────────────────────────────
  doc.setFillColor(30, 30, 30);
  doc.rect(0, 0, pageW, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SafeKids', marginL, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Bracelets QR de sécurité pour enfants', marginL, 26);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`BON DE COMMANDE`, pageW - marginR, 18, { align: 'right' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${orderNum}${articleLabel}`, pageW - marginR, 26, { align: 'right' });
  doc.text(fmtDate(order.createdAt), pageW - marginR, 33, { align: 'right' });

  y = 50;

  // ── Client info ──────────────────────────────────────────────
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', marginL, y);

  y += 5;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (order.customerName) {
    doc.text(order.customerName, marginL, y);
    y += 5;
  }
  if (order.customerEmail) {
    doc.text(order.customerEmail, marginL, y);
    y += 5;
  }

  // Statut
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUT', pageW / 2, 50);
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(STATUS_FR[order.status] || order.status, pageW / 2, 55);

  y = Math.max(y, 65) + 5;

  // ── Line separator ───────────────────────────────────────────
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  doc.line(marginL, y, pageW - marginR, y);
  y += 8;

  // ── Table header ─────────────────────────────────────────────
  const cols = {
    name: marginL,
    color: marginL + contentW * 0.40,
    size: marginL + contentW * 0.55,
    qty: marginL + contentW * 0.65,
    unit: marginL + contentW * 0.75,
    total: pageW - marginR,
  };

  doc.setFillColor(248, 248, 248);
  doc.rect(marginL, y - 4, contentW, 8, 'F');

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('ARTICLE', cols.name, y);
  doc.text('COULEUR', cols.color, y);
  doc.text('TAILLE', cols.size, y);
  doc.text('QTÉ', cols.qty, y);
  doc.text('P.U.', cols.unit, y);
  doc.text('TOTAL', cols.total, y, { align: 'right' });

  y += 8;

  // ── Single item row ──────────────────────────────────────────
  const lineTotal = item.unitPrice * item.quantity;
  const name = item.name.length > 35 ? item.name.substring(0, 35) + '…' : item.name;

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(name, cols.name, y);
  doc.text(item.color || '—', cols.color, y);
  doc.text(item.size || '—', cols.size, y);
  doc.text(String(item.quantity), cols.qty, y);
  doc.text(fmt(item.unitPrice), cols.unit, y);
  doc.setFont('helvetica', 'bold');
  doc.text(fmt(lineTotal), cols.total, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  y += 6;
  doc.setDrawColor(240, 240, 240);
  doc.setLineWidth(0.2);
  doc.line(marginL, y - 2, pageW - marginR, y - 2);

  y += 4;

  // ── Total ────────────────────────────────────────────────────
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.5);
  doc.line(marginL + contentW * 0.6, y, pageW - marginR, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL TTC', marginL + contentW * 0.6, y);
  doc.setFontSize(13);
  doc.setTextColor(232, 72, 107);
  doc.text(fmt(lineTotal), pageW - marginR, y, { align: 'right' });

  // ── QR Profile section ───────────────────────────────────────
  if (order.qrProfile) {
    y += 15;
    if (y > 240) { doc.addPage(); y = 20; }

    doc.setFillColor(240, 245, 255);
    doc.rect(marginL, y - 4, contentW, 8, 'F');
    doc.setTextColor(60, 80, 120);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS QR CODE', marginL + 2, y);
    y += 8;

    const payload = order.qrProfile.payload;

    const qrContent = buildQRContentFromPayload(order.qrProfile.qrType, payload);
    let qrImageDataUrl = '';
    try {
      qrImageDataUrl = await QRCode.toDataURL(qrContent, {
        width: 400,
        margin: 2,
        color: { dark: '#111827', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
    } catch { /* ignore */ }

    const qrImgSize = 40;
    const textAreaW = contentW - qrImgSize - 10;
    const textStartY = y;

    const CONTACT_LABELS: Record<string, string> = {
      parentName: 'Parent / Tuteur',
      phone1: 'Téléphone principal',
      phone2: 'Téléphone secondaire',
      address: 'Adresse',
    };

    const MEDICAL_LABELS: Record<string, string> = {
      childName: "Prénom de l'enfant",
      birthDate: 'Date de naissance',
      bloodType: 'Groupe sanguin',
      allergies: 'Allergies',
      doctor: 'Médecin traitant',
      doctorPhone: 'Téléphone médecin',
    };

    const contactEntries = Object.entries(CONTACT_LABELS).filter(([k]) => payload[k]);
    if (contactEntries.length > 0) {
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTACT D\'URGENCE', marginL, y);
      y += 5;

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const maxValW = textAreaW - 45;
      for (const [key, label] of contactEntries) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.text(`${label} :`, marginL, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(payload[key]), marginL + 45, y, { maxWidth: maxValW });
        y += 5;
      }
    }

    const medicalEntries = Object.entries(MEDICAL_LABELS).filter(([k]) => payload[k]);
    if (medicalEntries.length > 0) {
      y += 3;
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('FICHE MÉDICALE', marginL, y);
      y += 5;

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const maxMedValW = textAreaW - 45;
      for (const [key, label] of medicalEntries) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.text(`${label} :`, marginL, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(payload[key]), marginL + 45, y, { maxWidth: maxMedValW });
        y += 5;
      }
    }

    if (contactEntries.length === 0 && medicalEntries.length === 0) {
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      for (const [key, value] of Object.entries(payload)) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`${key} : ${value}`, marginL, y);
        y += 5;
      }
    }

    if (qrImageDataUrl) {
      const qrX = pageW - marginR - qrImgSize;
      const qrY = textStartY - 2;
      doc.addImage(qrImageDataUrl, 'PNG', qrX, qrY, qrImgSize, qrImgSize);
      const qrBottom = qrY + qrImgSize + 4;
      if (y < qrBottom) y = qrBottom;
    }
  }

  // ── Footer ───────────────────────────────────────────────────
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  doc.line(marginL, footerY - 5, pageW - marginR, footerY - 5);

  doc.setTextColor(160, 160, 160);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('SafeKids — Bracelets QR de sécurité pour enfants', marginL, footerY);
  doc.text(`Généré le ${fmtDate(new Date().toISOString())}`, pageW - marginR, footerY, { align: 'right' });

  // ── Save ─────────────────────────────────────────────────────
  const suffix = totalItems > 1 ? `-article-${itemIndex + 1}` : '';
  doc.save(`bon-commande-${orderNum}${suffix}.pdf`);
}

/**
 * Génère un bon de commande PDF par article de la commande.
 * S'il n'y a qu'un seul article, un seul PDF est généré (comportement identique à avant).
 * S'il y en a plusieurs, un PDF est téléchargé pour chaque article.
 */
export async function generateOrderPDF(order: AdminOrderDetail) {
  const { default: jsPDF } = await import('jspdf');
  const total = order.items.length;

  for (let i = 0; i < total; i++) {
    await generateSingleItemPDF(jsPDF, order, order.items[i], i, total);
    // Petit délai entre les téléchargements pour éviter que le navigateur bloque
    if (i < total - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
}
