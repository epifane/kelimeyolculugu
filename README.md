# Kelime Yolculuğu

## Dosya yapısı
- `index.html` — sayfa iskeleti
- `style.css` — tüm görsel stiller
- `app.js` — oyun mantığı (harita, grid/bulmaca, klavye, ipucu, skor, PWA kaydı)
- `data/kelimeler.json` — kategori/durak/kelime verisi (yeni kelime eklemek için sadece bu dosyayı düzenle)
- `manifest.json`, `sw.js`, `icons/icon.svg` — PWA (yüklenebilir, çevrimdışı çalışan uygulama) dosyaları

## Çalıştırma
`app.js`, veriyi `fetch("data/kelimeler.json")` ile yüklüyor. Tarayıcı güvenlik kısıtları
yüzünden bu, dosyaya doğrudan çift tıklayarak (`file://`) açıldığında **çalışmaz**.
GitHub Pages'e yükledikten sonra sorunsuz çalışır; yerelde denemek için proje
klasöründe basit bir sunucu açman yeterli, örn:

```
npx serve .
```

## Notlar
- `icons/icon.svg` geçici/basit bir ikon. Gerçek 192x192 ve 512x512 PNG ikonlar
  eklemek istersen `manifest.json`'daki `icons` listesine ekleyip bu SVG'yi
  kaldırabilirsin.
- Yeni kategori eklemek: `data/kelimeler.json`'a aynı şablonda bir obje eklemek yeterli.
