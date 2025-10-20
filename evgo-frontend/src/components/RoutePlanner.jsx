import PropTypes from 'prop-types';

export function RoutePlanner({
  startPoint,
  endPoint,
  onStartChange,
  onEndChange,
  onPlan,
  onClear,
  isPlanning,
  route,
  error,
}) {
  const useCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Tarayıcınız konum bilgisini paylaşmayı desteklemiyor.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onStartChange({ lat: latitude.toFixed(6), lng: longitude.toFixed(6) });
      },
      () => {
        alert('Konum bilgisi alınamadı. Lütfen izin verdiğinizden emin olun.');
      },
    );
  };

  return (
    <div className="route-planner">
      <fieldset>
        <legend>Başlangıç Noktası</legend>
        <label>
          Enlem
          <input
            type="text"
            value={startPoint.lat}
            onChange={(event) => onStartChange({ lat: event.target.value, lng: startPoint.lng })}
            placeholder="41.015137"
          />
        </label>
        <label>
          Boylam
          <input
            type="text"
            value={startPoint.lng}
            onChange={(event) => onStartChange({ lat: startPoint.lat, lng: event.target.value })}
            placeholder="28.97953"
          />
        </label>
        <button type="button" onClick={useCurrentLocation}>
          Konumumu kullan
        </button>
      </fieldset>

      <fieldset>
        <legend>Varış Noktası</legend>
        <label>
          Enlem
          <input
            type="text"
            value={endPoint.lat}
            onChange={(event) => onEndChange({ lat: event.target.value, lng: endPoint.lng })}
            placeholder="41.0082"
          />
        </label>
        <label>
          Boylam
          <input
            type="text"
            value={endPoint.lng}
            onChange={(event) => onEndChange({ lat: endPoint.lat, lng: event.target.value })}
            placeholder="28.9784"
          />
        </label>
        <p className="helper-text">
          Seçtiğiniz istasyona göre otomatik olarak doldurulur. Dilerseniz manuel güncelleyebilirsiniz.
        </p>
      </fieldset>

      <div className="route-actions">
        <button type="button" onClick={onPlan} disabled={isPlanning}>
          {isPlanning ? 'Rota hesaplanıyor…' : 'Rota Oluştur'}
        </button>
        <button type="button" onClick={onClear} disabled={isPlanning}>
          Temizle
        </button>
      </div>

      {error ? <p className="helper-text" style={{ color: '#b91c1c' }}>{error}</p> : null}

      {route ? (
        <div className="route-summary">
          <strong>Özet</strong>
          <p>
            Mesafe: {(route.distance / 1000).toFixed(1)} km — Süre: {(route.duration / 60).toFixed(0)} dk
          </p>
        </div>
      ) : null}
    </div>
  );
}

RoutePlanner.propTypes = {
  startPoint: PropTypes.shape({ lat: PropTypes.string, lng: PropTypes.string }).isRequired,
  endPoint: PropTypes.shape({ lat: PropTypes.string, lng: PropTypes.string }).isRequired,
  onStartChange: PropTypes.func.isRequired,
  onEndChange: PropTypes.func.isRequired,
  onPlan: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  isPlanning: PropTypes.bool.isRequired,
  route: PropTypes.shape({ distance: PropTypes.number, duration: PropTypes.number }),
  error: PropTypes.string,
};

RoutePlanner.defaultProps = {
  route: null,
  error: null,
};

export default RoutePlanner;
