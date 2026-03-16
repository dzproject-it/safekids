import * as S from '../../../styles/Footer.styles';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={S.footer}>
      <div className={S.container}>
        <div className={S.grid}>
          {/* Brand Column */}
          <div className={S.brandCol}>
            <div className={S.brandLogo}>
              <div className={S.brandLogoIcon}>
                <i className="ri-qr-code-line text-white text-2xl"></i>
              </div>
              <span className={S.brandName}>QR Kids</span>
            </div>
            <p className={S.brandDesc}>
              La solution innovante pour la sécurité de vos enfants. Des bracelets QR Code personnalisables qui vous apportent la tranquillité d'esprit au quotidien.
            </p>
            <div className={S.socialRow}>
              <a href="#" className={S.socialLink}><i className="ri-facebook-fill text-lg"></i></a>
              <a href="#" className={S.socialLink}><i className="ri-instagram-line text-lg"></i></a>
              <a href="#" className={S.socialLink}><i className="ri-twitter-x-line text-lg"></i></a>
              <a href="#" className={S.socialLink}><i className="ri-youtube-fill text-lg"></i></a>
            </div>
          </div>

          {/* Address Column */}
          <div className={S.colAddr}>
            <h4 className={S.colHeading}>ADRESSE</h4>
            <p className={S.colText}>
              123 Avenue de la Sécurité<br />
              75001 Paris, France
            </p>
          </div>

          {/* Contact Column */}
          <div className={S.colContact}>
            <h4 className={S.colHeading}>CONTACT</h4>
            <div className="space-y-2">
              <a href="tel:+33123456789" className={S.contactLink}>
                <i className="ri-phone-line"></i>
                <span className="text-sm">+33 1 23 45 67 89</span>
              </a>
              <a href="mailto:contact@qrkids.fr" className={S.contactLink}>
                <i className="ri-mail-line"></i>
                <span className="text-sm">contact@qrkids.fr</span>
              </a>
            </div>
          </div>

          {/* Image Column */}
          <div className={S.colImg}>
            <div className={S.imgWrapper}>
              <img
                src="https://readdy.ai/api/search-image?query=Colorful%20children%20safety%20bracelet%20with%20QR%20code%20close-up%20product%20shot%2C%20modern%20wearable%20technology%2C%20vibrant%20colors%2C%20professional%20product%20photography%2C%20clean%20background%2C%20high%20quality%20detail%20shot%2C%20safety%20device%20for%20kids&width=400&height=300&seq=footer1&orientation=portrait"
                alt="Bracelet QR Code"
                className={S.imgEl}
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={S.bottomBar}>
          <div className={S.bottomRow}>
            <p className={S.copyright}>
              © {currentYear} QR Kids. Tous droits réservés.
            </p>
            <div className={S.legalLinks}>
              <a href="#" className={S.legalLink}>Conditions Générales</a>
              <a href="#" className={S.legalLink}>Confidentialité</a>
              <a href="#" className={S.legalLink}>Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;