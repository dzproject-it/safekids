import { categories, sortOptions } from '../../../mocks/products';
import * as S from '../../../styles/ShopFilters.styles';

interface ShopFiltersProps {
  activeCategory: string;
  activeSort: string;
  activeSize: string;
  priceRange: [number, number];
  onCategoryChange: (cat: string) => void;
  onSortChange: (sort: string) => void;
  onSizeChange: (size: string) => void;
  onPriceChange: (range: [number, number]) => void;
  totalResults: number;
}

const sizes = ['Tous', 'XS', 'S', 'M', 'L'];

const ShopFilters = ({
  activeCategory,
  activeSort,
  activeSize,
  onCategoryChange,
  onSortChange,
  onSizeChange,
  totalResults,
}: ShopFiltersProps) => {
  return (
    <div className={S.wrapper}>
      <div className={S.container}>
        <div className={S.row}>
          {/* Categories */}
          <div className={S.catGroup}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={S.catBtn(activeCategory === cat.id)}
              >
                <div className={S.catIconBox}>
                  <i className={`${cat.icon} text-xs`}></i>
                </div>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right filters */}
          <div className={S.rightGroup}>
            {/* Size filter */}
            <div className={S.sizeGroup}>
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => onSizeChange(size === 'Tous' ? 'all' : size)}
                  className={S.sizeBtn(
                    (size === 'Tous' && activeSize === 'all') || activeSize === size
                  )}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className={S.sortWrapper}>
              <select
                value={activeSort}
                onChange={(e) => onSortChange(e.target.value)}
                className={S.sortSelect}
              >
                {sortOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
              <div className={S.sortArrow}>
                <i className="ri-arrow-down-s-line text-gray-500 text-sm"></i>
              </div>
            </div>

            {/* Results count */}
            <span className={S.resultsCount}>
              {totalResults} produit{totalResults > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopFilters;
