// "resim göster" bloğunun göz resimleri. Bu proje için çizilmiştir (LEGO resimleri değildir).
// Koordinatlar 178x128 ekran pikseli.

const SOL = 52;
const SAG = 126;
const ORTA_Y = 66;
const RX = 30;
const RY = 26;

function goz(ctx, cx, { ry = RY } = {}) {
  ctx.beginPath();
  ctx.ellipse(cx, ORTA_Y, RX, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function bebek(ctx, cx, { r = 10, dx = 0, dy = 0 } = {}) {
  ctx.beginPath();
  ctx.arc(cx + dx, ORTA_Y + dy, r, 0, Math.PI * 2);
  ctx.fill();
}

function kapaliGoz(ctx, cx) {
  ctx.beginPath();
  ctx.moveTo(cx - RX, ORTA_Y);
  ctx.quadraticCurveTo(cx, ORTA_Y + 14, cx + RX, ORTA_Y);
  ctx.stroke();
}

function kas(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

const CIZIMLER = {
  NEUTRAL(ctx) {
    for (const cx of [SOL, SAG]) {
      goz(ctx, cx);
      bebek(ctx, cx);
    }
  },
  AWAKE(ctx) {
    for (const cx of [SOL, SAG]) {
      goz(ctx, cx, { ry: RY + 4 });
      bebek(ctx, cx, { r: 7 });
      ctx.beginPath();
      ctx.arc(cx, ORTA_Y - 18, 24, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();
    }
  },
  SLEEPING(ctx) {
    kapaliGoz(ctx, SOL);
    kapaliGoz(ctx, SAG);
    ctx.font = 'bold 14px monospace';
    ctx.fillText('z', 150, 22);
    ctx.font = 'bold 10px monospace';
    ctx.fillText('z', 162, 12);
  },
  ANGRY(ctx) {
    for (const cx of [SOL, SAG]) {
      goz(ctx, cx);
      bebek(ctx, cx, { dy: 4 });
    }
    kas(ctx, SOL - 28, ORTA_Y - 36, SOL + 26, ORTA_Y - 22);
    kas(ctx, SAG - 26, ORTA_Y - 22, SAG + 28, ORTA_Y - 36);
  },
  DIZZY(ctx) {
    for (const cx of [SOL, SAG]) {
      goz(ctx, cx);
      for (const r of [6, 12, 18]) {
        ctx.beginPath();
        ctx.arc(cx, ORTA_Y, r, 0, Math.PI * 1.6);
        ctx.stroke();
      }
    }
  },
  LOVE(ctx) {
    for (const cx of [SOL, SAG]) {
      goz(ctx, cx);
      ctx.beginPath();
      ctx.moveTo(cx, ORTA_Y + 12);
      ctx.bezierCurveTo(cx - 22, ORTA_Y - 2, cx - 10, ORTA_Y - 18, cx, ORTA_Y - 6);
      ctx.bezierCurveTo(cx + 10, ORTA_Y - 18, cx + 22, ORTA_Y - 2, cx, ORTA_Y + 12);
      ctx.fill();
    }
  },
  WINKING(ctx) {
    goz(ctx, SOL);
    bebek(ctx, SOL);
    kapaliGoz(ctx, SAG);
  },
};

export function resmiCiz(ctx, ad, cizgiRengi) {
  const cizim = CIZIMLER[ad];
  if (!cizim) return;
  ctx.strokeStyle = cizgiRengi;
  ctx.fillStyle = cizgiRengi;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.textBaseline = 'top';
  cizim(ctx);
}
