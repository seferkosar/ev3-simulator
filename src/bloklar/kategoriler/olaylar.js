import {
  sapka, komut, simge, giris, secim, aracOgesi,
  SENSOR_PORTLARI, KARSILASTIRMA_UZUN, RENKLER, UZUNLUK_BIRIMLERI, DUGMELER,
} from '../ortak.js';
import { Order } from 'blockly/python';
import { Order as JsOrder } from 'blockly/javascript';
import { SIMGE } from '../simgeler.js';
import { jsSensor, pySensor } from './sensorler.js';
import { zamanlayici as pyZamanlayici, KARS_PY, KARS_JS } from '../pyDonanim.js';

const S = 'olay_blocks';
const port = secim('PORT', SENSOR_PORTLARI);
const MESAJLAR = [['mesaj1', 'mesaj1']];

const b = {
  programBasladiginda: sapka('olay_program_basladiginda', S, '%1 program başladığında', [
    simge(SIMGE.oynat),
  ]),
  renk: sapka('olay_renk', S, '%1 %2 renk %3 olduğunda', [
    simge(SIMGE.renk), port, secim('RENK', RENKLER),
  ]),
  dokunma: sapka('olay_dokunma', S, '%1 %2 sensörüne %3', [
    simge(SIMGE.dokunma),
    port,
    secim('DURUM', [
      ['basıldığında', 'PRESSED'],
      ['bırakıldığında', 'RELEASED'],
      ['çarpıldığında', 'BUMPED'],
    ]),
  ]),
  mesafe: sapka('olay_mesafe', S, '%1 %2 mesafe %3 %4 %5 olduğunda', [
    simge(SIMGE.mesafe), port, secim('KARS', KARSILASTIRMA_UZUN),
    giris('DEGER', 'Number'), secim('BIRIM', UZUNLUK_BIRIMLERI),
  ]),
  aci: sapka('olay_aci', S, '%1 %2 açı %3 %4 ° olduğunda', [
    simge(SIMGE.jiroskop), port, secim('KARS', KARSILASTIRMA_UZUN), giris('DEGER', 'Number'),
  ]),
  dugme: sapka('olay_dugme', S, '%1 %2 düğmesine %3', [
    simge(SIMGE.tugla),
    secim('DUGME', DUGMELER),
    secim('DURUM', [
      ['basıldığında', 'PRESSED'],
      ['bırakıldığında', 'RELEASED'],
    ]),
  ]),
  kosul: sapka('olay_kosul', S, '%1 olduğunda', [giris('KOSUL', 'Boolean')]),
  mesajGelince: sapka('olay_mesaj_gelince', S, '%1 mesajı gelince', [secim('MESAJ', MESAJLAR)]),
  yayinla: komut('olay_yayinla', S, '%1 mesajını yayınla', [secim('MESAJ', MESAJLAR)]),
  yayinlaBekle: komut('olay_yayinla_bekle', S, '%1 mesajını yayınla ve bekle', [secim('MESAJ', MESAJLAR)]),
  zamanlayici: sapka('olay_zamanlayici', S, 'zamanlayıcı > %1 olduğunda', [giris('DEGER', 'Number')]),
};

const alan = (b, ad) => b.getFieldValue(ad);
const jsD = (u, b, ad) => u.valueToCode(b, ad, JsOrder.NONE) || '0';
const pyD = (u, b, ad) => u.valueToCode(b, ad, Order.NONE) || '0';

// --- Şapka blokları ---
// Şapkalar altlarındaki zinciri sarar; bu yüzden forBlock yerine buradan üretilir
// (jsKodu.js ve pythonKodu.js). Her olay bir koşuldur: koşul yanlıştan doğruya geçince çalışır.

/** JS: olay koşulu (olay_program_basladiginda ve olay_mesaj_gelince dışında). */
export const OLAY_KOSULU_JS = {
  olay_renk: (b) => `${jsSensor.renk(alan(b, 'PORT'))} === '${alan(b, 'RENK')}'`,
  olay_dokunma: (b) => (alan(b, 'DURUM') === 'PRESSED' ? '' : '!') + jsSensor.basili(alan(b, 'PORT')),
  olay_mesafe: (b, u) =>
    `op.karsilastir(${jsSensor.mesafe(alan(b, 'PORT'), alan(b, 'BIRIM'))}, ${jsD(u, b, 'DEGER')}, '${KARS_JS[alan(b, 'KARS')]}')`,
  olay_aci: (b, u) =>
    `op.karsilastir(${jsSensor.aci(alan(b, 'PORT'))}, ${jsD(u, b, 'DEGER')}, '${KARS_JS[alan(b, 'KARS')]}')`,
  olay_dugme: (b) => (alan(b, 'DURUM') === 'PRESSED' ? '' : '!') + jsSensor.dugme(alan(b, 'DUGME')),
  olay_kosul: (b, u) => u.valueToCode(b, 'KOSUL', JsOrder.NONE) || 'false',
  olay_zamanlayici: (b, u) => `robot.zamanlayici() > op.sayi(${jsD(u, b, 'DEGER')})`,
};

/** Python: olay koşulu (Pybricks'te olaylar bir döngüyle izlenir). */
export const OLAY_KOSULU_PY = {
  olay_renk: (b, u) => pySensor.renkEsit(u, alan(b, 'PORT'), alan(b, 'RENK')),
  olay_dokunma: (b, u) => (alan(b, 'DURUM') === 'PRESSED' ? '' : 'not ') + pySensor.basili(u, alan(b, 'PORT')),
  olay_mesafe: (b, u) =>
    `${pySensor.mesafe(u, alan(b, 'PORT'), alan(b, 'BIRIM'))} ${KARS_PY[alan(b, 'KARS')]} ${pyD(u, b, 'DEGER')}`,
  olay_aci: (b, u) => `${pySensor.aci(u, alan(b, 'PORT'))} ${KARS_PY[alan(b, 'KARS')]} ${pyD(u, b, 'DEGER')}`,
  olay_dugme: (b, u) => {
    const k = pySensor.dugme(u, alan(b, 'DUGME'));
    return alan(b, 'DURUM') === 'PRESSED' ? k : `not (${k})`;
  },
  olay_kosul: (b, u) => u.valueToCode(b, 'KOSUL', Order.NONE) || 'False',
  olay_zamanlayici: (b, u) => `${pyZamanlayici(u)}.time() / 1000 > ${pyD(u, b, 'DEGER')}`,
};

export const SAPKA_TURLERI = new Set([
  'olay_program_basladiginda', 'olay_mesaj_gelince', ...Object.keys(OLAY_KOSULU_JS),
]);

/** Python'da mesaj fonksiyonunun adı. */
export const mesajFonksiyonu = (ad) => `mesaj_${String(ad).replace(/\W/g, '_')}`;

const js = {
  olay_yayinla: (b, u) => `robot.yayinla(${u.quote_(alan(b, 'MESAJ'))});\n`,
  olay_yayinla_bekle: (b, u) => `await robot.yayinla(${u.quote_(alan(b, 'MESAJ'))});\n`,
};

const python = {
  olay_yayinla: (b, u) => {
    u.ev3Mesajlar?.add(alan(b, 'MESAJ'));
    return `${mesajFonksiyonu(alan(b, 'MESAJ'))}()\n`;
  },
  olay_yayinla_bekle: (b, u) => {
    u.ev3Mesajlar?.add(alan(b, 'MESAJ'));
    return `${mesajFonksiyonu(alan(b, 'MESAJ'))}()\n`;
  },
};

export default {
  anahtar: 'olaylar',
  ad: 'Olaylar',
  stil: S,
  bloklar: Object.values(b),
  arac: [
    aracOgesi(b.programBasladiginda),
    aracOgesi(b.renk, { PORT: '3' }),
    aracOgesi(b.dokunma, { PORT: '1' }),
    aracOgesi(b.mesafe, { PORT: '4', DEGER: 15 }),
    aracOgesi(b.aci, { PORT: '2', DEGER: 45 }),
    aracOgesi(b.dugme),
    aracOgesi(b.kosul),
    aracOgesi(b.mesajGelince),
    aracOgesi(b.yayinla),
    aracOgesi(b.yayinlaBekle),
    aracOgesi(b.zamanlayici, { DEGER: 10 }),
  ],
  python,
  js,
};
