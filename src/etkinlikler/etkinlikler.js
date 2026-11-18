// "Görevler" menüsündeki etkinlikler: kullanıcının öğretim programındaki "EV3 çalışma sitesi"nin
// (~/Desktop/lego/LEGO EV3 Öğretim Programı.html#ev3-calisma) uygulamalı etkinliklerinden (konu 133–167)
// simülasyonda anlamlı çalışanlar seçildi. Programlar sitedeki EV3 Classroom programlarının bizim
// bloklarımızla yazılmış hâlidir; değiştirilen yerler `uyarlama` notunda yazar.
// tests/etkinlikler.test.js her birini öğrencinin yapacağı hareketlerle sahte saatte çalıştırır.
import { programaCevir } from '../dersler/donustur.js';

const bas = (...b) => [['start'], ...b];
const v = (ad) => ['var', ad];

// --- Sahneler (cm; x sağa, y aşağı; yön 0 = sağa) ---
const orta = (x = 100, y = 75, yon = 0) => ({ genislik: 200, yukseklik: 150, baslangic: { x, y, yon } });

const GARAJ = { x: 54, y: 50, g: 30, h: 40 };
const garajSahnesi = {
  ...orta(30, 40, 0),
  engeller: [
    { x: GARAJ.x - 5, y: GARAJ.y + 6, g: 4, h: 44 },
    { x: GARAJ.x + GARAJ.g + 1, y: GARAJ.y + 6, g: 4, h: 44 },
    { x: GARAJ.x - 5, y: GARAJ.y + 46, g: GARAJ.g + 10, h: 4 },
  ],
  bolgeler: [{ ...GARAJ, renk: 'YELLOW' }],
  hedef: { x: GARAJ.x + 6, y: GARAJ.y + 4, g: GARAJ.g - 12, h: GARAJ.h - 20 },
};

const DUBALAR = [{ x: 68, y: 66 }, { x: 117, y: 56 }, { x: 160, y: 66 }];
const slalomSahnesi = {
  genislik: 200, yukseklik: 120, baslangic: { x: 20, y: 75, yon: 0 },
  engeller: DUBALAR.map((d) => ({ x: d.x - 3, y: d.y - 3, g: 6, h: 6, tur: 'duba' })),
  bolgeler: [{ x: 150, y: 28, g: 34, h: 32, renk: 'GREEN' }],
  hedef: { x: 150, y: 28, g: 34, h: 32 },
};

const olaySahnesi = {
  ...orta(40, 120, 0),
  bolgeler: [{ x: 0, y: 0, g: 200, h: 22, renk: 'RED' }],
};

const HAZINE = { x: 80, y: 108, g: 26, h: 26 };
const hazineSahnesi = {
  ...orta(30, 75, 0),
  bolgeler: [{ x: 90, y: 55, g: 20, h: 40, renk: 'BLUE' }, { ...HAZINE, renk: 'YELLOW' }],
};

const KUTULAR = [
  { x: 140, y: 65, g: 20, h: 20 }, // doğuda, 40 cm
  { x: 66, y: 22, g: 18, h: 18 }, // kuzeybatıda, en yakın
  { x: 90, y: 128, g: 20, h: 20 }, // güneyde
];
const enYakinSahnesi = { ...orta(100, 75, 0), engeller: KUTULAR.map((k) => ({ ...k, tur: 'kutu' })) };

const supurgeSahnesi = {
  ...orta(40, 75, 0),
  engeller: [{ x: 95, y: 30, g: 20, h: 20, tur: 'kutu' }, { x: 130, y: 100, g: 25, h: 20, tur: 'kutu' }],
};

// Otobüs: çizgi pisti + üç yeşil durak işareti (çizgiyi dik keser)
const pist = (() => {
  const n = [];
  const yay = (cx, cy, b) => {
    for (let i = 0; i <= 6; i++) {
      const a = ((b + 15 * i) * Math.PI) / 180;
      n.push([cx + 25 * Math.cos(a), cy + 25 * Math.sin(a)]);
    }
  };
  yay(145, 95, 0);
  yay(55, 95, 90);
  yay(55, 55, 180);
  yay(145, 55, 270);
  n.push(n[0]);
  return n;
})();
const otobusSahnesi = {
  ...orta(60, 120, 0),
  cizgiler: [
    { noktalar: pist, kalinlik: 2.5, renk: 'BLACK' },
    { noktalar: [[115, 112], [115, 128]], kalinlik: 3, renk: 'GREEN' },
    { noktalar: [[162, 75], [178, 75]], kalinlik: 3, renk: 'GREEN' },
    { noktalar: [[85, 22], [85, 38]], kalinlik: 3, renk: 'GREEN' },
  ],
};

// Labirent: kare 35,2 cm (robot her adımda 2 tur = bir kare gider), çıkış kırmızı.
const K = 35.2;
const LABIRENT = ['S.....#', '###.#.#', '....#.#', '.#####.', '......R'];
const labirentSahnesi = {
  genislik: LABIRENT[0].length * K,
  yukseklik: LABIRENT.length * K,
  baslangic: { x: K / 2, y: K / 2, yon: 0 },
  engeller: LABIRENT.flatMap((s, y) => [...s].flatMap((c, x) => (c === '#' ? [{ x: x * K, y: y * K, g: K, h: K, tur: 'tas' }] : []))),
  bolgeler: [{ x: 6 * K, y: 4 * K, g: K, h: K, renk: 'RED' }],
  hedef: { x: 6 * K, y: 4 * K, g: K, h: K },
};

// --- Etkinlikler ---
export const ETKINLIKLER = [
  {
    id: 133, grup: 'Tuğla', baslik: 'Ekranda isim kartı', mod: 'elle',
    aciklama: 'Robot kendini tanıtan bir isim kartı gösterir: üç satır yazı, gözler ve bir veda.',
    gelistir: 'Okulunun ve robotunun adını ekle. Gözleri art arda değiştirerek göz kırpan bir robot yap.',
    ipucu: 'Robot sekmesinde EV3 ekranını izle. Program bitince ekran temizlenmez; her yazıdan sonra bekleme var.',
    uyarlama: '"Büyük yazı tipi" bizde yok; konum bloğu normal yazıyla yazar.',
    programlar: [bas(['clear'], ['write', 'Merhaba!', 1], ['write', 'Ben EV3', 3], ['write', 'Sinif: 7-A', 4], ['wait', 3],
      ['imgfor', '~Nötr', 2], ['clear'], ['writexy', 'Hosca kal!', 30, 60], ['wait', 2])],
  },
  {
    id: 134, grup: 'Tuğla', baslik: 'Durum ışığıyla trafik lambası', mod: 'elle',
    aciklama: 'Tuğlanın durum ışığı yeşil, turuncu ve kırmızı yanar; ekranda GEC, HAZIR, DUR yazar.',
    gelistir: 'Dokunma sensörüne basılırsa yeşil süresi kısalsın. Kırmızıda her saniye kısa bir bip çalsın.',
    ipucu: 'Robot sekmesinde tuğlanın ışığını izle. Bitirmek için Durdur.',
    programlar: [bas(['forever', [
      ['light', '~yeşil'], ['clear'], ['writexy', 'GEC', 60, 50], ['wait', 4],
      ['light', '~turuncu'], ['clear'], ['writexy', 'HAZIR', 45, 50], ['beep', 72, 0.2], ['wait', 1],
      ['light', '~kırmızı'], ['clear'], ['writexy', 'DUR', 60, 50], ['wait', 4],
    ]])],
  },
  {
    id: 135, grup: 'Tuğla', baslik: 'Düğmeli piyano', mod: 'elle',
    aciklama: 'Tuğlanın beş düğmesinin her biri bir nota çalar. Her düğmenin kendi olay yığını vardır.',
    gelistir: 'Bildiğin kısa bir şarkıyı çal. Dokunma sensörüne basınca bir oktav yukarı (+12) çalan bir düğme ekle.',
    ipucu: 'Robot sekmesinde tuğlanın düğmelerine bas. Bitirmek için Durdur.',
    programlar: [
      bas(['write', 'EV3 PIYANO', 1]),
      [['ondugme', '~sol'], ['beep', 60, 0.3]],
      [['ondugme', '~yukarı'], ['beep', 62, 0.3]],
      [['ondugme', '~sağ'], ['beep', 64, 0.3]],
      [['ondugme', '~aşağı'], ['beep', 65, 0.3]],
      [['ondugme', '~orta'], ['beep', 67, 0.3]],
    ],
  },
  {
    id: 136, grup: 'Tuğla', baslik: 'Kronometre', mod: 'elle',
    aciklama: 'Zamanlayıcı geçen saniyeyi gösterir. Orta düğme sıfırlar, sol düğme tur zamanını kaydeder.',
    gelistir: '10\'dan geriye sayan bir sayaç yap. "zamanlayıcı > 10 olduğunda" ışığı kırmızı yapsın.',
    ipucu: 'Robot sekmesinde sol düğmeye basıp tur zamanını kaydet, orta düğmeyle sıfırla. Bitirmek için Durdur.',
    programlar: [
      bas(['set', '~tur', 0], ['resettimer'], ['forever', [
        ['clear'], ['write', ['div', ['round', ['mul', ['timer'], 10]], 10], 3],
        ['write', ['join', 'Tur: ', v('tur')], 6], ['wait', 0.1],
      ]]),
      [['ondugme', '~orta'], ['resettimer']],
      [['ondugme', '~sol'], ['set', '~tur', ['div', ['round', ['mul', ['timer'], 10]], 10]], ['beep', 72, 0.1]],
    ],
  },
  {
    id: 137, grup: 'Tuğla', baslik: 'Elektronik zar', mod: 'elle',
    aciklama: 'Orta düğmeye her basışta 1–6 arasında rastgele bir sayı gelir. 6 gelirse ışık yeşil yanar.',
    gelistir: 'İki zar at ve toplamını yaz. Zarı 100 kez attırıp her sayının kaç kez geldiğini say.',
    ipucu: 'Robot sekmesinde orta düğmeye bas. Bitirmek için Durdur.',
    uyarlama: '"Good job" sesi yerine "Evet" sesi çalar.',
    programlar: [
      bas(['write', 'Ortaya bas', 3]),
      [['ondugme', '~orta'], ['set', '~zar', ['rand', 1, 6]], ['clear'], ['writexy', v('zar'), 80, 40],
        ['ifelse', ['eq', v('zar'), 6], [['light', '~yeşil'], ['sound', '~Evet']], [['light', '~turuncu'], ['beep', 60, 0.1]]]],
    ],
  },
  {
    id: 138, grup: 'Sensör', baslik: 'Dokunma sayacı (turnike)', mod: 'elle',
    aciklama: 'Dokunma sensörüne kaç kez basıldığını sayar. "Bırakılana kadar bekle" bir basışın iki kez sayılmasını önler.',
    gelistir: '10. geçişte "Dolu!" yazsın ve kırmızı ışık yansın. Bırakılma beklemesini kaldırınca ne oluyor?',
    ipucu: 'Robot sekmesinde dokunma sensörüne birkaç kez bas. Orta düğme sayacı sıfırlar. Bitirmek için Durdur.',
    programlar: [
      bas(['set', '~geçiş', 0], ['forever', [
        ['waittouch', '~1', '~basılı'], ['change', '~geçiş', 1], ['beep', 67, 0.05], ['clear'],
        ['write', ['join', 'Gecis: ', v('geçiş')], 3], ['waittouch', '~1', '~bırakılmış'],
      ]]),
      [['ondugme', '~orta'], ['set', '~geçiş', 0], ['clear'], ['write', 'Gecis: 0', 3]],
    ],
  },
  {
    id: 140, grup: 'Sensör', baslik: 'Park sensörü', mod: 'elle',
    aciklama: 'Engele yaklaştıkça bip sıklaşır: bekleme = uzaklık ÷ 100 saniye. 5 cm\'den yakında kırmızı ışık.',
    gelistir: 'Robot geri geri giderken park sensörü çalışsın; 5 cm\'de dursun.',
    ipucu: 'Robot sekmesinde Mesafe kaydırıcısını yavaşça azalt: bipler sıklaşır. Bitirmek için Durdur.',
    programlar: [bas(['forever', [
      ['set', '~mesafe', ['dist', '~4']],
      ['ifelse', ['lt', v('mesafe'), 5], [['light', '~kırmızı'], ['beep', 84, 0.2]], [
        ['ifelse', ['lt', v('mesafe'), 100],
          [['light', '~turuncu'], ['beep', 76, 0.05], ['wait', ['div', v('mesafe'), 100]]],
          [['light', '~yeşil']]],
      ]],
    ]])],
  },
  {
    id: 141, grup: 'Sensör', baslik: 'Gyro açıölçer', mod: 'elle',
    aciklama: 'Robotu elle döndürünce açı ekranda yazar. Açı 90\'ın katlarına yakınsa yeşil ışık yanar.',
    gelistir: 'Açı 45\'in katlarına yakınken turuncu yansın. En büyük açıyı bir değişkende sakla.',
    ipucu: 'Robot sekmesinde Açı kaydırıcısını 90\'a, sonra 45\'e getir; ışığı izle. Bitirmek için Durdur.',
    programlar: [bas(['wait', 1], ['resetangle', '~2'], ['forever', [
      ['set', '~kalan', ['mod', ['fn', '~mutlak', ['angle', '~2']], 90]], ['clear'],
      ['writexy', ['angle', '~2'], 70, 40],
      ['ifelse', ['or', ['lt', v('kalan'), 3], ['gt', v('kalan'), 87]], [['light', '~yeşil']], [['light', '~kırmızı']]],
      ['wait', 0.1],
    ]])],
  },
  {
    id: 143, grup: 'Hareket', baslik: 'Kare çizen robot', mod: 'sahne', sahne: orta(70, 110, -90),
    aciklama: 'Robot 4 kez "30 cm ilerle, 90° dön" yapar ve başladığı yere döner. Tekrarla bloğu programı kısaltır.',
    gelistir: 'Üçgen (3 × 120°) ve altıgen (6 × 60°) çiz. Kenar uzunluğunu değişken yap.',
    ipucu: 'Sahnede robotun izini izle. Cetvelle bir kenarı ölç: 30 cm mi?',
    programlar: [bas(['mvspeed', 40], ['rep', 4, [['mvfor', '~düz: 0', 1.7, '~dönüş'], ['mvfor', '~sağ: 100', 180, '~derece']]])],
  },
  {
    id: 144, grup: 'Hareket', baslik: 'Slalom', mod: 'sahne', sahne: slalomSahnesi,
    aciklama: 'Tekerlere farklı hız verince robot kıvrılır. Dubaların arasından S çizerek yeşil bitişe var.',
    gelistir: 'Dubaları yaklaştır: tur sayılarını nasıl değiştirmen gerekir? Dört dubalı bir slalom yap.',
    ipucu: 'Sol teker hızlıysa robot sağa, sağ teker hızlıysa sola kıvrılır. Dubalara çarpma.',
    uyarlama: 'Sitedeki değerler (20/60 hız, 1,2 tur) çok dar kıvrılıyor; bu dubalar için 40/60 hız ve 2 tur kullanıldı.',
    programlar: [bas(['tank', 2, '~dönüş', 40, 60], ['tank', 4, '~dönüş', 60, 40], ['tank', 4, '~dönüş', 40, 60], ['tank', 2, '~dönüş', 60, 40])],
  },
  {
    id: 145, grup: 'Hareket', baslik: 'Spiral çizen robot', mod: 'sahne', sahne: orta(100, 75, 0),
    aciklama: 'Her kenar bir öncekinden 0,2 tur uzun: kenar uzunluğu bir değişkende tutulur ve her turda büyür.',
    gelistir: 'Spirali içe doğru çiz (kenar küçülsün). Dönüş açısını 90 yerine 120 yap: ne oluşur?',
    ipucu: 'Sahnede izi açık tut ve spirali izle.',
    programlar: [bas(['mvspeed', 40], ['set', '~kenar', 0.3], ['rep', 12, [
      ['mvfor', '~düz: 0', v('kenar'), '~dönüş'], ['mvfor', '~sağ: 100', 180, '~derece'], ['change', '~kenar', 0.2],
    ]], ['mvstop'])],
  },
  {
    id: 146, grup: 'Hareket', baslik: 'Gyro ile yıldız çizmek', mod: 'sahne', sahne: orta(70, 95, 0),
    aciklama: 'Beş köşeli yıldızda robot her köşede 144° döner (5 × 144 = 720). Dönüşü gyro ölçer.',
    gelistir: 'Altı köşeli yıldız için açı ne olmalı? Dönüş hızını artırınca yıldız bozuluyor mu?',
    ipucu: 'Sahnede izi izle: yıldız kapanıyor mu? Başladığı yere ne kadar yakın döndü?',
    uyarlama: 'Gerçek robotta gecikme yüzünden 140°\'de durulur; simülasyonda gecikme az olduğu için 143° kullanıldı.',
    programlar: [bas(['rep', 5, [
      ['mvforh', '~düz: 0', 2, '~dönüş', 40], ['resetangle', '~2'], ['mvstarth', '~sağ: 100', 20],
      ['until', ['gt', ['angle', '~2'], 143]], ['mvstop'],
    ]])],
  },
  {
    id: 147, grup: 'Hareket', baslik: 'Garaja geri park', mod: 'sahne', sahne: garajSahnesi,
    aciklama: 'Robot garajın önünü geçer, geri giderken tek tekerle (pivot) döner ve garaja geri geri girer.',
    gelistir: 'Garajı sola al. Park bitince farları (durum ışığı) yak.',
    ipucu: 'Eksi hız robotu geri götürür. "sağ: 50" tek tekerleği durdurur. Sarı garaja duvara değmeden gir.',
    uyarlama: '"Good job" sesi yerine "Evet" sesi çalar.',
    programlar: [bas(['mvforh', '~düz: 0', 2.5, '~dönüş', 40], ['mvforh', '~sağ: 50', 1, '~dönüş', -30],
      ['mvforh', '~düz: 0', 1, '~dönüş', -30], ['sound', '~Evet'])],
  },
  {
    id: 148, grup: 'Motor', baslik: 'Otopark bariyeri', mod: 'elle',
    aciklama: 'Ultrasonik sensör bir araba görünce A motoru bariyeri 90° kaldırır, 3 saniye sonra indirir.',
    gelistir: 'Bariyer kalkarken bip çalsın. Kaç araba geçtiğini sayıp ekrana yaz.',
    ipucu: 'Robot sekmesinde Mesafe kaydırıcısını 10 cm\'nin altına indir (araba geldi), sonra yukarı çıkar. Bitirmek için Durdur.',
    programlar: [bas(['mospeed', '~A', 30], ['forever', [
      ['until', ['lt', ['dist', '~4'], 10]], ['light', '~yeşil'],
      ['morun', '~A', '~saat yönünün tersine', 90, '~derece'], ['wait', 3],
      ['morun', '~A', '~saat yönünde', 90, '~derece'], ['light', '~kırmızı'],
    ]])],
  },
  {
    id: 153, grup: 'Olay', baslik: 'Dans eden robot: aynı anda üç iş', mod: 'sahne', sahne: orta(100, 75, 0),
    aciklama: 'Üç "program başladığında" yığını aynı anda çalışır: biri dans eder, biri müzik çalar, biri ışık ve gözleri değiştirir.',
    gelistir: 'Dördüncü bir yığınla A motorunu (kol) sallayın. Müziği değiştirin.',
    ipucu: 'Sahnede robotu, Robot sekmesinde ışığı ve ekranı izle.',
    uyarlama: '"Gözler / Sol alt, Sağ alt" resimleri bizde yok; Göz kırpan ve Nötr kullanıldı.',
    programlar: [
      bas(['rep', 4, [['mvforh', '~sağ: 100', 1, '~dönüş', 40], ['mvforh', '~sol: -100', 1, '~dönüş', 40]]]),
      bas(['rep', 4, [['beep', 60, 0.25], ['beep', 64, 0.25], ['beep', 67, 0.25], ['beep', 72, 0.5]]]),
      bas(['rep', 8, [['light', '~yeşil'], ['imgfor', '~Göz kırpan', 0.5], ['light', '~turuncu'], ['imgfor', '~Nötr', 0.5]]]),
    ],
  },
  {
    id: 155, grup: 'Olay', baslik: 'Sensör olaylarıyla çarpışmasız robot', mod: 'sahne', sahne: olaySahnesi,
    aciklama: 'Ana yığın robotu ilerletir; olay yığınları bekçilik yapar: duvar yaklaşınca geri çekilip döner, kırmızıya gelince program biter.',
    gelistir: 'Dokunma sensörü için bir olay daha ekle. Kırmızı yerine yeşilde dursun.',
    ipucu: 'Sahnede robot duvarlara çarpmadan dolaşıp üstteki kırmızı şeride varmalı.',
    uyarlama: '"Good job" sesi yerine "Evet" sesi çalar.',
    programlar: [
      bas(['mvstarth', '~düz: 0', 30]),
      [['onmesafe', '~4', '<', 15], ['mvforh', '~düz: 0', 0.5, '~dönüş', -30], ['mvforh', '~sağ: 100', 0.5, '~dönüş', 30], ['mvstarth', '~düz: 0', 30]],
      [['onrenk', '~3', '~kırmızı'], ['mvstop'], ['sound', '~Evet'], ['stop']],
    ],
  },
  {
    id: 156, grup: 'Kontrol', baslik: 'Zaman sınırlı süpürge', mod: 'sahne', sahne: supurgeSahnesi,
    aciklama: 'Robot süpürge 20 saniye odada gezer: duvara yaklaşınca geri çekilir ve rastgele bir açıyla döner. 20. saniyede olay programı bitirir.',
    gelistir: 'Süreyi 30 saniye yap. Her dönüşte sayaç artsın; sonunda kaç kez döndüğünü yazsın.',
    ipucu: 'Sahnede izi açık tut: robot odanın ne kadarını süpürdü?',
    uyarlama: '"Good job" sesi yerine "Evet" sesi çalar. Robot duvara sığ açıyla yaklaşırsa köşesi sürtebilir: ultrasonik sensör yalnızca önünü görür. Bunu öğrencilerle tartışın.',
    programlar: [
      bas(['resettimer'], ['forever', [
        ['mvstarth', '~düz: 0', 40], ['until', ['lt', ['dist', '~4'], 15]],
        ['mvforh', '~düz: 0', 0.5, '~dönüş', -30], ['mvforh', '~sağ: 100', ['rand', 100, 300], '~derece', 30],
      ]]),
      [['ontimer', 20], ['mvstop'], ['sound', '~Evet'], ['stop']],
    ],
  },
  {
    id: 157, grup: 'Kontrol', baslik: 'Hazine avı (olana kadar tekrarla)', mod: 'sahne', sahne: hazineSahnesi,
    aciklama: 'Robot ilerler ve yere bakar. Mavi "su" görürse geri çekilip döner; sarı "hazine"yi görünce durur ve kutlar.',
    gelistir: 'Hazineyi başka yere koy; bulamazsa dönüş miktarını rastgele yap.',
    ipucu: '"Sarı olana kadar tekrarla" döngüsü hazine görülünce biter; sonra döngüden sonraki bloklar çalışır.',
    uyarlama: '"Büyük gülümseme" ve "Fantastic" yerine "Sevgi" gözleri ve "Evet" sesi.',
    programlar: [bas(['untilrep', ['iscolor', '~3', '~sarı'], [
      ['ifelse', ['iscolor', '~3', '~mavi'],
        [['mvforh', '~düz: 0', 0.3, '~dönüş', -30], ['mvforh', '~sağ: 100', 0.4, '~dönüş', 30]],
        [['mvstarth', '~düz: 0', 25]]],
    ]], ['mvstop'], ['img', '~Sevgi'], ['sound', '~Evet'])],
  },
  {
    id: 158, grup: 'Operatör', baslik: 'Kilometre sayacı', mod: 'sahne', sahne: orta(20, 75, 0),
    aciklama: 'Robot ilerlerken B motorunun saydığı dereceyi tura ve santimetreye çevirip ekrana yazar (1 tur ≈ 17,6 cm).',
    gelistir: 'Hızı (cm/sn) da hesaplayıp yaz. Cetvelle ölçtüğün yolla karşılaştır.',
    ipucu: 'Sahne sekmesinde robotu izle; durdurmak için Robot sekmesinde orta düğmeye bas, sonra cetvelle ölç.',
    programlar: [
      bas(['moreset', '~B'], ['mvstarth', '~düz: 0', 30], ['forever', [
        ['set', '~tur', ['div', ['modeg', '~B'], 360]], ['clear'],
        ['write', ['join', 'Derece: ', ['modeg', '~B']], 1],
        ['write', ['join', 'Tur: ', ['round', v('tur')]], 2],
        ['write', ['join', ['join', 'Yol: ', ['round', ['mul', v('tur'), 17.6]]], ' cm'], 3],
        ['wait', 0.2],
      ]]),
      [['ondugme', '~orta'], ['mvstop']],
    ],
  },
  {
    id: 162, grup: 'Değişken', baslik: 'En yakın nesneyi bul', mod: 'sahne', sahne: enYakinSahnesi,
    aciklama: 'Robot yerinde 360° döner, her an mesafeyi ölçer ve en küçüğünü açısıyla saklar. Sonra en yakın nesneye döner ve 10 cm kalana kadar gider.',
    gelistir: 'En uzak nesneyi bul. Kaç nesne gördüğünü say.',
    ipucu: 'Sahnede kırmızı ultrasonik ışını izle. "en yakın" başta 255: sensörün okuyabileceği en büyük değer.',
    programlar: [bas(
      ['wait', 1], ['resetangle', '~2'], ['set', '~en yakın', 255], ['set', '~en iyi açı', 0],
      ['mvstarth', '~sağ: 100', 10],
      ['untilrep', ['gt', ['angle', '~2'], 360], [
        ['set', '~ölçüm', ['dist', '~4']],
        ['if', ['lt', v('ölçüm'), v('en yakın')], [['set', '~en yakın', v('ölçüm')], ['set', '~en iyi açı', ['angle', '~2']]]],
      ]],
      ['mvstop'], ['write', ['join', 'En yakin: ', v('en yakın')], 2],
      ['resetangle', '~2'], ['mvstarth', '~sağ: 100', 10], ['until', ['gt', ['angle', '~2'], v('en iyi açı')]], ['mvstop'],
      ['mvforh', '~düz: 0', ['div', ['sub', v('en yakın'), 10], 17.6], '~dönüş', 30],
    )],
  },
  {
    id: 164, grup: 'Proje', baslik: 'Duraklı otobüs', mod: 'sahne', sahne: otobusSahnesi,
    aciklama: 'Otobüs siyah çizgiyi oransal izler. Yeşil durak işaretinde durur, kapıyı (A motoru) açıp kapatır, anons yapar. Üçüncü durakta sefer biter.',
    gelistir: 'Durak adlarını bir listede tut. Yolcu sayısını rastgele indir/bindir.',
    ipucu: 'Durak bloğu "Bloklarım"da tanımlı. Durağı geçmek için kısa bir düz hareket var; yoksa aynı durak iki kez sayılır.',
    uyarlama: 'Durakları tanıyan renk sensörü sitede 1. portta; bizde tek renk sensörü var (3. port).',
    programlar: [
      [['def', 'Durak', 'no'],
        ['mvstop'], ['clear'], ['writexy', ['join', 'Durak ', v('no')], 30, 50], ['sound', '~Merhaba'],
        ['morun', '~A', '~saat yönünde', 90, '~derece'], ['wait', 2], ['morun', '~A', '~saat yönünün tersine', 90, '~derece']],
      bas(['set', '~durak', 0], ['untilrep', ['eq', v('durak'), 3], [
        ['ifelse', ['iscolor', '~3', '~yeşil'],
          [['change', '~durak', 1], ['call', 'Durak', v('durak')], ['mvforh', '~düz: 0', 0.3, '~dönüş', 20]],
          [['set', '~düzeltme', ['mul', ['sub', ['refl', '~3'], 50], 0.8]], ['mvstarth', v('düzeltme'), 25]]],
      ]], ['mvstop'], ['sound', '~Hoşça kal']),
    ],
  },
  {
    id: 165, grup: 'Proje', baslik: 'Labirent çözen robot', mod: 'sahne', sahne: labirentSahnesi,
    aciklama: 'Sağ el kuralı: robot her adımda önce sağa bakar. Sağ açıksa oraya gider; kapalıysa önü, o da kapalıysa solu dener; çıkmaz sokakta geri döner. Çıkış kırmızı.',
    gelistir: 'Sol el kuralıyla dene: hangisi daha kısa sürdü? Labirentte kaç adım attığını say.',
    ipucu: '"Dön" bloğu Bloklarım\'da: "hedef yön"ü değiştirir ve jiroskop o yöne gelene kadar döner. Kırmızı çıkışa varınca program biter.',
    uyarlama: 'Sitede robot 0,5 turluk küçük adımlar atar. Simülasyonda adım bir kare (2 tur = 35,2 cm) yapıldı; böylece robot köşelere sürtmeden döner. Sitedeki "Dön" her seferinde açıyı sıfırlar; küçük taşmalar birikip robotu duvara çarptırıyordu. Burada açı bir kez sıfırlanır, gidilecek yön "hedef yön" değişkeninde tutulur (gyro kayması konusu). Gecikme az olduğu için dönüş 1° erken bitirilir.',
    programlar: [
      [['def', 'Dön', 'açı'], ['change', '~hedef yön', v('açı')],
        ['ifelse', ['gt', v('açı'), 0],
          [['mvstarth', '~sağ: 100', 20], ['until', ['gt', ['angle', '~2'], ['sub', v('hedef yön'), 1]]]],
          [['mvstarth', '~sol: -100', 20], ['until', ['lt', ['angle', '~2'], ['add', v('hedef yön'), 1]]]]],
        ['mvstop']],
      bas(['resetangle', '~2'], ['set', '~hedef yön', 0], ['untilrep', ['iscolor', '~3', '~kırmızı'], [
        ['call', 'Dön', 90],
        ['if', ['lt', ['dist', '~4'], 20], [['call', 'Dön', -90],
          ['if', ['lt', ['dist', '~4'], 20], [['call', 'Dön', -90],
            ['if', ['lt', ['dist', '~4'], 20], [['call', 'Dön', -90]]]]]]],
        ['mvforh', '~düz: 0', 2, '~dönüş', 30],
      ]], ['mvstop'], ['sound', '~Evet']),
    ],
  },
];

const GRUPLAR = ['Tuğla', 'Sensör', 'Hareket', 'Motor', 'Olay', 'Kontrol', 'Operatör', 'Değişken', 'Proje'];

/** Görevler menüsü için görünüm (Görevler menüsündeki derslerle aynı biçim). */
export const ETKINLIK_GORUNUMU = {
  ad: 'Etkinlikler',
  alt: 'EV3 çalışma sitesinin uygulamalı etkinliklerinden seçmeler (tuğla, sensör, hareket, motor, olay, proje).',
  etkinlikler: GRUPLAR.flatMap((g) => ETKINLIKLER.filter((e) => e.grup === g)).map((e) => ({
    ...e,
    anahtar: `e-${e.id}`,
    etkinlik: true,
  })),
};

export const etkinlikBul = (anahtar) => ETKINLIK_GORUNUMU.etkinlikler.find((e) => e.anahtar === anahtar) ?? null;
export const etkinlikProgrami = (e) => programaCevir(e.programlar);
