import { komut, simge, giris, secim, aracOgesi } from '../ortak.js';
import { SIMGE } from '../simgeler.js';

const S = 'ses_blocks';
const ikon = simge(SIMGE.tugla);
const SESLER = [
  ['İletişim / Merhaba', 'HELLO'],
  ['İletişim / Evet', 'YES'],
  ['İletişim / Hayır', 'NO'],
  ['İletişim / Hoşça kal', 'GOODBYE'],
  ['Hayvanlar / Köpek', 'DOG_BARK_1'],
];

const b = {
  bitene: komut('ses_bitene_kadar_cal', S, '%1 %2 sesini bitene kadar çal', [ikon, secim('SES', SESLER)]),
  baslat: komut('ses_baslat', S, '%1 %2 sesini başlat', [ikon, secim('SES', SESLER)]),
  bip: komut('ses_bip', S, '%1 bip %2 , %3 saniye çal', [
    ikon, giris('NOTA', 'Number'), giris('SURE', 'Number'),
  ]),
  bipBaslat: komut('ses_bip_baslat', S, '%1 bip %2 çalmaya başla', [ikon, giris('NOTA', 'Number')]),
  durdur: komut('ses_durdur', S, '%1 tüm sesleri durdur', [ikon]),
  duzey: komut('ses_duzey', S, '%1 ses düzeyini %2 %% yap', [ikon, giris('DUZEY', 'Number')]),
};

export default {
  anahtar: 'ses',
  ad: 'Ses',
  stil: S,
  bloklar: Object.values(b),
  arac: [
    aracOgesi(b.bitene),
    aracOgesi(b.baslat),
    aracOgesi(b.bip, { NOTA: 60, SURE: 0.2 }),
    aracOgesi(b.bipBaslat, { NOTA: 60 }),
    aracOgesi(b.durdur),
    aracOgesi(b.duzey, { DUZEY: 100 }),
  ],
};
