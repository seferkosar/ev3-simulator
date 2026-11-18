import { Order } from 'blockly/python';
import { Order as JsOrder } from 'blockly/javascript';
import { komut, simge, giris, secim, aracOgesi, MOTOR_PORTLARI } from '../ortak.js';
import { SIMGE } from '../simgeler.js';
import { hareket as pyHareket, motor as pyMotor } from '../pyDonanim.js';
import { carp } from '../pythonYardimci.js';

const S = 'hareket_blocks';
const ikon = simge(SIMGE.hareket);
const BIRIM = [
  ['tur', 'ROT'],
  ['derece', 'DEG'],
  ['saniye', 'SEC'],
  ['cm', 'CM'],
];
const birim = secim('BIRIM', BIRIM);
const donus = giris('DONUS', 'Number');

const b = {
  yonlu: komut('hareket_yonlu', S, '%1 %2 %3 %4 hareket et', [
    ikon,
    secim('YON', [
      ['ileri', 'FWD'],
      ['geri', 'BWD'],
      ['sağa', 'RIGHT'],
      ['sola', 'LEFT'],
    ]),
    giris('MIKTAR', 'Number'),
    birim,
  ]),
  donuslu: komut('hareket_donuslu', S, '%1 dönüş %2 ile %3 %4 hareket et', [
    ikon, donus, giris('MIKTAR', 'Number'), birim,
  ]),
  baslat: komut('hareket_baslat', S, '%1 dönüş %2 ile harekete başla', [ikon, donus]),
  durdur: komut('hareket_durdur', S, '%1 hareketi durdur', [ikon]),
  hiz: komut('hareket_hiz_ayarla', S, '%1 hareket hızını %2 %% yap', [ikon, giris('HIZ', 'Number')]),
  motorlar: komut('hareket_motorlari', S, '%1 hareket motorları %2 ve %3', [
    ikon, secim('SOL', MOTOR_PORTLARI), secim('SAG', MOTOR_PORTLARI),
  ]),
  durus: komut('hareket_durus_ayarla', S, '%1 hareket motorları durunca %2', [
    ikon,
    secim('DURUS', [
      ['konumunu korusun', 'HOLD'],
      ['fren yapsın', 'BRAKE'],
      ['serbest kalsın', 'COAST'],
    ]),
  ]),
  donusluHizli: komut('hareket_donuslu_hizla', S, '%1 dönüş %2 ile %3 %4 , %5 %% hızla hareket et', [
    ikon, donus, giris('MIKTAR', 'Number'), birim, giris('HIZ', 'Number'),
  ]),
  tank: komut('hareket_tank', S, '%1 %2 %3 , sol %4 sağ %5 %% hızla hareket et', [
    ikon, giris('MIKTAR', 'Number'), birim, giris('SOL_HIZ', 'Number'), giris('SAG_HIZ', 'Number'),
  ]),
  baslatHizli: komut('hareket_baslat_hizla', S, '%1 dönüş %2 ile %3 %% hızla harekete başla', [
    ikon, donus, giris('HIZ', 'Number'),
  ]),
  tankBaslat: komut('hareket_tank_baslat', S, '%1 sol %2 sağ %3 %% hızla harekete başla', [
    ikon, giris('SOL_HIZ', 'Number'), giris('SAG_HIZ', 'Number'),
  ]),
};

const alan = (b, ad) => b.getFieldValue(ad);
const jsD = (u, b, ad, vars = '0') => u.valueToCode(b, ad, JsOrder.NONE) || vars;
const pyD = (u, b, ad, vars = '0') => u.valueToCode(b, ad, Order.NONE) || vars;

const js = {
  hareket_yonlu: (b, u) =>
    `await robot.hareketYonlu('${alan(b, 'YON')}', ${jsD(u, b, 'MIKTAR')}, '${alan(b, 'BIRIM')}', YIGIN);\n`,
  hareket_donuslu: (b, u) =>
    `await robot.hareketDonuslu(${jsD(u, b, 'DONUS')}, ${jsD(u, b, 'MIKTAR')}, '${alan(b, 'BIRIM')}', undefined, YIGIN);\n`,
  hareket_baslat: (b, u) => `robot.hareketBaslat(${jsD(u, b, 'DONUS')});\n`,
  hareket_durdur: () => 'robot.hareketDurdur();\n',
  hareket_hiz_ayarla: (b, u) => `robot.hareketHizAyarla(${jsD(u, b, 'HIZ')});\n`,
  hareket_motorlari: (b) => `robot.hareketMotorlari('${alan(b, 'SOL')}', '${alan(b, 'SAG')}');\n`,
  hareket_durus_ayarla: (b) => `robot.hareketDurus('${alan(b, 'DURUS')}');\n`,
  hareket_donuslu_hizla: (b, u) =>
    `await robot.hareketDonuslu(${jsD(u, b, 'DONUS')}, ${jsD(u, b, 'MIKTAR')}, '${alan(b, 'BIRIM')}', ${jsD(u, b, 'HIZ')}, YIGIN);\n`,
  hareket_tank: (b, u) =>
    `await robot.hareketTank(${jsD(u, b, 'MIKTAR')}, '${alan(b, 'BIRIM')}', ${jsD(u, b, 'SOL_HIZ')}, ${jsD(u, b, 'SAG_HIZ')}, YIGIN);\n`,
  hareket_baslat_hizla: (b, u) => `robot.hareketBaslat(${jsD(u, b, 'DONUS')}, ${jsD(u, b, 'HIZ')});\n`,
  hareket_tank_baslat: (b, u) => `robot.hareketTankBaslat(${jsD(u, b, 'SOL_HIZ')}, ${jsD(u, b, 'SAG_HIZ')});\n`,
};

const YONLU = {
  FWD: ['hareket_hizi', 'hareket_hizi'],
  BWD: ['-hareket_hizi', '-hareket_hizi'],
  RIGHT: ['hareket_hizi', '-hareket_hizi'],
  LEFT: ['-hareket_hizi', 'hareket_hizi'],
};

const python = {
  hareket_yonlu: (b, u) => {
    pyHareket(u);
    const [sol, sag] = YONLU[alan(b, 'YON')];
    return `hareket_et(${sol}, ${sag}, ${pyD(u, b, 'MIKTAR')}, '${alan(b, 'BIRIM')}')\n`;
  },
  hareket_donuslu: (b, u) => {
    pyHareket(u);
    return (
      `_sol, _sag = donus_hizlari(${pyD(u, b, 'DONUS')}, hareket_hizi)\n` +
      `hareket_et(_sol, _sag, ${pyD(u, b, 'MIKTAR')}, '${alan(b, 'BIRIM')}')\n`
    );
  },
  hareket_baslat: (b, u) => {
    pyHareket(u);
    return `_sol, _sag = donus_hizlari(${pyD(u, b, 'DONUS')}, hareket_hizi)\nsol_motor.run(_sol * 10)\nsag_motor.run(_sag * 10)\n`;
  },
  hareket_durdur: (b, u) => {
    pyHareket(u);
    return 'durdur(sol_motor, hareket_durusu)\ndurdur(sag_motor, hareket_durusu)\n';
  },
  hareket_hiz_ayarla: (b, u) => {
    pyHareket(u);
    return `hareket_hizi = ${pyD(u, b, 'HIZ')}\n`;
  },
  hareket_motorlari: (b, u) => {
    pyHareket(u);
    const sol = pyMotor(u, alan(b, 'SOL')).ad;
    const sag = pyMotor(u, alan(b, 'SAG')).ad;
    return `sol_motor, sag_motor = ${sol}, ${sag}\n`;
  },
  hareket_durus_ayarla: (b, u) => {
    pyHareket(u);
    return `hareket_durusu = Stop.${alan(b, 'DURUS')}\n`;
  },
  hareket_donuslu_hizla: (b, u) => {
    pyHareket(u);
    return (
      `_sol, _sag = donus_hizlari(${pyD(u, b, 'DONUS')}, ${pyD(u, b, 'HIZ')})\n` +
      `hareket_et(_sol, _sag, ${pyD(u, b, 'MIKTAR')}, '${alan(b, 'BIRIM')}')\n`
    );
  },
  hareket_tank: (b, u) => {
    pyHareket(u);
    return `hareket_et(${pyD(u, b, 'SOL_HIZ')}, ${pyD(u, b, 'SAG_HIZ')}, ${pyD(u, b, 'MIKTAR')}, '${alan(b, 'BIRIM')}')\n`;
  },
  hareket_baslat_hizla: (b, u) => {
    pyHareket(u);
    return `_sol, _sag = donus_hizlari(${pyD(u, b, 'DONUS')}, ${pyD(u, b, 'HIZ')})\nsol_motor.run(_sol * 10)\nsag_motor.run(_sag * 10)\n`;
  },
  hareket_tank_baslat: (b, u) => {
    pyHareket(u);
    return `sol_motor.run(${carp(pyD(u, b, 'SOL_HIZ'), 10)})\nsag_motor.run(${carp(pyD(u, b, 'SAG_HIZ'), 10)})\n`;
  },
};

export default {
  anahtar: 'hareket',
  js,
  python,
  ad: 'Hareket',
  stil: S,
  bloklar: Object.values(b),
  arac: [
    aracOgesi(b.yonlu, { MIKTAR: 1 }),
    aracOgesi(b.donuslu, { DONUS: 0, MIKTAR: 1 }),
    aracOgesi(b.baslat, { DONUS: 0 }),
    aracOgesi(b.durdur),
    aracOgesi(b.hiz, { HIZ: 50 }),
    aracOgesi(b.motorlar, { SOL: 'B', SAG: 'C' }),
    aracOgesi(b.durus),
    aracOgesi(b.donusluHizli, { DONUS: 0, MIKTAR: 1, HIZ: 50 }),
    aracOgesi(b.tank, { MIKTAR: 1, SOL_HIZ: 50, SAG_HIZ: 50 }),
    aracOgesi(b.baslatHizli, { DONUS: 0, HIZ: 50 }),
    aracOgesi(b.tankBaslat, { SOL_HIZ: 50, SAG_HIZ: 50 }),
  ],
};
