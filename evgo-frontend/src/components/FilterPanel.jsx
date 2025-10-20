import PropTypes from 'prop-types';
import './FilterPanel.css';

const CHARGER_TYPES = [
  { label: 'AC', value: 'AC' },
  { label: 'DC', value: 'DC' },
];

export function FilterPanel({ filters, onChange }) {
  const toggleType = (type) => {
    const nextTypes = filters.chargerTypes.includes(type)
      ? filters.chargerTypes.filter((value) => value !== type)
      : [...filters.chargerTypes, type];

    onChange({ ...filters, chargerTypes: nextTypes });
  };

  const updatePrice = (key, value) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;
    const [min, max] = filters.priceRange;
    if (key === 'min') {
      onChange({
        ...filters,
        priceRange: [Math.min(numeric, max), max],
      });
    } else {
      onChange({
        ...filters,
        priceRange: [min, Math.max(numeric, min)],
      });
    }
  };

  return (
    <div className="filter-panel filter-group">
      <div>
        <p className="section-title">Şarj Tipi</p>
        {CHARGER_TYPES.map(({ label, value }) => (
          <label key={value}>
            <input
              type="checkbox"
              checked={filters.chargerTypes.includes(value)}
              onChange={() => toggleType(value)}
            />
            {label}
          </label>
        ))}
      </div>

      <div>
        <p className="section-title">kWh Başına Fiyat (₺)</p>
        <div className="price-range-inputs">
          <label>
            <span className="helper-text">Min</span>
            <input
              type="number"
              value={filters.priceRange[0]}
              onChange={(event) => updatePrice('min', event.target.value)}
              min="0"
              step="0.1"
            />
          </label>
          <label>
            <span className="helper-text">Maks</span>
            <input
              type="number"
              value={filters.priceRange[1]}
              onChange={(event) => updatePrice('max', event.target.value)}
              min="0"
              step="0.1"
            />
          </label>
        </div>
        <p className="helper-text">
          İstasyon verilerinde fiyat bulunmuyorsa otomatik olarak listeye dahil edilir.
        </p>
      </div>
    </div>
  );
}

FilterPanel.propTypes = {
  filters: PropTypes.shape({
    chargerTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
    priceRange: PropTypes.arrayOf(PropTypes.number).isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FilterPanel;
