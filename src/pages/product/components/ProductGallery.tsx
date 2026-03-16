import { useState } from 'react';
import * as S from '../../../styles/ProductGallery.styles';

const colorHexMap: Record<string, string> = {
  Rose: '#f472b6',
  Violet: '#c084fc',
  Corail: '#fb923c',
  Bleu: '#38bdf8',
  Vert: '#4ade80',
  Noir: '#374151',
  Jaune: '#facc15',
  Blanc: '#f8fafc',
  Gris: '#9ca3af',
  Rouge: '#ef4444',
  'Rose Pâle': '#fbcfe8',
  Doré: '#fde047',
  'Bleu Marine': '#1e40af',
  'Vert Forêt': '#166534',
  'Vert Menthe': '#6ee7b7',
  Beige: '#fef3c7',
  Pastel: '#e9d5ff',
  Néon: '#a3e635',
  'Bleu Nuit': '#4338ca',
  'Gris Argent': '#94a3b8',
  'Noir Cosmos': '#0f172a',
  'Blanc Crème': '#fffbeb',
  'Gris Perle': '#cbd5e1',
  Nude: '#fed7aa',
  'Rouge Noël': '#b91c1c',
  Or: '#fbbf24',
  'Vert Sapin': '#14532d',
};

interface ProductGalleryProps {
  image: string;
  name: string;
  category: string;
  selectedColor?: string;
}

const getCategoryBg = S.categoryBg;

const getExtraImages = (image: string, category: string): string[] => {
  const seqMap: Record<string, string[]> = {
    boy: [
      image,
      'https://readdy.ai/api/search-image?query=Blue%20silicone%20QR%20code%20bracelet%20for%20boys%20close%20up%20detail%20showing%20QR%20code%20chip%20texture%2C%20product%20photography%20on%20soft%20blue%20gradient%20background%2C%20minimalist%20style%2C%20high%20quality%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod2-thumb2&orientation=portrait',
      'https://readdy.ai/api/search-image?query=Child%20wearing%20blue%20silicone%20QR%20code%20safety%20bracelet%20on%20wrist%2C%20lifestyle%20photo%2C%20soft%20blue%20background%2C%20minimalist%20style%2C%20high%20quality%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod2-thumb3&orientation=portrait',
    ],
    girl: [
      image,
      'https://readdy.ai/api/search-image?query=Pink%20silicone%20QR%20code%20bracelet%20for%20girls%20close%20up%20detail%20showing%20QR%20code%20chip%20texture%2C%20product%20photography%20on%20soft%20pink%20gradient%20background%2C%20minimalist%20style%2C%20high%20quality%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod1-thumb2&orientation=portrait',
      'https://readdy.ai/api/search-image?query=Child%20wearing%20pink%20silicone%20QR%20code%20safety%20bracelet%20on%20wrist%2C%20lifestyle%20photo%2C%20soft%20pink%20background%2C%20minimalist%20style%2C%20high%20quality%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod1-thumb3&orientation=portrait',
    ],
    unisex: [
      image,
      'https://readdy.ai/api/search-image?query=Yellow%20silicone%20QR%20code%20bracelet%20for%20children%20close%20up%20detail%20showing%20QR%20code%20chip%20texture%2C%20product%20photography%20on%20soft%20yellow%20gradient%20background%2C%20minimalist%20style%2C%20high%20quality%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod3-thumb2&orientation=portrait',
      'https://readdy.ai/api/search-image?query=Child%20wearing%20yellow%20silicone%20QR%20code%20safety%20bracelet%20on%20wrist%2C%20lifestyle%20photo%2C%20soft%20yellow%20background%2C%20minimalist%20style%2C%20high%20quality%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod3-thumb3&orientation=portrait',
    ],
  };
  return seqMap[category] ?? [image, image, image];
};

const ProductGallery = ({ image, name, category, selectedColor }: ProductGalleryProps) => {
  const overlayColor = selectedColor && selectedColor !== 'Arc-en-Ciel'
    ? colorHexMap[selectedColor]
    : undefined;
  const images = getExtraImages(image, category);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const currentImage = images[selectedIndex];

  return (
    <div className={S.wrapper}>
      <div
        className={S.mainImgContainer(getCategoryBg(category))}
        style={{ height: 480 }}
        onClick={() => setZoomed(true)}
      >
        <img
          key={currentImage}
          src={currentImage}
          alt={name}
          className={S.mainImg}
        />
        {overlayColor && (
          <div
            className={S.colorOverlay}
            style={{ backgroundColor: overlayColor, mixBlendMode: 'color', opacity: 0.45 }}
          />
        )}
        {selectedColor === 'Arc-en-Ciel' && (
          <div
            className={S.colorOverlay}
            style={{
              background: 'linear-gradient(135deg, #f472b6 0%, #facc15 33%, #4ade80 66%, #38bdf8 100%)',
              mixBlendMode: 'color',
              opacity: 0.45,
            }}
          />
        )}
        <div className={S.zoomHint}>
          <i className="ri-zoom-in-line"></i> Agrandir
        </div>
      </div>

      {/* Thumbnails */}
      <div className={S.thumbnailRow}>
        {images.map((img, i) => (
          <div
            key={i}
            onClick={() => setSelectedIndex(i)}
            className={S.thumbnail(getCategoryBg(category), selectedIndex === i)}
          >
            <img src={img} alt={`${name} vue ${i + 1}`} className={S.thumbnailImg} />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {zoomed && (
        <div className={S.lightbox} onClick={() => setZoomed(false)}>
          <div className={S.lightboxContent(getCategoryBg(category))}>
            <img src={currentImage} alt={name} className={S.lightboxImg} />
          </div>
          <button className={S.lightboxClose}>
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
