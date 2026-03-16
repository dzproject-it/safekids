import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as S from '../../../styles/Hero.styles';

const Hero = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={S.section}>
      {/* Navigation */}
      <nav className={S.nav(scrolled)}>
        <div className={S.navContainer}>
          <div className={S.logoWrapper}>
            <div className={S.logoIcon}>
              <i className="ri-qr-code-line text-white text-xl"></i>
            </div>
            <span className={S.logoText(scrolled)}>QR Kids</span>
          </div>
          <div className={S.navLinks(scrolled)}>
            <a href="#products" className={S.navLink}>Produits</a>
            <a href="#features" className={S.navLink}>Fonctionnalités</a>
            <a href="#testimonials" className={S.navLink}>Avis</a>
            <button onClick={scrollToProducts} className={S.orderBtn}>Commander</button>
          </div>
          <button className={S.menuBtn}>
            <i className={S.menuIcon(scrolled)}></i>
          </button>
        </div>
      </nav>

      {/* Hero Background */}
      <div className={S.bgWrapper}>
        <img
          src="https://readdy.ai/api/search-image?query=Happy%20children%20playing%20outdoors%20wearing%20colorful%20safety%20bracelets%2C%20bright%20sunny%20day%20in%20park%2C%20active%20kids%20running%20and%20laughing%2C%20lifestyle%20photography%2C%20natural%20lighting%2C%20joyful%20atmosphere%2C%20modern%20family%20safety%20concept%2C%20vibrant%20colors%2C%20professional%20photography%20with%20shallow%20depth%20of%20field&width=1920&height=1080&seq=hero1&orientation=landscape"
          alt="Enfants heureux portant des bracelets QR"
          className={S.bgImg}
        />
        <div className={S.bgOverlay}></div>
      </div>

      {/* Hero Content */}
      <div className={S.contentWrapper}>
        <div className={S.content}>
          <h1 className={S.heading}>SÉCURITÉ CONNECTÉE</h1>
          <p className={S.subheading}>pour vos enfants</p>
          <p className={S.description}>
            Des bracelets QR Code personnalisables qui protègent vos enfants partout où ils vont. Programmez vos contacts d'urgence en quelques secondes.
          </p>
          <button onClick={scrollToProducts} className={S.heroBtn}>
            <div className={S.heroBtnIcon}>
              <i className="ri-shopping-bag-line text-white text-xl"></i>
            </div>
            <span>DÉCOUVRIR LES BRACELETS</span>
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className={S.scrollIndicator}>
        <i className="ri-arrow-down-line text-white text-3xl"></i>
      </div>
    </section>
  );
};

export default Hero;