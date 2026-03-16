import * as S from '../../../styles/CTA.styles';

const CTA = () => {
  const handleOrder = () => {
    const section = document.getElementById('products');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={S.section}>
      {/* Background Image */}
      <div className={S.bgWrapper}>
        <img
          src="https://readdy.ai/api/search-image?query=Happy%20child%20wearing%20colorful%20safety%20bracelet%20at%20school%20playground%2C%20smiling%20kid%20in%20park%20setting%2C%20natural%20daylight%20photography%2C%20joyful%20expression%2C%20modern%20safety%20wearable%20technology%2C%20bright%20and%20positive%20atmosphere%2C%20lifestyle%20shot%20with%20bokeh%20background%2C%20professional%20photography&width=1920&height=800&seq=cta1&orientation=landscape"
          alt="Enfant heureux avec bracelet"
          className={S.bgImg}
        />
        <div className={S.bgOverlay}></div>
      </div>

      {/* Content */}
      <div className={S.content}>
        <h2 className={S.heading}>
          PROTÉGEZ CE QUI<br />COMPTE LE PLUS
        </h2>
        <p className={S.subtitle}>
          Rejoignez des milliers de parents qui ont choisi la tranquillité d'esprit avec nos bracelets QR Code intelligents.
        </p>
        <button
          onClick={handleOrder}
          className={S.btn}>
          <div className={S.btnIcon}>
            <i className="ri-shopping-cart-line text-white text-xl"></i>
          </div>
          <span>COMMANDER MAINTENANT</span>
          <i className="ri-arrow-right-up-line text-xl"></i>
        </button>
      </div>
    </section>
  );
};

export default CTA;