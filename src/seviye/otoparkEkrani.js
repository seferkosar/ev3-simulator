// Seviye: Otopark Ekranı. Kaynak: seviye-ekran.md
import { BLOK_KATEGORILERI } from '../bloklar/kategoriler/index.js';
import { GOREVDE_KAPALI, DEGISKEN_ACIK, DEGISKEN_KAPALI, BLOKLARIM } from '../bloklar/kayit.js';

export const HIKAYE =
  'Otoparkın giriş robotunun ekranı boş. Sürücüler dolu mu boş mu anlayamıyor. ' +
  'Robotun ekranını sen programla.';

// Görev 1–2'de yalnızca temizle ve yaz; "program başladığında" her görevde açıktır.
const TEMEL = ['olay_program_basladiginda', 'ekran_temizle', 'ekran_satira_yaz'];

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
    acik: [...TEMEL, 'op_birlestir', 'ekran_konuma_yaz'],
    degisken: true,
    // Ekran pikseli, 0'dan başlar (öğrenciye 1'den başlayarak gösterilir).
    hedef: { x: 90, y: 60, genislik: 60, yukseklik: 30 },
  },
];

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
  return gorev.acik.includes(tur);
}

export const gorevBul = (no) => {
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
  const kategoriler = BLOK_KATEGORILERI.map((k) => ({
    kind: 'category',
    name: k.ad,
    categorystyle: `${k.anahtar}_kategori`,
    contents: k.arac.map((oge) =>
      acik.has(oge.type) ? oge : { ...oge, disabledReasons: [GOREVDE_KAPALI] },
    ),
  }));
  kategoriler.push(
    {
      kind: 'category',
      name: 'Değişkenler',
      categorystyle: 'degiskenler_kategori',
      custom: gorev.degisken ? DEGISKEN_ACIK : DEGISKEN_KAPALI,
    },
    { kind: 'category', name: 'Bloklarım', categorystyle: 'bloklarim_kategori', custom: BLOKLARIM },
  );
  return { kind: 'categoryToolbox', contents: kategoriler };
}
