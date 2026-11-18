# Plan: Robotun sahnede hareket ettiği simülasyon

İnceleme: 18 Kasım 2026, CoderZ proje editörü (kullanıcının açık Chrome oturumunda) ve CoderZ yardım sayfaları
(Simulation Pane Controls, Camera, Run Simulation).

## CoderZ'da gözlemlediklerim

| Konu | Ne gördüm |
|---|---|
| Sahne | 3B bir dünya (çiftlik arazisi, çit, binalar). Simülasyon `simulation.gocoderz.com` adresinden ayrı bir çerçevede (iframe) çalışıyor; editörle mesajlaşıyor. |
| Robot | Gerçekçi 3B EV3 sürüş tabanı (iki tekerlek, sensörler, kol). |
| Çalıştırma | Çalıştır → robot sürer, çalışan blok parlar, süre sayacı başlar. Durdur ve "Reset Simulation" robotu başlangıç noktasına götürür; kod değişmez. |
| Kamera | Takip kamerası (robotun arkasından / üstten) ve sabit geniş açı arasında geçiş; sağ tık ile kaydırma, tekerlek ile yakınlaştırma. Sol altta mini harita. |
| Göstergeler | Üstte pil, yıldız (puan) ve süre. HUD paneli: Jiroskop (öne eğim, dönüş, yana eğim), Kodlayıcı (sol/sağ teker derecesi), Kol, Renk, Ultrasonik (cm), Dokunma. |
| Sensörler | Değerler **dünyadan** gelir: mesafe sensörü duvara uzaklığı ölçer, renk sensörü zemini görür, jiroskop robotun dönüşünü ölçer. (MakeCode'da ise kullanıcı kaydırıcıyla elle değiştiriyordu.) |
| Bloklar | Sür (güç, yön), dur, kol/kaldırma; ızgara görevleri için "bir adım sür", "engel var mı"; sensörlerde jiroskop, ultrasonik, renk, kodlayıcı, dokunma, robot hızı. |
| Ölçüm | Güç 100 ile ~3 saniyede kodlayıcı 2318° → yaklaşık **770 °/sn**. Bizim modelimizde %100 = 1000 °/sn. |

## Bizim simülatöre uygulanabilir mi?

Evet. Altyapının çoğu hazır: motor modeli (`motorModeli.js`), sürüş blokları (dönüş → sol/sağ hız),
sensör blokları ve worker'daki `robot` nesnesi. Eksik olan, robotun **bir zeminde konumu ve yönü**
ve sensörlerin bu dünyadan hesaplanması.

### Öneri: önce 2B üstten görünüm, sonra isteğe bağlı 3B

| | 2B üstten sahne (önerilen) | 3B sahne (CoderZ gibi) |
|---|---|---|
| Okul bilgisayarı | Zayıf bilgisayarda da akıcı (canvas) | Ekran kartı ister (WebGL); yavaş makinede takılır |
| Ölçmeyi öğretme | Zemin ızgarası cm; cetvelle ölçülür | Derinlikten mesafe tahmini zor |
| Geliştirme | Bu projede birkaç adımda | Model, ışık, kamera, fizik motoru: büyük iş |
| Görsel çekicilik | Sade | Çok çekici |
| Görseller | Kendi çizimimiz | Kendi 3B modelimiz gerekir (CoderZ/LEGO modelleri kullanılamaz) |

Aynı "dünya modeli" (konum, yön, çarpışma, sensörler) iki görünüm için de kullanılır; 3B daha sonra
yalnızca bir çizim katmanı olarak eklenebilir.

## Mimari

- **`src/simulasyon/dunya.js` (saf, test edilebilir):** saha (genişlik/yükseklik cm, duvarlar, engeller,
  renkli bölgeler/çizgiler), robot durumu (x, y cm; yön °), her adımda:
  - **Kinematik:** sol/sağ teker °/sn → cm/sn (teker çevresi π·5,6 cm); doğrusal hız = ortalama,
    dönüş hızı = fark / teker aralığı (~12 cm).
  - **Çarpışma:** robot dikdörtgeni duvar/engel ile kesişirse ilerlemez; ön tampon değerse dokunma sensörü "basılı".
  - **Ultrasonik:** sensörden ileri ışın (birkaç ışınlık koni), en yakın kesişme, 0–255 cm.
  - **Renk:** sensör noktasının altındaki zemin rengi → en yakın EV3 rengi; yansıyan ışık = parlaklık.
  - **Jiroskop:** robotun toplam dönüşü (°) ve dönüş hızı (°/sn).
- **Nerede çalışır:** worker içinde (motor modeli zaten orada). Program sensör okuyunca değer anında
  dünyadan gelir, mesaj gecikmesi olmaz; testler aynı modülü doğrudan kullanır. Worker ~60 Hz adım atar,
  ana sayfaya robotun konumunu toplu komutlarla gönderir (`{ tur: 'konum-robot', x, y, yon }`).
- **Ana sayfa:** `src/arayuz/sahneCizici.js` saha + robot + iz + sensör ışınlarını çizer.
- **İki mod:** "Sahne" (sensörler dünyadan; HUD salt okunur) ve mevcut "Elle sensör" modu (kaydırıcılar).
  Ekran görevleri (Otopark Ekranı) değişmez.

## Aşamalar

### Aşama 1: Hareket eden robot
1. Dünya modeli + kinematik + testler (ör. "1 tur ileri = 17,6 cm", "sağa yerinde dönüş = yön değişir, konum değişmez").
2. Sağ panelde "Robot | Sahne | Python" sekmeleri; sahnede ızgaralı zemin (cm), robot, geçtiği **iz** çizgisi.
3. Sıfırla (başlangıç konumuna dön), kamera: tüm saha / robotu takip, yakınlaştırma.
4. Çarpışma: duvara çarpınca durur, konsolda "Robot duvara çarptı".

### Aşama 2: Sensörler dünyadan
5. Ultrasonik ışın (sahnede çizilir), renk sensörü noktası, jiroskop, dokunma tamponu, kodlayıcılar.
6. HUD paneli (CoderZ'daki gibi): jiroskop, kodlayıcı, renk, mesafe, dokunma canlı değerleri.

### Aşama 3: Sahneler ve görevler
7. Hazır sahneler: boş saha, **otopark** (park yerine gir, duvara 10 cm kala dur), çizgi izleme pisti, labirent.
8. Yıldız toplama, süre, "hedef bölgede dur" görev kontrolleri (mevcut görev kontrolcüsüne bağlanır).

### Aşama 4 (isteğe bağlı)
9. 3B görünüm (three.js ile kendi basit robot modelimiz; aynı dünya modeli).
10. Sensör grafiği (zamanla mesafe/ışık değeri; EV3 Classroom'daki veri kaydı gibi).
11. Öğretmen için saha düzenleyici (engel, çizgi, renkli bölge ekle; dosyaya kaydet).

## CoderZ'dan daha iyi olabilecek öneriler

- **Tahmin et, sonra ölç:** Ders programınızın ilkesi. Çalıştırmadan önce "Robot kaç cm gidecek?"
  tahmini; sonra sahnedeki cetvelle ölçülür, fark konsolda gösterilir.
- **İz çizgisi ve cetvel:** Dönüşleri ve mesafeleri görerek öğrenme (CoderZ'da yok).
- **Sensörün gördüğünü göstermek:** Ultrasonik ışını ve renk sensörünün baktığı noktayı sahnede çizmek.
- **cm ve derece ile gerçek ölçüler:** Teker ve gövde ölçüleri EV3 eğitim setine göre; aynı program
  gerçek robotta da benzer mesafe gider.
- **Yavaş çekimle birlikte:** Çalışan blok parlarken robotun o bloktaki hareketi görülür.
- **Python ile aynı:** Sahne yalnızca simülasyonu etkiler; Python çıktısı değişmez.

## Kararınız gereken konular

1. 2B ile mi başlayalım (önerim), yoksa doğrudan 3B mi?
2. İlk hazır sahne hangisi olsun? (Önerim: Otopark — mevcut seviyenin hikâyesiyle uyumlu.)
3. Motor hızı: %100 = 1000 °/sn mi kalsın (gerçek EV3 büyük motoruna yakın), CoderZ'daki gibi ~770 °/sn mi?
4. Elle sensör modu (kaydırıcılar) sahneyle birlikte kalsın mı?

## Uygulama durumu (18 Kasım 2026)

Kararlar (kullanıcı "önerilerin ölçüsünde" dedi): 2B üstten görünüm, ilk sahne Otopark, %100 = 1000 °/sn kaldı,
elle sensör kaydırıcıları "Robot" sekmesinde kaldı.

Uygulanan: 1–3. aşamalar (hareket, iz, sıfırla, takip kamerası, çarpışma; sensörler dünyadan, HUD;
Boş saha, Otopark, Çizgi pisti, Labirent ve görev kontrolleri) ve öneriler (cetvel, "tahmin et, sonra ölç",
ultrasonik ışın ve renk sensörü noktasının çizimi). 4. aşama (3B, sensör grafiği, saha düzenleyici) yapılmadı.
