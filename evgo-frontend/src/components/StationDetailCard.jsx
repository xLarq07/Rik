import PropTypes from 'prop-types';

function formatPrice(station) {
  const price =
    typeof station.pricePerKwh === 'number'
      ? station.pricePerKwh
      : typeof station.price === 'number'
        ? station.price
        : station.pricing?.per_kwh ?? station.pricing?.price ?? null;

  if (price == null) return 'Belirtilmemiş';
  return `${price.toFixed(2)} ₺/kWh`;
}

function renderChargerTypes(station) {
  const possibleFields = [
    station.connectorTypes,
    station.chargerTypes,
    station.types,
    station.chargingSpeeds,
  ].find((value) => Array.isArray(value) && value.length > 0);

  if (!possibleFields) return 'Belirtilmemiş';
  return possibleFields
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item?.name) return item.name;
      return String(item);
    })
    .join(', ');
}

export function StationDetailCard({ station, onPlanRoute, isPlanning }) {
  if (!station) {
    return <p className="helper-text">Bir istasyon seçmek için haritadaki markerlara tıklayın.</p>;
  }

  return (
    <div className="station-detail">
      <h2>{station.name ?? 'İstasyon Detayı'}</h2>
      <dl>
        <dt>Adres</dt>
        <dd>{station.address ?? 'Bilgi yok'}</dd>
        <dt>Şarj Tipleri</dt>
        <dd>{renderChargerTypes(station)}</dd>
        <dt>Fiyat</dt>
        <dd>{formatPrice(station)}</dd>
      </dl>
      <button type="button" onClick={onPlanRoute} disabled={isPlanning}>
        {isPlanning ? 'Rota hesaplanıyor…' : 'Bu istasyona rota oluştur'}
      </button>
    </div>
  );
}

StationDetailCard.propTypes = {
  station: PropTypes.object,
  onPlanRoute: PropTypes.func,
  isPlanning: PropTypes.bool,
};

StationDetailCard.defaultProps = {
  station: null,
  onPlanRoute: undefined,
  isPlanning: false,
};

export default StationDetailCard;
