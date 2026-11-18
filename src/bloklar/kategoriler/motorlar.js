import { komut, deger, simge, giris, secim, aracOgesi, MOTOR_PORTLARI } from '../ortak.js';
import { SIMGE } from '../simgeler.js';

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

export default {
  anahtar: 'motorlar',
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
