import { Order } from 'blockly/python';
import { Order as JsOrder } from 'blockly/javascript';
import { deger, kosul, giris, secim, aracOgesi } from '../ortak.js';
import { metneCevir, metneCevirJs } from '../pythonYardimci.js';

const S = 'operator_blocks';
// Scratch'teki gibi işlem girişleri serbesttir: ovale sayı da yazı da yazılabilir.
const ikili = (type, isaret, tur) =>
  (tur === 'Boolean' ? kosul : deger)(type, S, `%1 ${isaret} %2`, [giris('A'), giris('B')], tur);

const b = {
  rastgele: deger('op_rastgele', S, '%1 ile %2 arasında rastgele seç', [
    giris('A', 'Number'), giris('B', 'Number'),
  ], 'Number'),
  topla: ikili('op_topla', '+', 'Number'),
  cikar: ikili('op_cikar', '-', 'Number'),
  carp: ikili('op_carp', '*', 'Number'),
  bol: ikili('op_bol', '/', 'Number'),
  kucuk: ikili('op_kucuk', '<', 'Boolean'),
  esit: ikili('op_esit', '=', 'Boolean'),
  buyuk: ikili('op_buyuk', '>', 'Boolean'),
  ve: kosul('op_ve', S, '%1 ve %2', [giris('A', 'Boolean'), giris('B', 'Boolean')]),
  veya: kosul('op_veya', S, '%1 veya %2', [giris('A', 'Boolean'), giris('B', 'Boolean')]),
  degil: kosul('op_degil', S, '%1 değil', [giris('A', 'Boolean')]),
  birlestir: deger('op_birlestir', S, 'birleştir %1 %2', [giris('A'), giris('B')], 'String'),
  uzunluk: deger('op_uzunluk', S, '%1 uzunluğu', [giris('A')], 'Number'),
  mod: ikili('op_mod', 'mod', 'Number'),
  yuvarla: deger('op_yuvarla', S, '%1 yuvarla', [giris('A')], 'Number'),
  islem: deger('op_islem', S, '%1 ( %2 )', [
    secim('ISLEM', [
      ['mutlak değer', 'ABS'],
      ['aşağı yuvarla', 'FLOOR'],
      ['yukarı yuvarla', 'CEIL'],
      ['karekök', 'SQRT'],
      ['sin', 'SIN'],
      ['cos', 'COS'],
      ['tan', 'TAN'],
    ]),
    giris('A'),
  ], 'Number'),
};

const python = {
  // Gerçek EV3'te metin + sayı hata verir; sayılar str() ile metne çevrilir.
  op_birlestir: (blok, u) => {
    const a = metneCevir(u.valueToCode(blok, 'A', Order.NONE) || "''");
    const c = metneCevir(u.valueToCode(blok, 'B', Order.NONE) || "''");
    return [`${a} + ${c}`, Order.ADDITIVE];
  },
};

const js = {
  op_birlestir: (blok, u) => {
    const a = metneCevirJs(u.valueToCode(blok, 'A', JsOrder.NONE) || "''");
    const c = metneCevirJs(u.valueToCode(blok, 'B', JsOrder.NONE) || "''");
    return [`${a} + ${c}`, JsOrder.ADDITION];
  },
};

export default {
  anahtar: 'operatorler',
  ad: 'Operatörler',
  stil: S,
  bloklar: Object.values(b),
  js,
  arac: [
    aracOgesi(b.rastgele, { A: 1, B: 10 }),
    aracOgesi(b.topla),
    aracOgesi(b.cikar),
    aracOgesi(b.carp),
    aracOgesi(b.bol),
    aracOgesi(b.kucuk, { B: '100' }),
    aracOgesi(b.esit, { B: '100' }),
    aracOgesi(b.buyuk, { B: '100' }),
    aracOgesi(b.ve),
    aracOgesi(b.veya),
    aracOgesi(b.degil),
    aracOgesi(b.birlestir, { A: 'elma', B: 'armut' }),
    aracOgesi(b.uzunluk, { A: 'elma' }),
    aracOgesi(b.mod),
    aracOgesi(b.yuvarla),
    aracOgesi(b.islem),
  ],
  python,
};
