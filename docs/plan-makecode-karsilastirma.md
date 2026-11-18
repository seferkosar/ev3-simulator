# MakeCode EV3 incelemesi ve öneri planı

İnceleme: 18 Kasım 2026, https://makecode.mindstorms.com (Blocks/JavaScript editörü, simülatör, öğreticiler).

## MakeCode'da gördüklerim

| Alan | Ne var |
|---|---|
| Düzen | Sol: EV3 simülatörü (portlarıyla). Orta: arama kutusu + kategoriler. Sağ: çalışma alanı. Üst: Blocks / JavaScript geçişi. Alt: İndir, proje adı, geri al/yinele, yakınlaştır. |
| Kategoriler | Brick, Sensors, Motors, Music, Loops, Logic, Variables, Math; Advanced altında Functions, Arrays, Text, Console, Control, Extensions. |
| Çalıştırma | Çalıştır düğmesi yok; her değişiklikte program kendiliğinden yeniden başlar. |
| Simülatör | Programda kullanılan motor ve sensör ilgili porta **kendiliğinden bağlanır**. Dokunma sensörüne basılır, renk paletten seçilir, mesafe kaydırıcıyla, jiroskop kadranla ayarlanır. Motor yüzde hızıyla döner. Tuğla düğmeleri tıklanır, durum ışığı yanar. Ekrana tıklayınca tuğla büyür. |
| Simülatör düğmeleri | Durdur, Yeniden başlat, Yavaş çekim, Sessiz, Tam ekran. Her sensörün yanında "kaldır" (⊗). |
| Kod görünümü | JavaScript **düzenlenebilir ve bloklara geri çevrilir** (iki yönlü). |
| Arama | Araç kutusunda blok arama ("show string" yazınca ilgili bloklar). |
| Projeler | Tarayıcıda otomatik kayıt, "Projelerim" listesi, içe aktar, proje adı. |
| Öğreticiler | Konulara göre ~50 öğretici. Öğretici kipinde: adım noktaları, talimat çubuğunda renkli blok adları, İpucu'na basınca **çözümün blok resmi**, Geri/İleri, yalnızca gereken kategoriler. |
| Ayarlar | Dil seçimi, yüksek kontrast, yazdır, eklentiler, paylaş (bulut). |

## Bizim editörle karşılaştırma

| Özellik | MakeCode | Bizde |
|---|---|---|
| Blok dili | MakeCode'un kendi blokları | EV3 Classroom blokları (ders programınızla aynı) ✔ |
| Kod görünümü | JS, düzenlenebilir | Python (Pybricks), salt okunur |
| Görev kontrolü | Yok (öğretici yalnızca anlatır) | Var, Türkçe geri bildirim ✔ |
| Güvenlik | — | Worker, ağ kapalı, süre sınırı ✔ |
| Otomatik kayıt | Var | **Yok: sayfa yenilenince program kaybolur** |
| Blok arama | Var | Yok |
| İpucu | Çözümün blok resmi | Konsolda metin |
| Sensör/motor simülasyonu | Var, etkileşimli | Yok (yalnızca ekran ve ışık) |
| Çalışan bloğu gösterme | Yavaş çekim | Yok |
| Ekranı büyütme | Var | Yok |

## Öneriler (öncelik sırasıyla)

### Aşama 1 — Bu seviyeyi hemen iyileştirir (küçük işler)

1. **Otomatik kayıt:** Çalışma alanı tarayıcıda (`localStorage`) kendiliğinden saklanır, sayfa yenilenince geri gelir. "Yeni program" düğmesi. *(Gizlilik kuralına uygun: yalnızca tarayıcıda.)*
2. **Öğretici kartı:** Görev metni editörün üstünde bir kartta; blok adları kendi renkleriyle. İpucu konsol yerine kartta açılır; son ipucu çözümün **blok resmini** (salt okunur küçük bir Blockly alanı) gösterir.
3. **Blok arama kutusu:** 94 blok arasında arama (Blockly'nin resmi `toolbox-search` eklentisi).
4. **Ekranı büyütme:** Tuğla ekranına tıklayınca büyük görünüm.
5. **Python'u indir:** `main.py` olarak indir; öğrenci gerçek EV3'te (Pybricks) çalıştırabilir. Seviye 3'teki MicroPython derslerine köprü.
6. **İngilizce karşılık:** Bloğun üstüne gelince EV3 Classroom'daki İngilizce adı ("write … at line"). Ders programındaki "terimi Türkçe ve İngilizce yaz" kuralına uyar, gerçek uygulamaya geçişi kolaylaştırır.

### Aşama 2 — Simülatörü büyütür (sonraki seviyeler için temel)

7. **Çalışan bloğu vurgulama + yavaş çekim:** Program çalışırken o anki blok parlar; "yavaş" düğmesiyle adım adım izlenir. Hata ayıklamayı öğretir.
8. **Tuğla düğmeleri ve olaylar:** Tuğladaki 5 düğme tıklanır; "düğmesine basıldığında" ve "düğmesi basılı mı?" blokları çalışır. (Worker'a ana sayfadan sensör durumu gönderilir; mimaride küçük bir genişleme.)
9. **Port diyagramı ve sensör kontrolleri:** Tuğlanın çevresinde A–D, 1–4 portları. Programda kullanılan sensör kendiliğinden bağlanır: dokunma (bas), renk (palet), mesafe (kaydırıcı), jiroskop (kadran). Sensör blokları çalışır.
10. **Motorlar:** Dönen motor göstergesi, yüzde hız ve derece sayacı. Motor blokları çalışır.
11. **Ses:** Bip ve nota blokları Web Audio ile çalar; "Sessiz" düğmesi.
12. **Simülatör düğmeleri:** Durdur, Yeniden başlat, Yavaş çekim, Sessiz, Tam ekran.

### Aşama 3 — İsteğe bağlı

13. Kontrol blokları (tekrarla, sürekli, eğer) ve Operatörler: diğer seviyeler için.
14. Yüksek kontrast ve yazı büyütme (erişilebilirlik); klavyeyle blok gezinme.
15. Programı yazdırma (çalışma kâğıdı için).
16. Gerçek EV3 piksel yazı tipine benzeyen kendi bitmap yazı tipimiz.

## Değiştirmeyi önermediklerim

- **Blok dili:** MakeCode bloklarına geçmeyelim; ders programınız EV3 Classroom bloklarını kullanıyor (sitenizde de bu fark not edilmiş).
- **Otomatik yeniden çalıştırma:** Görev kontrolü için açık "Çalıştır" daha iyi; istenirse "değişince çalıştır" seçeneği eklenebilir.
- **Bulut paylaşımı, hesap:** Gizlilik kuralına aykırı. Dosyaya kaydet/aç yeterli.
- **Düzenlenebilir kod (iki yönlü):** Python'dan bloğa çeviri büyük bir iş; Seviye 3 gelince ayrıca değerlendirilir.
- **Görseller:** MakeCode'un ve LEGO'nun tuğla, sensör, logo çizimlerini kopyalamayalım; kendi çizimlerimizi kullanalım.

## Uygulama durumu (18 Kasım 2026)

16 maddenin hepsi uygulandı. Ek olarak "Serbest" çalışma modu eklendi (görevlerde gri olan motor, sensör ve ses bloklarını denemek için).

Bilerek yapılan değişiklikler:
- Süre kuralı: "3 sn işlem süresi" yerine "3 sn yanıt vermezse durdur" (kilitlenme koruması) ve toplam 5 dk. Etkileşimli sensör programları (sürekli döngüler) bunu gerektiriyor.
- "yaz, satır" önce satırı temizler; Python'da `draw_box` ile aynısı yapılır.
- Motor/hareket/sensör/ses Python karşılıkları Pybricks belgelerine göre yazıldı ve derlenebilir olduğu denetlendi; gerçek bir EV3'te denenmedi.
