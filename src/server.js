const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const dataFilePath = path.join(__dirname, '..', 'data', 'stations.json');

app.use(cors());
app.use(express.json());

function loadStations() {
  try {
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error('Stations JSON must be an array.');
    }

    return parsed;
  } catch (error) {
    console.error('Failed to read stations file:', error.message);
    return [];
  }
}

function filterStations(stations, query) {
  const { type, city, operator, search } = query;
  let filtered = stations;

  if (type) {
    const normalizedType = type.toString().trim().toLowerCase();
    filtered = filtered.filter((station) =>
      Array.isArray(station.connectors) &&
      station.connectors.some((connector) =>
        typeof connector.type === 'string' &&
        connector.type.toLowerCase() === normalizedType
      )
    );
  }

  if (city) {
    const normalizedCity = city.toString().trim().toLowerCase();
    filtered = filtered.filter(
      (station) =>
        typeof station.city === 'string' &&
        station.city.toLowerCase() === normalizedCity
    );
  }

  if (operator) {
    const normalizedOperator = operator.toString().trim().toLowerCase();
    filtered = filtered.filter(
      (station) =>
        typeof station.operator === 'string' &&
        station.operator.toLowerCase() === normalizedOperator
    );
  }

  if (search) {
    const normalizedSearch = search.toString().trim().toLowerCase();
    filtered = filtered.filter((station) => {
      const nameMatch = typeof station.name === 'string' &&
        station.name.toLowerCase().includes(normalizedSearch);
      const addressMatch = typeof station.address === 'string' &&
        station.address.toLowerCase().includes(normalizedSearch);
      return nameMatch || addressMatch;
    });
  }

  return filtered;
}

app.get('/', (_req, res) => {
  res.json({ message: 'Elektrikli araç şarj istasyonu API\'sine hoş geldiniz.' });
});

app.get('/stations', (req, res) => {
  const stations = loadStations();
  const filteredStations = filterStations(stations, req.query);

  res.json({
    total: stations.length,
    count: filteredStations.length,
    data: filteredStations,
  });
});

app.get('/stations/:id', (req, res) => {
  const stations = loadStations();
  const station = stations.find((item) => item.id === req.params.id);

  if (!station) {
    return res.status(404).json({ error: 'İstasyon bulunamadı.' });
  }

  return res.json(station);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Aradığınız uç nokta bulunamadı.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} üzerinde çalışıyor`);
  });
}

module.exports = app;
