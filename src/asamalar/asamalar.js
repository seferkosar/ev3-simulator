// "Aşamalar" menüsü: Robot Yolculuğu oyununun 26 aşaması, bizim EV3 bloklarımızla.
// Oyundaki kısa bloklar ("ileri", "sağa dön", "önüm kapalı" …) burada gerçek EV3 bloklarına karşılık gelir.
// Her aşamanın doğrulanmış örnek çözümü var (tests/asamalar.test.js simülasyonda çalıştırır).
import { ASAMALAR, DUNYALAR } from './asamaVerisi.js';
import { asamaSahnesi, KARE } from './asamaSahnesi.js';
import { programaCevir } from '../dersler/donustur.js';

// --- Oyun bloklarının EV3 karşılıkları (donustur.js dili) ---
const F = ['mvfor', '~ileri', KARE, '~cm']; // 1 kare ileri
const R = ['mvfor', '~sağ', 180, '~derece']; // tekerler 180° → robot yerinde 90° sağa döner
const L = ['mvfor', '~sol', 180, '~derece'];
const TUT = ['morun', '~A', '~saat yönünün tersine', 90, '~derece']; // kolu indir
const BIRAK = ['morun', '~A', '~saat yönünde', 90, '~derece']; // kolu kaldır
const GOSTER = ['write', 'Tamam'];
const BIP = ['beep', 72, 0.3];
const ONUM_KAPALI = ['lt', ['dist', '~4'], 20];
const KIRMIZI = ['iscolor', '~3', '~kırmızı'];
const MAVI = ['iscolor', '~3', '~mavi'];
const BEYAZ = ['iscolor', '~3', '~beyaz'];
const DOKUNMA = ['pressed', '~1'];
const GYRO_SAG = [['resetangle', '~2'], ['mvstart', '~sağ: 100'], ['until', ['gt', ['angle', '~2'], 88]], ['mvstop']];
const GYRO_SOL = [['resetangle', '~2'], ['mvstart', '~sol: -100'], ['until', ['lt', ['angle', '~2'], -88]], ['mvstop']];
// Dokunma: duvara değene kadar ilerle, sonra karenin ortasına geri gel.
const DOKUNANA_KADAR = [['mvstart', '~düz: 0'], ['until', DOKUNMA], ['mvstop'], ['mvfor', '~geri', 4, '~cm']];

const n = (adet, blok) => Array.from({ length: adet }, () => blok);
const bas = (...bloklar) => [['start'], ...bloklar];
const kendi = (ad, ...bloklar) => [['def', ad], ...bloklar];

/** Oyundaki hazır başlangıç programı ({k:"f"}, {k:"rep", n, body}) → donustur.js dili. */
function oyunProgrami(liste) {
  const cevir = (b) => {
    switch (b.k) {
      case 'f': return F;
      case 'l': return L;
      case 'r': return R;
      case 'rep': return ['rep', b.n, b.body.map(cevir)];
      default: throw new Error(`Oyun bloğu çevrilemedi: ${b.k}`);
    }
  };
  return [bas(...liste.main.map(cevir))];
}

// Aşama id → örnek çözüm (programlar listesi).
const COZUM = {
  0: [bas(...n(4, F))],
  1: [bas(F, F, R, F, F)],
  2: [bas(F, F, F, R, F, F, R, F, F, F)],
  3: [bas(['rep', 8, [F]])],
  4: [bas(['rep', 4, [F, L, F, R]])],
  5: [bas(['rep', 4, [['rep', 3, [F]], L]])],
  n1: [bas(['forever', [F]])],
  n2: [bas(['untilrep', ONUM_KAPALI, [F]], GOSTER)],
  n3: [bas(F, ['untilrep', BEYAZ, [F]])],
  n4: [bas(['forever', [['ifelse', ONUM_KAPALI, [R], [F]]]])],
  n5: [bas(['rep', 4, [['untilrep', ONUM_KAPALI, [F]], R]])],
  6: [bas(['forever', [['ifelse', ONUM_KAPALI, [R], [F]]]])],
  7: [bas(['forever', [['ifelse', ONUM_KAPALI, [L], [F]]]])],
  // Tek ultrasonik sensör var: önce sağa dönüp bakar (sağım açık mı?), kapalıysa sola döner.
  8: [bas(['forever', [R, ['if', ONUM_KAPALI, [L, ['if', ONUM_KAPALI, [L, ['if', ONUM_KAPALI, [L]]]]]], F]])],
  9: [bas(['forever', [['ifelse', KIRMIZI, [L, F], [F]]]])],
  10: [bas(['forever', [['ifelse', KIRMIZI, [L, F], [['ifelse', MAVI, [R, F], [F]]]]]])],
  11: [bas(['forever', [...DOKUNANA_KADAR, R]])],
  12: [bas(F, F, F, TUT, L, F, F, BIRAK, R, F)],
  13: [kendi('kargo', F, F, TUT, L, L, F, F, BIRAK), bas(['call', 'kargo'], ['call', 'kargo'], R, ['call', 'kargo'])],
  14: [kendi('tasi dolan', L, F, R, F, F, R, F, L), bas(F, ['call', 'tasi dolan'], ['call', 'tasi dolan'], F, ['call', 'tasi dolan'], F, F)],
  15: [kendi('tasi dolan', L, F, R, F, F, R, F, L), bas(['forever', [['ifelse', ONUM_KAPALI, [['call', 'tasi dolan']], [F]]]])],
  16: [bas(F, F, F, R, F, F, F)],
  17: [bas(['rep', 4, [['rep', 2, [F]], L]])],
  18: [bas(F, F, R, F, F, F, F)],
  19: [bas(F, F, ['if', MAVI, [TUT]], F, F, BIRAK, F, ['if', ONUM_KAPALI, [GOSTER, BIP]])],
  20: [bas(...DOKUNANA_KADAR, ...GYRO_SOL, F, F, ['if', KIRMIZI, [TUT]], F, ['if', ONUM_KAPALI, [BIRAK]], ...GYRO_SOL, F, GOSTER, BIP)],
};

/** Komut bloğu sayısı (değer/koşul blokları ve "program başladığında" sayılmaz; sayfadaki sayımla aynı). */
function blokSay(liste) {
  let n = 0;
  for (const b of liste) {
    if (b[0] === 'start') continue;
    n += 1;
    const govdeler = { rep: [2], forever: [1], untilrep: [2], if: [2], ifelse: [2, 3] }[b[0]] ?? [];
    for (const i of govdeler) n += blokSay(b[i] ?? []);
  }
  return n;
}
export const cozumBlokSayisi = (a) => COZUM[a.id].reduce((t, p) => t + blokSay(p), 0);

// Oyunun bloklarının bizdeki karşılığı (aşama kartında "Kullanacağın bloklar").
const ARAC_ADI = {
  f: 'ileri 30 cm hareket et (1 kare)',
  l: 'sola 180 derece hareket et (robot 90° döner)',
  r: 'sağa 180 derece hareket et (robot 90° döner)',
  gl: 'jiroskopla sola 90° dön (açıyı sıfırla, dön, açı < −88 olana kadar bekle)',
  gr: 'jiroskopla sağa 90° dön',
  grab: 'A motorunu saat yönünün tersine 90 derece döndür (kolu indir, paketi tut)',
  drop: 'A motorunu saat yönünde 90 derece döndür (kolu kaldır, bırak)',
  show: 'ekrana yaz (haber ver)',
  beep: 'bip sesi çal',
  rep: 'kez tekrarla',
  forever: 'sürekli',
  wh: 'olana kadar tekrarla',
  dw: 'önce bir kez yap, sonra olana kadar tekrarla',
  if: 'eğer … ise / değilse',
  call: 'Bloklarım (kendi bloğun)',
};
const KOSUL_ADI = {
  fb: 'önüm kapalı: 4 mesafe (cm) < 20 mi?',
  ff: 'önüm açık: mesafe 20 cm\'den büyük (önüm kapalı olana kadar tekrarla)',
  rf: 'sağım açık: sağa dön, sonra önüne bak (tek mesafe sensörü var)',
  touch: '1 dokunma basılı mı?',
  cr: '3 renk kırmızı mı?',
  cb: '3 renk mavi mi?',
};

export const ASAMA_GORUNUMU = DUNYALAR.map((d, i) => ({
  no: i + 1,
  ad: d.ad,
  alt: d.aciklama,
  kavram: d.kavram,
  asamalar: ASAMALAR.filter((a) => a.dunya === i).map((a) => ({
    ...a,
    anahtar: `a-${a.id}`,
    hataAvi: Boolean(a.baslangicProgrami),
    oyunPar: a.par,
    // EV3 blokları oyunun kısa bloklarından uzun olabilir (ör. jiroskopla dönüş 4 blok): sınır en az örnek çözüm kadar.
    par: Math.max(a.par, cozumBlokSayisi(a)),
    bloklar: [
      ...a.araclar.map((k) => ARAC_ADI[k]).filter(Boolean),
      ...a.kosullar.map((k) => KOSUL_ADI[k]).filter(Boolean),
    ],
  })),
}));

export const asamaBul = (anahtar) =>
  ASAMA_GORUNUMU.flatMap((d) => d.asamalar).find((a) => a.anahtar === anahtar) ?? null;

/** Aşamanın sahnesi (dunya.js biçiminde). */
export const asamaSahnesiniAl = (a) => asamaSahnesi(a);

/** Örnek çözüm, Blockly JSON. */
export const asamaCozumu = (a) => programaCevir(COZUM[a.id]);

/** Başlangıç programı: hata avı aşamalarında hatalı program, diğerlerinde boş "program başladığında". */
export const asamaBaslangici = (a) =>
  programaCevir(a.baslangicProgrami ? oyunProgrami(a.baslangicProgrami) : [bas()]);

export const COZUMU_OLAN = Object.keys(COZUM);
