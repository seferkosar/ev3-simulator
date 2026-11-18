import {
  komut, deger, kosul, simge, giris, secim, aracOgesi,
  SENSOR_PORTLARI, KARSILASTIRMA_KISA, KARSILASTIRMA_UZUN, RENKLER, UZUNLUK_BIRIMLERI, DUGMELER,
} from '../ortak.js';
import { Order } from 'blockly/python';
import { Order as JsOrder } from 'blockly/javascript';
import { SIMGE } from '../simgeler.js';
import {
  cihaz, colorImport, buttonImport, zamanlayici as pyZamanlayici, basiliDugme, bekleDongusu, KARS_PY, KARS_JS,
} from '../pyDonanim.js';

const S = 'sensor_blocks';
const port = secim('PORT', SENSOR_PORTLARI);
const renkIkon = simge(SIMGE.renk);
const dokunmaIkon = simge(SIMGE.dokunma);
const mesafeIkon = simge(SIMGE.mesafe);
const jiroIkon = simge(SIMGE.jiroskop);
const tuglaIkon = simge(SIMGE.tugla);

const b = {
  // Renk sensörü
  yansiyanMi: kosul('sensor_yansiyan_mi', S, '%1 %2 yansıyan ışık %3 %4 %% mi?', [
    renkIkon, port, secim('KARS', KARSILASTIRMA_KISA), giris('DEGER', 'Number'),
  ]),
  yansiyan: deger('sensor_yansiyan', S, '%1 %2 yansıyan ışık', [renkIkon, port], 'Number'),
  yansiyanAyarla: komut('sensor_yansiyan_ayarla', S, '%1 %2 yansıyan ışık %3 değerini %4 yap', [
    renkIkon, port, secim('UC', [['en düşük', 'MIN'], ['en yüksek', 'MAX']]), giris('DEGER', 'Number'),
  ]),
  yansiyanSifirla: komut('sensor_yansiyan_sifirla', S, '%1 yansıyan ışık ayarını sıfırla', [renkIkon]),
  renkBekle: komut('sensor_renk_bekle', S, '%1 %2 renk %3 olana kadar bekle', [
    renkIkon, port, secim('RENK', RENKLER),
  ]),
  renkMi: kosul('sensor_renk_mi', S, '%1 %2 renk %3 mi?', [renkIkon, port, secim('RENK', RENKLER)]),
  renk: deger('sensor_renk', S, '%1 %2 renk', [renkIkon, port], 'String'),
  ortamMi: kosul('sensor_ortam_mi', S, '%1 %2 ortam ışığı %3 %4 %% mi?', [
    renkIkon, port, secim('KARS', KARSILASTIRMA_KISA), giris('DEGER', 'Number'),
  ]),
  ortam: deger('sensor_ortam', S, '%1 %2 ortam ışığı', [renkIkon, port], 'Number'),
  // Dokunma sensörü
  dokunmaBekle: komut('sensor_dokunma_bekle', S, '%1 %2 %3 olana kadar bekle', [
    dokunmaIkon, port,
    secim('DURUM', [['basılı', 'PRESSED'], ['bırakılmış', 'RELEASED'], ['çarpılmış', 'BUMPED']]),
  ]),
  dokunmaMi: kosul('sensor_dokunma_mi', S, '%1 %2 basılı mı?', [dokunmaIkon, port]),
  // Zamanlayıcı
  zamanlayici: deger('sensor_zamanlayici', S, '%1 zamanlayıcı', [tuglaIkon], 'Number'),
  zamanlayiciSifirla: komut('sensor_zamanlayici_sifirla', S, '%1 zamanlayıcıyı sıfırla', [tuglaIkon]),
  // Ultrasonik (mesafe) sensörü
  mesafeBekle: komut('sensor_mesafe_bekle', S, '%1 %2 mesafe %3 %4 %5 olana kadar bekle', [
    mesafeIkon, port, secim('KARS', KARSILASTIRMA_UZUN), giris('DEGER', 'Number'),
    secim('BIRIM', UZUNLUK_BIRIMLERI),
  ]),
  mesafeMi: kosul('sensor_mesafe_mi', S, '%1 %2 mesafe %3 %4 %5 mi?', [
    mesafeIkon, port, secim('KARS', KARSILASTIRMA_KISA), giris('DEGER', 'Number'),
    secim('BIRIM', UZUNLUK_BIRIMLERI),
  ]),
  mesafe: deger('sensor_mesafe', S, '%1 %2 mesafe ( %3 )', [
    mesafeIkon, port, secim('BIRIM', UZUNLUK_BIRIMLERI),
  ], 'Number'),
  // Jiroskop
  aciBekle: komut('sensor_aci_bekle', S, '%1 %2 açı %3 %4 ° olana kadar bekle', [
    jiroIkon, port, secim('KARS', KARSILASTIRMA_UZUN), giris('DEGER', 'Number'),
  ]),
  aciMi: kosul('sensor_aci_mi', S, '%1 %2 açı %3 %4 ° mi?', [
    jiroIkon, port, secim('KARS', KARSILASTIRMA_KISA), giris('DEGER', 'Number'),
  ]),
  aci: deger('sensor_aci', S, '%1 %2 açı', [jiroIkon, port], 'Number'),
  aciSifirla: komut('sensor_aci_sifirla', S, '%1 %2 açıyı sıfırla', [jiroIkon, port]),
  acisalHiz: deger('sensor_acisal_hiz', S, '%1 %2 açısal hız', [jiroIkon, port], 'Number'),
  // Tuğla düğmeleri
  dugmeBekle: komut('sensor_dugme_bekle', S, '%1 %2 düğmesi %3 olana kadar bekle', [
    tuglaIkon, secim('DUGME', DUGMELER), secim('DURUM', [['basılı', 'PRESSED'], ['bırakılmış', 'RELEASED']]),
  ]),
  dugmeMi: kosul('sensor_dugme_mi', S, '%1 %2 düğmesi basılı mı?', [tuglaIkon, secim('DUGME', DUGMELER)]),
  dugme: deger('sensor_dugme', S, '%1 düğme', [tuglaIkon], 'String'),
};

const alan = (b, ad) => b.getFieldValue(ad);
const portu = (b) => alan(b, 'PORT');
const jsD = (u, b, ad, vars = '0') => u.valueToCode(b, ad, JsOrder.NONE) || vars;
const pyD = (u, b, ad, vars = '0') => u.valueToCode(b, ad, Order.NONE) || vars;
const jsKars = (u, b, ifade) => `op.karsilastir(${ifade}, ${jsD(u, b, 'DEGER')}, '${KARS_JS[alan(b, 'KARS')]}')`;
const pyKars = (u, b, ifade) => `${ifade} ${KARS_PY[alan(b, 'KARS')]} ${pyD(u, b, 'DEGER')}`;
const jsBekle = (kosul) => `await robot.bekleKosul(() => ${kosul}, YIGIN);\n`;
const F = JsOrder.FUNCTION_CALL;

// --- Simülatör (JS) ifadeleri; olay blokları da bunları kullanır ---
export const jsSensor = {
  yansiyan: (p) => `robot.yansiyan('${p}')`,
  ortam: (p) => `robot.ortam('${p}')`,
  renk: (p) => `robot.renk('${p}')`,
  basili: (p) => `robot.basili('${p}')`,
  mesafe: (p, birim) => `robot.mesafe('${p}', '${birim}')`,
  aci: (p) => `robot.aci('${p}')`,
  dugme: (d) => `robot.dugmeBasili('${d}')`,
};

// --- Python ifadeleri ---
const PY_RENK = (r) => (r === 'NONE' ? 'None' : `Color.${r}`);
export const pySensor = {
  yansiyan: (u, p) => `${cihaz(u, 'renk', p)}.reflection()`,
  ortam: (u, p) => `${cihaz(u, 'renk', p)}.ambient()`,
  renk: (u, p) => `${cihaz(u, 'renk', p)}.color()`,
  renkEsit: (u, p, r) => {
    colorImport(u);
    return `${cihaz(u, 'renk', p)}.color() == ${PY_RENK(r)}`;
  },
  basili: (u, p) => `${cihaz(u, 'dokunma', p)}.pressed()`,
  mesafe: (u, p, birim) => `${cihaz(u, 'mesafe', p)}.distance() / ${birim === 'IN' ? '25.4' : '10'}`,
  aci: (u, p) => `${cihaz(u, 'jiroskop', p)}.angle()`,
  dugme: (u, d) => {
    buttonImport(u);
    return `Button.${d} in ev3.buttons.pressed()`;
  },
};

const dokunmaBekleJs = (p, durum) => {
  const basildi = jsBekle(jsSensor.basili(p));
  const birakildi = jsBekle(`!${jsSensor.basili(p)}`);
  return durum === 'PRESSED' ? basildi : durum === 'RELEASED' ? birakildi : basildi + birakildi;
};

const js = {
  sensor_yansiyan_mi: (b, u) => [jsKars(u, b, jsSensor.yansiyan(portu(b))), F],
  sensor_yansiyan: (b) => [jsSensor.yansiyan(portu(b)), F],
  sensor_yansiyan_ayarla: (b, u) => `robot.yansiyanAyarla('${portu(b)}', '${alan(b, 'UC')}', ${jsD(u, b, 'DEGER')});\n`,
  sensor_yansiyan_sifirla: () => 'robot.yansiyanSifirla();\n',
  sensor_renk_bekle: (b) => jsBekle(`${jsSensor.renk(portu(b))} === '${alan(b, 'RENK')}'`),
  sensor_renk_mi: (b) => [`${jsSensor.renk(portu(b))} === '${alan(b, 'RENK')}'`, JsOrder.EQUALITY],
  sensor_renk: (b) => [`robot.renkAdi('${portu(b)}')`, F],
  sensor_ortam_mi: (b, u) => [jsKars(u, b, jsSensor.ortam(portu(b))), F],
  sensor_ortam: (b) => [jsSensor.ortam(portu(b)), F],
  sensor_dokunma_bekle: (b) => dokunmaBekleJs(portu(b), alan(b, 'DURUM')),
  sensor_dokunma_mi: (b) => [jsSensor.basili(portu(b)), F],
  sensor_zamanlayici: () => ['robot.zamanlayici()', F],
  sensor_zamanlayici_sifirla: () => 'robot.zamanlayiciSifirla();\n',
  sensor_mesafe_bekle: (b, u) => jsBekle(jsKars(u, b, jsSensor.mesafe(portu(b), alan(b, 'BIRIM')))),
  sensor_mesafe_mi: (b, u) => [jsKars(u, b, jsSensor.mesafe(portu(b), alan(b, 'BIRIM'))), F],
  sensor_mesafe: (b) => [jsSensor.mesafe(portu(b), alan(b, 'BIRIM')), F],
  sensor_aci_bekle: (b, u) => jsBekle(jsKars(u, b, jsSensor.aci(portu(b)))),
  sensor_aci_mi: (b, u) => [jsKars(u, b, jsSensor.aci(portu(b))), F],
  sensor_aci: (b) => [jsSensor.aci(portu(b)), F],
  sensor_aci_sifirla: (b) => `robot.aciSifirla('${portu(b)}');\n`,
  sensor_acisal_hiz: (b) => [`robot.acisalHiz('${portu(b)}')`, F],
  sensor_dugme_bekle: (b) => {
    const k = jsSensor.dugme(alan(b, 'DUGME'));
    return jsBekle(alan(b, 'DURUM') === 'PRESSED' ? k : `!${k}`);
  },
  sensor_dugme_mi: (b) => [jsSensor.dugme(alan(b, 'DUGME')), F],
  sensor_dugme: () => ['robot.dugmeAdi()', F],
};

const R = Order.RELATIONAL;
const python = {
  sensor_yansiyan_mi: (b, u) => [pyKars(u, b, pySensor.yansiyan(u, portu(b))), R],
  sensor_yansiyan: (b, u) => [pySensor.yansiyan(u, portu(b)), Order.FUNCTION_CALL],
  sensor_yansiyan_ayarla: () => "pass  # Kalibrasyon: Pybricks'te karşılığı yok\n",
  sensor_yansiyan_sifirla: () => "pass  # Kalibrasyon: Pybricks'te karşılığı yok\n",
  sensor_renk_bekle: (b, u) => bekleDongusu(u, pySensor.renkEsit(u, portu(b), alan(b, 'RENK'))),
  sensor_renk_mi: (b, u) => [pySensor.renkEsit(u, portu(b), alan(b, 'RENK')), R],
  sensor_renk: (b, u) => [pySensor.renk(u, portu(b)), Order.FUNCTION_CALL],
  sensor_ortam_mi: (b, u) => [pyKars(u, b, pySensor.ortam(u, portu(b))), R],
  sensor_ortam: (b, u) => [pySensor.ortam(u, portu(b)), Order.FUNCTION_CALL],
  sensor_dokunma_bekle: (b, u) => {
    const k = pySensor.basili(u, portu(b));
    const basildi = bekleDongusu(u, k);
    const birakildi = bekleDongusu(u, `not ${k}`);
    const d = alan(b, 'DURUM');
    return d === 'PRESSED' ? basildi : d === 'RELEASED' ? birakildi : basildi + birakildi;
  },
  sensor_dokunma_mi: (b, u) => [pySensor.basili(u, portu(b)), Order.FUNCTION_CALL],
  sensor_zamanlayici: (b, u) => [`${pyZamanlayici(u)}.time() / 1000`, Order.MULTIPLICATIVE],
  sensor_zamanlayici_sifirla: (b, u) => `${pyZamanlayici(u)}.reset()\n`,
  sensor_mesafe_bekle: (b, u) => bekleDongusu(u, pyKars(u, b, pySensor.mesafe(u, portu(b), alan(b, 'BIRIM')))),
  sensor_mesafe_mi: (b, u) => [pyKars(u, b, pySensor.mesafe(u, portu(b), alan(b, 'BIRIM'))), R],
  sensor_mesafe: (b, u) => [pySensor.mesafe(u, portu(b), alan(b, 'BIRIM')), Order.MULTIPLICATIVE],
  sensor_aci_bekle: (b, u) => bekleDongusu(u, pyKars(u, b, pySensor.aci(u, portu(b)))),
  sensor_aci_mi: (b, u) => [pyKars(u, b, pySensor.aci(u, portu(b))), R],
  sensor_aci: (b, u) => [pySensor.aci(u, portu(b)), Order.FUNCTION_CALL],
  sensor_aci_sifirla: (b, u) => `${cihaz(u, 'jiroskop', portu(b))}.reset_angle(0)\n`,
  sensor_acisal_hiz: (b, u) => [`${cihaz(u, 'jiroskop', portu(b))}.speed()`, Order.FUNCTION_CALL],
  sensor_dugme_bekle: (b, u) => {
    const k = pySensor.dugme(u, alan(b, 'DUGME'));
    return bekleDongusu(u, alan(b, 'DURUM') === 'PRESSED' ? k : `not (${k})`);
  },
  sensor_dugme_mi: (b, u) => [pySensor.dugme(u, alan(b, 'DUGME')), R],
  sensor_dugme: (b, u) => {
    basiliDugme(u);
    return ['basili_dugme()', Order.FUNCTION_CALL];
  },
};

export default {
  anahtar: 'sensorler',
  js,
  python,
  ad: 'Sensörler',
  stil: S,
  bloklar: Object.values(b),
  arac: [
    aracOgesi(b.yansiyanMi, { PORT: '3', DEGER: 50 }),
    aracOgesi(b.yansiyan, { PORT: '3' }),
    aracOgesi(b.yansiyanAyarla, { PORT: '3', DEGER: 0 }),
    aracOgesi(b.yansiyanSifirla),
    aracOgesi(b.renkBekle, { PORT: '3' }),
    aracOgesi(b.renkMi, { PORT: '3' }),
    aracOgesi(b.renk, { PORT: '3' }),
    aracOgesi(b.ortamMi, { PORT: '3', DEGER: 50 }),
    aracOgesi(b.ortam, { PORT: '3' }),
    aracOgesi(b.dokunmaBekle, { PORT: '1' }),
    aracOgesi(b.dokunmaMi, { PORT: '1' }),
    aracOgesi(b.zamanlayici),
    aracOgesi(b.zamanlayiciSifirla),
    aracOgesi(b.mesafeBekle, { PORT: '4', DEGER: 15 }),
    aracOgesi(b.mesafeMi, { PORT: '4', DEGER: 15 }),
    aracOgesi(b.mesafe, { PORT: '4' }),
    aracOgesi(b.aciBekle, { PORT: '2', DEGER: 45 }),
    aracOgesi(b.aciMi, { PORT: '2', DEGER: 45 }),
    aracOgesi(b.aci, { PORT: '2' }),
    aracOgesi(b.aciSifirla, { PORT: '2' }),
    aracOgesi(b.acisalHiz, { PORT: '2' }),
    aracOgesi(b.dugmeBekle),
    aracOgesi(b.dugmeMi),
    aracOgesi(b.dugme),
  ],
};
