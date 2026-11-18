import {
  komut, deger, kosul, simge, giris, secim, aracOgesi,
  SENSOR_PORTLARI, KARSILASTIRMA_KISA, KARSILASTIRMA_UZUN, RENKLER, UZUNLUK_BIRIMLERI, DUGMELER,
} from '../ortak.js';
import { SIMGE } from '../simgeler.js';

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

export default {
  anahtar: 'sensorler',
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
