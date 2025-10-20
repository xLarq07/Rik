# EVGO Frontend

Elektrikli araç kullanıcılarının yakındaki şarj istasyonlarını harita üzerinde inceleyebileceği, filtreleyebileceği ve temel rota planlama deneyimi yaşayabileceği React tabanlı arayüz.

## Başlangıç

```bash
npm install
npm run dev
```

Varsayılan olarak uygulama `http://localhost:5173` adresinde çalışır.

## Yapılandırma

- `VITE_API_BASE_URL`: Şarj istasyonlarının listelendiği backend API adresi. `.env` dosyasında belirtilmelidir. Varsayılan olarak `http://localhost:8000` kullanılır.

Backend API `/stations` uç noktasından JSON formatında istasyon listesi beklenmektedir. Liste boş dönerse veya istek başarısız olursa İstanbul için örnek veri gösterilir.

Harita katmanı OpenStreetMap altyapısını kullanan Leaflet ile sunulur; bu entegrasyon için ek bir API anahtarı gerekmemektedir.

## Özellikler

- OpenStreetMap (Leaflet) tabanlı interaktif harita
- AC/DC ve fiyat aralığı filtreleri
- Marker tıklandığında detay kartı ve rota planlama kısayolu
- OSRM servisi ile temel rota oluşturma ve mesafe/süre özeti
- Harita tıklamalarıyla koordinat seçebilme, tarayıcı konumunu kullanabilme
