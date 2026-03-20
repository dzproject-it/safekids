import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { saveQRProfile } from '../../../services/api';
import * as S from '../../../styles/QRCustomizer.styles';

// ── Types ───────────────────────────────────────────────────────────────────

interface QRCustomizerProps {
  productName: string;
  productId?: number;
  onAddToCart?: () => void;
}

type QRTypeLocal = S.QRType;

interface ContactData {
  parentName: string;
  phone1: string;
  phone2: string;
  address: string;
}

interface MedicalData {
  childName: string;
  birthDate: string;
  bloodType: string;
  allergies: string;
  doctor: string;
  doctorPhone: string;
}

// ── Helper : construit le contenu encodé dans le QR Code ────────────────────

function buildMedicalNote(m: MedicalData): string {
  const parts = [
    m.childName   ? `Enfant : ${m.childName}` : '',
    m.birthDate   ? `Né(e) le : ${m.birthDate}` : '',
    m.bloodType   ? `Groupe sanguin : ${m.bloodType}` : '',
    m.allergies   ? `Allergies : ${m.allergies}` : '',
    m.doctor      ? `Médecin : ${m.doctor}` : '',
    m.doctorPhone ? `Tél. médecin : ${m.doctorPhone}` : '',
  ].filter(Boolean);
  return parts.length > 0 ? parts.join('\\n') : '';
}

function buildQRContent(
  qrType: QRTypeLocal,
  contactData: ContactData,
  medicalData: MedicalData,
  textData: string,
): string {
  switch (qrType) {
    case 'contact': {
      const medNote = buildMedicalNote(medicalData);
      const noteLines = [
        '⚠️ BRACELET SAFEKIDS ⚠️',
        contactData.parentName ? `Contact : ${contactData.parentName}` : '',
        contactData.phone1 ? `Tél : ${contactData.phone1}` : '',
        contactData.phone2 ? `Tél 2 : ${contactData.phone2}` : '',
        contactData.address ? `Adresse : ${contactData.address}` : '',
        medNote ? `\\n--- FICHE MÉDICALE ---\\n${medNote}` : '',
      ].filter(Boolean).join('\\n');

      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${contactData.parentName || 'Parent/Tuteur'}`,
        medicalData.childName ? `ORG:SafeKids - ${medicalData.childName}` : 'ORG:SafeKids',
        contactData.phone1 ? `TEL;TYPE=CELL:${contactData.phone1}` : '',
        contactData.phone2 ? `TEL;TYPE=WORK:${contactData.phone2}` : '',
        contactData.address ? `ADR:;;${contactData.address};;;;` : '',
        `NOTE:${noteLines}`,
        'END:VCARD',
      ].filter(Boolean).join('\n');
    }
    case 'text':
      return textData || 'Mon texte personnalisé';
    default:
      return '';
  }
}

// ── Composant ───────────────────────────────────────────────────────────────

const QRCustomizer = ({ productName, productId, onAddToCart }: QRCustomizerProps) => {
  const [qrType, setQrType]       = useState<QRTypeLocal>('contact');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const [contactData, setContactData] = useState<ContactData>({
    parentName: '', phone1: '', phone2: '', address: '',
  });

  const [medicalData, setMedicalData] = useState<MedicalData>({
    childName: '', birthDate: '', bloodType: '',
    allergies: '', doctor: '', doctorPhone: '',
  });

  const [textData, setTextData] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Régénère le QR Code en temps réel (debounce 300 ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const content = buildQRContent(qrType, contactData, medicalData, textData);
      if (!content.trim()) {
        setQrDataUrl('');
        return;
      }
      try {
        const url = await QRCode.toDataURL(content, {
          width: 240,
          margin: 2,
          color: { dark: '#111827', light: '#ffffff' },
          errorCorrectionLevel: 'M',
        });
        setQrDataUrl(url);
      } catch {
        setQrDataUrl('');
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [qrType, contactData, medicalData, textData]);

  const [showMedical, setShowMedical] = useState(false);

  const types: { id: QRTypeLocal; label: string; icon: string }[] = [
    { id: 'contact', label: 'Contact urgence',  icon: 'ri-phone-line' },
    { id: 'text',    label: 'Texte libre',       icon: 'ri-text' },
  ];

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);

    const payload: Record<string, string> =
      qrType === 'contact' ? { ...contactData, ...medicalData }
      : { text: textData };

    try {
      await saveQRProfile({ productId, qrType, payload });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const isEmpty = buildQRContent(qrType, contactData, medicalData, textData).trim() === '';

  // ── Rendu ────────────────────────────────────────────────────────────────

  return (
    <div className={S.wrapper}>

      {/* En-tête */}
      <div className={S.header}>
        <div className={S.headerIcon}>
          <i className="ri-qr-code-line text-white text-xl"></i>
        </div>
        <div>
          <h3 className={S.headerTitle}>Personnalisez votre QR Code</h3>
          <p className={S.headerSubtitle}>Aperçu en temps réel · {productName}</p>
        </div>
      </div>

      {/* Layout 2 colonnes */}
      <div className={S.layout}>

        {/* ── Colonne formulaire ── */}
        <div className={S.formColumn}>

          {/* Sélecteur de type */}
          <div className={S.typeGrid}>
            {types.map((t) => (
              <button key={t.id} onClick={() => setQrType(t.id)} className={S.typeBtn(qrType === t.id)}>
                <i className={S.typeBtnIcon(t.icon)}></i>
                {t.label}
              </button>
            ))}
          </div>

          {/* Formulaire Contact + Médical fusionné */}
          {qrType === 'contact' && (
            <div className={S.fieldGroup}>
              <div>
                <label className={S.label}>Nom du parent / tuteur</label>
                <input type="text" value={contactData.parentName} placeholder="Ex : Marie Dupont"
                  onChange={(e) => setContactData({ ...contactData, parentName: e.target.value })}
                  className={S.input} />
              </div>
              <div>
                <label className={S.label}>Téléphone principal</label>
                <input type="tel" value={contactData.phone1} placeholder="Ex : +33 6 12 34 56 78"
                  onChange={(e) => setContactData({ ...contactData, phone1: e.target.value })}
                  className={S.input} />
              </div>
              <div>
                <label className={S.label}>Téléphone secondaire</label>
                <input type="tel" value={contactData.phone2} placeholder="Ex : +33 6 98 76 54 32"
                  onChange={(e) => setContactData({ ...contactData, phone2: e.target.value })}
                  className={S.input} />
              </div>
              <div>
                <label className={S.label}>Adresse du domicile</label>
                <input type="text" value={contactData.address} placeholder="Ex : 12 rue des Lilas, 75001 Paris"
                  onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                  className={S.input} />
              </div>

              {/* Section médicale dépliable */}
              <button type="button" onClick={() => setShowMedical(!showMedical)} className={S.medicalToggle(showMedical)}>
                <i className={`ri-heart-pulse-line text-base ${showMedical ? 'text-rose-500' : 'text-gray-400'}`}></i>
                <span>Fiche médicale</span>
                <span className={S.medicalBadge}>Facultatif</span>
                <i className={`ri-arrow-down-s-line text-lg transition-transform ${showMedical ? 'rotate-180' : ''}`}></i>
              </button>

              {showMedical && (
                <div className={S.medicalSection}>
                  <div>
                    <label className={S.label}>Prénom de l'enfant</label>
                    <input type="text" value={medicalData.childName} placeholder="Ex : Léa"
                      onChange={(e) => setMedicalData({ ...medicalData, childName: e.target.value })}
                      className={S.input} />
                  </div>
                  <div>
                    <label className={S.label}>Date de naissance</label>
                    <input type="date" value={medicalData.birthDate}
                      onChange={(e) => setMedicalData({ ...medicalData, birthDate: e.target.value })}
                      className={S.input} />
                  </div>
                  <div>
                    <label className={S.label}>Groupe sanguin</label>
                    <select value={medicalData.bloodType}
                      onChange={(e) => setMedicalData({ ...medicalData, bloodType: e.target.value })}
                      className={S.inputSelect}>
                      <option value="">Sélectionner...</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={S.label}>Allergies connues</label>
                    <input type="text" value={medicalData.allergies} placeholder="Ex : Arachides, pénicilline..."
                      onChange={(e) => setMedicalData({ ...medicalData, allergies: e.target.value })}
                      className={S.input} />
                  </div>
                  <div>
                    <label className={S.label}>Médecin traitant</label>
                    <input type="text" value={medicalData.doctor} placeholder="Dr. Martin"
                      onChange={(e) => setMedicalData({ ...medicalData, doctor: e.target.value })}
                      className={S.input} />
                  </div>
                  <div>
                    <label className={S.label}>Téléphone médecin</label>
                    <input type="tel" value={medicalData.doctorPhone} placeholder="+33 1 23 45 67 89"
                      onChange={(e) => setMedicalData({ ...medicalData, doctorPhone: e.target.value })}
                      className={S.input} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Formulaire Texte */}
          {qrType === 'text' && (
            <div>
              <label className={S.label}>Votre message</label>
              <textarea rows={5} value={textData} placeholder="Écrivez le texte qui apparaîtra lors du scan du QR Code..."
                onChange={(e) => { if (e.target.value.length <= 500) setTextData(e.target.value); }}
                className={S.inputTextarea} />
              <p className={S.charCount}>{textData.length}/500</p>
            </div>
          )}

          {/* Bouton Sauvegarder */}
          {saveError && <p className={S.saveError}>{saveError}</p>}
          <button onClick={handleSave} disabled={saving || isEmpty} className={S.saveBtn(saved, saving || isEmpty)}>
            {saving ? (
              <><div className={S.saveBtnSpinner}></div> Sauvegarde...</>
            ) : saved ? (
              <><i className="ri-check-line text-lg"></i> Informations sauvegardées !</>
            ) : (
              <><i className="ri-save-line text-lg"></i> Sauvegarder la personnalisation</>
            )}
          </button>

          {/* Bouton Ajouter au panier — visible après sauvegarde */}
          {saved && onAddToCart && (
            <button onClick={onAddToCart} className={S.addToCartBtn}>
              <i className="ri-shopping-bag-line text-lg"></i> Ajouter au panier
            </button>
          )}
        </div>

        {/* ── Colonne aperçu QR Code ── */}
        <div className={S.previewColumn}>
          <div className={S.previewCard}>
            <p className={S.previewTitle}>Aperçu QR Code</p>

            <div className={S.previewImgWrapper}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Aperçu QR Code" className={S.previewImg} />
              ) : (
                <div className={S.previewEmpty}>
                  <i className={S.previewEmptyIcon}></i>
                  <p className={S.previewEmptyText}>Remplissez le formulaire pour voir l'aperçu</p>
                </div>
              )}
            </div>

            {/* Résumé des données */}
            {qrDataUrl && (
              <div className={S.previewSummary}>
                {qrType === 'contact' && (<>
                  {contactData.parentName && <p className={S.previewSummaryLine}><span className="font-semibold">👤</span> {contactData.parentName}</p>}
                  {contactData.phone1     && <p className={S.previewSummaryLine}><span className="font-semibold">📞</span> {contactData.phone1}</p>}
                  {contactData.address    && <p className={S.previewSummaryLine}><span className="font-semibold">📍</span> {contactData.address}</p>}
                  {medicalData.childName  && <p className={S.previewSummaryLine}><span className="font-semibold">👦</span> {medicalData.childName}</p>}
                  {medicalData.bloodType  && <p className={S.previewSummaryLine}><span className="font-semibold">🩸</span> {medicalData.bloodType}</p>}
                  {medicalData.allergies  && <p className={S.previewSummaryLine}><span className="font-semibold">⚠️</span> {medicalData.allergies}</p>}
                </>)}
                {qrType === 'text' && <p className={S.previewSummaryLineClamp}>{textData}</p>}
              </div>
            )}

            <p className={S.previewFooter}>
              Ce QR Code sera intégré dans votre bracelet{' '}
              <span className={S.previewFooterProductName}>{productName}</span>.
            </p>
          </div>
        </div>

      </div>

      <p className={S.footerNote}>
        Vous pourrez modifier ces informations à tout moment depuis votre espace client.
      </p>
    </div>
  );
};

export default QRCustomizer;
