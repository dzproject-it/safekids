import Hero from './components/Hero';
import About from './components/About';
import Products from './components/Products';
import Features from './components/Features';
import CTA from './components/CTA';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <About />
      <Products />
      <Features />
      <CTA />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default HomePage;