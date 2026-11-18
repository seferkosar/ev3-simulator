import { Order } from 'blockly/python';
import { Order as JsOrder } from 'blockly/javascript';
import { deger, kosul, giris, secim, aracOgesi } from '../ortak.js';
import { metneCevir, metneCevirJs, pySayi, jsSayi } from '../pythonYardimci.js';

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

const pyD = (u, b, ad, sira = Order.NONE, vars = "''") => u.valueToCode(b, ad, sira) || vars;
const jsD = (u, b, ad, sira = JsOrder.NONE, vars = "''") => u.valueToCode(b, ad, sira) || vars;
const pyK = (u, b, ad) => u.valueToCode(b, ad, Order.LOGICAL_NOT) || 'False';
const jsK = (u, b, ad) => u.valueToCode(b, ad, JsOrder.LOGICAL_NOT) || 'false';

const PY_ARITMETIK = {
  op_topla: ['+', Order.ADDITIVE],
  op_cikar: ['-', Order.ADDITIVE],
  op_carp: ['*', Order.MULTIPLICATIVE],
  op_bol: ['/', Order.MULTIPLICATIVE],
  op_mod: ['%', Order.MULTIPLICATIVE],
};
const JS_ARITMETIK = {
  op_topla: ['+', JsOrder.ADDITION],
  op_cikar: ['-', JsOrder.SUBTRACTION],
  op_carp: ['*', JsOrder.MULTIPLICATION],
  op_bol: ['/', JsOrder.DIVISION],
};
const PY_KARS = { op_kucuk: '<', op_esit: '==', op_buyuk: '>' };
const JS_KARS = { op_kucuk: '<', op_esit: '=', op_buyuk: '>' };
const MATH_IMPORT = (u) => {
  u.definitions_.import_math = 'import math';
};
const PY_ISLEM = {
  ABS: (x) => `abs(${x})`,
  FLOOR: (x, u) => (MATH_IMPORT(u), `math.floor(${x})`),
  CEIL: (x, u) => (MATH_IMPORT(u), `math.ceil(${x})`),
  SQRT: (x, u) => (MATH_IMPORT(u), `math.sqrt(${x})`),
  SIN: (x, u) => (MATH_IMPORT(u), `math.sin(math.radians(${x}))`),
  COS: (x, u) => (MATH_IMPORT(u), `math.cos(math.radians(${x}))`),
  TAN: (x, u) => (MATH_IMPORT(u), `math.tan(math.radians(${x}))`),
};

const python = {
  // Gerçek EV3'te metin + sayı hata verir; sayılar str() ile metne çevrilir.
  op_birlestir: (blok, u) => {
    const a = metneCevir(pyD(u, blok, 'A'));
    const c = metneCevir(pyD(u, blok, 'B'));
    return [`${a} + ${c}`, Order.ADDITIVE];
  },
  op_rastgele: (b, u) => {
    u.definitions_.import_randint = 'from urandom import randint';
    return [`randint(${pyD(u, b, 'A', Order.NONE, '0')}, ${pyD(u, b, 'B', Order.NONE, '0')})`, Order.FUNCTION_CALL];
  },
  ...Object.fromEntries(
    Object.entries(PY_ARITMETIK).map(([tur, [isaret, sira]]) => [
      tur,
      (b, u) => [`${pySayi(pyD(u, b, 'A', sira))} ${isaret} ${pySayi(pyD(u, b, 'B', sira))}`, sira],
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(PY_KARS).map(([tur, isaret]) => [
      tur,
      (b, u) => [`${pySayi(pyD(u, b, 'A', Order.RELATIONAL))} ${isaret} ${pySayi(pyD(u, b, 'B', Order.RELATIONAL))}`, Order.RELATIONAL],
    ]),
  ),
  op_ve: (b, u) => [`${pyK(u, b, 'A')} and ${pyK(u, b, 'B')}`, Order.LOGICAL_AND],
  op_veya: (b, u) => [`${pyK(u, b, 'A')} or ${pyK(u, b, 'B')}`, Order.LOGICAL_OR],
  op_degil: (b, u) => [`not ${pyK(u, b, 'A')}`, Order.LOGICAL_NOT],
  op_uzunluk: (b, u) => [`len(str(${pyD(u, b, 'A')}))`, Order.FUNCTION_CALL],
  op_yuvarla: (b, u) => [`round(${pySayi(pyD(u, b, 'A'))})`, Order.FUNCTION_CALL],
  op_islem: (b, u) => [PY_ISLEM[b.getFieldValue('ISLEM')](pySayi(pyD(u, b, 'A')), u), Order.FUNCTION_CALL],
};

const js = {
  op_birlestir: (blok, u) => {
    const a = metneCevirJs(jsD(u, blok, 'A'));
    const c = metneCevirJs(jsD(u, blok, 'B'));
    return [`${a} + ${c}`, JsOrder.ADDITION];
  },
  op_rastgele: (b, u) => [`op.rastgele(${jsD(u, b, 'A')}, ${jsD(u, b, 'B')})`, JsOrder.FUNCTION_CALL],
  ...Object.fromEntries(
    Object.entries(JS_ARITMETIK).map(([tur, [isaret, sira]]) => [
      tur,
      (b, u) => [`${jsSayi(jsD(u, b, 'A', sira))} ${isaret} ${jsSayi(jsD(u, b, 'B', sira))}`, sira],
    ]),
  ),
  op_mod: (b, u) => [`op.mod(${jsD(u, b, 'A')}, ${jsD(u, b, 'B')})`, JsOrder.FUNCTION_CALL],
  ...Object.fromEntries(
    Object.entries(JS_KARS).map(([tur, isaret]) => [
      tur,
      (b, u) => [`op.karsilastir(${jsD(u, b, 'A')}, ${jsD(u, b, 'B')}, '${isaret}')`, JsOrder.FUNCTION_CALL],
    ]),
  ),
  op_ve: (b, u) => [`${jsK(u, b, 'A')} && ${jsK(u, b, 'B')}`, JsOrder.LOGICAL_AND],
  op_veya: (b, u) => [`${jsK(u, b, 'A')} || ${jsK(u, b, 'B')}`, JsOrder.LOGICAL_OR],
  op_degil: (b, u) => [`!${jsK(u, b, 'A')}`, JsOrder.LOGICAL_NOT],
  op_uzunluk: (b, u) => [`String(${jsD(u, b, 'A')}).length`, JsOrder.MEMBER],
  op_yuvarla: (b, u) => [`Math.round(${jsSayi(jsD(u, b, 'A'))})`, JsOrder.FUNCTION_CALL],
  op_islem: (b, u) => [`op.islem('${b.getFieldValue('ISLEM')}', ${jsD(u, b, 'A')})`, JsOrder.FUNCTION_CALL],
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
