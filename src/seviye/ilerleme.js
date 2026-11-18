// Tamamlanan görevler yalnızca bu tarayıcıda saklanır (CLAUDE.md: gizlilik).
// localStorage kapalı ya da hata veriyorsa oyun ilerleme kaydetmeden çalışmaya devam eder.
const ANAHTAR = 'ev3-simulator:otopark-ekrani:ilerleme';

const varsayilanDepo = () => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

export function ilerlemeYukle(depo = varsayilanDepo()) {
  try {
    const veri = JSON.parse(depo?.getItem(ANAHTAR) ?? 'null');
    return new Set(Array.isArray(veri?.tamamlanan) ? veri.tamamlanan.filter(Number.isInteger) : []);
  } catch {
    return new Set();
  }
}

/** Kaydedebildiyse true döner. */
export function ilerlemeKaydet(tamamlanan, depo = varsayilanDepo()) {
  try {
    depo?.setItem(ANAHTAR, JSON.stringify({ tamamlanan: [...tamamlanan].sort() }));
    return Boolean(depo);
  } catch {
    return false;
  }
}
