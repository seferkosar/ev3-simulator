// "Robot Yolculuğu" aşama haritasını (karakter ızgarası) sahne simülasyonuna çevirir.
// Bir kare KARE cm. Robot karenin ortasından başlar; duvarlar (#) ve saha kenarı engeldir.
// Görev: bütün yıldızları topla, paketleri teslim alanına (Z) bırak, bayrağa (G) var;
// gerekiyorsa bayraktayken ekrana yazarak ya da ses çalarak haber ver.

export const KARE = 30;
const YON = [-90, 0, 90, 180]; // 0 yukarı, 1 sağ, 2 aşağı, 3 sol
const RENK = { r: 'RED', b: 'BLUE', y: 'YELLOW', g: 'GREEN' };
const PAY = 6; // hedef alanı karenin kenarından bu kadar içeride (robot merkezi girmeli)

const kareMerkezi = ([x, y]) => ({ x: x * KARE + KARE / 2, y: y * KARE + KARE / 2 });
const kareAlani = ([x, y], pay = 0) => ({ x: x * KARE + pay, y: y * KARE + pay, g: KARE - pay * 2, h: KARE - pay * 2 });

/** Haritadaki karakterlerin konumları: { S: [[x,y]], G: [...], ... } */
function bul(harita) {
  const k = {};
  harita.forEach((satir, y) => [...satir].forEach((c, x) => (k[c] ??= []).push([x, y])));
  return k;
}

export function asamaSahnesi(a) {
  const k = bul(a.harita);
  const hedefKare = a.hedefKare ?? k.G?.[0];
  const teslimKare = a.teslimKare ?? k.Z?.[0];
  const paketler = (a.paketKareleri ?? k.o ?? []).map(kareMerkezi);
  return {
    genislik: a.harita[0].length * KARE,
    yukseklik: a.harita.length * KARE,
    baslangic: { ...kareMerkezi(k.S[0]), yon: YON[a.yon] },
    engeller: (k['#'] ?? []).map((p) => ({ ...kareAlani(p), tur: 'tas' })),
    bolgeler: [
      ...Object.entries(RENK).flatMap(([c, renk]) => (k[c] ?? []).map((p) => ({ ...kareAlani(p), renk }))),
    ],
    yildizlar: (k['*'] ?? []).map(kareMerkezi),
    hedef: kareAlani(hedefKare, PAY),
    bayrak: kareMerkezi(hedefKare),
    ...(teslimKare && { teslim: kareAlani(teslimKare, 2) }),
    ...(paketler.length && { paketler }),
    haberVer: Boolean(a.haberVer),
    kare: KARE,
    tamamlanincaDur: true,
  };
}

/** Program bittikten sonra görev kontrolü (oyundaki mesajlara benzer; cevabı söylemez). */
export function asamaKontrol(a, anlik) {
  if (anlik.gorevTamam) return { basarili: true, mesaj: 'Görev tamam! Robot bayrağa vardı.' };
  const eksik = [];
  const yildizKalan = anlik.yildizlar.filter((y) => !y).length;
  if (yildizKalan) eksik.push(`${yildizKalan} yıldız toplanmadı`);
  const paketKalan = (anlik.paketler ?? []).filter((p) => !p.teslim).length;
  if (paketKalan) eksik.push(`${paketKalan} paket teslim edilmedi`);
  if (!anlik.bayrakta) eksik.push('robot bayrakta değil');
  else if (a.haberVer && !anlik.haberVerildi) eksik.push('bayrakta ekrana yazarak ya da ses çalarak haber vermedin');
  let mesaj = `Program bitti ama ${eksik.join(', ')}.`;
  if (anlik.carpti) mesaj = `Robot bir taşa ya da kenara çarptı. Hangi blok onu yanlış yöne götürdü? (${eksik.join(', ')})`;
  return { basarili: false, mesaj };
}
