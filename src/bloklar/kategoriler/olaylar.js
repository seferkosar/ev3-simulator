import {
  sapka, komut, simge, giris, secim, aracOgesi,
  SENSOR_PORTLARI, KARSILASTIRMA_UZUN, RENKLER, UZUNLUK_BIRIMLERI, DUGMELER,
} from '../ortak.js';
import { SIMGE } from '../simgeler.js';

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

// Program gövdesi şapkanın altındaki bloklardan oluşur; şapkanın kendisi kod üretmez.
const python = {
  olay_program_basladiginda: () => '',
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
  js: { olay_program_basladiginda: () => '' },
};
