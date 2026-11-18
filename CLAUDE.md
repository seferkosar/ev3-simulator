# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proje

Lego Mindstorms EV3'ü öğreten, web tabanlı bir simülatör oyunu. Hedef kitle ortaokul öğrencileri.

- Arayüzdeki tüm metinler Türkçe olmalı. Cümleler kısa ve sade tutulmalı.
- İlk seviye ("Otopark Ekranı", 4 görev) ve Serbest çalışma oynanabilir durumda. Bütün bloklar (Bloklarım dahil) simülatörde ve Python'da çalışır. Görevler menüsünde öğretim programının 48 EV3 dersi var.

## Teknoloji

- Vite + düz JavaScript (framework yok)
- Blockly: öğrenci programını bloklarla kurar
- Canvas: sanal EV3 ekranı ve sahne çizimi
- Vitest: testler

## Komutlar

- `npm install` — bağımlılıkları kur
- `npm run dev` — geliştirme sunucusu (http://localhost:5173)
- `npm test` — tüm testler (Vitest, tek sefer)
- `npx vitest run tests/iskelet.test.js` — tek test dosyası; `-t "ad"` ile tek test
- `npm run build` — `dist/` içine üretim derlemesi

Testler `tests/**/*.test.js` altında ve Node ortamında çalışır (`vite.config.js`).
Plan: `docs/plan-seviye-ekran.md`.

## Yapı

- Bloklar EV3 Classroom paletini (Scratch tarzı, `zelos` görünümü) Türkçe olarak izler. Kaynak resimler: `~/Desktop/lego/Ekran Resmi 2026-11-15 *.png`. Editör özellikleri MakeCode EV3 incelemesine dayanır: `docs/plan-makecode-karsilastirma.md`.
- Blockly'yi her zaman `src/bloklar/blocklyKurulum.js` üzerinden al (Türkçe dil, blok kayıtları, tema, 4 boşluk Python girintisi). `blockly/core` doğrudan alınırsa hazır bloklar metinsiz kalır ve hata verir.
- Her kategori `src/bloklar/kategoriler/<ad>.js` içinde: `bloklar` (JSON tanımları), `arac` (araç kutusu öğeleri, `aracOgesi()` boş girişlere beyaz oval koyar), `python` ve `js` (her bloğun Pybricks ve simülatör karşılığı). Yeni blok eklerken dördünü ve `ingilizceAdlar.js`'yi birlikte güncelle; `tests/bloklarCalisma.test.js` her bloğun Python'unu (bilgisayarda `python3` varsa) derleyerek denetler.
- Python cihaz tanımları (`motor_a = Motor(Port.A)` gibi) ve yardımcı fonksiyonlar `pyDonanim.js` içinde; kategoriler bunları çağırır, `pythonKodu.js` başlığa yerleştirir.
- Açılır listeleri `ortak.js` içindeki `secim()` ile kur: Blockly ortak baş kelimeyi listenin dışına taşır, `secim()` bunu engeller.
- Şapka blokları (`olaylar.js` → `SAPKA_TURLERI`) altlarındaki zinciri sarar; forBlock ile değil `jsKodu.js` / `pythonKodu.js` içinde üretilir. JS: `baslat(...)`, `olay(() => koşul, ...)`, `mesajGelince(...)`. Python: "program başladığında" ana program, mesajlar `def mesaj_…()`, sensör/düğme olayları sonda kenar tetiklemeli bir `while True` döngüsü.
- Satır ve konum öğrenciye 1'den başlar; Python ve JS'de 0'a çevrilir (`pythonYardimci.js`). "yaz, satır" önce satırı temizler (Python'da `draw_box`).
- Araç kutusu `src/seviye/otoparkEkrani.js` içindeki `aracKutusu(no)` ile üretilir: en üstte "Ara" kategorisi, sonra bütün kategoriler; görevde açık olmayan bloklar `disabledReasons` ile gri ve sürüklenemez. Görev 0 = **Serbest** (bütün bloklar açık, görev kontrolü yok). Araç kutusu **her zaman kategorilidir**. Ara, Değişkenler ve Bloklarım dinamik kategorilerdir (`kayit.js` → `dinamikKategorileriBagla`). Blok oluşturulunca da `izinliMi()` uygulanır (arama, yapıştırma, dosya).
- Çalıştırma: `jsKodu.js` (her bloktan önce `await adim(id, YIGIN)`) → `src/calistirici/calistirici.js` worker'ı başlatır → `isci.js` ağı kapatır, her 250 ms "nabız" gönderir → `yurutucu.js` kodu `new Function` ile yalnızca worker içinde çalıştırır; `robot` nesnesi motor, hareket, sensör, ses ve mesajları sağlar, `op` operatörleri (`islemler.js`). Komutlar `toplu` mesajlarla gelir: ekran (`temizle`, `konum`, `resim`) `komutuUygula` ile modele; `isik`, `motorlar`, `ses`, `blok` (yavaş çekim vurgusu) arayüze. Sensör ve düğme değerleri ana sayfadan `donanim` mesajıyla gider.
- Simülatör paneli (`src/arayuz/simulatorPaneli.js`): programda kullanılan motor/sensörler `donanimBul.js` ile bulunup portlara kendiliğinden bağlanır; sensörler elle kontrol edilir. Motor modeli worker ve sayfada ortak: `src/simulasyon/motorModeli.js`. Sesler `src/arayuz/ses.js` (Web Audio ve tarayıcının Türkçe konuşması; ses dosyası yok). Göz resimleri `src/ekran/resimler.js`, piksel yazı `ekranCizici.js` (bu proje için çizildi; LEGO/MakeCode görseli kullanılmaz).
- Sahne simülasyonu (sağ panel "Sahne" sekmesi; plan: `docs/plan-sahne-simulasyonu.md`): robot 2B üstten görünen bir sahnede gezer. `src/simulasyon/dunya.js` saf dünya modeli (cm, derece; x sağa, y aşağı, yön saat yönünde artı): diferansiyel sürüş kinematiği, çarpışma, ultrasonik ışın, zemin rengi, jiroskop, yıldızlar. Dünya worker'da çalışır; motor hızı her değiştiğinde ve her sensör okumasında o ana kadar ilerletilir (sonuç saate değil hıza bağlı, testler sahte saatle yazılır). Sahne modunda sensör blokları dünyadan okur; Robot sekmesindeki elle kaydırıcılar yalnızca "elle" modda kullanılır (son açılan Robot/Sahne sekmesi belirler). Hazır sahneler ve görev kontrolleri `src/simulasyon/sahneler.js`; çizim `src/arayuz/sahneCizici.js`. Hareket ve sensör blokları görevlerde kapalı olduğu için sahne görevleri Serbest modda yapılır.
- Görevler menüsü (öğretim programı dersleri): `src/dersler/dersVerisi.js` kullanıcının `~/Desktop/lego/LEGO EV3 Öğretim Programı.html` dosyasından çıkarılmış 3 seviye × 16 hafta (başlık, kazanım, örnek EV3 Classroom programları). `donustur.js` kısaltılmış blok listelerini bizim Blockly programımıza çevirir (ad/değişkenler ASCII). `dersGorevleri.js` her ders için simülasyon modu (sahne/elle), ipucu, eksik tanımlar için ek programlar ve durumu tutar; `tests/dersler.test.js` her kodlu dersi öğrencinin yapacağı sensör hareketleriyle sahte saatte çalıştırıp durumu doğrular (yardımcı: `tests/dersCalistirici.js`). Ders seçilince bloklar Serbest gibi açılır. Yeni ders/blok eklerken `donustur.js` eşlemesini ve testteki beklentiyi birlikte güncelle.
- Görevler menüsü bölümleri (`src/arayuz/dersMenusu.js`): Otopark Ekranı Görev 1–4 (görev kartında yalnızca Serbest düğmesi kaldı), Etkinlikler, sonra dersler. Etkinlikler (`src/etkinlikler/etkinlikler.js`): aynı HTML'deki "EV3 çalışma sitesi"nin (`#ev3-calisma`, gömülü `emb-ev3` JSON) uygulamalı konularından (133–167) seçilen 22 etkinlik; her biri kendi sahnesi ya da elle modu, uyarlama notu ve programıyla (donustur.js dili). `tests/etkinlikler.test.js` hepsini `tests/etkinlikCalistirici.js` ile çalıştırır: sahte saat kuyruğu (bekleme ve `aralik` zamanlayıcıları aynı saati paylaşır), böylece olay şapkaları ve birden çok yığın doğru zamanlanır. Gerçek zamanda jiroskop dönüşleri biraz taşar: göreli dönüşleri (her seferinde açıyı sıfırlayan) tekrar eden programlar tarayıcıda da denenmeli.
- Aşamalar menüsü (Robot Yolculuğu oyunu, aynı HTML dosyasından): `src/asamalar/asamaVerisi.js` 9 dünya × 26 aşama (harita ızgarası, hikâye, ipucu, par). `asamaSahnesi.js` haritayı sahneye çevirir (1 kare = 30 cm; taş = engel, yıldız, renkli karo, paket, teslim alanı Z, bayrak) ve `tamamlanincaDur` ile görev tamamlanınca programı bitirir. `asamalar.js` oyun bloklarının EV3 karşılıkları (ileri 30 cm, sağa/sola 180 teker derecesi = 90° dönüş, kol = A motoru ∓90°, önüm kapalı = mesafe < 20) ve her aşamanın örnek çözümü; `tests/asamalar.test.js` hepsini sahnede çalıştırır, hata avı aşamalarının hazır programının başarısız olduğunu ve çözümlerin 3 yıldız aldığını denetler. Dünya modeli paketleri (kol inince tutar, kalkınca bırakır) ve "haber ver"i (bayraktayken ekran/ses) destekler. Tek ultrasonik sensör olduğu için "sağım açık" önce sağa dönüp bakarak yapılır.
- Bloklarım: Blockly'nin hazır `procedures_*` blokları; JS üreticisi `kategoriler/bloklarim.js` (her blok `async function ad(YIGIN, …)`), Python'da hazır `def`. Görevlerde kapalı, Serbest ve derslerde açık (`bloklarim` bayrağı).
- Görev kontrolü (`src/seviye/`): program `bitti` ile bitince `gorevKontrol.js` ekran günlüğüne ve `programOzeti.js`'ye bakar; mesajlar cevabı vermeden eksiği söyler. Metin eşleşmesi tam (büyük/küçük harf ve baş/son boşluk hariç). Görev 4 hedef kutusu `GOREVLER[3].hedef`. Örnek çözümler `COZUMLER` ("Çözümü göster"); testler her çözümün kontrolden geçtiğini denetler.
- `src/arayuz/`: görev kartı, konsol, program dosyası (`programCoz` Türkçe hata verir), otomatik kayıt. Tarayıcıda saklananlar (hepsi `localStorage`, erişilemezse sessizce atlanır): program (`otomatikKayit.js`), tamamlanan görevler (`ilerleme.js`), görünüm tercihleri (`main.js` → `tercih`).
- `src/ekran/ekranModeli.js` canvas'tan bağımsızdır; görev kontrolü `gunluk()` (en fazla 5000 kayıt), çizici `ogeler()` kullanır.
- `deneme.html`: ekran modelini elle denemek için geçici sayfa (yalnızca `npm run dev` ile, derlemeye girmez).

## Mevcut seviye: "Ekrana yazdırma"

- Sanal EV3 ekranı **178×128 piksel**.
- Ekran API'si Pybricks EV3'e benzemeli: `clear()`, `print(...)`, `draw_text(x, y, text)`, `load_image(ImageFile...)`; ışık `ev3.light.on/off`.
- Ekran kategorisinin bütün blokları her görevde açık (18.11.2026 kararı; seviye-ekran.md Görev 1–2 için yalnızca temizle ve yaz diyordu).
- Blockly blokları bu API'ye karşılık gelmeli.

## Güvenlik (zorunlu)

- Öğrenci kodu her zaman bir **Web Worker** içinde çalışır.
- **3 saniye kilitlenme koruması:** worker 3 saniye boyunca yanıt vermezse (nabız gelmezse) sonlandırılır. Bekleme ve "sürekli" döngüler buna takılmaz, çünkü her blok adımında worker nefes alır (18.11.2026: etkileşimli sensörler için "3 sn işlem süresi" kuralı bununla değiştirildi). Toplam süre en fazla **5 dakika**. Durdur her zaman çalışır.
- Ana iş parçacığında `eval`, `new Function` veya benzeri dinamik kod çalıştırma kullanılmaz.
- Worker ile ana iş parçacığı yalnızca mesajlaşarak konuşur (ör. ekran çizim komutları).

## Gizlilik (zorunlu)

- Öğrenciden ad, e-posta veya fotoğraf istenmez.
- İlerleme yalnızca tarayıcıda (ör. `localStorage`) tutulur. Sunucuya veri gönderilmez.

## Çalışma biçimi

- Önce plan yap, onay al, sonra kod yaz.
- Her adımdan sonra testleri çalıştır. Testler geçmeden adımı bitmiş sayma.
