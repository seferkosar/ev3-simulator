// Araç kutusunda blok arama. Görevde kapalı bloklar aramada da gri görünür.
import { BLOK_KATEGORILERI } from './kategoriler/index.js';
import { INGILIZCE_ADLAR } from './ingilizceAdlar.js';

const kucuk = (s) => s.toLocaleLowerCase('tr').normalize('NFC');

/** Bloğun aranabilir metni: Türkçe yazısı, açılır liste seçenekleri ve İngilizce adı. */
function aramaMetni(blok) {
  const parcalar = [];
  for (let i = 0; blok[`message${i}`] !== undefined; i++) {
    parcalar.push(blok[`message${i}`].replace(/%\d+/g, ' '));
    for (const arg of blok[`args${i}`] ?? []) {
      if (arg.type === 'field_dropdown') parcalar.push(...arg.options.map(([etiket]) => etiket));
    }
  }
  parcalar.push(INGILIZCE_ADLAR[blok.type] ?? '');
  return kucuk(parcalar.join(' ').replaceAll(' ', ' '));
}

const DIZIN = BLOK_KATEGORILERI.flatMap((k) => {
  const tanimlar = new Map(k.bloklar.map((b) => [b.type, b]));
  return k.arac.map((oge) => ({ oge, metin: aramaMetni(tanimlar.get(oge.type)) }));
});

/**
 * Sorguya uyan araç kutusu öğeleri. Her kelime metinde geçmeli.
 * acikMi(tur): görevde açık mı; değilse öğe disabledReasons ile döner.
 */
export function blokAra(sorgu, acikMi, kapaliNedeni = 'GOREVDE_KAPALI') {
  const kelimeler = kucuk(sorgu).trim().split(/\s+/).filter(Boolean);
  if (!kelimeler.length) return [];
  return DIZIN.filter(({ metin }) => kelimeler.every((k) => metin.includes(k))).map(({ oge }) =>
    acikMi(oge.type) ? oge : { ...oge, disabledReasons: [kapaliNedeni] },
  );
}
