// Seviye: Otopark Ekranı. Kaynak: seviye-ekran.md
import { BLOK_KATEGORILERI } from '../bloklar/kategoriler/index.js';
import { GOREVDE_KAPALI, DEGISKEN_ACIK, DEGISKEN_KAPALI, BLOKLARIM, BLOKLARIM_ACIK, ARAMA, tumBlokTurleri } from '../bloklar/kayit.js';
import { BLOKLARIM_TURLERI } from '../bloklar/kategoriler/bloklarim.js';

export const HIKAYE =
  'Otoparkın giriş robotunun ekranı boş. Sürücüler dolu mu boş mu anlayamıyor. ' +
  'Robotun ekranını sen programla.';

// Ekran kategorisinin bütün blokları ve "program başladığında" her görevde açıktır.
// (seviye-ekran.md Görev 1–2'de yalnızca temizle ve yaz diyordu; 18.11.2026'da bütün Ekran
// blokları her görevde açık olsun diye değiştirildi.)
const EKRAN_BLOKLARI = BLOK_KATEGORILERI.find((k) => k.anahtar === 'ekran').bloklar.map((b) => b.type);
const TEMEL = ['olay_program_basladiginda', ...EKRAN_BLOKLARI];

// acik: araç kutusunda kullanılabilen bloklar. degisken: Değişkenler kategorisi açık mı.
export const GOREVLER = [
  { no: 1, metin: 'Ekrana "BOS" yazdır.', acik: TEMEL, degisken: false },
  { no: 2, metin: 'Ekranı temizle, sonra "DOLU" yazdır.', acik: TEMEL, degisken: false },
  {
    no: 3,
    metin: 'bos_yer = 5 değişkenini oluştur, ekranda "Bos yer: 5" göster.',
    acik: [...TEMEL, 'op_birlestir'],
    degisken: true,
  },
  {
    no: 4,
    ek: true,
    metin: 'Ekrandaki hedef kutusunun içine "konuma yaz" bloğuyla bir yazı yazdır.',
    acik: [...TEMEL, 'op_birlestir'],
    degisken: true,
    // Ekran pikseli, 0'dan başlar (öğrenciye 1'den başlayarak gösterilir).
    hedef: { x: 90, y: 60, genislik: 60, yukseklik: 30 },
  },
];

/** Serbest çalışma: bütün bloklar açık, görev kontrolü yok (motor, sensör, ses denemek için). */
export const SERBEST = {
  no: 0,
  serbest: true,
  metin: 'Serbest çalışma: bütün bloklar açık. Motorları, sensörleri ve sesleri dene.',
  get acik() {
    return tumBlokTurleri();
  },
  degisken: true,
  bloklarim: true,
};

// Görevlerin örnek çözümleri ("Çözümü göster" ipucunda salt okunur bloklar olarak görünür).
const metin = (METIN) => ({ shadow: { type: 'ev3_metin', fields: { METIN } } });
const sayi = (NUM) => ({ shadow: { type: 'ev3_sayi', fields: { NUM } } });
const satir = (m, n = 1) => ({ type: 'ekran_satira_yaz', inputs: { METIN: m, SATIR: sayi(n) } });
const programla = (ilk, ek = {}) => ({
  ...ek,
  blocks: { languageVersion: 0, blocks: [{ type: 'olay_program_basladiginda', x: 10, y: 10, next: { block: ilk } }] },
});
export const COZUMLER = {
  1: programla(satir(metin('BOS'))),
  2: programla({ type: 'ekran_temizle', next: { block: satir(metin('DOLU')) } }),
  3: programla(
    {
      type: 'variables_set',
      fields: { VAR: { id: 'cozum_bos_yer' } },
      inputs: { VALUE: sayi(5) },
      next: {
        block: satir({
          block: {
            type: 'op_birlestir',
            inputs: {
              A: metin('Bos yer: '),
              B: { block: { type: 'variables_get', fields: { VAR: { id: 'cozum_bos_yer' } } } },
            },
          },
        }),
      },
    },
    { variables: [{ name: 'bos_yer', id: 'cozum_bos_yer' }] },
  ),
  4: programla({ type: 'ekran_konuma_yaz', inputs: { METIN: metin('DOLU'), X: sayi(100), Y: sayi(70) } }),
};

// seviye-ekran.md'deki ipuçları, sırayla açılır.
export const IPUCLARI = [
  'Önce ekranı temizlemeyi dene.',
  'Metin ve sayıyı birleştirmek için birleştir bloğunu kullan.',
];

const DEGISKEN_BLOKLARI = new Set(['variables_get', 'variables_set', 'math_change']);
const DEGER_BLOKLARI = new Set(['ev3_sayi', 'ev3_metin']);

/** Bu blok türü bu görevde kullanılabilir mi? (Dosyadan açılan ve görevden taşınan bloklar için.) */
export function izinliMi(tur, gorevNo) {
  const gorev = gorevBul(gorevNo);
  if (DEGER_BLOKLARI.has(tur)) return true;
  if (DEGISKEN_BLOKLARI.has(tur)) return gorev.degisken;
  if (BLOKLARIM_TURLERI.has(tur)) return Boolean(gorev.bloklarim);
  return gorev.acik.includes(tur);
}

export const gorevBul = (no) => {
  if (no === SERBEST.no) return SERBEST;
  const gorev = GOREVLER.find((g) => g.no === no);
  if (!gorev) throw new Error(`Bilinmeyen görev: ${no}`);
  return gorev;
};

/**
 * Görevin araç kutusu (Blockly JSON). Bütün kategoriler görünür;
 * görevin izin vermediği bloklar gri ve sürüklenemez olur.
 */
export function aracKutusu(gorevNo) {
  const gorev = gorevBul(gorevNo);
  const acik = new Set(gorev.acik);
  const kategoriler = [{ kind: 'category', name: 'Ara', categorystyle: 'arama_kategori', custom: ARAMA }];
  kategoriler.push(...BLOK_KATEGORILERI.map((k) => ({
    kind: 'category',
    name: k.ad,
    categorystyle: `${k.anahtar}_kategori`,
    contents: k.arac.map((oge) =>
      acik.has(oge.type) ? oge : { ...oge, disabledReasons: [GOREVDE_KAPALI] },
    ),
  })));
  kategoriler.push(
    {
      kind: 'category',
      name: 'Değişkenler',
      categorystyle: 'degiskenler_kategori',
      custom: gorev.degisken ? DEGISKEN_ACIK : DEGISKEN_KAPALI,
    },
    {
      kind: 'category',
      name: 'Bloklarım',
      categorystyle: 'bloklarim_kategori',
      custom: gorev.bloklarim ? BLOKLARIM_ACIK : BLOKLARIM,
    },
  );
  return { kind: 'categoryToolbox', contents: kategoriler };
}
