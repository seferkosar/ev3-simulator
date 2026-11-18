// Kod üretiminde küçük dönüşümler (Python ve JS). Değer düz bir sayıysa sonucu hesaplayıp
// yazar, değilse (ör. değişken) ifadeyi olduğu gibi kurar.
import { SATIR_YUKSEKLIGI } from '../ekran/ekranModeli.js';

const DUZ_SAYI = /^-?\d+(\.\d+)?$/;
const DUZ_METIN = /^'(?:[^'\\]|\\.)*'$/;

const hesapla = (kod, islem, ifade) =>
  DUZ_SAYI.test(kod) ? String(islem(Number(kod))) : ifade;

/** Öğrencinin 1'den başlayan konumunu 0'dan başlayan konuma çevirir (Python ve JS'de aynı). */
export const eksiBir = (kod) => hesapla(kod, (n) => n - 1, `${kod} - 1`);

/** Satır numarasını (1'den başlar) piksel cinsinden y'ye çevirir (Python ve JS'de aynı). */
export const satirdanY = (kod) =>
  hesapla(kod, (n) => (n - 1) * SATIR_YUKSEKLIGI, `(${kod} - 1) * ${SATIR_YUKSEKLIGI}`);

/** Satırın son pikselinin y'si (satır kutusunu temizlemek için). */
export const satirSonuY = (kod) =>
  hesapla(kod, (n) => n * SATIR_YUKSEKLIGI - 1, `${kod} * ${SATIR_YUKSEKLIGI} - 1`);

/** Saniyeyi milisaniyeye çevirir. */
export const saniyedenMs = (kod) =>
  hesapla(kod, (n) => Math.round(n * 1000), `int(${kod} * 1000)`);
export const saniyedenMsJs = (kod) =>
  hesapla(kod, (n) => Math.round(n * 1000), `Math.round(${kod} * 1000)`);

/** Bir değeri sabit bir sayıyla çarpar (ör. yüzde → °/sn). */
export const carp = (kod, k) => hesapla(kod, (n) => n * k, `${kod} * ${k}`);

/** Eksi işaretli ifade. */
export const eksi = (kod) => hesapla(kod, (n) => -n, `-(${kod})`);

/** Tırnaklı sayı ('5') ya da boş yazı ('') aritmetikte sayı olarak kullanılır. */
const TIRNAKLI_SAYI = /^'(-?\d+(?:\.\d+)?)'$/;
export const pySayi = (kod) => {
  if (kod === "''" || kod === '') return '0';
  const m = TIRNAKLI_SAYI.exec(kod);
  return m ? m[1] : kod;
};
/** JS: sayıya çevir (düz sayıysa olduğu gibi). */
export const jsSayi = (kod) => {
  const p = pySayi(kod);
  return DUZ_SAYI.test(p) ? p : `op.sayi(${kod})`;
};

/** Düz metin değilse metne çevirir. */
export const metneCevir = (kod) => (DUZ_METIN.test(kod) ? kod : `str(${kod})`);
export const metneCevirJs = (kod) => (DUZ_METIN.test(kod) ? kod : `String(${kod})`);
