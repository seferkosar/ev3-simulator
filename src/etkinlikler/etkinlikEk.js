// Ek etkinlikler (EV3 çalışma sitesi): 133–167 arasındaki kalan uygulamalı etkinlikler ve
// konuların örnek görev programları (EV3Lessons ve CS2N modülleri, sitedeki CODE2 / P16 programları).
// Biçim etkinlikler.js ile aynı; `konu` sitedeki konu numarasıdır.
import { sahneBul } from '../simulasyon/sahneler.js';

const bas = (...b) => [['start'], ...b];
const v = (ad) => ['var', ad];
const orta = (x = 100, y = 75, yon = 0, ek = {}) => ({ genislik: 200, yukseklik: 150, baslangic: { x, y, yon }, ...ek });
const serit = (x, renk, g = 6, y = 0, h = 150) => ({ x, y, g, h, renk });
const DOKUNMA = ['pressed', '~1'];
const renkMi = (r) => ['iscolor', '~3', `~${r}`];
const cizgiSahnesi = sahneBul('cizgi').sahne;

// Kırmızı pist (siyaha kadar izle) — çizgi pistinin kırmızı kopyası ve üstte siyah bitiş işareti
const kirmiziPist = {
  ...cizgiSahnesi,
  cizgiler: [
    { ...cizgiSahnesi.cizgiler[0], renk: 'RED' },
    { noktalar: [[85, 20], [85, 40]], kalinlik: 4, renk: 'BLACK' },
  ],
  yildizlar: [],
};

// Engelin etrafından (konu 20)
const engelSahnesi = orta(30, 40, 0, {
  engeller: [{ x: 50, y: 50, g: 50, h: 15, tur: 'kutu' }],
  bolgeler: [serit(24, 'GREEN', 4, 25, 60)],
});

// Kutunun çevresi: pivot dönüşlü (konu 82) ve gyro dönüşlü (konu 33)
const kutuPivot = orta(50, 120, -90, { engeller: [{ x: 66, y: 82, g: 24, h: 24, tur: 'kutu' }] });
const kutuGyro = orta(40, 120, -90, { engeller: [{ x: 54, y: 82, g: 24, h: 24, tur: 'kutu' }] });

export const EK_ETKINLIKLER = [
  // ---------- Tuğla ve sensörler (elle) ----------
  {
    id: '139', konu: 139, grup: 'Renk ve çizgi', baslik: 'Renk ayırıcı', mod: 'elle',
    aciklama: 'Renk sensörünün önüne tutulan parçanın rengini ekrana yazar. Her renk için ayrı bir "eğer" bloğu var.',
    gelistir: 'Her renkten kaç parça sayıldığını değişkenlerde tut. A motoruyla bir kapak ekleyip kırmızıları sola, mavileri sağa ayır.',
    ipucu: 'Robot sekmesinde renk sensöründe sırayla kırmızı, mavi, yeşil ve sarıyı seç. Bitirmek için Durdur.',
    uyarlama: 'Renk adını söyleyen sesler bizde yok; her renk farklı bir nota çalar.',
    programlar: [bas(['forever', [
      ['if', renkMi('kırmızı'), [['write', 'KIRMIZI', 3], ['beep', 60, 0.3]]],
      ['if', renkMi('mavi'), [['write', 'MAVI', 3], ['beep', 64, 0.3]]],
      ['if', renkMi('yeşil'), [['write', 'YESIL', 3], ['beep', 67, 0.3]]],
      ['if', renkMi('sarı'), [['write', 'SARI', 3], ['beep', 72, 0.3]]],
      ['wait', 0.5], ['clear'],
    ]])],
  },
  {
    id: '142', konu: 142, grup: 'Renk ve çizgi', baslik: 'Gece lambası (ortam ışığı)', mod: 'elle',
    aciklama: 'Ortam karanlıklaşınca (ortam ışığı < 10) turuncu ışık yanar ve gözler uykulu olur; aydınlıkta ışık söner.',
    gelistir: 'Işık ölçer yap: yansıyan ve ortam ışığını ekrana yaz; farklı yüzeyleri ölçüp tabloya geçir.',
    ipucu: 'Robot sekmesinde renk sensörünün Ortam kaydırıcısını 10\'un altına indir (karanlık), sonra yükselt. Bitirmek için Durdur.',
    uyarlama: '"Yorgun gözler" yerine "Uykulu" resmi kullanıldı.',
    programlar: [bas(['forever', [
      ['ifelse', ['lt', ['amb', '~3'], 10], [['light', '~turuncu'], ['img', '~Uykulu']], [['light', '~kapalı'], ['img', '~Uyanık']]],
      ['wait', 0.5],
    ]])],
  },
  {
    id: '83', konu: 83, grup: 'Dokunma', baslik: 'Basılıysa gülen, değilse uykulu yüz', mod: 'elle',
    aciklama: '"Eğer … değilse" bloğu iki yoldan birini seçer: dokunma sensörü basılıysa bir resim, değilse başka bir resim.',
    gelistir: 'Bir dokunuşta gözler, ikincide başka bir yüz göstersin ("basıldı, sonra bırakıldı" bekle).',
    ipucu: 'Robot sekmesinde dokunma sensörüne basılı tut, sonra bırak; ekranı izle. Bitirmek için Durdur.',
    uyarlama: '"Büyük gülümseme" ve "Üzgün" resimleri bizde yok; "Sevgi" ve "Uykulu" kullanıldı.',
    programlar: [bas(['forever', [['ifelse', DOKUNMA, [['img', '~Sevgi']], [['img', '~Uykulu']]], ['wait', 0.3]]])],
  },
  {
    id: '161', konu: 161, grup: 'Veri ve hesap', baslik: 'Mantık kapıları (ve, veya, değil)', mod: 'elle',
    aciklama: 'Dokunma sensörü (A) ve orta düğme (B) ile VE, VEYA, DEĞİL kapılarını dene. Sonuç ekranda; VEYA doğruysa ışık yeşil.',
    gelistir: 'İki sensörlü bir güvenlik kuralı tasarla: "mesafe < 20 VE dokunma basılı" ise alarm.',
    ipucu: 'Robot sekmesinde önce yalnız dokunmaya bas, sonra dokunma basılıyken orta düğmeye de bas. Bitirmek için Durdur.',
    programlar: [bas(['forever', [
      ['clear'],
      ['ifelse', DOKUNMA, [['write', 'A: 1', 1]], [['write', 'A: 0', 1]]],
      ['ifelse', ['and', DOKUNMA, ['btn', '~orta']], [['write', 'AND: 1', 3]], [['write', 'AND: 0', 3]]],
      ['ifelse', ['or', DOKUNMA, ['btn', '~orta']], [['write', 'OR: 1', 4], ['light', '~yeşil']], [['write', 'OR: 0', 4], ['light', '~kapalı']]],
      ['ifelse', ['not', DOKUNMA], [['write', 'NOT A: 1', 5]], [['write', 'NOT A: 0', 5]]],
      ['wait', 0.1],
    ]])],
  },
  {
    id: '159', konu: 159, grup: 'Veri ve hesap', baslik: 'Refleks ölçme oyunu', mod: 'elle',
    aciklama: 'Robot rastgele bir süre bekler, sonra ışığı yeşil yakar. Orta düğmeye ne kadar hızlı basarsan refleksin o kadar iyi. En iyi süre bir değişkende saklanır.',
    gelistir: 'Her öğrenci 5 kez oynasın; ortalama refleks süresi kaç?',
    ipucu: 'Robot sekmesinde ışık yeşil yanınca hemen orta düğmeye bas. Erken basarsan "Erken bastin!" yazar. Bitirmek için Durdur.',
    uyarlama: '"Error" ve "Fantastic" sesleri yerine "Hayır" ve "Evet".',
    programlar: [bas(['set', '~en iyi', 99], ['forever', [
      ['clear'], ['write', 'BEKLE', 3], ['light', '~kırmızı'], ['wait', ['rand', 2, 5]],
      ['ifelse', ['btn', '~orta'], [['write', 'Erken bastin!', 5], ['sound', '~Hayır']], [
        ['light', '~yeşil'], ['resettimer'], ['waitbtn', '~orta', '~basılı'],
        ['set', '~süre', ['div', ['round', ['mul', ['timer'], 100]], 100]],
        ['if', ['lt', v('süre'), v('en iyi')], [['set', '~en iyi', v('süre')], ['sound', '~Evet']]],
        ['clear'], ['write', ['join', 'Sure: ', v('süre')], 2], ['write', ['join', 'En iyi: ', v('en iyi')], 4],
        ['waitbtn', '~orta', '~bırakılmış'], ['wait', 2],
      ]],
    ]])],
  },
  {
    id: '160', konu: 160, grup: 'Veri ve hesap', baslik: 'Tek mi çift mi? (mod)', mod: 'elle',
    aciklama: 'Robot 1–99 arasında bir sayı tutar. Sol düğme "tek", sağ düğme "çift" demek. Sayı mod 2 = 0 ise çifttir. 5 turda puanını say.',
    gelistir: '3\'e bölünebilir mi oyunu yap (mod 3). Doğru cevapta süre kısalsın.',
    ipucu: 'Robot sekmesinde ekrandaki sayı çiftse sağ, tekse sol düğmeye bas. Beş soru sonra puan yazar.',
    uyarlama: '"Yes" ve "No" sesleri yerine "Evet" ve "Hayır".',
    programlar: [bas(['set', '~puan', 0], ['rep', 5, [
      ['set', '~sayı', ['rand', 1, 99]], ['clear'], ['writexy', v('sayı'), 70, 30],
      ['until', ['or', ['btn', '~sol'], ['btn', '~sağ']]],
      ['ifelse', ['or', ['and', ['btn', '~sağ'], ['eq', ['mod', v('sayı'), 2], 0]], ['and', ['btn', '~sol'], ['eq', ['mod', v('sayı'), 2], 1]]],
        [['change', '~puan', 1], ['sound', '~Evet']], [['sound', '~Hayır']]],
      ['wait', 1],
    ]], ['clear'], ['write', ['join', 'Puan: ', v('puan')], 3], ['wait', 5])],
  },
  {
    id: '149', konu: 149, grup: 'Motor', baslik: 'Düğmeyle kumanda edilen vinç', mod: 'elle',
    aciklama: 'Yukarı düğme basılıyken vinç kolu (A) kalkar, aşağı düğmeyle iner, bırakınca durur. Orta düğme kancayı (D) açıp kapatır; "kanca açık" değişkeni son durumu hatırlar.',
    gelistir: 'Kol en fazla 90° kalksın (A motorunun derecesine bak). Kanca açılırken bip çalsın.',
    ipucu: 'Robot sekmesinde yukarı düğmeyi basılı tut ve A motorunun dönmesini izle. Orta düğmeye bas: D motoru döner. Bitirmek için Durdur.',
    programlar: [
      bas(['mospeed', '~A', 25], ['set', '~kanca açık', 0], ['forever', [
        ['ifelse', ['btn', '~yukarı'], [['mostart', '~A', '~saat yönünün tersine']],
          [['ifelse', ['btn', '~aşağı'], [['mostart', '~A', '~saat yönünde']], [['mostop', '~A']]]]],
      ]]),
      [['ondugme', '~orta'], ['ifelse', ['eq', v('kanca açık'), 0],
        [['morun', '~D', '~saat yönünde', 90, '~derece'], ['set', '~kanca açık', 1]],
        [['morun', '~D', '~saat yönünün tersine', 90, '~derece'], ['set', '~kanca açık', 0]]]],
    ],
  },
  {
    id: '150', konu: 150, grup: 'Motor', baslik: 'Devir ölçer', mod: 'elle',
    aciklama: 'B motoru 1 saniye çalışır; sayılan dereceden dakikadaki devir (derece ÷ 360 × 60) hesaplanır. Orta düğmeye her basışta hız 10 artar.',
    gelistir: 'Hız (10…100) ile devir/dk arasındaki ilişkiyi grafiğe dök. Doğru orantılı mı?',
    ipucu: 'Robot sekmesinde ekrandaki sonucu oku, sonra orta düğmeye bas: hız 10 artar.',
    programlar: [bas(['set', '~hız', 10], ['rep', 10, [
      ['moreset', '~B'], ['mostarth', '~B', v('hız')], ['wait', 1], ['set', '~derece', ['modeg', '~B']], ['mostop', '~B'],
      ['clear'], ['write', ['join', 'Hiz %: ', v('hız')], 1], ['write', ['join', 'Derece/sn: ', v('derece')], 3],
      ['write', ['join', 'Devir/dk: ', ['round', ['mul', ['div', v('derece'), 360], 60]]], 4],
      ['waitbtn', '~orta', '~basılı'], ['change', '~hız', 10],
    ]])],
  },
  {
    id: '152', konu: 152, grup: 'Motor', baslik: 'LEGO saat (saniye ibresi)', mod: 'elle',
    aciklama: 'Saniye ibresi her saniye 6° döner (360 ÷ 60). Bekleme yerine zamanlayıcıyla tam saniyeyi beklemek saatin gecikmesini önler.',
    gelistir: 'Dakika ibresi ekle (B motoru, her 60 saniyede 6°). Her 10 saniyede farklı bir ses çal.',
    ipucu: 'Robot sekmesinde A motorunun derecesini izle: her saniye 6 artar. Bitirmek için Durdur.',
    programlar: [bas(['mospeed', '~A', 50], ['resettimer'], ['set', '~saniye', 0], ['forever', [
      ['morun', '~A', '~saat yönünde', 6, '~derece'], ['beep', 90, 0.02], ['change', '~saniye', 1],
      ['until', ['gt', ['timer'], v('saniye')]],
    ]])],
  },
  {
    id: '154', konu: 154, grup: 'Olay', baslik: 'Yayınla ve dinle: alarm sistemi', mod: 'elle',
    aciklama: 'Dokunma sensörü ya da yakın bir nesne aynı mesajı yayınlar; "mesajı gelince" yığını sireni çalar. Siren kodu bir kez yazılır, iki olaydan çağrılır.',
    gelistir: 'Üçüncü bir tetikleyici ekle: renk sensörü kırmızı görünce de alarm çalsın.',
    ipucu: 'Robot sekmesinde dokunma sensörüne bas ya da Mesafe kaydırıcısını 15 cm\'nin altına indir. Bitirmek için Durdur.',
    uyarlama: 'Mesaj adı "alarm" yerine "mesaj1" (bizde tek mesaj adı var).',
    programlar: [
      [['ondokunma', '~1'], ['broadcast']],
      [['onmesafe', '~4', '<', 15], ['broadcast']],
      [['onmesaj'], ['light', '~kırmızı'], ['rep', 3, [['beep', 84, 0.2], ['beep', 72, 0.2]]], ['light', '~yeşil']],
      bas(['light', '~yeşil'], ['write', 'Alarm kurulu', 3]),
    ],
  },
  {
    id: '163', konu: 163, grup: 'Proje', baslik: 'Güvenlik robotu', mod: 'elle',
    aciklama: 'Robot kapıda nöbet tutar: biri geçerse (mesafe < 40) alarm çalar ve ihlal sayısı artar. Dokunma sensörü şifre gibidir: 3 basışta sistem kapanır. Orta düğme sayaçları sıfırlar.',
    gelistir: 'Yanlış saatte (zamanlayıcı > 30) geçişleri ayrıca say. Şifreyi "dokun, orta düğme, dokun" sırası yap.',
    ipucu: 'Robot sekmesinde Mesafe kaydırıcısını 40 cm\'nin altına indirip geri çıkar (biri geçti). Sonra dokunma sensörüne 3 kez bas.',
    uyarlama: '"Goodbye" sesi yerine "Hoşça kal".',
    programlar: [
      bas(['set', '~ihlal', 0], ['set', '~şifre', 0], ['light', '~yeşil'], ['forever', [
        ['clear'], ['write', 'NOBETTE', 1], ['write', ['join', 'Ihlal: ', v('ihlal')], 3],
        ['write', ['join', ['join', 'Sifre: ', v('şifre')], '/3'], 4], ['wait', 0.2],
      ]]),
      [['onmesafe', '~4', '<', 40], ['change', '~ihlal', 1],
        ['rep', 4, [['light', '~kırmızı'], ['beep', 84, 0.15], ['light', '~kapalı'], ['wait', 0.15]]], ['light', '~yeşil']],
      [['ondokunma', '~1'], ['change', '~şifre', 1],
        ['if', ['eq', v('şifre'), 3], [['clear'], ['write', 'KAPANDI', 3], ['sound', '~Hoşça kal'], ['stop']]]],
      [['ondugme', '~orta'], ['set', '~ihlal', 0], ['set', '~şifre', 0]],
    ],
  },
  {
    id: '95b', konu: 95, grup: 'Tuğla', baslik: 'Düğmelerle menü (robotu yönet)', mod: 'sahne', sahne: orta(60, 110, -90),
    aciklama: 'Ekranda bir menü yazar. Yukarı: 1 tur ileri, aşağı: geri, sol/sağ: 90° dön. "veya" bloğu dört düğmeden herhangi birini bekler.',
    gelistir: 'Orta düğmeye "kare çiz" seçeneği ekle. Her hareketten sonra bip çalsın.',
    ipucu: 'Robot sekmesinde tuğlanın düğmelerine bas, Sahne sekmesinde robotun hareketini izle (önce Sahne sekmesini aç, sonra düğmelere Robot sekmesinden bas).',
    programlar: [bas(['forever', [
      ['clear'], ['write', 'Yukari: Ileri', 1], ['write', 'Asagi: Geri', 3], ['write', 'Sol: Sola don', 5], ['write', 'Sag: Saga don', 7],
      ['until', ['or', ['or', ['btn', '~yukarı'], ['btn', '~aşağı']], ['or', ['btn', '~sol'], ['btn', '~sağ']]]],
      ['if', ['btn', '~yukarı'], [['mvforh', '~düz: 0', 1, '~dönüş', 50]]],
      ['if', ['btn', '~aşağı'], [['mvforh', '~düz: 0', 1, '~dönüş', -50]]],
      ['if', ['btn', '~sol'], [['mvforh', '~sol: -100', 0.5, '~dönüş', 50]]],
      ['if', ['btn', '~sağ'], [['mvforh', '~sağ: 100', 0.5, '~dönüş', 50]]],
    ]])],
  },
  {
    id: '95a', konu: 95, grup: 'Tuğla', baslik: 'Orta düğmeye basılana kadar ilerle', mod: 'sahne', sahne: orta(20, 75, 0),
    aciklama: 'Robot ilerler; orta düğmeye basılınca durur. Programın bir yerine düğme beklemesi koymak hata ayıklamada da işe yarar.',
    gelistir: 'Sol düğme sola, sağ düğme sağa döndürsün; orta düğme dursun.',
    ipucu: 'Sahne sekmesinde robot ilerlerken Robot sekmesindeki orta düğmeye bas.',
    programlar: [bas(['mvstarth', '~düz: 0', 50], ['waitbtn', '~orta', '~basılı'], ['mvstop'])],
  },

  // ---------- Hareket ----------
  {
    id: '69', konu: 69, grup: 'Hareket', baslik: 'Bitişe git ve geri dön', mod: 'sahne',
    sahne: orta(20, 75, 0, { bolgeler: [serit(106, 'YELLOW', 4)] }),
    aciklama: 'Robot 5 tur ileri gidip sarı bitiş çizgisine varır, sonra eksi hızla 5 tur geri gelir. Aynı tur sayısı: gidilen yol ile dönülen yol eşit.',
    gelistir: 'Birimi tur yerine derece ya da saniye yap: aynı yol kaç derece? kaç saniye?',
    ipucu: 'Sahnede cetvelle başlangıçtan bitişe ölç: 5 tur kaç cm?',
    programlar: [bas(['mvforh', '~düz: 0', 5, '~dönüş', 50], ['mvforh', '~düz: 0', 5, '~dönüş', -50])],
  },
  {
    id: '73', konu: 73, grup: 'Hareket', baslik: '"Hello World" yaz ve 3 saniye ilerle', mod: 'sahne', sahne: orta(20, 75, 0),
    aciklama: 'Ekrana yazı yazılır, robot harekete başlar, 3 saniye beklenir, sonra durur. "Harekete başla" beklemez; süreyi "bekle" belirler.',
    gelistir: 'İki satır yaz ve 5 saniye bekle: bekleme olmazsa yazı neden hemen kaybolur?',
    ipucu: 'Robot sekmesinde ekrana, Sahne sekmesinde robota bak. 3 saniyede kaç cm gitti?',
    programlar: [bas(['write', 'Hello World', 5], ['mvstarth', '~düz: 0', 50], ['wait', 3], ['mvstop'])],
  },
  {
    id: '20a', konu: 20, grup: 'Hareket', baslik: 'Engelin etrafından: kare dönüşler', mod: 'sahne', sahne: engelSahnesi,
    aciklama: 'Engelin yanından 5 tur geç, yerinde 90° sağa dön (0,5 tur), arkasından 2 tur geç, yine dön ve 5 turla yeşil başlangıç çizgisine dön.',
    gelistir: 'Engelin etrafından sola doğru dolan. Kaç blok değişti?',
    ipucu: 'Sahnede robotun izini izle; engele değmemeli.',
    programlar: [bas(
      ['mvforh', '~düz: 0', 5, '~dönüş', 50], ['mvforh', '~sağ: 100', 0.5, '~dönüş', 50],
      ['mvforh', '~düz: 0', 2, '~dönüş', 50], ['mvforh', '~sağ: 100', 0.5, '~dönüş', 50],
      ['mvforh', '~düz: 0', 5, '~dönüş', 50],
    )],
  },
  {
    id: '20b', konu: 20, grup: 'Hareket', baslik: 'Engelin etrafından: tek geniş dönüş', mod: 'sahne', sahne: engelSahnesi,
    aciklama: 'Aynı görev tek bir geniş dönüşle: sol teker 100, sağ teker 50 hızla dönünce robot sağa doğru yarım daire çizer.',
    gelistir: 'Daha geniş bir yarım daire için hızları nasıl değiştirmelisin? (70/50 dene.)',
    ipucu: 'Kare dönüşlü programla karşılaştır: hangisi daha kısa? Hangisi daha hızlı?',
    uyarlama: 'Sitede yay 3,8 tur; bu robotta tam yarım daire için hızlı tekerin 4 tur dönmesi gerekiyor.',
    programlar: [bas(['mvforh', '~düz: 0', 5, '~dönüş', 50], ['tank', 4, '~dönüş', 100, 50], ['mvforh', '~düz: 0', 5, '~dönüş', 50])],
  },
  {
    id: '82', konu: 82, grup: 'Hareket', baslik: 'Kutunun çevresini bir kez dolaş (pivot)', mod: 'sahne', sahne: kutuPivot,
    aciklama: '"4 kez tekrarla": 1000 derece ilerle, tek tekerle (sağ: 50) 360 derece dön. Döngü olmasa aynı iki blok dört kez yazılırdı.',
    gelistir: 'Dikdörtgen bir kutu için iki farklı kenar uzunluğu kullan.',
    ipucu: 'Sahnede robot kutuya değmeden başladığı yere dönmeli.',
    programlar: [bas(['rep', 4, [['mvforh', '~düz: 0', 1000, '~derece', 50], ['mvforh', '~sağ: 50', 360, '~derece', 50]]])],
  },
  {
    id: '89', konu: 89, grup: 'Bloklarım', baslik: 'Santimetreyle ilerleyen blok (Move_CM)', mod: 'sahne', sahne: orta(60, 75, 0),
    aciklama: 'Kendi bloğun iki girişi var: güç ve santimetre. 1 cm = 20,5 teker derecesi (360 ÷ 17,6). Önce 10 cm ileri, sonra tam hızla 20 cm geri.',
    gelistir: 'Turn_Degrees bloğunu da yap; ikisiyle bir kare çiz.',
    ipucu: 'Move_CM bloğu Bloklarım\'da. Cetvelle ölç: robot başladığı yerin 10 cm gerisinde mi?',
    programlar: [
      [['def', 'Move_CM', 'Power', 'Centimeters'], ['mvforh', '~düz: 0', ['mul', v('Centimeters'), 20.5], '~derece', v('Power')]],
      bas(['call', 'Move_CM', 50, 10], ['call', 'Move_CM', -100, 20]),
    ],
  },
  {
    id: '90', konu: 90, grup: 'Bloklarım', baslik: 'Açıyla dönen bloklar (Right_Turn, Left_Turn)', mod: 'sahne', sahne: orta(80, 75, 0),
    aciklama: 'Robotun açısını teker derecesine çeviren iki kendi blok: derece × 4 kadar tek tekerle (pivot) döner.',
    gelistir: 'Bu bloklarla bir kare, sonra bir üçgen (120°) çiz.',
    ipucu: 'Sahnede robot önce sağa 90°, sonra sola 90° döner ve yine sağa bakar.',
    uyarlama: 'Sitedeki robot için çarpan 3,7; bu simülasyondaki robot için 4 (teker aralığı 11,2 cm).',
    programlar: [
      [['def', 'Right_Turn', 'Degrees', 'Power'], ['mvforh', '~sağ: 50', ['mul', v('Degrees'), 4], '~derece', v('Power')]],
      [['def', 'Left_Turn', 'Degrees', 'Power'], ['mvforh', '~sol: -50', ['mul', v('Degrees'), 4], '~derece', v('Power')]],
      bas(['call', 'Right_Turn', 90, 50], ['call', 'Left_Turn', 90, 50]),
    ],
  },
  {
    id: '102', konu: 102, grup: 'Bloklarım', baslik: 'Hızlanarak kalk, siyah çizgide dur', mod: 'sahne',
    sahne: orta(20, 75, 0, { bolgeler: [serit(150, 'BLACK', 6)] }),
    aciklama: 'RampUp bloğu hızı zamanlayıcıyla artırır (hız = zamanlayıcı × artış). Blok bitince motorlar son hızda döner; robot siyahı görene kadar ilerler.',
    gelistir: 'RampDown bloğu yap: siyah çizgiye yaklaşırken yavaşla.',
    ipucu: 'Sahnede robotun yavaş kalkıp hızlandığını izle. Hız göstergesi Robot sekmesinde.',
    programlar: [
      [['def', 'RampUp', 'Seconds', 'Ramp rate'], ['resettimer'],
        ['untilrep', ['gt', ['timer'], v('Seconds')], [['mvstarth', '~düz: 0', ['mul', ['timer'], v('Ramp rate')]]]]],
      bas(['call', 'RampUp', 2, 20], ['until', renkMi('siyah')], ['mvstop']),
    ],
  },

  // ---------- Dokunma ----------
  {
    id: '77', konu: 77, grup: 'Dokunma', baslik: 'Duvara çarpınca geri gel ve sağa dön', mod: 'sahne', sahne: orta(40, 75, 0),
    aciklama: 'Robot duvara değene kadar ilerler, 500 derece geri gelir ve tek tekerle sağa 90° döner. "Harekete başla" tek başına bir şey yapmaz: arkasından bir "bekle" gelmeli.',
    gelistir: 'Bunu 4 kez tekrarla: robot odanın dört duvarına değsin.',
    ipucu: 'Sahnede tamponun duvara değdiği anda kırmızı olduğunu gör.',
    uyarlama: 'Sitedeki robotta 90° için 720 derece; bu robotta tek teker 360 derece yeter.',
    programlar: [bas(['mvstarth', '~düz: 0', 50], ['waittouch', '~1', '~basılı'],
      ['mvforh', '~düz: 0', 500, '~derece', -50], ['mvforh', '~sağ: 50', 360, '~derece', 50])],
  },
  {
    id: '27', konu: 27, grup: 'Dokunma', baslik: 'Süpürge: dört duvara değ', mod: 'sahne', sahne: { genislik: 100, yukseklik: 100, baslangic: { x: 50, y: 50, yon: 0 } },
    aciklama: 'Robot bir duvara değene kadar ilerler, biraz geri çekilir ve 90° döner. Bu dört blok 4 kez tekrarlanınca dört duvarın hepsine değer.',
    gelistir: 'Geri çekilmeyi kaldır: robot duvara yapışıkken dönünce ne oluyor?',
    ipucu: 'Neden geri çekiliyoruz? Duvara yapışık dönen robot gövdesini duvara sürter.',
    programlar: [bas(['rep', 4, [['mvstarth', '~düz: 0', 50], ['waittouch', '~1', '~basılı'],
      ['mvforh', '~düz: 0', 1, '~dönüş', -50], ['mvforh', '~sağ: 100', 0.5, '~dönüş', 50]]])],
  },
  {
    id: '84a', konu: 84, grup: 'Renk ve çizgi', baslik: 'Dokunmaya basılana kadar çizgi izle', mod: 'sahne', sahne: cizgiSahnesi,
    aciklama: 'Siyah görünce sağa, beyaz görünce sola kıvrılarak çizginin kenarını izler. "Dokunma basılı olana kadar tekrarla" döngüsü durunca robot da durur.',
    gelistir: 'Dönüş değerini 50 yerine 25 yap: robot daha mı akıcı gidiyor?',
    ipucu: 'Sahnede yıldızları topla. Durdurmak için Sahne\'deki "Dokunmaya bas" düğmesine bas.',
    programlar: [bas(['untilrep', DOKUNMA, [['ifelse', renkMi('siyah'), [['mvstarth', '~sağ: 50', 30]], [['mvstarth', '~sol: -50', 30]]]]], ['mvstop'])],
    uyarlama: 'Sitede hız %50; bu pistteki keskin virajlar için %30 kullanıldı.',
  },
  // ---------- Ultrasonik ----------
  {
    id: '81', konu: 81, grup: 'Ultrasonik', baslik: '15–20 cm arasında dur', mod: 'sahne',
    sahne: orta(30, 75, 0, { engeller: [{ x: 150, y: 0, g: 10, h: 150 }] }),
    aciklama: 'İç içe "eğer": 20 cm\'den uzaksa ileri, 15 cm\'den yakınsa geri, arada dur. Robot hep bu aralıkta kalmaya çalışır.',
    gelistir: '"Güç seninle": elini (engeli) yaklaştırınca robot kaçsın, uzaklaştırınca gelsin.',
    ipucu: 'Sahnede kırmızı ultrasonik ışını ve Mesafe göstergesini izle. Bitirmek için Durdur.',
    programlar: [bas(['forever', [
      ['ifelse', ['lt', ['dist', '~4'], 20],
        [['ifelse', ['lt', ['dist', '~4'], 15], [['mvstarth', '~düz: 0', -50]], [['mvstop']]]],
        [['mvstarth', '~düz: 0', 50]]],
    ]])],
  },
  {
    id: '30', konu: 30, grup: 'Ultrasonik', baslik: 'Uzaklaşana kadar geri git', mod: 'sahne', sahne: orta(178, 75, 0),
    aciklama: 'Robot duvarın dibinden geri geri gider; mesafe 30 cm\'den büyük olunca durur. Bu kez "büyüktür" koşulu kullanılır.',
    gelistir: 'Önce 20 cm\'ye kadar yaklaş, sonra 30 cm\'ye kadar uzaklaş; bunu 3 kez yap.',
    ipucu: 'Sahnede robot başta duvara 12 cm uzakta. Durunca Mesafe göstergesine bak.',
    programlar: [bas(['mvstarth', '~düz: 0', -50], ['until', ['gt', ['dist', '~4'], 30]], ['mvstop'])],
  },
  {
    id: '53', konu: 53, grup: 'Ultrasonik', baslik: 'Mesafe kadar hız (veri kablosu)', mod: 'sahne', sahne: orta(30, 75, 0),
    aciklama: 'Sensörün değeri doğrudan hız girişine bağlanır: duvar uzaktayken hızlı, yaklaştıkça yavaş gider. Duvara çarpmadan yanaşır.',
    gelistir: 'Hızı "mesafe − 10" yap: robot nerede durur? Neden?',
    ipucu: 'Sahnede robotun duvara yaklaştıkça yavaşladığını izle. Bitirmek için Durdur.',
    programlar: [bas(['forever', [['mvstarth', '~düz: 0', ['dist', '~4']]]])],
  },
  {
    id: '99', konu: 99, grup: 'Ultrasonik', baslik: 'Robot takipçi (oransal kontrol)', mod: 'sahne',
    sahne: orta(30, 75, 0, { engeller: [{ x: 150, y: 0, g: 10, h: 150 }] }),
    aciklama: 'Hata = mesafe − 15; düzeltme = hata × 5; hız = düzeltme. Uzaktayken hızlı, yaklaştıkça yavaş, geçince geri: robot 15 cm\'de durur.',
    gelistir: 'Katsayıyı 5 yerine 1 ve 15 yap: robot ne kadar sürede yerleşiyor? Titriyor mu?',
    ipucu: 'Sahnede robot duvara 15 cm kala durmalı. Program 1 dakika çalışır.',
    programlar: [bas(['resettimer'], ['untilrep', ['gt', ['timer'], 60], [
      ['set', '~hata', ['sub', ['dist', '~4'], 15]], ['set', '~düzeltme', ['mul', v('hata'), 5]],
      ['mvstarth', '~düz: 0', v('düzeltme')],
    ]], ['mvstop'])],
  },

  // ---------- Renk ve çizgi ----------
  {
    id: '78', konu: 78, grup: 'Renk ve çizgi', baslik: 'Yeşil çizgiye kadar git ve dur', mod: 'sahne',
    sahne: orta(20, 75, 0, { bolgeler: [serit(120, 'GREEN', 6)] }),
    aciklama: 'Robot ilerler; renk sensörü yeşil görünce durur. Motorlar "konumunu korusun" durunca çizgiyi geçmez.',
    gelistir: 'Yeşilde dur, 2 saniye bekle, sonra kırmızıya kadar devam et.',
    ipucu: 'Sahnede renk sensörünün (robotun önündeki nokta) yeşile değdiği anda robot durmalı.',
    programlar: [bas(['mvstarth', '~düz: 0', 50], ['until', renkMi('yeşil')], ['mvstop'])],
  },
  {
    id: '75', konu: 75, grup: 'Renk ve çizgi', baslik: 'Renklere göre konuşan robot', mod: 'sahne',
    sahne: orta(20, 75, 0, { genislik: 200, bolgeler: [serit(60, 'BLACK', 6), serit(110, 'RED', 6)] }),
    aciklama: 'Robot yavaşça ilerler ve "sürekli" döngüde zemine bakar: siyahta ve kırmızıda rengin adını söyler, diğer yerlerde kısa bir tık sesi çıkarır.',
    gelistir: 'Mavi ve yeşil şeritler ekle. Robot sarıda dursun.',
    ipucu: 'Sahnede şeritlerin üstünden geçerken Robot sekmesindeki ekranı izle. Bitirmek için Durdur.',
    uyarlama: 'Renk adını söyleyen sesler bizde yok: renk ekrana yazılır ve bir nota çalar; tık sesi yerine çok kısa bip.',
    programlar: [bas(['mvstarth', '~düz: 0', 10], ['forever', [
      ['ifelse', renkMi('siyah'), [['write', 'SIYAH', 3], ['beep', 48, 0.5]],
        [['ifelse', renkMi('kırmızı'), [['write', 'KIRMIZI', 3], ['beep', 60, 0.5]], [['clear'], ['beep', 60, 0.01]]]]],
    ]])],
  },
  {
    id: '84b', konu: 84, grup: 'Renk ve çizgi', baslik: 'Belirli bir mesafe boyunca çizgi izle', mod: 'sahne', sahne: cizgiSahnesi,
    aciklama: 'Döngüden önce B motorunun sayacı sıfırlanır; 1500 dereceyi geçince "olana kadar tekrarla" döngüsü biter ve robot durur.',
    gelistir: '3 tur (1080°) boyunca izle. Kaç derece pistin bir tam turu eder?',
    ipucu: 'Sahnede cetvelle ölç: 1500 derece yaklaşık kaç cm? (1 tur ≈ 17,6 cm)',
    programlar: [bas(['moreset', '~B'], ['untilrep', ['gt', ['modeg', '~B'], 1500], [
      ['ifelse', renkMi('siyah'), [['mvstarth', '~sağ: 50', 25]], [['mvstarth', '~sol: -50', 25]]],
    ]], ['mvstop'])],
  },
  {
    id: '100', konu: 100, grup: 'Renk ve çizgi', baslik: 'Oransal çizgi izleyici (1000 derece)', mod: 'sahne', sahne: cizgiSahnesi,
    aciklama: 'Hata = yansıyan ışık − 50; düzeltme = hata × 0,7. Düzeltme "harekete başla" bloğunun yön girişine konur: çizgiden ne kadar uzaksa o kadar çok döner.',
    gelistir: '0,7 yerine 1,0 ile başla; ±0,5, sonra ±0,1 adımlarla en iyi değeri bul.',
    ipucu: 'Sahnede robotun zikzak yapmadan kaydığını izle. Basit izleyiciyle karşılaştır.',
    programlar: [bas(['moreset', '~C'], ['untilrep', ['gt', ['modeg', '~C'], 1000], [
      ['set', '~hata', ['sub', ['refl', '~3'], 50]], ['set', '~düzeltme', ['mul', v('hata'), 0.7]],
      ['mvstarth', v('düzeltme'), 25],
    ]], ['mvstop'])],
  },
  {
    id: '93', konu: 93, grup: 'Bloklarım', baslik: 'Kırmızı çizgiyi siyaha kadar izle', mod: 'sahne', sahne: kirmiziPist,
    aciklama: 'Follow_Until_Black kendi bloğu: kırmızı görünce sağa, değilse sola kıvrılarak kırmızı çizgiyi izler; siyah işareti görünce durur.',
    gelistir: 'Bloğa bir "renk" girişi ekle: hangi renge kadar izleyeceğini sen seç.',
    ipucu: 'Bloğun tanımı Bloklarım\'da; ana program onu 30 güçle çağırır. Siyah işaret pistin üstünde.',
    programlar: [
      [['def', 'Follow_Until_Black', 'Power'], ['untilrep', renkMi('siyah'), [
        ['ifelse', renkMi('kırmızı'), [['mvstarth', '~sağ: 50', v('Power')]], [['mvstarth', '~sol: -50', v('Power')]]],
      ]], ['mvstop']],
      bas(['call', 'Follow_Until_Black', 30]),
    ],
  },
  {
    id: '55', konu: 55, grup: 'Veri ve hesap', baslik: 'Hasarın uzunluğunu ölç', mod: 'sahne',
    sahne: orta(20, 75, 0, { bolgeler: [{ x: 80, y: 40, g: 40, h: 70, renk: 'RED' }] }),
    aciklama: 'Robot kırmızı "hasar" bölgesine girince B motorunun derecesini saklar, çıkınca farkı alır: (derece farkı ÷ 360) × 17,6 = hasarın uzunluğu (cm).',
    gelistir: 'Hasarın alanını bul: iki yönden geçip eni ve boyu ölç, çarp.',
    ipucu: 'Sonucu Robot sekmesinde ekranda oku; sonra Sahne\'de cetvelle kırmızı bölgeyi ölçüp karşılaştır.',
    programlar: [bas(
      ['mvstarth', '~düz: 0', 30], ['until', renkMi('kırmızı')], ['set', '~Başlangıç', ['modeg', '~B']],
      ['until', ['not', renkMi('kırmızı')]], ['mvstop'],
      ['write', ['join', 'Uzunluk: ', ['mul', ['div', ['sub', ['modeg', '~B'], v('Başlangıç')], 360], 17.6]], 1], ['wait', 5],
    )],
  },
  {
    id: '16', konu: 16, grup: 'Motor', baslik: 'Kutuyu getir', mod: 'sahne',
    sahne: orta(30, 75, 0, { bolgeler: [{ x: 10, y: 55, g: 30, h: 40, renk: 'GREEN' }], paketler: [{ x: 80, y: 75 }] }),
    aciklama: 'Robot yaklaşık 50 cm (2,84 tur) ilerleyip kutuya varır, kolu (A) indirip kutuyu kavrar ve aynı tur sayısıyla başlangıca döner.',
    gelistir: 'Kutuyu başka bir köşeye bırak: kolu kaldırmayı unutma.',
    ipucu: '2. ve 4. bloklar neden aynı tur sayısı? Sahnede kutunun robotla geldiğini izle.',
    uyarlama: 'Sitede önce kol kaldırılır; bizim robotun kolu başta zaten yukarıda olduğu için bu adım yok.',
    programlar: [bas(['mvforh', '~düz: 0', 2.84, '~dönüş', 50], ['morun', '~A', '~saat yönünün tersine', 0.25, '~dönüş'],
      ['mvforh', '~düz: 0', 2.84, '~dönüş', -50])],
  },
  {
    id: '85', konu: 85, grup: 'Motor', baslik: 'Siyah çizgiye git, nesneyi al, geri dön', mod: 'sahne',
    sahne: orta(25, 75, 0, { bolgeler: [{ x: 5, y: 55, g: 30, h: 40, renk: 'GREEN' }, serit(120, 'BLACK', 4, 40, 70)], paketler: [{ x: 115, y: 75 }] }),
    aciklama: 'Robot siyah çizgiye kadar gider, kolu indirip nesneyi alır, sonra geri geri yeşil başlangıç alanına döner.',
    gelistir: 'Nesneyi başlangıçta bırak (kolu kaldır) ve bir ses çal.',
    ipucu: 'Sahnede kahverengi kutuyu izle: kol inince robotla birlikte gelir.',
    uyarlama: 'Sitede kol saat yönünde 360° döner; bizim kolumuz saat yönünün tersine 90° ile iner.',
    programlar: [bas(['mvstarth', '~düz: 0', 50], ['until', renkMi('siyah')], ['mvstop'],
      ['morun', '~A', '~saat yönünün tersine', 90, '~derece'],
      ['mvstarth', '~düz: 0', -50], ['until', renkMi('yeşil')], ['mvstop'])],
  },

  // ---------- Gyro ----------
  {
    id: '33', konu: 33, grup: 'Gyro', baslik: 'Kutunun etrafında gyro ile tur', mod: 'sahne', sahne: kutuGyro,
    aciklama: 'Bir kenar + bir köşe: ilerle, açıyı sıfırla, yavaşça dönmeye başla, açı hedefi geçince dur. Bu beş blok dört kez tekrarlanır.',
    gelistir: 'Dikdörtgen bir kutu için iki farklı kenar uzunluğu kullan.',
    ipucu: 'Sahnede robot kutuya değmeden başladığı yere dönmeli.',
    uyarlama: 'Gerçek robotta gecikme yüzünden 86°\'de durulur; simülasyonda gecikme az olduğu için 89°.',
    programlar: [bas(['rep', 4, [
      ['mvforh', '~düz: 0', 3, '~dönüş', 50], ['resetangle', '~2'], ['mvstarth', '~sağ: 100', 30],
      ['until', ['gt', ['angle', '~2'], 89]], ['mvstop'],
    ]])],
  },

  // ---------- Proje ----------
  {
    id: '167', konu: 167, grup: 'Proje', baslik: 'Teslimat robotu', mod: 'sahne',
    sahne: {
      genislik: 200, yukseklik: 60, baslangic: { x: 20, y: 30, yon: 0 },
      bolgeler: [serit(68, 'YELLOW', 4, 0, 60), serit(118, 'YELLOW', 4, 0, 60), serit(168, 'YELLOW', 4, 0, 60)],
    },
    aciklama: 'Hedef adres (1, 2, 3) tuğla düğmeleriyle seçilir: sağ/sol değiştirir, orta onaylar. Robot adrese gidip kolla paketi bırakır ve başlangıca döner.',
    gelistir: 'Teslim edilen paketleri say. 4. adres ekle.',
    ipucu: 'Robot sekmesinde sağ düğmeye iki kez basıp hedefi 3 yap, sonra orta düğmeye bas; Sahne\'de robotu izle.',
    uyarlama: 'Sitede adres uzaklıkları bir listede (50, 100, 150); bizde liste olmadığı için uzaklık = hedef × 50.',
    programlar: [bas(['set', '~hedef', 1], ['forever', [
      ['clear'], ['write', 'TESLIMAT', 1], ['write', ['join', 'Hedef no: ', v('hedef')], 3],
      ['until', ['or', ['or', ['btn', '~sol'], ['btn', '~sağ']], ['btn', '~orta']]],
      ['if', ['and', ['btn', '~sağ'], ['lt', v('hedef'), 3]], [['change', '~hedef', 1]]],
      ['if', ['and', ['btn', '~sol'], ['gt', v('hedef'), 1]], [['change', '~hedef', -1]]],
      ['if', ['btn', '~orta'], [
        ['set', '~tur', ['div', ['mul', v('hedef'), 50], 17.6]], ['mvforh', '~düz: 0', v('tur'), '~dönüş', 40],
        ['morun', '~A', '~saat yönünde', 90, '~derece'], ['morun', '~A', '~saat yönünün tersine', 90, '~derece'],
        ['mvforh', '~düz: 0', v('tur'), '~dönüş', -40], ['sound', '~Evet'],
      ]],
      ['wait', 0.3],
    ]])],
  },
];
