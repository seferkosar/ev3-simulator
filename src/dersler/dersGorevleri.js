// Öğretim programındaki EV3 dersleri, sitedeki "Görevler" menüsü için.
// Her ders için: simülasyonda nasıl çalıştırılacağı (mod, sahne), öğrenciye ipucu, öğretim programında
// tanımı verilmeyen bloklar için ek tanımlar ve simülasyonda denetlenen durum (tests/dersler.test.js).
import { SEVIYELER } from './dersVerisi.js';
import { programaCevir } from './donustur.js';

const S = (sahne, ipucu = '') => ({ mod: 'sahne', sahne, ipucu });
const E = (ipucu = '') => ({ mod: 'elle', ipucu });

// durum: 'calisiyor' | 'kismen' | 'calismaz'; not: neden.
const AYAR = {
  '1-2': E('Robot sekmesinde EV3 ekranını izle.'),
  '1-3': S('bos', 'Robot 1 tur (yaklaşık 17,6 cm) ileri gider. Cetvelle ölç.'),
  '1-4': S('bos', 'Robotun izini takip et: hangi blok hangi çizgiyi çizdi?'),
  '1-5': E('Robot sekmesinde A portundaki motorun 10 saniye döndüğünü izle.'),
  '1-6': E('A motorunun çeyrek tur gidip geri geldiğini derece göstergesinde izle.'),
  '1-7': E('Robot sekmesinde renk sensöründe önce kırmızıyı, sonra yeşili seç.'),
  '1-8': E('Robot sekmesinde dans eden motoru ve ekranı izle.'),
  '1-9': E('Robot sekmesinde jiroskobun Açı kaydırıcısını 10°\'nin üstüne çek (deprem!). Bitirmek için Durdur.'),
  '1-10': S('bos', 'Robot 5 tur gider. Önce tahmin et, sonra ölç.'),
  '1-11': E('Robot sekmesinde hikâyeyi izle: gözler, ses ve motor.'),
  '2-1': E('Robot sekmesinde EV3 ekranını izle.'),
  '2-2': S('bos', 'Robotun çizdiği yolu cetvelle ölç.'),
  '2-3': S('bos', 'Program sonunda ekranda B motorunun saydığı derece yazar.'),
  '2-4': S('bos', 'Robot bir kare çizer; başladığı yere ne kadar yakın döndü?'),
  '2-5': S('bos', 'Süre ve dönüş sayısı değişkenlere kaydedilir.'),
  '2-6': S('bos', 'Robotun hızı (cm/sn) ekrana yazılır.'),
  '2-7': S('bos', 'Robot duvara 20 cm kala durur ve bip çalar.'),
  '2-8': E('Robot sekmesinde Açı kaydırıcısını 45°\'nin üstüne ve −45°\'nin altına getir. Bitirmek için Durdur.'),
  '2-9': S('cizgi', 'Robot yansıyan ışıkla çizginin kenarını izler. Bitirmek için Durdur.'),
  '2-10': E('Robot sekmesinde: dokunma sensörüne bas, Açı kaydırıcısını eğim kadar ayarla, sonra yine bas.'),
  '2-11': E('Robot sekmesinde sırayla: renk sensöründe beyazı seç, dokunmaya bas, Açı kaydırıcısını 30°\'nin üstüne çek.'),
  '2-12': E('Robot sekmesinde dokunmaya her basışta bir çizgi çizilir (3 kez); her seferinde Açı kaydırıcısını 30° daha artır.'),
  '3-1': S('bos', 'Robot 1 tur ileri, 1 tur geri gider.'),
  '3-2': S('bos', '1023 derece kaç cm? Cetvelle ölç.'),
  '3-3': S('bos', 'Jiroskopla 90° dönerek kare çizer.'),
  '3-4': S('bos', 'Başlamak için Sahne\'deki "Dokunmaya bas" düğmesine bas. Bitirmek için Durdur.'),
  '3-5': E('Robot sekmesinde Mesafe kaydırıcısını 20 cm\'nin altına indir, sonra yukarı çıkar: sayaç artar.'),
  '3-6': S('cizgi', 'Oransal (P) kontrolle çizgi izleme. Kp değerini değiştirip dene. Bitirmek için Durdur.'),
  '3-7': S('bos', 'Kendi bloklarınla (git, dön) yol çiz.'),
  '3-8': S('labirent', 'Labirentte sağ el kuralını dene. Bitirmek için Durdur.'),
  '3-9': S('bos', 'Python sekmesinde aynı programın MicroPython hâline bak.'),
  '3-10': S('bos', 'Robot engele 15 cm kala durur. Python sekmesine de bak.'),
  '3-11': E('Robot sekmesinde dokunmaya bas; renk sensörünün yansıyan ışığını eşiğin altına ya da üstüne getir.'),
  '3-12': S('cizgi', 'Teslimat robotu çizgiyi izler. Bitirmek için Sahne\'deki "Dokunmaya bas" düğmesine bas.'),
};

// Öğretim programında tanımı verilmeyen bloklar ve değişkenler (aynı biçimde, örnek olarak eklendi).
const EK = {
  '3-8': {
    not: '"sağa dön", "sola dön" ve "git" blokları bu derste tanımlanmamış; örnek tanımlar eklendi.',
    programlar: [
      [['def', 'sağa dön'], ['resetangle', '~2'], ['mvstart', '~sağ: 100'], ['until', ['gt', ['angle', '~2'], 89]], ['mvstop']],
      [['def', 'sola dön'], ['resetangle', '~2'], ['mvstart', '~sol: -100'], ['until', ['lt', ['angle', '~2'], -89]], ['mvstop']],
      [['def', 'git', 'cm'], ['mvfor', '~ileri', ['var', 'cm'], '~cm']],
    ],
  },
  '3-11': {
    not: '"ortalama A" ve "ortalama B" önceki ölçümden gelir; örnek değerler (20 ve 80) eklendi.',
    basa: [['set', '~ortalama A', 20], ['set', '~ortalama B', 80]],
  },
  '3-12': {
    not: '"çizgiyi izle" bloğu bu derste tanımlanmamış; örnek tanım eklendi.',
    programlar: [
      [['def', 'çizgiyi izle'], ['ifelse', ['lt', ['refl', '~3'], 50], [['mvstart', '~sol: -30']], [['mvstart', '~sağ: 30']]]],
    ],
  },
};

// Simülasyonda denetlenen durum (tests/dersler.test.js bunu doğrular).
const DURUM = {
  '3-8': { durum: 'kismen', not: 'Bu algoritma labirentte bir köşede gidip gelebilir; öğrenciler kuralı iyileştirmeli.' },
};

const PROJE_NOTU = 'Bu hafta kodsuz: tasarım, proje ya da tartışma haftası. Kazanımı ve önerileri oku.';

export const DERS_GORUNUMU = SEVIYELER.map((s) => ({
  no: s.no,
  ad: s.ad,
  alt: s.alt,
  dersler: s.haftalar.map((h) => {
    const anahtar = `${s.no}-${h.no}`;
    const kodlu = h.programlar.length > 0;
    const ek = EK[anahtar];
    return {
      anahtar,
      seviye: s.no,
      hafta: h.no,
      baslik: h.baslik,
      kazanim: h.kazanim,
      disiplin: h.disiplin,
      anlatim: h.anlatim,
      yanilgi: h.yanilgi,
      proje: h.proje,
      kodlu,
      ...(kodlu ? AYAR[anahtar] : { ipucu: PROJE_NOTU }),
      ekNot: ek?.not ?? '',
      durum: kodlu ? (DURUM[anahtar]?.durum ?? 'calisiyor') : 'kodsuz',
      durumNotu: DURUM[anahtar]?.not ?? '',
    };
  }),
}));

/** Dersin örnek programı (ek tanımlarla birlikte) Blockly JSON olarak. */
export function dersProgrami(anahtar) {
  const [s, h] = anahtar.split('-').map(Number);
  const hafta = SEVIYELER[s - 1].haftalar[h - 1];
  const ek = EK[anahtar] ?? {};
  let programlar = hafta.programlar.map((p) => p.slice());
  if (ek.basa) {
    programlar = programlar.map((p) => (p[0][0] === 'start' ? [p[0], ...ek.basa, ...p.slice(1)] : p));
  }
  return programaCevir([...(ek.programlar ?? []), ...programlar]);
}

export const dersBul = (anahtar) =>
  DERS_GORUNUMU.flatMap((s) => s.dersler).find((d) => d.anahtar === anahtar) ?? null;
