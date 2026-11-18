// Blok tanımlarında ortak kullanılan parçalar.

export const MOTOR_PORTLARI = ['A', 'B', 'C', 'D'].map((p) => [p, p]);
export const SENSOR_PORTLARI = ['1', '2', '3', '4'].map((p) => [p, p]);

export const KARSILASTIRMA_KISA = [
  ['<', 'LT'],
  ['=', 'EQ'],
  ['>', 'GT'],
];
export const KARSILASTIRMA_UZUN = [
  ['küçüktür (<)', 'LT'],
  ['eşittir (=)', 'EQ'],
  ['büyüktür (>)', 'GT'],
];
export const RENKLER = [
  ['kırmızı', 'RED'],
  ['yeşil', 'GREEN'],
  ['mavi', 'BLUE'],
  ['sarı', 'YELLOW'],
  ['siyah', 'BLACK'],
  ['beyaz', 'WHITE'],
  ['kahverengi', 'BROWN'],
  ['renk yok', 'NONE'],
];
export const UZUNLUK_BIRIMLERI = [
  ['cm', 'CM'],
  ['inç', 'IN'],
];
export const DUGMELER = [
  ['orta', 'CENTER'],
  ['sol', 'LEFT'],
  ['sağ', 'RIGHT'],
  ['yukarı', 'UP'],
  ['aşağı', 'DOWN'],
];

// --- Argüman yardımcıları ---
export const simge = (src) => ({ type: 'field_image', src, width: 26, height: 26, alt: '' });
export const giris = (name, check) => ({ type: 'input_value', name, ...(check && { check }) });
// Blockly, bütün seçeneklerde ortak olan baş/son kelimeyi listenin dışına taşır
// ("Gözler / Nötr" → "Gözler /" + "Nötr"). Bölünmeyen boşluk bunu engeller.
const BOLUNMEZ = ' ';
export const secim = (name, options) => ({
  type: 'field_dropdown',
  name,
  options: options.map(([etiket, deger]) => [etiket.replaceAll(' ', BOLUNMEZ), deger]),
});
export const yigin = (name) => ({ type: 'input_statement', name });

// --- Blok biçimleri ---
const temel = (type, style, message0, args0) => ({
  type,
  style,
  message0,
  args0,
  inputsInline: true,
});

/** Üstüne ve altına blok takılabilen komut bloğu. */
export const komut = (type, style, message0, args0 = []) => ({
  ...temel(type, style, message0, args0),
  previousStatement: null,
  nextStatement: null,
});

/** Programın başladığı şapka bloğu (üstüne blok takılmaz). */
export const sapka = (type, style, message0, args0 = []) => ({
  ...temel(type, style, message0, args0),
  nextStatement: null,
  hat: 'cap',
});

/** Değer veren yuvarlak blok. */
export const deger = (type, style, message0, args0 = [], tur = null) => ({
  ...temel(type, style, message0, args0),
  output: tur,
});

/** Doğru/yanlış veren altıgen blok. */
export const kosul = (type, style, message0, args0 = []) => ({
  ...temel(type, style, message0, args0),
  output: 'Boolean',
});

/**
 * Araç kutusundaki blok bilgisi. Boş girişlere beyaz oval (gölge) değer koyar.
 * ozel: { GIRIS_ADI: 1 | 'metin', ALAN_ADI: 'SECENEK' }
 *   sayı → sayı ovali, metin → yazı ovali. Boolean girişler boş kalır.
 */
export function aracOgesi(blok, ozel = {}) {
  const inputs = {};
  const fields = {};
  for (let i = 0; blok[`args${i}`]; i++) {
    for (const arg of blok[`args${i}`]) {
      if (arg.type === 'input_value' && arg.check !== 'Boolean') {
        const v = ozel[arg.name] ?? (arg.check === 'Number' ? 0 : '');
        inputs[arg.name] =
          typeof v === 'number'
            ? { shadow: { type: 'ev3_sayi', fields: { NUM: v } } }
            : { shadow: { type: 'ev3_metin', fields: { METIN: v } } };
      } else if (arg.type === 'field_dropdown' && arg.name in ozel) {
        fields[arg.name] = ozel[arg.name];
      }
    }
  }
  return {
    kind: 'block',
    type: blok.type,
    ...(Object.keys(inputs).length && { inputs }),
    ...(Object.keys(fields).length && { fields }),
  };
}
