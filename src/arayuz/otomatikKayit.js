// Öğrencinin programı yalnızca bu tarayıcıda kendiliğinden saklanır (CLAUDE.md: gizlilik).
// Sayfa yenilenince geri gelir. localStorage kullanılamazsa sessizce atlanır.
const ANAHTAR = 'ev3-simulator:otopark-ekrani:program';
const SURUM = 1;

const varsayilanDepo = () => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

export function programiSakla({ program, gorev }, depo = varsayilanDepo()) {
  try {
    depo?.setItem(ANAHTAR, JSON.stringify({ surum: SURUM, gorev, program }));
    return Boolean(depo);
  } catch {
    return false;
  }
}

/** Saklanan program: { program, gorev } ya da yoksa/bozuksa null. */
export function saklananProgram(depo = varsayilanDepo()) {
  try {
    const veri = JSON.parse(depo?.getItem(ANAHTAR) ?? 'null');
    if (veri?.surum !== SURUM || !veri.program || typeof veri.program !== 'object') return null;
    return { program: veri.program, gorev: Number.isInteger(veri.gorev) ? veri.gorev : 1 };
  } catch {
    return null;
  }
}

export function saklananProgramiSil(depo = varsayilanDepo()) {
  try {
    depo?.removeItem(ANAHTAR);
  } catch {
    // yok sayılır
  }
}
