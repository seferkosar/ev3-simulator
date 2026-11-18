// Simülatörün sesleri. Ses dosyası yok: bip Web Audio ile üretilir, "İletişim" sesleri tarayıcının
// Türkçe konuşmasıyla söylenir, köpek sesi kısa bir sentezle taklit edilir.
const KONUSMA = { HELLO: 'Merhaba', YES: 'Evet', NO: 'Hayır', GOODBYE: 'Hoşça kal' };

/** MIDI nota numarasını frekansa çevirir (60 = Do, 69 = La 440 Hz). */
export const notaFrekansi = (nota) => 440 * 2 ** ((nota - 69) / 12);

export function sesMotoruOlustur() {
  let baglam = null;
  let sessiz = false;
  let duzey = 1;
  const calanlar = new Set();

  const ac = () => {
    if (!baglam) {
      const Sinif = globalThis.AudioContext ?? globalThis.webkitAudioContext;
      if (!Sinif) return null;
      baglam = new Sinif();
    }
    if (baglam.state === 'suspended') baglam.resume();
    return baglam;
  };

  function ton(frekans, ms, { tip = 'square', kayma = null } = {}) {
    const b = ac();
    if (!b || sessiz || duzey === 0) return;
    const osc = b.createOscillator();
    const kazanc = b.createGain();
    osc.type = tip;
    osc.frequency.setValueAtTime(frekans, b.currentTime);
    if (kayma) osc.frequency.exponentialRampToValueAtTime(kayma, b.currentTime + ms / 1000);
    kazanc.gain.setValueAtTime(0.12 * duzey, b.currentTime);
    kazanc.gain.setTargetAtTime(0, b.currentTime + ms / 1000 - 0.02, 0.01);
    osc.connect(kazanc).connect(b.destination);
    osc.start();
    osc.stop(b.currentTime + ms / 1000);
    calanlar.add(osc);
    osc.onended = () => calanlar.delete(osc);
  }

  function konus(metin) {
    if (sessiz || duzey === 0 || !globalThis.speechSynthesis) return;
    const s = new SpeechSynthesisUtterance(metin);
    s.lang = 'tr-TR';
    s.volume = duzey;
    s.rate = 1.05;
    speechSynthesis.speak(s);
  }

  return {
    /** Kullanıcı bir düğmeye bastığında çağrılır (tarayıcılar sesi ancak bundan sonra açar). */
    hazirla: ac,
    sessizMi: () => sessiz,
    sessizYap(deger) {
      sessiz = deger;
      if (sessiz) this.durdur();
    },
    /** Worker'dan gelen { tur: 'ses', islem, ... } komutu. */
    calis(komut) {
      if (komut.islem === 'bip') ton(notaFrekansi(komut.nota), Math.min(komut.ms, 5000));
      else if (komut.islem === 'dosya') {
        if (KONUSMA[komut.ad]) konus(KONUSMA[komut.ad]);
        else {
          ton(520, 120, { tip: 'sawtooth', kayma: 260 });
          setTimeout(() => ton(480, 140, { tip: 'sawtooth', kayma: 220 }), 180);
        }
      } else if (komut.islem === 'durdur') this.durdur();
      else if (komut.islem === 'duzey') duzey = komut.yuzde / 100;
    },
    durdur() {
      for (const osc of calanlar) {
        try {
          osc.stop();
        } catch {
          // zaten durmuş
        }
      }
      calanlar.clear();
      globalThis.speechSynthesis?.cancel();
    },
    sifirla() {
      this.durdur();
      duzey = 1;
    },
  };
}
