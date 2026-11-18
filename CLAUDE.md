# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proje

Lego Mindstorms EV3'ü öğreten, web tabanlı bir simülatör oyunu. Hedef kitle ortaokul öğrencileri.

- Arayüzdeki tüm metinler Türkçe olmalı. Cümleler kısa ve sade tutulmalı.
- Proje erken aşamada: yalnızca Vite iskeleti var. Bu dosya plana göre yazıldı.

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

- Bloklar EV3 Classroom paletini (Scratch tarzı, `zelos` görünümü) Türkçe olarak izler. Kaynak resimler: `~/Desktop/lego/Ekran Resmi 2026-11-15 *.png`.
- Blockly'yi her zaman `src/bloklar/blocklyKurulum.js` üzerinden al (Türkçe dil, blok kayıtları, tema). `blockly/core` doğrudan alınırsa hazır bloklar metinsiz kalır ve hata verir.
- Her kategori `src/bloklar/kategoriler/<ad>.js` içinde: `bloklar` (JSON tanımları), `arac` (araç kutusu öğeleri, `aracOgesi()` boş girişlere beyaz oval koyar), `python` (yalnızca şu ana kadar çalışan bloklar). Yeni blok eklerken üçünü birlikte güncelle.
- Açılır listeleri `ortak.js` içindeki `secim()` ile kur: Blockly ortak baş kelimeyi listenin dışına taşır, `secim()` bunu engeller.
- Python yalnızca "program başladığında" bloğuna bağlı zincirlerden üretilir (`pythonKodu.js`). Satır ve konum öğrenciye 1'den başlar; Python'da 0'a çevrilir (`pythonYardimci.js`).
- Araç kutusu `src/seviye/otoparkEkrani.js` içindeki `aracKutusu(no)` ile üretilir: bütün kategoriler görünür, görevde açık olmayan bloklar `disabledReasons` ile gri ve sürüklenemez olur. Araç kutusu **her zaman kategorilidir** (Blockly sonradan biçim değişimine izin vermez). Değişkenler ve Bloklarım dinamik kategorilerdir (`kayit.js` → `dinamikKategorileriBagla`).
- Sayfa düzeni (`index.html` + `src/stil.css`): solda koyu editör (araç çubuğu, Blockly, konsol), sağda EV3 tuğlası ve `</> Python` sekmesi. Araç kutusundaki renkli daireler `src/bloklar/daireKategori.js` ile çizilir (Blockly'nin varsayılan kategori sınıfının yerine kaydedilir).
- Çalıştırma: bloklar → `jsKodu.js` (her kategorinin `js` haritası; Python ile aynı 1→0 dönüşümleri) → `src/calistirici/calistirici.js` worker'ı başlatır, 3 sn sayacı worker "hazır" deyince başlar → `isci.js` ağı kapatır, `yurutucu.js` kodu `new Function` ile yalnızca worker içinde çalıştırır → ekran komutları (`temizle`, `konum`) mesajla gelir, `komutuUygula` ile ekran modeline işlenir. Yeni bir çalışan blokta `python` ve `js` karşılığını birlikte yaz; `tests/calistirma.test.js` ikisinin aynı sonucu verdiğini denetler.
- Görev kontrolü (`src/seviye/`): program `bitti` ile bitince `gorevKontrol.js` ekran yazı günlüğüne (`ekran.gunluk()`) ve program yapısına (`programOzeti.js`) bakar; mesajlar öğrenciye cevabı vermeden ne eksik olduğunu söyler. Metin eşleşmesi tam (büyük/küçük harf ve baş/son boşluk hariç). Görev 4'ün hedef kutusu `GOREVLER[3].hedef` içinde (0'dan başlayan piksel). `izinliMi()` görevde açık olmayan blokları çalışma alanında da kapatır (görev değişince ve dosya açılınca). İlerleme yalnızca `localStorage` (`ilerleme.js`); erişilemezse sessizce atlanır.
- `src/arayuz/`: konsol ve program dosyası (dışa/içe aktar, `programCoz` Türkçe hata verir). İçe aktarma başarısız olursa eski çalışma alanı geri yüklenir.
- `src/ekran/ekranModeli.js` canvas'tan bağımsızdır; görev kontrolü `gunluk()`, çizici `ogeler()` kullanır.
- `deneme.html`: ekran modelini elle denemek için geçici sayfa (yalnızca `npm run dev` ile, derlemeye girmez).

## Mevcut seviye: "Ekrana yazdırma"

- Sanal EV3 ekranı **178×128 piksel**.
- Ekran API'si Pybricks EV3'e benzemeli: `clear()`, `print(...)`, `draw_text(x, y, text)`.
- Blockly blokları bu API'ye karşılık gelmeli.

## Güvenlik (zorunlu)

- Öğrenci kodu her zaman bir **Web Worker** içinde çalışır.
- Her çalıştırmanın **3 saniye** zaman aşımı vardır. Süre dolunca worker sonlandırılır.
- Ana iş parçacığında `eval`, `new Function` veya benzeri dinamik kod çalıştırma kullanılmaz.
- Worker ile ana iş parçacığı yalnızca mesajlaşarak konuşur (ör. ekran çizim komutları).

## Gizlilik (zorunlu)

- Öğrenciden ad, e-posta veya fotoğraf istenmez.
- İlerleme yalnızca tarayıcıda (ör. `localStorage`) tutulur. Sunucuya veri gönderilmez.

## Çalışma biçimi

- Önce plan yap, onay al, sonra kod yaz.
- Her adımdan sonra testleri çalıştır. Testler geçmeden adımı bitmiş sayma.
