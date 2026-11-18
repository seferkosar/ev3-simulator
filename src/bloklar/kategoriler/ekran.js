import { Order } from 'blockly/python';
import { Order as JsOrder } from 'blockly/javascript';
import { komut, simge, giris, secim, aracOgesi } from '../ortak.js';
import { SIMGE } from '../simgeler.js';
import { eksiBir, satirdanY, satirSonuY, saniyedenMs, saniyedenMsJs } from '../pythonYardimci.js';

const S = 'ekran_blocks';
const ikon = simge(SIMGE.tugla);
// Değerler ekranModeli.js'teki RESIMLER ve Pybricks ImageFile adlarıyla aynı olmalı.
const RESIMLER = [
  ['Gözler / Nötr', 'NEUTRAL'],
  ['Gözler / Uyanık', 'AWAKE'],
  ['Gözler / Uykulu', 'SLEEPING'],
  ['Gözler / Kızgın', 'ANGRY'],
  ['Gözler / Başı dönmüş', 'DIZZY'],
  ['Gözler / Göz kırpan', 'WINKING'],
  ['Gözler / Sevgi', 'LOVE'],
];

const b = {
  resimSureli: komut('ekran_resim_sureli', S, '%1 %2 resmini %3 saniye göster', [
    ikon, secim('RESIM', RESIMLER), giris('SURE', 'Number'),
  ]),
  resim: komut('ekran_resim', S, '%1 %2 resmini göster', [ikon, secim('RESIM', RESIMLER)]),
  satiraYaz: komut('ekran_satira_yaz', S, '%1 %2 yaz, satır %3', [
    ikon, giris('METIN'), giris('SATIR', 'Number'),
  ]),
  konumaYaz: komut('ekran_konuma_yaz', S, '%1 %2 yaz, konum %3 , %4 yazı tipi %5', [
    ikon,
    giris('METIN'),
    giris('X', 'Number'),
    giris('Y', 'Number'),
    secim('RENK', [
      ['normal siyah', 'BLACK'],
      ['normal beyaz', 'WHITE'],
    ]),
  ]),
  temizle: komut('ekran_temizle', S, '%1 ekranı temizle', [ikon]),
  isik: komut('ekran_durum_isigi', S, '%1 durum ışığını %2 yap', [
    ikon,
    secim('RENK', [
      ['yeşil', 'GREEN'],
      ['kırmızı', 'RED'],
      ['turuncu', 'ORANGE'],
      ['kapalı', 'OFF'],
    ]),
  ]),
};

const resimImport = (u) => {
  u.definitions_['import_imagefile'] = 'from pybricks.media.ev3dev import ImageFile';
};

// Satır ve konum öğrenci için 1'den başlar; Pybricks'te (0, 0) sol üst köşedir.
const python = {
  ekran_temizle: () => 'ev3.screen.clear()\n',

  ekran_resim: (blok, u) => {
    resimImport(u);
    return `ev3.screen.load_image(ImageFile.${blok.getFieldValue('RESIM')})\n`;
  },

  // Resim süre boyunca kalır, sonra ekran temizlenir.
  ekran_resim_sureli: (blok, u) => {
    resimImport(u);
    u.definitions_['import_wait'] = 'from pybricks.tools import wait';
    const sure = u.valueToCode(blok, 'SURE', Order.MULTIPLICATIVE) || '0';
    return (
      `ev3.screen.load_image(ImageFile.${blok.getFieldValue('RESIM')})\n` +
      `wait(${saniyedenMs(sure)})\n` +
      'ev3.screen.clear()\n'
    );
  },

  ekran_durum_isigi: (blok, u) => {
    const renk = blok.getFieldValue('RENK');
    if (renk === 'OFF') return 'ev3.light.off()\n';
    u.definitions_['import_color'] = 'from pybricks.parameters import Color';
    return `ev3.light.on(Color.${renk})\n`;
  },

  ekran_satira_yaz: (blok, u) => {
    const metin = u.valueToCode(blok, 'METIN', Order.NONE) || "''";
    const satir = u.valueToCode(blok, 'SATIR', Order.NONE) || '1';
    // Önce satırı beyaz kutuyla temizle (simülatördeki gibi yazılar üst üste binmesin).
    u.definitions_['import_color'] = 'from pybricks.parameters import Color';
    return (
      `ev3.screen.draw_box(0, ${satirdanY(satir)}, 177, ${satirSonuY(satir)}, fill=True, color=Color.WHITE)\n` +
      `ev3.screen.draw_text(0, ${satirdanY(satir)}, ${metin})\n`
    );
  },

  ekran_konuma_yaz: (blok, u) => {
    const metin = u.valueToCode(blok, 'METIN', Order.NONE) || "''";
    const x = eksiBir(u.valueToCode(blok, 'X', Order.ADDITIVE) || '1');
    const y = eksiBir(u.valueToCode(blok, 'Y', Order.ADDITIVE) || '1');
    if (blok.getFieldValue('RENK') === 'WHITE') {
      u.definitions_['import_color'] = 'from pybricks.parameters import Color';
      return (
        `ev3.screen.draw_text(${x}, ${y}, ${metin}, ` +
        'text_color=Color.WHITE, background_color=Color.BLACK)\n'
      );
    }
    return `ev3.screen.draw_text(${x}, ${y}, ${metin})\n`;
  },
};

// Simülatörde çalışan JS. `ekran`, `isik` ve `bekle`yi Web Worker sağlar (src/calistirici/yurutucu.js).
const js = {
  ekran_temizle: () => 'ekran.clear();\n',

  ekran_resim: (blok) => `ekran.load_image('${blok.getFieldValue('RESIM')}');\n`,

  ekran_resim_sureli: (blok, u) => {
    const sure = u.valueToCode(blok, 'SURE', JsOrder.MULTIPLICATION) || '0';
    return (
      `ekran.load_image('${blok.getFieldValue('RESIM')}');\n` +
      `await bekle(${saniyedenMsJs(sure)});\n` +
      'ekran.clear();\n'
    );
  },

  ekran_durum_isigi: (blok) => {
    const renk = blok.getFieldValue('RENK');
    return renk === 'OFF' ? 'isik.off();\n' : `isik.on('${renk}');\n`;
  },

  ekran_satira_yaz: (blok, u) => {
    const metin = u.valueToCode(blok, 'METIN', JsOrder.NONE) || "''";
    const satir = u.valueToCode(blok, 'SATIR', JsOrder.NONE) || '1';
    return `ekran.draw_text(0, ${satirdanY(satir)}, ${metin}, null, true);\n`;
  },

  ekran_konuma_yaz: (blok, u) => {
    const metin = u.valueToCode(blok, 'METIN', JsOrder.NONE) || "''";
    const x = eksiBir(u.valueToCode(blok, 'X', JsOrder.ADDITION) || '1');
    const y = eksiBir(u.valueToCode(blok, 'Y', JsOrder.ADDITION) || '1');
    const renk = blok.getFieldValue('RENK') === 'WHITE' ? ", 'WHITE'" : '';
    return `ekran.draw_text(${x}, ${y}, ${metin}${renk});\n`;
  },
};

export default {
  anahtar: 'ekran',
  ad: 'Ekran',
  stil: S,
  bloklar: Object.values(b),
  js,
  arac: [
    aracOgesi(b.resimSureli, { SURE: 2 }),
    aracOgesi(b.resim),
    aracOgesi(b.satiraYaz, { METIN: 'EV3', SATIR: 1 }),
    aracOgesi(b.konumaYaz, { METIN: 'EV3', X: 1, Y: 1 }),
    aracOgesi(b.temizle),
    aracOgesi(b.isik),
  ],
  python,
};
