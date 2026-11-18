import { Order } from 'blockly/python';
import { Order as JsOrder } from 'blockly/javascript';
import { komut, deger, simge, giris, secim, aracOgesi, MOTOR_PORTLARI } from '../ortak.js';
import { SIMGE } from '../simgeler.js';
import { motor as pyMotor } from '../pyDonanim.js';
import { carp, eksi, saniyedenMs } from '../pythonYardimci.js';

const S = 'motor_blocks';
const ikon = simge(SIMGE.motor);
const port = secim('PORT', MOTOR_PORTLARI);
const YON = [
  ['saat yönünde', 'CW'],
  ['saat yönünün tersine', 'CCW'],
];
const BIRIM = [
  ['tur', 'ROT'],
  ['derece', 'DEG'],
  ['saniye', 'SEC'],
];

const b = {
  sureli: komut('motor_sureli_dondur', S, '%1 %2 %3 %4 %5 döndür', [
    ikon, port, secim('YON', YON), giris('MIKTAR', 'Number'), secim('BIRIM', BIRIM),
  ]),
  baslat: komut('motor_baslat', S, '%1 %2 motorunu %3 çalıştır', [ikon, port, secim('YON', YON)]),
  durdur: komut('motor_durdur', S, '%1 %2 motorunu durdur', [ikon, port]),
  hiz: komut('motor_hiz_ayarla', S, '%1 %2 hızını %3 %% yap', [ikon, port, giris('HIZ', 'Number')]),
  durus: komut('motor_durus_ayarla', S, '%1 %2 durunca %3', [
    ikon, port,
    secim('DURUS', [
      ['konumunu korusun', 'HOLD'],
      ['fren yapsın', 'BRAKE'],
      ['serbest kalsın', 'COAST'],
    ]),
  ]),
  sureliHizli: komut('motor_sureli_hizla', S, '%1 %2 %3 %4 , %5 %% hızla döndür', [
    ikon, port, giris('MIKTAR', 'Number'), secim('BIRIM', BIRIM), giris('HIZ', 'Number'),
  ]),
  hizlaBaslat: komut('motor_hizla_baslat', S, '%1 %2 motorunu %3 %% hızla çalıştır', [
    ikon, port, giris('HIZ', 'Number'),
  ]),
  gucleBaslat: komut('motor_gucle_baslat', S, '%1 %2 motorunu %3 %% güçle çalıştır', [
    ikon, port, giris('GUC', 'Number'),
  ]),
  dereceSifirla: komut('motor_derece_sifirla', S, '%1 %2 sayılan dereceyi sıfırla', [ikon, port]),
  derece: deger('motor_derece', S, '%1 %2 sayılan derece', [ikon, port], 'Number'),
  hizDegeri: deger('motor_hiz', S, '%1 %2 hızı', [ikon, port], 'Number'),
};

const alan = (b, ad) => b.getFieldValue(ad);
const portu = (b) => alan(b, 'PORT');
const jsDeger = (u, b, ad, vars = '0') => u.valueToCode(b, ad, JsOrder.NONE) || vars;
const pyDeger = (u, b, ad, vars = '0') => u.valueToCode(b, ad, Order.NONE) || vars;

const js = {
  motor_sureli_dondur: (b, u) =>
    `await robot.motorSureli('${portu(b)}', '${alan(b, 'YON')}', ${jsDeger(u, b, 'MIKTAR')}, '${alan(b, 'BIRIM')}', YIGIN);\n`,
  motor_baslat: (b) => `robot.motorBaslat('${portu(b)}', '${alan(b, 'YON')}');\n`,
  motor_durdur: (b) => `robot.motorDurdur('${portu(b)}');\n`,
  motor_hiz_ayarla: (b, u) => `robot.motorHizAyarla('${portu(b)}', ${jsDeger(u, b, 'HIZ')});\n`,
  motor_durus_ayarla: (b) => `robot.motorDurus('${portu(b)}', '${alan(b, 'DURUS')}');\n`,
  motor_sureli_hizla: (b, u) =>
    `await robot.motorSureliHizla('${portu(b)}', ${jsDeger(u, b, 'MIKTAR')}, '${alan(b, 'BIRIM')}', ${jsDeger(u, b, 'HIZ')}, YIGIN);\n`,
  motor_hizla_baslat: (b, u) => `robot.motorHizlaBaslat('${portu(b)}', ${jsDeger(u, b, 'HIZ')});\n`,
  motor_gucle_baslat: (b, u) => `robot.motorHizlaBaslat('${portu(b)}', ${jsDeger(u, b, 'GUC')});\n`,
  motor_derece_sifirla: (b) => `robot.motorDereceSifirla('${portu(b)}');\n`,
  motor_derece: (b) => [`robot.motorDerece('${portu(b)}')`, JsOrder.FUNCTION_CALL],
  motor_hiz: (b) => [`robot.motorHiz('${portu(b)}')`, JsOrder.FUNCTION_CALL],
};

/** Python: miktar + birim → run_angle / run_time satırı. */
function pyDondur(u, m, hiz, miktar, birim, ters) {
  if (birim === 'SEC') {
    return `${m.ad}.run_time(${ters ? eksi(hiz) : hiz}, ${saniyedenMs(miktar)}, then=${m.durus})\n`;
  }
  const derece = birim === 'ROT' ? carp(miktar, 360) : miktar;
  return `${m.ad}.run_angle(${hiz}, ${ters ? eksi(derece) : derece}, then=${m.durus})\n`;
}

const python = {
  motor_sureli_dondur: (b, u) => {
    const m = pyMotor(u, portu(b));
    return pyDondur(u, m, m.hiz, pyDeger(u, b, 'MIKTAR'), alan(b, 'BIRIM'), alan(b, 'YON') === 'CCW');
  },
  motor_baslat: (b, u) => {
    const m = pyMotor(u, portu(b));
    return `${m.ad}.run(${alan(b, 'YON') === 'CCW' ? `-${m.hiz}` : m.hiz})\n`;
  },
  motor_durdur: (b, u) => {
    const m = pyMotor(u, portu(b));
    return `durdur(${m.ad}, ${m.durus})\n`;
  },
  motor_hiz_ayarla: (b, u) => `${pyMotor(u, portu(b)).hiz} = ${carp(pyDeger(u, b, 'HIZ'), 10)}\n`,
  motor_durus_ayarla: (b, u) => `${pyMotor(u, portu(b)).durus} = Stop.${alan(b, 'DURUS')}\n`,
  motor_sureli_hizla: (b, u) => {
    const m = pyMotor(u, portu(b));
    return pyDondur(u, m, carp(pyDeger(u, b, 'HIZ'), 10), pyDeger(u, b, 'MIKTAR'), alan(b, 'BIRIM'), false);
  },
  motor_hizla_baslat: (b, u) => `${pyMotor(u, portu(b)).ad}.run(${carp(pyDeger(u, b, 'HIZ'), 10)})\n`,
  motor_gucle_baslat: (b, u) => `${pyMotor(u, portu(b)).ad}.dc(${pyDeger(u, b, 'GUC')})\n`,
  motor_derece_sifirla: (b, u) => `${pyMotor(u, portu(b)).ad}.reset_angle(0)\n`,
  motor_derece: (b, u) => [`${pyMotor(u, portu(b)).ad}.angle()`, Order.FUNCTION_CALL],
  motor_hiz: (b, u) => [`${pyMotor(u, portu(b)).ad}.speed() / 10`, Order.MULTIPLICATIVE],
};

export default {
  anahtar: 'motorlar',
  js,
  python,
  ad: 'Motorlar',
  stil: S,
  bloklar: Object.values(b),
  arac: [
    aracOgesi(b.sureli, { MIKTAR: 1 }),
    aracOgesi(b.baslat),
    aracOgesi(b.durdur),
    aracOgesi(b.hiz, { HIZ: 75 }),
    aracOgesi(b.durus),
    aracOgesi(b.sureliHizli, { MIKTAR: 1, HIZ: 75 }),
    aracOgesi(b.hizlaBaslat, { HIZ: 75 }),
    aracOgesi(b.gucleBaslat, { GUC: 100 }),
    aracOgesi(b.dereceSifirla),
    aracOgesi(b.derece),
    aracOgesi(b.hizDegeri),
  ],
};
