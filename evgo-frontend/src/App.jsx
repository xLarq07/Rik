import { useCallback, useEffect, useMemo, useState } from 'react';
import StationMap from './components/StationMap.jsx';
import FilterPanel from './components/FilterPanel.jsx';
import StationDetailCard from './components/StationDetailCard.jsx';
import RoutePlanner from './components/RoutePlanner.jsx';
import './App.css';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');

const FALLBACK_STATIONS = [
  {
    id: 'galata',
    name: 'Galata EV Hızlı Şarj',
    address: 'Bereketzade, Büyük Hendek Cd. No:33, Beyoğlu/İstanbul',
    latitude: 41.025651,
    longitude: 28.975258,
    chargerTypes: ['AC', 'DC'],
    pricePerKwh: 7.5,
  },
  {
    id: 'kadikoy',
    name: 'Kadıköy İskelesi Şarj Noktası',
    address: 'Caferağa, Rıhtım Cd., Kadıköy/İstanbul',
    latitude: 40.99297,
    longitude: 29.02498,
    chargerTypes: ['AC'],
    pricePerKwh: 5.9,
  },
  {
    id: 'maslak',
    name: 'Maslak İş Merkezi Ultra Hızlı Şarj',
    address: 'Maslak Mah., Büyükdere Cd. No:233, Sarıyer/İstanbul',
    latitude: 41.11302,
    longitude: 29.02051,
    chargerTypes: ['DC'],
    pricePerKwh: 9.25,
  },
];

function resolveStationPosition(station) {
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

function extractChargerTypes(station) {
  const sources = [station.connectorTypes, station.chargerTypes, station.types];
  const value = sources.find((item) => Array.isArray(item) && item.length > 0);
  if (!value) return [];
  return value.map((item) => String(item).toUpperCase());
}

function resolvePrice(station) {
  if (typeof station.pricePerKwh === 'number') return station.pricePerKwh;
  if (typeof station.price === 'number') return station.price;
  if (typeof station.cost === 'number') return station.cost;
  if (station.pricing) {
    if (typeof station.pricing.per_kwh === 'number') return station.pricing.per_kwh;
    if (typeof station.pricing.price === 'number') return station.pricing.price;
    if (typeof station.pricing.min === 'number') return station.pricing.min;
  }
  return null;
}

function formatCoordinate(value) {
  return Number.parseFloat(value).toFixed(6);
}

function parsePoint(point) {
  const lat = Number.parseFloat(point.lat);
  const lng = Number.parseFloat(point.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

function buildRouteUrl(start, end) {
  return `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
}

function App() {
  const [stations, setStations] = useState([]);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [stationError, setStationError] = useState(null);
  const [filters, setFilters] = useState({ chargerTypes: [], priceRange: [0, 15] });
  const [selectedStation, setSelectedStation] = useState(null);
  const [startPoint, setStartPoint] = useState({ lat: '', lng: '' });
  const [endPoint, setEndPoint] = useState({ lat: '', lng: '' });
  const [isPlanningRoute, setIsPlanningRoute] = useState(false);
  const [route, setRoute] = useState(null);
  const [routeError, setRouteError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchStations = async () => {
      setIsLoadingStations(true);
      setStationError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/stations`, {
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`İstasyonlar alınamadı: ${response.status}`);
        }
        const data = await response.json();
        const list = Array.isArray(data) ? data : data?.results ?? [];
        if (!Array.isArray(list) || list.length === 0) {
          throw new Error('API boş liste döndürdü.');
        }
        setStations(list);
      } catch (error) {
        console.error('İstasyonlar alınırken hata oluştu', error);
        setStationError('İstasyon verileri alınamadı, örnek veri gösteriliyor.');
        setStations(FALLBACK_STATIONS);
      } finally {
        setIsLoadingStations(false);
      }
    };

    fetchStations();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedStation) return;
    const position = resolveStationPosition(selectedStation);
    if (!position) return;
    setEndPoint({ lat: formatCoordinate(position[0]), lng: formatCoordinate(position[1]) });
  }, [selectedStation]);

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const chargerTypes = extractChargerTypes(station);
      if (filters.chargerTypes.length > 0) {
        const hasMatch = filters.chargerTypes.some((type) => chargerTypes.includes(type));
        if (!hasMatch) return false;
      }

      const price = resolvePrice(station);
      if (price != null) {
        const [min, max] = filters.priceRange;
        if (price < min || price > max) return false;
      }

      return true;
    });
  }, [stations, filters]);

  const handlePlanRoute = useCallback(
    async (overridePoints) => {
      const start = parsePoint(overridePoints?.start ?? startPoint);
      const end = parsePoint(overridePoints?.end ?? endPoint);

      if (!start || !end) {
        setRouteError('Lütfen başlangıç ve varış koordinatlarını kontrol edin.');
        return;
      }

      setIsPlanningRoute(true);
      setRouteError(null);

      try {
        const response = await fetch(buildRouteUrl(start, end));
        if (!response.ok) {
          throw new Error('Rota isteği başarısız.');
        }
        const payload = await response.json();
        const primaryRoute = payload.routes?.[0];
        if (!primaryRoute) {
          throw new Error('Geçerli rota bulunamadı');
        }
        setRoute({
          coordinates: primaryRoute.geometry.coordinates,
          distance: primaryRoute.distance,
          duration: primaryRoute.duration,
        });
      } catch (error) {
        console.error('Rota oluşturulamadı', error);
        setRoute(null);
        setRouteError('Rota oluşturulurken bir hata oluştu. Lütfen daha sonra yeniden deneyin.');
      } finally {
        setIsPlanningRoute(false);
      }
    },
    [startPoint, endPoint],
  );

  const handlePlanRouteToStation = useCallback(() => {
    if (!selectedStation) {
      setRouteError('Lütfen önce bir istasyon seçin.');
      return;
    }
    const position = resolveStationPosition(selectedStation);
    if (!position) {
      setRouteError('Seçilen istasyon için koordinat bulunamadı.');
      return;
    }
    const formatted = { lat: formatCoordinate(position[0]), lng: formatCoordinate(position[1]) };
    setEndPoint(formatted);
    handlePlanRoute({ end: formatted });
  }, [selectedStation, handlePlanRoute]);

  const handleClearRoute = useCallback(() => {
    setRoute(null);
    setRouteError(null);
  }, []);

  const handleMapClick = useCallback(
    (latlng) => {
      const formattedPoint = { lat: formatCoordinate(latlng.lat), lng: formatCoordinate(latlng.lng) };
      if (!startPoint.lat || !startPoint.lng) {
        setStartPoint(formattedPoint);
        return;
      }
      if (!endPoint.lat || !endPoint.lng) {
        setEndPoint(formattedPoint);
        return;
      }
      setStartPoint(formattedPoint);
    },
    [startPoint, endPoint],
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>EVGO Şarj İstasyonları</h1>
        {isLoadingStations ? <span>İstasyonlar yükleniyor…</span> : null}
      </header>
      <aside className="sidebar">
        <div className="sidebar-section">
          <FilterPanel filters={filters} onChange={setFilters} />
          {stationError ? <p className="helper-text" style={{ color: '#b45309' }}>{stationError}</p> : null}
        </div>
        <div className="sidebar-section">
          <p className="section-title">İstasyon Detayı</p>
          <StationDetailCard station={selectedStation} onPlanRoute={handlePlanRouteToStation} isPlanning={isPlanningRoute} />
        </div>
        <div className="sidebar-section">
          <p className="section-title">Rota Planlama</p>
          <RoutePlanner
            startPoint={startPoint}
            endPoint={endPoint}
            onStartChange={setStartPoint}
            onEndChange={setEndPoint}
            onPlan={() => handlePlanRoute()}
            onClear={handleClearRoute}
            isPlanning={isPlanningRoute}
            route={route}
            error={routeError}
          />
        </div>
      </aside>
      <main className="content">
        <StationMap
          stations={filteredStations}
          selectedStation={selectedStation}
          onStationSelect={setSelectedStation}
          route={route}
          onMapClick={handleMapClick}
        />
      </main>
    </div>
  );
}

export default App;
