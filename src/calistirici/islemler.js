// Operatör bloklarının simülatördeki davranışı (EV3 Classroom / Scratch kurallarına yakın).

/** Sayıya çevirir; sayı değilse 0. */
export const sayi = (x) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
};

const sayiMi = (x) => x !== '' && x !== null && x !== undefined && Number.isFinite(Number(x));

/** <, =, >: ikisi de sayıysa sayı olarak, değilse büyük/küçük harf gözetmeden metin olarak. */
export function karsilastir(a, b, islem) {
  const sayisal = sayiMi(a) && sayiMi(b);
  const x = sayisal ? Number(a) : String(a).toLowerCase();
  const y = sayisal ? Number(b) : String(b).toLowerCase();
  if (islem === '<') return x < y;
  if (islem === '>') return x > y;
  return x === y;
}

/** Sonuç bölenle aynı işaretli (Scratch mod). */
export function mod(a, b) {
  const x = sayi(a);
  const y = sayi(b);
  if (y === 0) return NaN;
  const k = x % y;
  return k !== 0 && k < 0 !== y < 0 ? k + y : k;
}

/** İki uç tam sayıysa tam sayı, değilse ondalıklı rastgele sayı. */
export function rastgele(a, b, rnd = Math.random) {
  const [alt, ust] = [sayi(a), sayi(b)].sort((p, q) => p - q);
  if (Number.isInteger(alt) && Number.isInteger(ust)) return alt + Math.floor(rnd() * (ust - alt + 1));
  return alt + rnd() * (ust - alt);
}

const RADYAN = Math.PI / 180;

/** "mutlak değer", "karekök", sin/cos/tan (derece) ... */
export function islem(ad, x) {
  const n = sayi(x);
  switch (ad) {
    case 'ABS': return Math.abs(n);
    case 'FLOOR': return Math.floor(n);
    case 'CEIL': return Math.ceil(n);
    case 'SQRT': return Math.sqrt(n);
    case 'SIN': return Math.round(Math.sin(n * RADYAN) * 1e10) / 1e10;
    case 'COS': return Math.round(Math.cos(n * RADYAN) * 1e10) / 1e10;
    case 'TAN': return Math.round(Math.tan(n * RADYAN) * 1e10) / 1e10;
    default: throw new Error(`Bilinmeyen işlem: ${ad}`);
  }
}
