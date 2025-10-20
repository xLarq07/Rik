import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, Marker, Popup, TileLayer, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './StationMap.css';

const DEFAULT_CENTER = [41.0082, 28.9784]; // İstanbul

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

function MapEventBinder({ onClick }) {
  useMapEvents({
    click(event) {
      if (onClick) {
        onClick(event.latlng);
      }
    },
  });
  return null;
}

MapEventBinder.propTypes = {
  onClick: PropTypes.func,
};

MapEventBinder.defaultProps = {
  onClick: undefined,
};

function resolvePosition(station) {
  if (!station) return null;
  if (Array.isArray(station.coordinates) && station.coordinates.length === 2) {
    return station.coordinates;
  }
  if (typeof station.latitude === 'number' && typeof station.longitude === 'number') {
    return [station.latitude, station.longitude];
  }
  if (station.location && typeof station.location.lat === 'number' && typeof station.location.lng === 'number') {
    return [station.location.lat, station.location.lng];
  }
  return null;
}

export function StationMap({ stations, selectedStation, onStationSelect, route, onMapClick }) {
  const center = useMemo(() => {
    const selectedPosition = resolvePosition(selectedStation);
    if (selectedPosition) return selectedPosition;

    const firstValidStation = stations.map(resolvePosition).find(Boolean);
    return firstValidStation ?? DEFAULT_CENTER;
  }, [selectedStation, stations]);

  const routePolyline = useMemo(() => {
    if (!route?.coordinates?.length) return null;
    return route.coordinates.map(([lng, lat]) => [lat, lng]);
  }, [route]);

  return (
    <div className="map-wrapper">
      <MapContainer center={center} zoom={12} className="map" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventBinder onClick={onMapClick} />
        {stations
          .map((station) => ({ station, position: resolvePosition(station) }))
          .filter(({ position }) => Array.isArray(position))
          .map(({ station, position }) => (
            <Marker
              key={station.id ?? station.code ?? `${position[0]}-${position[1]}`}
              position={position}
              icon={defaultIcon}
              eventHandlers={{
                click: () => onStationSelect?.(station),
              }}
            >
              <Popup>
                <strong>{station.name ?? 'İstasyon'}</strong>
                {station.address ? <p>{station.address}</p> : null}
              </Popup>
            </Marker>
          ))}
        {routePolyline ? <Polyline positions={routePolyline} color="#2563eb" weight={6} opacity={0.75} /> : null}
      </MapContainer>
    </div>
  );
}

StationMap.propTypes = {
  stations: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedStation: PropTypes.object,
  onStationSelect: PropTypes.func,
  route: PropTypes.shape({
    coordinates: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  }),
  onMapClick: PropTypes.func,
};

StationMap.defaultProps = {
  selectedStation: null,
  onStationSelect: undefined,
  route: null,
  onMapClick: undefined,
};

export default StationMap;
