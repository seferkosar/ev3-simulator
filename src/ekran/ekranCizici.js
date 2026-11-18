// Ekran modelindeki görünen yazıları ve resimleri canvas'a çizer.
import { EKRAN_GENISLIGI, EKRAN_YUKSEKLIGI, SATIR_YUKSEKLIGI as SATIR } from './ekranModeli.js';
import { resmiCiz } from './resimler.js';

const ARKA_PLAN = '#c9d3b6'; // EV3 ekranına benzeyen soluk yeşil
const YAZI_RENGI = '#111';
// EV3 ekranı gibi piksel piksel yazı: yazı gizli küçük bir tuvale çizilir, her piksel ya tam
// dolu ya tam boş sayılır ve ekrana 1×1 kareler olarak aktarılır (ölçekte keskin kareler görünür).
const YAZI_TIPI = 'bold 11px monospace';
const ESIK = 110; // 0–255 saydamlık eşiği
const HEDEF_RENGI = '#c92a2a';

function pikselleriBul(metin) {
  const tuval = new OffscreenCanvas(EKRAN_GENISLIGI, SATIR);
  const c = tuval.getContext('2d', { willReadFrequently: true });
  c.font = YAZI_TIPI;
  c.textBaseline = 'top';
  c.fillStyle = '#000';
  c.fillText(metin, 0, 2);
  const { data } = c.getImageData(0, 0, EKRAN_GENISLIGI, SATIR);
  const pikseller = [];
  let genislik = 0;
  for (let y = 0; y < SATIR; y++) {
    for (let x = 0; x < EKRAN_GENISLIGI; x++) {
      if (data[(y * EKRAN_GENISLIGI + x) * 4 + 3] >= ESIK) {
        pikseller.push(x, y);
        genislik = Math.max(genislik, x + 1);
      }
    }
  }
  return { pikseller, genislik };
}

const onbellek = new Map();
function pikselYazi(metin) {
  if (!onbellek.has(metin)) {
    if (onbellek.size > 500) onbellek.clear();
    onbellek.set(metin, pikselleriBul(metin));
  }
  return onbellek.get(metin);
}

export function ciziciOlustur(canvas, olcek = 3) {
  canvas.width = EKRAN_GENISLIGI * olcek;
  canvas.height = EKRAN_YUKSEKLIGI * olcek;
  const ctx = canvas.getContext('2d');

  function yaziCiz({ metin, x, y, renk }) {
    const { pikseller, genislik } = pikselYazi(metin);
    if (renk === 'WHITE') {
      ctx.fillStyle = YAZI_RENGI;
      ctx.fillRect(x, y, genislik + 2, SATIR);
      ctx.fillStyle = '#fff';
    } else {
      ctx.fillStyle = YAZI_RENGI;
    }
    for (let i = 0; i < pikseller.length; i += 2) {
      ctx.fillRect(x + 1 + pikseller[i], y + pikseller[i + 1], 1, 1);
    }
  }

  return {
    /** secenekler.hedef: { x, y, genislik, yukseklik } verilirse kesikli hedef kutusu çizilir. */
    ciz(ogeler, { hedef } = {}) {
      ctx.setTransform(olcek, 0, 0, olcek, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = ARKA_PLAN;
      ctx.fillRect(0, 0, EKRAN_GENISLIGI, EKRAN_YUKSEKLIGI);
      for (const oge of ogeler) {
        if (oge.resim) {
          ctx.save();
          resmiCiz(ctx, oge.resim, YAZI_RENGI);
          ctx.restore();
        } else {
          yaziCiz(oge);
        }
      }
      if (hedef) {
        ctx.save();
        ctx.strokeStyle = HEDEF_RENGI;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        ctx.strokeRect(hedef.x + 0.5, hedef.y + 0.5, hedef.genislik - 1, hedef.yukseklik - 1);
        ctx.restore();
      }
    },
  };
}
