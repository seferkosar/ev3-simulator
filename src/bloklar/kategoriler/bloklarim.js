// Bloklarım (kendi bloğunu tanımla): Blockly'nin hazır procedures_* blokları kullanılır.
// Simülatörde her blok `async function ad(YIGIN, ...)` olur ve `await` ile çağrılır; böylece adım,
// vurgulama ve durdurma Bloklarım'ın içinde de çalışır. Python'da Blockly'nin hazır `def` üreticisi kullanılır.
import { Order as JsOrder } from 'blockly/javascript';

export const BLOKLARIM_TURLERI = new Set([
  'procedures_defnoreturn',
  'procedures_defreturn',
  'procedures_callnoreturn',
  'procedures_callreturn',
  'procedures_ifreturn',
]);
export const TANIM_TURLERI = new Set(['procedures_defnoreturn', 'procedures_defreturn']);

function tanim(b, u) {
  const ad = u.getProcedureName(b.getFieldValue('NAME'));
  const parametreler = b.getVarModels().map((v) => `, ${u.getVariableName(v.getId())}`).join('');
  const govde = b.getInput('STACK') ? u.statementToCode(b, 'STACK') : '';
  const donus = b.getInput('RETURN') ? u.valueToCode(b, 'RETURN', JsOrder.NONE) : '';
  u.definitions_[`%${ad}`] =
    `async function ${ad}(YIGIN${parametreler}) {\n` +
    `${u.INDENT}await adim(${u.quote_(b.id)}, YIGIN);\n${govde}` +
    `${donus ? `${u.INDENT}return ${donus};\n` : ''}}`;
  return null;
}

const argumanlar = (b, u) =>
  b.getVarModels().map((_, i) => `, ${u.valueToCode(b, `ARG${i}`, JsOrder.NONE) || 'null'}`).join('');

const js = {
  procedures_defnoreturn: tanim,
  procedures_defreturn: tanim,
  procedures_callnoreturn: (b, u) =>
    `await ${u.getProcedureName(b.getFieldValue('NAME'))}(YIGIN${argumanlar(b, u)});\n`,
  procedures_callreturn: (b, u) => [
    `(await ${u.getProcedureName(b.getFieldValue('NAME'))}(YIGIN${argumanlar(b, u)}))`,
    JsOrder.ATOMIC,
  ],
  procedures_ifreturn: (b, u) => {
    const kosul = u.valueToCode(b, 'CONDITION', JsOrder.NONE) || 'false';
    const deger = b.hasReturnValue_ ? u.valueToCode(b, 'VALUE', JsOrder.NONE) || 'null' : '';
    return `if (${kosul}) {\n${u.INDENT}return${deger ? ` ${deger}` : ''};\n}\n`;
  },
};

export default { anahtar: 'bloklarim', bloklar: [], js };
