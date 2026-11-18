import { komut, simge, giris, secim, aracOgesi, MOTOR_PORTLARI } from '../ortak.js';
import { SIMGE } from '../simgeler.js';

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

export default {
  anahtar: 'hareket',
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
