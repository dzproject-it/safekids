import { stats } from '../../../mocks/products';
import * as S from '../../../styles/About.styles';

const About = () => {
  return (
    <section className={S.section}>
      <div className={S.container}>
        <div className={S.grid}>
          {/* Left Content */}
          <div className={S.leftCol}>
            <h2 className={S.heading}>
              Protégez<br />
              Vos Enfants<br />
              Intelligemment
            </h2>
            
            <div className={S.statsRow}>
              {stats.map((stat, index) => (
                <div key={index} className={S.statItem}>
                  <div className={S.statNumber}>
                    {stat.number}
                    {stat.label !== 'Assistance' && '+'}
                    {stat.label === 'Sécurisé' && '%'}
                  </div>
                  <div className={S.statLabel}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Decorative */}
          <div className={S.rightCol}>
            <div className={S.decorBg}>
              {/* Organic Shapes */}
              <div className={S.blob1}></div>
              <div className={S.blob2}></div>
              <div className={S.blob3}></div>
              <div className={S.blob4}></div>
              
              {/* Floating Elements */}
              <div className={S.float1}></div>
              <div className={S.float2}></div>
              <div className={S.float3}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;