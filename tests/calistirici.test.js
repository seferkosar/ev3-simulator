import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { programCalistir, ZAMAN_ASIMI_MS } from '../src/calistirici/calistirici.js';

/** Gerçek Worker yerine elle mesaj gönderdiğimiz sahte worker. */
function sahteIsci() {
  const isci = {
    gelenler: [],
    sonlandirildi: false,
    postMessage: (m) => isci.gelenler.push(m),
    terminate: () => (isci.sonlandirildi = true),
    gonder: (data) => isci.onmessage({ data }),
  };
  return isci;
}

function baslat(ek = {}) {
  const isci = sahteIsci();
  const komutlar = [];
  const calisma = programCalistir('KOD', {
    isciOlustur: () => isci,
    komutGeldi: (k) => komutlar.push(k),
    ...ek,
  });
  let sonuc;
  calisma.sonuc.then((s) => (sonuc = s));
  return { isci, komutlar, calisma, sonuc: () => sonuc };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('çalıştırıcı', () => {
  it('3 saniyelik sınır', () => {
    expect(ZAMAN_ASIMI_MS).toBe(3000);
  });

  it('kodu worker hazır olunca gönderir, komutları iletir, bitince worker\'ı kapatır', async () => {
    const { isci, komutlar, sonuc } = baslat();
    expect(isci.gelenler).toEqual([]);
    isci.gonder({ tur: 'hazir' });
    expect(isci.gelenler).toEqual([{ kod: 'KOD' }]);
    isci.gonder({ tur: 'konum', x: 0, y: 0, metin: 'BOS' });
    isci.gonder({ tur: 'bitti' });
    await vi.runAllTimersAsync();
    expect(komutlar).toEqual([{ tur: 'konum', x: 0, y: 0, metin: 'BOS' }]);
    expect(sonuc()).toEqual({ durum: 'bitti' });
    expect(isci.sonlandirildi).toBe(true);
  });

  it('3 saniyede bitmeyen programı durdurur', async () => {
    const { isci, sonuc } = baslat();
    isci.gonder({ tur: 'hazir' });
    await vi.advanceTimersByTimeAsync(ZAMAN_ASIMI_MS - 1);
    expect(sonuc()).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    expect(sonuc()).toEqual({ durum: 'zaman_asimi' });
    expect(isci.sonlandirildi).toBe(true);
  });

  it('sayaç worker hazır dedikten sonra başlar (açılış süresi sayılmaz)', async () => {
    const { isci, sonuc } = baslat();
    await vi.advanceTimersByTimeAsync(5000);
    expect(sonuc()).toBeUndefined();
    isci.gonder({ tur: 'hazir' });
    await vi.advanceTimersByTimeAsync(ZAMAN_ASIMI_MS - 1);
    expect(sonuc()).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    expect(sonuc()).toEqual({ durum: 'zaman_asimi' });
  });

  it('worker hiç hazır olmazsa hata verir', async () => {
    const { sonuc } = baslat();
    await vi.advanceTimersByTimeAsync(10000);
    expect(sonuc()).toEqual({ durum: 'hata', mesaj: 'Program başlatılamadı.' });
  });

  it('programdaki hatayı iletir', async () => {
    const { isci, sonuc } = baslat();
    isci.gonder({ tur: 'hazir' });
    isci.gonder({ tur: 'hata', mesaj: 'Konum için x ve y sayı olmalı.' });
    await vi.runAllTimersAsync();
    expect(sonuc()).toEqual({ durum: 'hata', mesaj: 'Konum için x ve y sayı olmalı.' });
  });

  it('ekrana uygulanamayan komutta durur', async () => {
    const { isci, sonuc } = baslat({
      komutGeldi: () => {
        throw new Error('bozuk');
      },
    });
    isci.gonder({ tur: 'hazir' });
    isci.gonder({ tur: 'temizle' });
    await vi.runAllTimersAsync();
    expect(sonuc()).toEqual({ durum: 'hata', mesaj: 'bozuk' });
    expect(isci.sonlandirildi).toBe(true);
  });

  it('Durdur ile kesilir; sonradan gelen mesajlar yok sayılır', async () => {
    const { isci, komutlar, calisma, sonuc } = baslat();
    isci.gonder({ tur: 'hazir' });
    calisma.durdur();
    isci.gonder({ tur: 'konum', x: 0, y: 0, metin: 'GEC' });
    isci.gonder({ tur: 'bitti' });
    await vi.runAllTimersAsync();
    expect(sonuc()).toEqual({ durum: 'durduruldu' });
    expect(komutlar).toEqual([]);
  });
});
