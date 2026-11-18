// Blok girişlerindeki beyaz ovaller (gölge bloklar). Araç kutusunda ayrıca görünmezler.
import { Order } from 'blockly/python';
import { Order as JsOrder } from 'blockly/javascript';

const bloklar = [
  {
    type: 'ev3_sayi',
    message0: '%1',
    args0: [{ type: 'field_number', name: 'NUM', value: 0 }],
    output: 'Number',
    style: 'deger_blocks',
  },
  {
    type: 'ev3_metin',
    message0: '%1',
    args0: [{ type: 'field_input', name: 'METIN', text: '' }],
    output: 'String',
    style: 'deger_blocks',
  },
];

const python = {
  ev3_sayi: (blok) => {
    const n = Number(blok.getFieldValue('NUM'));
    return [String(n), n < 0 ? Order.UNARY_SIGN : Order.ATOMIC];
  },
  ev3_metin: (blok, u) => [u.quote_(blok.getFieldValue('METIN')), Order.ATOMIC],
};

const js = {
  ev3_sayi: (blok) => {
    const n = Number(blok.getFieldValue('NUM'));
    return [String(n), n < 0 ? JsOrder.UNARY_NEGATION : JsOrder.ATOMIC];
  },
  ev3_metin: (blok, u) => [u.quote_(blok.getFieldValue('METIN')), JsOrder.ATOMIC],
};

export default { anahtar: 'degerler', bloklar, python, js };
