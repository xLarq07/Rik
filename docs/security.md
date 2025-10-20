# Güvenlik Politikaları

## SSL/TLS Yönetimi
- Tüm dış HTTP trafiği TLS 1.2 veya üzeri protokolü kullanacak şekilde zorlanır.
- Sertifikalar Let's Encrypt veya kurumsal CA üzerinden alınır; geçerlilik süresi bitmeden 30 gün önce otomatik yenileme tetiklenir.
- Sertifika zinciri ve özel anahtarlar `secrets-manager` üzerinde AES-256-GCM ile şifrelenir ve erişim yalnızca yetkili DevOps ekibi tarafından denetlenir.
- Uygulamanın ters proxy katmanında (NGINX) HSTS, OCSP stapling ve güvenli yeniden yönlendirme politikaları aktiftir.

## Şifreleme Prensipleri
- Dinlenen veriler (at-rest) PostgreSQL Transparent Data Encryption ile korunur; obje depolamada sunucu tarafı şifreleme (SSE-KMS) zorunludur.
- İletim halindeki veriler (in-transit) TLS ile korunur; eski şifre paketleri (RC4, 3DES) devre dışıdır.
- Uygulama seviyesinde hassas alanlar (TC kimlik, kredi kartı numaraları) `crypto` modülü ile AES-256-GCM kullanılarak şifrelenir ve anahtarlar donanım güvenlik modülünde (HSM) saklanır.
- Hashlenen parolalar Argon2id algoritmasıyla oluşturulur, benzersiz salt ve minimum 32 MB bellek kullanımı ile yapılandırılır.

## PCI DSS Süreçleri
- Kart verileri yalnızca ödeme ağ geçidi tokenizasyonu ile işlendiğinden, sistemde tam PAN saklanmaz.
- PCI DSS 4.0 gerekliliklerine uygunluk yılda bir bağımsız denetimle doğrulanır; penetrasyon testleri altı ayda bir yapılır.
- Loglama sistemi, kart verileri veya CVV içeren alanları maskeleyecek şekilde yapılandırılmıştır.
- Erişim kontrolleri rol tabanlıdır (RBAC) ve kritik sistemlere erişim için çok faktörlü kimlik doğrulama zorunludur.

## KVKK Süreçleri
- Veri işleme envanteri yılda iki kez güncellenir ve KVKK temsilcisi tarafından onaylanır.
- Açık rıza kayıtları güvenli şekilde saklanır, rıza geri çekme talepleri 7 gün içinde işlenir.
- Veri sahiplerinden gelen başvurular için SLA 30 gündür; süreç CRM entegrasyonu üzerinden izlenir.
- Veri ihlali durumunda 72 saat içinde Kişisel Verileri Koruma Kurumu'na bildirim yapılır.

## Olay Müdahale
- Güvenlik olayları için 7/24 görevli bir CSIRT ekibi bulunur.
- Olay kayıtları merkezi SIEM platformunda toplanır ve en az 1 yıl saklanır.
- Her kritik olay sonrası kök neden analizi ve aksiyon planı hazırlanır.
