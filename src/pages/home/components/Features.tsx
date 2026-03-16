import { features } from '../../../mocks/products';
import * as S from '../../../styles/Features.styles';

const Features = () => {
  return (
    <section id="features" className={S.section}>
      <div className={S.container}>
        {/* Header */}
        <div className={S.headerWrapper}>
          <p className={S.eyebrow}>
            PERSONNALISATION FACILE
          </p>
          <h2 className={S.heading}>
            Technologie Simple<br />
            Et Sécurisée
          </h2>
        </div>

        {/* Features Grid */}
        <div className={S.grid}>
          {features.map((feature) => (
            <div
              key={feature.id}
              className={S.card}
            >
              <div className={S.cardIconBox}>
                <i className={S.featureIcon(feature.icon)}></i>
              </div>
              <h3 className={S.cardTitle}>
                {feature.title}
              </h3>
              <p className={S.cardDesc}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;