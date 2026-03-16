import { testimonials } from '../../../mocks/products';
import * as S from '../../../styles/Testimonials.styles';

const Testimonials = () => {
  return (
    <section id="testimonials" className={S.section}>
      <div className={S.container}>
        {/* Header */}
        <div className="mb-16">
          <div className={S.badge}>
            AVIS PARENTS
          </div>
          <h2 className={S.heading}>
            Ils Nous Font<br />
            Confiance
          </h2>
        </div>

        {/* Testimonials Grid - Masonry Layout */}
        <div className={S.grid}>
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={S.card}
            >
              {/* Header */}
              <div className={S.cardHeader}>
                <div className={S.avatarBg(testimonial.color)}>
                  {testimonial.avatar}
                </div>
                <div>
                  <div className={S.authorName}>{testimonial.name}</div>
                  <div className={S.authorHandle}>{testimonial.username}</div>
                </div>
              </div>

              {/* Content */}
              <p className={S.text}>
                "{testimonial.text}"
              </p>

              {/* Rating */}
              <div className={S.starsRow}>
                {[...Array(5)].map((_, i) => (
                  <i key={i} className={S.star}></i>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;