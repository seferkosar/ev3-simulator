// Simülatör paneli: motor portları (A–D), sensör portları (1–4) ve tuğla düğmeleri.
// Programda kullanılan motor ve sensörler kendiliğinden bağlanır (donanimBul.js).
// Sensörler elle değiştirilir; değişiklik onDegisim(donanim) ile çalışan programa iletilir.
import { SIMGE } from '../bloklar/simgeler.js';
import { SENSOR_VARSAYILAN } from '../calistirici/yurutucu.js';

const MOTOR_PORTLARI = ['A', 'B', 'C', 'D'];
const SENSOR_PORTLARI = ['1', '2', '3', '4'];
const SENSOR_ADLARI = { dokunma: 'Dokunma', renk: 'Renk', mesafe: 'Mesafe', jiroskop: 'Jiroskop' };
const SENSOR_SIMGESI = { dokunma: SIMGE.dokunma, renk: SIMGE.renk, mesafe: SIMGE.mesafe, jiroskop: SIMGE.jiroskop };
const RENKLER = [
  ['RED', 'kırmızı', '#e03131'],
  ['GREEN', 'yeşil', '#2f9e44'],
  ['BLUE', 'mavi', '#1971c2'],
  ['YELLOW', 'sarı', '#fcc419'],
  ['BLACK', 'siyah', '#111'],
  ['WHITE', 'beyaz', '#fff'],
  ['BROWN', 'kahverengi', '#8b5a2b'],
  ['NONE', 'renk yok', 'transparent'],
];

const el = (etiket, ozellikler = {}, ...cocuklar) => {
  const e = document.createElement(etiket);
  for (const [k, v] of Object.entries(ozellikler)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) e.setAttribute(k, v);
  }
  e.append(...cocuklar);
  return e;
};

function kaydirici({ etiket, min, max, deger, birim, degisti }) {
  const cikti = el('output', {}, `${deger}${birim}`);
  const giris = el('input', {
    type: 'range', min, max, value: deger, 'aria-label': etiket,
    oninput: () => {
      cikti.textContent = `${giris.value}${birim}`;
      degisti(Number(giris.value));
    },
  });
  return el('label', { class: 'kaydirici' }, el('span', {}, etiket), giris, cikti);
}

export function simulatorPaneliOlustur({ motorKap, sensorKap, dugmeler, isiklar, onDegisim }) {
  const sensorDegerleri = {}; // port → { tur, ...değerler } (bağlantı değişse de korunur)
  const dugmeDurumu = {};
  let bagli = { motorlar: [], sensorler: {} };
  let motorAnlik = { durum: {}, zaman: Date.now() };
  const motorGostergeleri = {};

  const donanim = () => ({
    sensorler: Object.fromEntries(
      Object.entries(bagli.sensorler).map(([p, tur]) => [p, { tur, ...sensorDegerleri[`${p}:${tur}`] }]),
    ),
    dugmeler: { ...dugmeDurumu },
  });
  const bildir = () => onDegisim(donanim());

  const degerler = (port, tur) => (sensorDegerleri[`${port}:${tur}`] ??= { ...SENSOR_VARSAYILAN[tur] });

  // --- Sensör kartları ---
  function sensorKontrolu(port, tur) {
    const d = degerler(port, tur);
    if (tur === 'dokunma') {
      const dugme = el('button', { class: 'sensor-bas', 'aria-pressed': String(d.basili) }, 'Bas');
      const ayarla = (basili) => {
        if (d.basili === basili) return;
        d.basili = basili;
        dugme.setAttribute('aria-pressed', String(basili));
        bildir();
      };
      dugme.addEventListener('pointerdown', (o) => {
        o.preventDefault();
        ayarla(true);
      });
      for (const olay of ['pointerup', 'pointerleave', 'pointercancel']) dugme.addEventListener(olay, () => ayarla(false));
      dugme.addEventListener('keydown', (o) => (o.key === ' ' || o.key === 'Enter') && (o.preventDefault(), ayarla(true)));
      dugme.addEventListener('keyup', () => ayarla(false));
      return [dugme];
    }
    if (tur === 'renk') {
      const palet = el('div', { class: 'renk-paleti', role: 'radiogroup', 'aria-label': 'Görülen renk' });
      for (const [kod, ad, css] of RENKLER) {
        const r = el('button', {
          class: `renk-sec${kod === 'NONE' ? ' renk-yok' : ''}`,
          role: 'radio',
          'aria-checked': String(d.renk === kod),
          'aria-label': ad,
          title: ad,
          style: `background:${css}`,
          onclick: () => {
            d.renk = kod;
            for (const c of palet.children) c.setAttribute('aria-checked', String(c === r));
            bildir();
          },
        });
        palet.append(r);
      }
      return [
        palet,
        kaydirici({ etiket: 'Yansıyan ışık', min: 0, max: 100, deger: d.yansiyan, birim: '%', degisti: (v) => ((d.yansiyan = v), bildir()) }),
        kaydirici({ etiket: 'Ortam ışığı', min: 0, max: 100, deger: d.ortam, birim: '%', degisti: (v) => ((d.ortam = v), bildir()) }),
      ];
    }
    if (tur === 'mesafe') {
      return [kaydirici({ etiket: 'Mesafe', min: 0, max: 255, deger: d.cm, birim: ' cm', degisti: (v) => ((d.cm = v), bildir()) })];
    }
    // jiroskop: açı değişiminden açısal hız hesaplanır, kısa süre sonra sıfırlanır
    let sonDegisim = Date.now();
    let durdurucu = null;
    return [
      kaydirici({
        etiket: 'Açı',
        min: -180,
        max: 180,
        deger: d.aci,
        birim: '°',
        degisti: (v) => {
          const simdi = Date.now();
          d.hiz = Math.round(((v - d.aci) / Math.max(1, simdi - sonDegisim)) * 1000);
          d.aci = v;
          sonDegisim = simdi;
          clearTimeout(durdurucu);
          durdurucu = setTimeout(() => ((d.hiz = 0), bildir()), 300);
          bildir();
        },
      }),
    ];
  }

  function portKarti(port, tur, motorMu) {
    const bos = !tur;
    const baslik = el(
      'div',
      { class: 'port-baslik' },
      el('span', { class: 'port-no' }, port),
      bos ? el('span', { class: 'port-ad' }, 'boş') : el('img', { src: motorMu ? SIMGE.motor : SENSOR_SIMGESI[tur], alt: '', class: 'port-simge' }),
      bos ? '' : el('span', { class: 'port-ad' }, motorMu ? 'Motor' : SENSOR_ADLARI[tur]),
    );
    const kart = el('section', {
      class: `port-karti${bos ? ' port-bos' : ''}${motorMu ? ' port-motor' : ' port-sensor'}`,
      'aria-label': `${port} portu${bos ? ', boş' : `, ${motorMu ? 'motor' : SENSOR_ADLARI[tur]}`}`,
    }, baslik);
    if (bos) return kart;
    if (motorMu) {
      const teker = el('img', { src: SIMGE.motor, alt: '', class: 'motor-teker' });
      const hiz = el('span', { class: 'motor-hiz' }, '%0');
      const derece = el('span', { class: 'motor-derece' }, '0°');
      motorGostergeleri[port] = { teker, hiz, derece };
      kart.append(el('div', { class: 'motor-gosterge' }, teker, el('div', {}, hiz, derece)));
    } else {
      kart.append(...sensorKontrolu(port, tur));
    }
    return kart;
  }

  // --- Tuğla düğmeleri ---
  for (const dugme of dugmeler) {
    const ad = dugme.dataset.dugme;
    const ayarla = (basili) => {
      if (Boolean(dugmeDurumu[ad]) === basili) return;
      dugmeDurumu[ad] = basili;
      dugme.classList.toggle('basili', basili);
      bildir();
    };
    dugme.addEventListener('pointerdown', (o) => {
      o.preventDefault();
      ayarla(true);
    });
    for (const olay of ['pointerup', 'pointerleave', 'pointercancel']) dugme.addEventListener(olay, () => ayarla(false));
    dugme.addEventListener('keydown', (o) => (o.key === ' ' || o.key === 'Enter') && (o.preventDefault(), ayarla(true)));
    dugme.addEventListener('keyup', () => ayarla(false));
  }

  // --- Motor animasyonu ---
  function ciz() {
    const simdi = Date.now();
    for (const [port, g] of Object.entries(motorGostergeleri)) {
      const m = motorAnlik.durum[port] ?? { hiz: 0, derece: 0 };
      const derece = m.derece + (m.hiz * (simdi - motorAnlik.zaman)) / 1000;
      g.teker.style.transform = `rotate(${derece}deg)`;
      g.hiz.textContent = `%${Math.round(m.hiz / 10)}`;
      g.derece.textContent = `${Math.round(derece)}°`;
    }
    requestAnimationFrame(ciz);
  }
  requestAnimationFrame(ciz);

  return {
    /** Programdaki donanıma göre portları yeniden çizer. */
    portlariGuncelle(yeni) {
      bagli = { motorlar: yeni.motorlar, sensorler: yeni.sensorler };
      for (const p of Object.keys(motorGostergeleri)) delete motorGostergeleri[p];
      motorKap.replaceChildren(...MOTOR_PORTLARI.map((p) => portKarti(p, yeni.motorlar.includes(p) ? 'motor' : null, true)));
      sensorKap.replaceChildren(...SENSOR_PORTLARI.map((p) => portKarti(p, yeni.sensorler[p] ?? null, false)));
    },
    donanim,
    /** Worker'dan gelen { durum: { A: { hiz, derece } }, zaman } anlık görüntüsü. */
    motorlariGuncelle(anlik) {
      motorAnlik = { durum: { ...motorAnlik.durum, ...anlik.durum }, zaman: anlik.zaman };
    },
    /** Program bitince motorlar durur ama dönülen derece ekranda kalır. */
    motorlariDurdur() {
      const simdi = Date.now();
      const durum = {};
      for (const [p, m] of Object.entries(motorAnlik.durum)) {
        durum[p] = { hiz: 0, derece: m.derece + (m.hiz * (simdi - motorAnlik.zaman)) / 1000 };
      }
      motorAnlik = { durum, zaman: simdi };
    },
    motorlariSifirla() {
      motorAnlik = { durum: {}, zaman: Date.now() };
    },
    isik(sinif) {
      for (const i of isiklar) {
        i.classList.remove('yesil', 'kirmizi', 'turuncu');
        if (sinif) i.classList.add(sinif);
      }
    },
  };
}
