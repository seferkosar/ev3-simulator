// Öğrenci programını yürütür. Yalnızca Web Worker içinde çağrılır (src/calistirici/isci.js);
// burada DOM ya da ana sayfa yoktur. Testler bu fonksiyonu doğrudan çağırır.

// Öğrenci kodunun dışarıyla konuşmasını engellemek için worker'da kapatılan adlar.
const KAPATILACAKLAR = [
  'fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts',
  'indexedDB', 'caches', 'BroadcastChannel', 'Worker', 'SharedWorker',
];

export function agiKapat(kapsam) {
  for (const ad of KAPATILACAKLAR) {
    try {
      Object.defineProperty(kapsam, ad, { value: undefined, writable: false, configurable: false });
    } catch {
      // Tanımlanamayan ad varsa yok sayılır; zaten bu ortamda bulunmuyordur.
    }
  }
}

/**
 * kod: jsKoduUret() çıktısı. gonder: her ekran komutunu ana sayfaya iletir.
 * Ekran komutları: { tur: 'temizle' } | { tur: 'konum', x, y, metin, renk? }
 */
export async function programiYurut(kod, gonder, { bekle } = {}) {
  const ekran = {
    clear() {
      gonder({ tur: 'temizle' });
    },
    draw_text(x, y, metin, renk) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new TypeError('Konum için x ve y sayı olmalı.');
      }
      gonder({ tur: 'konum', x, y, metin: String(metin), ...(renk && { renk }) });
    },
  };
  const bekleFn = bekle ?? ((ms) => new Promise((coz) => setTimeout(coz, ms)));
  // new Function yalnızca worker içinde kullanılır; ana sayfada eval yoktur (CLAUDE.md).
  const program = new Function('ekran', 'bekle', `'use strict';\nreturn (async () => {\n${kod}\n})();`);
  await program(ekran, bekleFn);
}
