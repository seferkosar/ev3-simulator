import { Order } from 'blockly/python';
import { Order as JsOrder } from 'blockly/javascript';
import { komut, simge, giris, secim, aracOgesi } from '../ortak.js';
import { SIMGE } from '../simgeler.js';
import { notaFrekansi } from '../pyDonanim.js';
import { saniyedenMs } from '../pythonYardimci.js';

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

const alan = (b, ad) => b.getFieldValue(ad);
const jsD = (u, b, ad, vars = '0') => u.valueToCode(b, ad, JsOrder.NONE) || vars;
const pyD = (u, b, ad, vars = '0') => u.valueToCode(b, ad, Order.NONE) || vars;

// Simülatörde: "İletişim" sesleri tarayıcının Türkçe konuşmasıyla, bip Web Audio ile çalar.
const js = {
  ses_bitene_kadar_cal: (b) => `await robot.sesCal('${alan(b, 'SES')}', true);\n`,
  ses_baslat: (b) => `robot.sesCal('${alan(b, 'SES')}', false);\n`,
  ses_bip: (b, u) => `await robot.bip(${jsD(u, b, 'NOTA')}, ${jsD(u, b, 'SURE')});\n`,
  ses_bip_baslat: (b, u) => `robot.bipBaslat(${jsD(u, b, 'NOTA')});\n`,
  ses_durdur: () => 'robot.sesDurdur();\n',
  ses_duzey: (b, u) => `robot.sesDuzey(${jsD(u, b, 'DUZEY')});\n`,
};

const sesImport = (u) => {
  u.definitions_['import_soundfile'] = 'from pybricks.media.ev3dev import SoundFile';
};

// Pybricks'te sesler çalınırken program bekler; "başlat" blokları da bekler.
const python = {
  ses_bitene_kadar_cal: (b, u) => {
    sesImport(u);
    return `ev3.speaker.play_file(SoundFile.${alan(b, 'SES')})\n`;
  },
  ses_baslat: (b, u) => {
    sesImport(u);
    return `ev3.speaker.play_file(SoundFile.${alan(b, 'SES')})\n`;
  },
  ses_bip: (b, u) => {
    notaFrekansi(u);
    return `ev3.speaker.beep(nota_frekansi(${pyD(u, b, 'NOTA')}), ${saniyedenMs(pyD(u, b, 'SURE'))})\n`;
  },
  ses_bip_baslat: (b, u) => {
    notaFrekansi(u);
    return `ev3.speaker.beep(nota_frekansi(${pyD(u, b, 'NOTA')}), 1000)\n`;
  },
  ses_durdur: () => "pass  # Pybricks'te çalan sesi durdurma bloğu yok\n",
  ses_duzey: (b, u) => `ev3.speaker.set_volume(${pyD(u, b, 'DUZEY')})\n`,
};

export default {
  anahtar: 'ses',
  js,
  python,
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
