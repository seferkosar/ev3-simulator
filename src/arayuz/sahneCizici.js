// Sahneyi üstten çizer: zemin ızgarası (cm), bölgeler, çizgiler, engeller, yıldızlar, hedef,
// robotun izi, robot ve sensörlerin "gördüğü" (ultrasonik ışın, renk sensörü noktası).
// Bu proje için çizildi; LEGO/CoderZ görseli kullanılmaz.
import { ROBOT } from '../simulasyon/dunya.js';

export const RENK_CSS = {
  RED: '#e03131', GREEN: '#2f9e44', BLUE: '#1971c2', YELLOW: '#fcc419',
  BLACK: '#111', WHITE: '#ffffff', BROWN: '#8b5a2b', NONE: '#cccccc',
};
const ZEMIN = '#f4f2ec';
const DIS = '#2b2d31';
const IZ = 'rgba(25, 113, 194, 0.75)';
const RAD = Math.PI / 180;

export function sahneCiziciOlustur(canvas) {
  const ctx = canvas.getContext('2d');
  let sahne = null;
  let robot = null;
  let iz = [];
  let izGoster = true;
  let kamera = 'tum';
  let cetvel = null; // { a: {x,y}, b: {x,y} } cm
  let olcek = 1;
  let ofset = { x: 0, y: 0 };

  function boyutla() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    return { w, h, dpr };
  }

  function kameraHesapla(w, h) {
    const kenar = 8;
    const sigdir = Math.min((w - kenar * 2) / sahne.genislik, (h - kenar * 2) / sahne.yukseklik);
    if (kamera === 'takip' && robot) {
      olcek = sigdir * 2.2;
      ofset = { x: w / 2 - robot.x * olcek, y: h / 2 - robot.y * olcek };
    } else {
      olcek = sigdir;
      ofset = { x: (w - sahne.genislik * olcek) / 2, y: (h - sahne.yukseklik * olcek) / 2 };
    }
  }

  function izgara() {
    ctx.lineWidth = 1 / olcek;
    if (sahne.kare) {
      // Robot Yolculuğu: kare ızgara
      ctx.strokeStyle = 'rgba(0,0,0,0.14)';
      ctx.beginPath();
      for (let x = 0; x <= sahne.genislik; x += sahne.kare) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, sahne.yukseklik);
      }
      for (let y = 0; y <= sahne.yukseklik; y += sahne.kare) {
        ctx.moveTo(0, y);
        ctx.lineTo(sahne.genislik, y);
      }
      ctx.stroke();
      return;
    }
    for (let x = 0; x <= sahne.genislik; x += 10) {
      ctx.strokeStyle = x % 50 === 0 ? 'rgba(0,0,0,0.16)' : 'rgba(0,0,0,0.06)';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, sahne.yukseklik);
      ctx.stroke();
    }
    for (let y = 0; y <= sahne.yukseklik; y += 10) {
      ctx.strokeStyle = y % 50 === 0 ? 'rgba(0,0,0,0.16)' : 'rgba(0,0,0,0.06)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(sahne.genislik, y);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.font = `${3.2}px system-ui, sans-serif`;
    ctx.textBaseline = 'top';
    for (let x = 50; x < sahne.genislik; x += 50) ctx.fillText(`${x}`, x + 0.8, 0.8);
    for (let y = 50; y < sahne.yukseklik; y += 50) ctx.fillText(`${y}`, 0.8, y + 0.8);
  }

  function yildiz(x, y, r, alindi) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (-90 + i * 36) * RAD;
      const rr = i % 2 ? r * 0.45 : r;
      ctx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a));
    }
    ctx.closePath();
    ctx.fillStyle = alindi ? 'rgba(252,196,25,0.25)' : '#fcc419';
    ctx.strokeStyle = alindi ? 'rgba(201,147,0,0.3)' : '#c99300';
    ctx.lineWidth = 0.5;
    ctx.fill();
    ctx.stroke();
  }

  function engel(e) {
    if (e.tur === 'araba') {
      ctx.fillStyle = '#5c7cfa';
      ctx.strokeStyle = '#364fc7';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.roundRect(e.x, e.y, e.g, e.h, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(e.x + 3, e.y + e.h * 0.2, e.g - 6, e.h * 0.18);
      ctx.fillRect(e.x + 3, e.y + e.h * 0.62, e.g - 6, e.h * 0.14);
      return;
    }
    if (e.tur === 'tas') {
      ctx.fillStyle = '#868e96';
      ctx.strokeStyle = '#495057';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.roundRect(e.x + 1.5, e.y + 1.5, e.g - 3, e.h - 3, 4);
      ctx.fill();
      ctx.stroke();
      return;
    }
    ctx.fillStyle = '#7a7f87';
    ctx.fillRect(e.x, e.y, e.g, e.h);
  }

  function bayrak({ x, y }) {
    ctx.strokeStyle = '#343a40';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 8);
    ctx.lineTo(x - 4, y - 9);
    ctx.stroke();
    ctx.fillStyle = '#e03131';
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 9);
    ctx.lineTo(x + 7, y - 5);
    ctx.lineTo(x - 4, y - 1);
    ctx.closePath();
    ctx.fill();
  }

  function teslimAlani(r) {
    ctx.strokeStyle = '#f08c00';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 1.5]);
    ctx.strokeRect(r.x + 1, r.y + 1, r.g - 2, r.h - 2);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(240,140,0,0.7)';
    ctx.font = 'bold 7px system-ui, sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText('Z', r.x + 3, r.y + 2.5);
  }

  function paket(p) {
    if (p.tasiniyor) return; // robotun üstünde çizilir
    ctx.fillStyle = p.teslim ? '#a9744f' : '#8b5a2b';
    ctx.strokeStyle = '#5c3a1a';
    ctx.lineWidth = 0.6;
    ctx.fillRect(p.x - 4, p.y - 4, 8, 8);
    ctx.strokeRect(p.x - 4, p.y - 4, 8, 8);
    ctx.beginPath();
    ctx.moveTo(p.x - 4, p.y);
    ctx.lineTo(p.x + 4, p.y);
    ctx.stroke();
  }

  function robotCiz(r) {
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate(r.yon * RAD);
    const { on, arka, yariGenislik: w } = ROBOT;
    // tekerler
    ctx.fillStyle = '#222';
    ctx.fillRect(-2.8, -w - 1.6, 5.6, 2.6);
    ctx.fillRect(-2.8, w - 1, 5.6, 2.6);
    // gövde
    ctx.fillStyle = '#f1f3f5';
    ctx.strokeStyle = '#495057';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.roundRect(-arka, -w + 1, on + arka, (w - 1) * 2, 2);
    ctx.fill();
    ctx.stroke();
    // taşınan paket
    if (r.paketler?.some((p) => p.tasiniyor)) {
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(on - 1, -3.5, 6, 7);
    }
    // tuğla ekranı
    ctx.fillStyle = '#b8c4a4';
    ctx.fillRect(-3, -3, 5, 6);
    // dokunma tamponu
    ctx.fillStyle = r.sensorler?.dokunma ? '#e03131' : '#868e96';
    ctx.fillRect(on - 0.6, -4, 1.4, 8);
    // yön oku
    ctx.fillStyle = '#f08c00';
    ctx.beginPath();
    ctx.moveTo(on - 1.5, 0);
    ctx.lineTo(on - 5, -2.5);
    ctx.lineTo(on - 5, 2.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function cetvelCiz() {
    const { a, b } = cetvel;
    const uzunluk = Math.hypot(b.x - a.x, b.y - a.y);
    ctx.strokeStyle = '#d6336c';
    ctx.fillStyle = '#d6336c';
    ctx.lineWidth = 0.6;
    ctx.setLineDash([2, 1]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.setLineDash([]);
    for (const p of [a, b]) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    const etiket = `${uzunluk.toFixed(1)} cm`;
    ctx.font = '4px system-ui, sans-serif';
    const g = ctx.measureText(etiket).width + 2;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillRect(mx - g / 2, my - 6, g, 5);
    ctx.fillStyle = '#a61e4d';
    ctx.textBaseline = 'top';
    ctx.fillText(etiket, mx - g / 2 + 1, my - 5.6);
  }

  function ciz() {
    if (!sahne) return;
    const { w, h, dpr } = boyutla();
    kameraHesapla(w, h);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = DIS;
    ctx.fillRect(0, 0, w, h);
    ctx.setTransform(dpr * olcek, 0, 0, dpr * olcek, dpr * ofset.x, dpr * ofset.y);

    ctx.fillStyle = ZEMIN;
    ctx.fillRect(0, 0, sahne.genislik, sahne.yukseklik);
    for (const b of sahne.bolgeler ?? []) {
      ctx.fillStyle = RENK_CSS[b.renk];
      ctx.globalAlpha = 0.55;
      ctx.fillRect(b.x, b.y, b.g, b.h);
      ctx.globalAlpha = 1;
    }
    izgara();
    for (const c of sahne.cizgiler ?? []) {
      ctx.strokeStyle = RENK_CSS[c.renk];
      ctx.lineWidth = c.kalinlik;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      c.noktalar.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
    }
    if (sahne.teslim) teslimAlani(sahne.teslim);
    if (sahne.bayrak) bayrak(sahne.bayrak);
    else if (sahne.hedef) {
      const r = sahne.hedef;
      ctx.strokeStyle = '#2b8a3e';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 1.5]);
      ctx.strokeRect(r.x, r.y, r.g, r.h);
      ctx.setLineDash([]);
    }
    for (const e of sahne.engeller ?? []) engel(e);
    (sahne.yildizlar ?? []).forEach((y, i) => yildiz(y.x, y.y, 4, robot?.yildizlar?.[i]));
    (robot?.paketler ?? sahne.paketler ?? []).forEach(paket);

    if (izGoster && iz.length > 1) {
      ctx.strokeStyle = IZ;
      ctx.lineWidth = 0.8;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      iz.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
    }

    if (robot) {
      if (robot.isin) {
        const { x1, y1, x2, y2 } = robot.isin;
        ctx.strokeStyle = 'rgba(224, 49, 49, 0.55)';
        ctx.lineWidth = 0.7;
        ctx.setLineDash([1.5, 1]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(224, 49, 49, 0.8)';
        ctx.beginPath();
        ctx.arc(x2, y2, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      robotCiz(robot);
      if (robot.renkNoktasi) {
        ctx.fillStyle = RENK_CSS[robot.sensorler?.renk] ?? '#ccc';
        ctx.strokeStyle = '#1c7ed6';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(robot.renkNoktasi.x, robot.renkNoktasi.y, 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    if (cetvel) cetvelCiz();
  }

  return {
    sahneAyarla(yeni, baslangicDurumu) {
      sahne = yeni;
      this.sifirla(baslangicDurumu);
    },
    /** Robotu başlangıca alır, izi siler. */
    sifirla(baslangicDurumu) {
      robot = baslangicDurumu;
      iz = robot ? [[robot.x, robot.y]] : [];
      ciz();
    },
    robotGuncelle(anlik) {
      robot = anlik;
      const son = iz[iz.length - 1];
      if (!son || Math.hypot(anlik.x - son[0], anlik.y - son[1]) > 0.5) iz.push([anlik.x, anlik.y]);
      ciz();
    },
    izGoster(deger) {
      izGoster = deger;
      ciz();
    },
    kamera(mod) {
      kamera = mod;
      ciz();
    },
    cetvel(deger) {
      cetvel = deger;
      ciz();
    },
    /** Ekran pikselinden sahne cm koordinatına. */
    dunyaya(px, py) {
      return { x: (px - ofset.x) / olcek, y: (py - ofset.y) / olcek };
    },
    ciz,
  };
}
