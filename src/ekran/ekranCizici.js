// Ekran modelindeki görünen yazıları canvas'a çizer.
import { EKRAN_GENISLIGI, EKRAN_YUKSEKLIGI, SATIR_YUKSEKLIGI as SATIR } from './ekranModeli.js';

const ARKA_PLAN = '#c9d3b6'; // EV3 ekranına benzeyen soluk yeşil
const YAZI_RENGI = '#111';
const YAZI_TIPI = '12px monospace';
const HEDEF_RENGI = '#c92a2a';

export function ciziciOlustur(canvas, olcek = 3) {
  canvas.width = EKRAN_GENISLIGI * olcek;
  canvas.height = EKRAN_YUKSEKLIGI * olcek;
  const ctx = canvas.getContext('2d');

  return {
    /** secenekler.hedef: { x, y, genislik, yukseklik } verilirse kesikli hedef kutusu çizilir. */
    ciz(ogeler, { hedef } = {}) {
      ctx.setTransform(olcek, 0, 0, olcek, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = ARKA_PLAN;
      ctx.fillRect(0, 0, EKRAN_GENISLIGI, EKRAN_YUKSEKLIGI);
      ctx.fillStyle = YAZI_RENGI;
      ctx.font = YAZI_TIPI;
      ctx.textBaseline = 'top';
      for (const { metin, x, y, renk } of ogeler) {
        if (renk === 'WHITE') {
          ctx.fillStyle = YAZI_RENGI;
          ctx.fillRect(x, y, ctx.measureText(metin).width + 2, SATIR);
          ctx.fillStyle = '#fff';
        } else {
          ctx.fillStyle = YAZI_RENGI;
        }
        ctx.fillText(metin, x + 1, y + 2);
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
