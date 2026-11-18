import * as Blockly from 'blockly/core';
import { Order } from 'blockly/python';
import { Order as JsOrder } from 'blockly/javascript';
import { komut, giris, secim, yigin, aracOgesi } from '../ortak.js';
import { saniyedenMs, saniyedenMsJs } from '../pythonYardimci.js';
import { waitImport, bekleDongusu } from '../pyDonanim.js';

const S = 'kontrol_blocks';

/** İçine blok alan C biçimli blok. */
const cBlok = (type, baslik, args0 = [], { sonrasi = true, degilse = false } = {}) => ({
  type,
  style: S,
  message0: baslik,
  args0,
  message1: '%1',
  args1: [yigin('YAP')],
  ...(degilse && { message2: 'değilse', message3: '%1', args3: [yigin('DEGILSE')] }),
  previousStatement: null,
  ...(sonrasi && { nextStatement: null }),
});

const b = {
  bekle: komut('kontrol_bekle', S, '%1 saniye bekle', [giris('SURE', 'Number')]),
  kosulBekle: komut('kontrol_olana_kadar_bekle', S, '%1 olana kadar bekle', [giris('KOSUL', 'Boolean')]),
  tekrarla: cBlok('kontrol_tekrarla', '%1 kez tekrarla', [giris('SAYI', 'Number')]),
  surekli: cBlok('kontrol_surekli', 'sürekli', [], { sonrasi: false }),
  olanaKadar: cBlok('kontrol_olana_kadar_tekrarla', '%1 olana kadar tekrarla', [giris('KOSUL', 'Boolean')]),
  eger: cBlok('kontrol_eger', 'eğer %1 ise', [giris('KOSUL', 'Boolean')]),
  egerDegilse: cBlok('kontrol_eger_degilse', 'eğer %1 ise', [giris('KOSUL', 'Boolean')], { degilse: true }),
  digerleriniDurdur: komut('kontrol_diger_yiginlari_durdur', S, 'diğer yığınları durdur'),
  durdur: {
    type: 'kontrol_durdur',
    style: S,
    message0: 'durdur %1',
    args0: [secim('NE', [['ve programdan çık', 'EXIT']])],
    previousStatement: null,
  },
};

const pyKosul = (u, b) => u.valueToCode(b, 'KOSUL', Order.NONE) || 'False';
const jsKosul = (u, b) => u.valueToCode(b, 'KOSUL', JsOrder.NONE) || 'false';
const pyGovde = (u, b, ad = 'YAP') => u.statementToCode(b, ad) || `${u.INDENT}pass\n`;
// Döngünün her turunda bir adım: boş "sürekli" döngü bile sayfayı kilitlemez, durdurulabilir.
const jsGovde = (u, b, ad = 'YAP') =>
  `${u.INDENT}await adim(${u.quote_(b.id)}, YIGIN);\n${u.statementToCode(b, ad)}`;

const python = {
  kontrol_bekle: (blok, u) => {
    waitImport(u);
    const sure = u.valueToCode(blok, 'SURE', Order.MULTIPLICATIVE) || '0';
    return `wait(${saniyedenMs(sure)})\n`;
  },
  kontrol_olana_kadar_bekle: (b, u) => bekleDongusu(u, pyKosul(u, b)),
  kontrol_tekrarla: (b, u) => {
    const n = u.valueToCode(b, 'SAYI', Order.NONE) || '0';
    return `for _ in range(int(${n})):\n${pyGovde(u, b)}`;
  },
  kontrol_surekli: (b, u) => `while True:\n${pyGovde(u, b)}`,
  kontrol_olana_kadar_tekrarla: (b, u) => `while not (${pyKosul(u, b)}):\n${pyGovde(u, b)}`,
  kontrol_eger: (b, u) => `if ${pyKosul(u, b)}:\n${pyGovde(u, b)}`,
  kontrol_eger_degilse: (b, u) =>
    `if ${pyKosul(u, b)}:\n${pyGovde(u, b)}else:\n${pyGovde(u, b, 'DEGILSE')}`,
  kontrol_diger_yiginlari_durdur: () => "pass  # Pybricks'te aynı anda çalışan yığın yok\n",
  kontrol_durdur: () => 'raise SystemExit\n',
};

const js = {
  kontrol_bekle: (blok, u) => {
    const sure = u.valueToCode(blok, 'SURE', JsOrder.MULTIPLICATION) || '0';
    return `await bekle(${saniyedenMsJs(sure)});\n`;
  },
  kontrol_olana_kadar_bekle: (b, u) => `await robot.bekleKosul(() => (${jsKosul(u, b)}), YIGIN);\n`,
  kontrol_tekrarla: (b, u) => {
    const n = u.valueToCode(b, 'SAYI', JsOrder.NONE) || '0';
    const i = u.nameDB_.getDistinctName('sayac', Blockly.Names.NameType.VARIABLE);
    return `for (let ${i} = 0; ${i} < op.sayi(${n}); ${i}++) {\n${jsGovde(u, b)}}\n`;
  },
  kontrol_surekli: (b, u) => `while (true) {\n${jsGovde(u, b)}}\n`,
  kontrol_olana_kadar_tekrarla: (b, u) => `while (!(${jsKosul(u, b)})) {\n${jsGovde(u, b)}}\n`,
  kontrol_eger: (b, u) => `if (${jsKosul(u, b)}) {\n${u.statementToCode(b, 'YAP')}}\n`,
  kontrol_eger_degilse: (b, u) =>
    `if (${jsKosul(u, b)}) {\n${u.statementToCode(b, 'YAP')}} else {\n${u.statementToCode(b, 'DEGILSE')}}\n`,
  kontrol_diger_yiginlari_durdur: () => 'robot.digerleriniDurdur(YIGIN);\n',
  kontrol_durdur: () => 'robot.programdanCik();\n',
};

export default {
  anahtar: 'kontrol',
  ad: 'Kontrol',
  stil: S,
  bloklar: Object.values(b),
  js,
  arac: [
    aracOgesi(b.bekle, { SURE: 1 }),
    aracOgesi(b.kosulBekle),
    aracOgesi(b.tekrarla, { SAYI: 10 }),
    aracOgesi(b.surekli),
    aracOgesi(b.olanaKadar),
    aracOgesi(b.eger),
    aracOgesi(b.egerDegilse),
    aracOgesi(b.digerleriniDurdur),
    aracOgesi(b.durdur),
  ],
  python,
};
