import { Order } from 'blockly/python';
import { Order as JsOrder } from 'blockly/javascript';
import { komut, giris, secim, yigin, aracOgesi } from '../ortak.js';
import { saniyedenMs, saniyedenMsJs } from '../pythonYardimci.js';

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

const python = {
  kontrol_bekle: (blok, u) => {
    u.definitions_['import_wait'] = 'from pybricks.tools import wait';
    const sure = u.valueToCode(blok, 'SURE', Order.MULTIPLICATIVE) || '0';
    return `wait(${saniyedenMs(sure)})\n`;
  },
};

const js = {
  kontrol_bekle: (blok, u) => {
    const sure = u.valueToCode(blok, 'SURE', JsOrder.MULTIPLICATION) || '0';
    return `await bekle(${saniyedenMsJs(sure)});\n`;
  },
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
