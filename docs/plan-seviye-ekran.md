# Plan: Otopark Ekranı seviyesi

## Güncelleme (18 Kasım 2026): EV3 Classroom tarzı bloklar, CoderZ benzeri editör

Kaynaklar: `~/Desktop/lego/Ekran Resmi 2026-11-15 *.png` (EV3 Classroom blok paleti, 8 resim)
ve CoderZ "Code Editor Controls" sayfası.

### Kararlar

| Konu | Karar |
|---|---|
| Blok motoru | Blockly kalır; Scratch tarzı `zelos` görünümüne geçilir (şapka blok, C döngü, altıgen koşul, yuvarlak değer). |
| Kapsam | Resimlerdeki **bütün kategoriler** araç kutusunda görünür. Görevin izin vermediği bloklar **gri ve sürüklenemez** olur ("Sonraki görevlerde açılacak"). |
| Dil | Blok yazıları Türkçe. |
| Sağ panel | EV3 tuğlası (çalışan ekranıyla) + `</>` ile salt okunur Python sekmesi. Altta konsol. |
| Simgeler | Kendi çizdiğimiz basit SVG simgeler. LEGO/CoderZ logosu ve çizimleri kullanılmaz. |

### Kategoriler ve renkler (resimlerden)

Motorlar (mavi), Hareket (pembe), Ekran (mor), Ses (açık mor), Olaylar (sarı), Kontrol (turuncu-sarı),
Sensörler (açık mavi), Operatörler (yeşil), Değişkenler (turuncu), Bloklarım (kırmızı).
Araç kutusu: solda renkli daireler ve altında kategori adı.

### Bu seviyede çalışan bloklar

| Blok | Python (Pybricks) |
|---|---|
| program başladığında | program gövdesi (şapkaya bağlı olmayan bloklar çalışmaz, soluk görünür) |
| `[EV3]` yaz, satır `[1]` | `ev3.screen.draw_text(0, (satır-1)*16, metin)` (Pybricks'te satır komutu yok) |
| `[EV3]` yaz, konum `[x]`,`[y]`, yazı tipi `[normal]` | `ev3.screen.draw_text(x, y, metin)` |
| ekranı temizle | `ev3.screen.clear()` |
| `[1]` saniye bekle | `wait(1000)` |
| birleştir, değişkenler | `str(a) + str(b)`, `bos_yer = 5` |

Diğer bütün bloklar yalnızca şekil olarak tanımlanır; Python karşılıkları ilgili seviye gelince yazılır.

### Editör düzeni (CoderZ'daki işlevlere benzer, kendi tasarımımız)

- Üst çubuk: seviye adı, görev seçici, ipucu düğmesi.
- Sol (koyu): kategori sütunu, araç çubuğu (Çalıştır/Durdur, Geri al, Yinele, Dışa aktar, İçe aktar), çalışma alanı (ortala, yakınlaştır, uzaklaştır, çöp kutusu), altta konsol.
- Sağ: EV3 tuğlası + Sıfırla; `</>` sekmesinde Python.

### Yeni adım sırası (her adımda testler)

A. Blok tanımları (tüm kategoriler), zelos teması, görev başına gri/açık araç kutusu, bu seviyenin Python karşılıkları.
B. Editör düzeni, EV3 tuğlası paneli, Python sekmesi, konsol.
C. Çalıştırıcı: JS üretimi, Web Worker, 3 sn zaman aşımı, Çalıştır/Durdur.
D. Görev kontrolcüsü, ipuçları, `localStorage` ilerlemesi.

### Riskler

- ~80 blok tanımı uzun ve hataya açık → her blok için "yüklenir ve Python/şekil üretir" testi.
- "satıra yaz" Pybricks'te yok; `draw_text` ile hesaplanır. Gerçek EV3 Classroom satır yüksekliğinden farklı olabilir.
- Gri bloklar çocukları şaşırtabilir → ipucu metni ve kilit simgesi.
- Scratch tarzı daire kategoriler için Blockly araç kutusu CSS ile özelleştirilecek.

---

## İlk plan (Blockly klasik görünüm)

Kaynak: `~/python/lego oyun/seviye-ekran.md` (hikâye, 4 görev, ipuçları, araç kutusu).

## Kararlar

| Konu | Karar |
|---|---|
| Python | Yalnızca gösterilir (salt okunur panel). Çalışan kod, bloklardan üretilen JS'dir ve Web Worker'da çalışır. |
| Görev 2 | `temizle` komutu `DOLU` yazısından **önce** gelmeli. |
| Görev 3 | `bos_yer` değişkeni ve birleştir bloğu **kullanılmalı**. |
| Metin eşleşmesi | Günlükteki bir yazı, beklenen metinle **tam olarak** aynı olmalı (büyük/küçük harf ve kenar boşlukları hariç). |
| Görev 4 | Ekranda bir **hedef kutusu** gösterilir. `konuma yaz` ile verilen (x, y) bu kutunun içinde olmalı. |
| Karakterler | EV3'e uygun: yalnızca ASCII. Türkçe harfler ekranda desteklenmez. |

## Açık sorular

- İpuçları nasıl açılsın? (düğme / N başarısız denemeden sonra / ikisi)
- Bloklar görevler arasında taşınsın mı? Görevler sırayla mı açılsın?
- Görev 4'te hedef kutusuna hangi metin yazılmalı? (Varsayılan: herhangi bir metin.)

## Mimari

- **Bloklar:** `ekranı temizle`, `ekrana yaz`, `konuma yaz` + Blockly'nin değişken, `text_join`, sayı ve metin blokları. Araç kutusu görev başına seviye verisinden gelir.
- **Üreticiler:** Python (Pybricks: `EV3Brick`, `ev3.screen.clear/print/draw_text`, sayılar `str()` ile) ve JS (worker için).
- **Ekran modeli (saf JS):** 178×128, satır imleci, kaydırma, yazı günlüğü `{tur, metin, x, y}`.
- **Canvas çizici:** ölçekli, keskin pikseller, tek renk.
- **Çalıştırıcı:** Web Worker; `new Function` yalnızca worker içinde; `fetch`/`importScripts` kapalı; 3 sn sayaç worker "hazır" dedikten sonra başlar, dolunca `terminate()`.
- **Görev kontrolcüsü:** seviye verisi + kontrol fonksiyonları (günlük ve blok yapısı üzerinden), durumlar `hazır → çalışıyor → başarılı | tekrar dene | zaman aşımı`, ilerleme `localStorage` içinde.

## Adımlar (her adımdan sonra testler)

1. Vite + Vitest + Blockly iskeleti; `CLAUDE.md` komutları güncellenir.
2. Ekran modeli + testler.
3. Görev verisi ve kontrol fonksiyonları + testler.
4. Bloklar, Python ve JS üreticiler + testler.
5. Worker çalıştırıcı ve zaman aşımı + testler.
6. Canvas çizici ve arayüz (Türkçe metinler).
7. İpuçları ve `localStorage` ilerlemesi.

## Riskler

- Gösterilen Python ile çalışan JS ayrışabilir → aynı bloklardan iki çıktıyı karşılaştıran testler.
- Pybricks yazı tipi ve `print` kaydırması yaklaşık taklit edilir.
- Öğrenci metin bloğuna Türkçe harf yazarsa: uyarı gösterilecek (ASCII kararı gereği).
- Değişken adlarında Türkçe harf (`boş_yer`) Python'da bozuk ada dönüşür → ASCII dışı adlarda uyarı.
- Blockly paket boyutu okul ağında yavaş yüklenebilir.
