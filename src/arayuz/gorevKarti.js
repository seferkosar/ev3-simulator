// Görev kartı: görev noktaları (tamamlananlar ✓), görev metni, ipucu baloncuğu ve
// "Çözümü göster" penceresi (çözüm blokları salt okunur küçük bir Blockly alanında).
import { Blockly, EV3_TEMASI } from '../bloklar/blocklyKurulum.js';

export function gorevKartiOlustur({
  dugmeKap, metinKap, ipucuDugmesi, ipucuBalonu, cozumDugmesi, cozumPenceresi, cozumAlani,
  gorevler, serbest, ipuclari, cozumler, gorevSecildi,
}) {
  let aktif = 1;
  let tamamlanan = new Set();
  let ipucuSirasi = 0;
  let cozumCalismaAlani = null;
  let ders = null; // öğretim programından seçilen ders (Görevler menüsü)

  function dugmeler() {
    const tumu = [serbest]; // Görev 1–4 artık Görevler menüsünde
    dugmeKap.replaceChildren(
      ...tumu.map((g) => {
        const d = document.createElement('button');
        d.dataset.no = g.no;
        d.textContent = g.serbest ? 'Serbest' : `Görev ${g.no}`;
        d.className = g.serbest ? 'serbest' : '';
        d.onclick = () => gorevSecildi(g.no);
        return d;
      }),
    );
  }

  function guncelle() {
    for (const d of dugmeKap.children) {
      const no = Number(d.dataset.no);
      const secili = !ders && no === aktif;
      d.setAttribute('aria-pressed', String(secili));
      d.classList.toggle('tamam', tamamlanan.has(no));
      if (no) d.setAttribute('aria-label', `Görev ${no}${tamamlanan.has(no) ? ' (tamamlandı)' : ''}`);
    }
    const g = [...gorevler, serbest].find((x) => x.no === aktif);
    if (ders?.metin) {
      metinKap.textContent = ders.metin;
    } else if (ders) {
      metinKap.textContent = `Seviye ${ders.seviye} · Hafta ${ders.hafta}: ${ders.baslik}`;
    } else {
      metinKap.textContent = g.serbest ? g.metin : `Görev ${g.no}${g.ek ? ' (ek)' : ''}: ${g.metin}`;
    }
    ipucuDugmesi.hidden = !ders && Boolean(g.serbest);
    cozumDugmesi.hidden = true;
    ipucuBalonu.hidden = true;
    ipucuSirasi = 0;
  }

  ipucuDugmesi.onclick = () => {
    ipucuBalonu.hidden = false;
    if (ders) {
      if (ders.cozum) cozumDugmesi.hidden = false; // aşamalar: ipucundan sonra çözüm açılabilir
      ipucuBalonu.textContent = [ders.ipucu, ders.ekNot, ders.durumNotu].filter(Boolean).join(' ');
      return;
    }
    ipucuBalonu.textContent = `İpucu ${ipucuSirasi + 1}/${ipuclari.length}: ${ipuclari[ipucuSirasi]}`;
    ipucuSirasi = (ipucuSirasi + 1) % ipuclari.length;
    // Bütün ipuçları görüldükten sonra çözüm açılabilir.
    if (ipucuSirasi === 0) cozumDugmesi.hidden = false;
  };

  cozumDugmesi.onclick = () => {
    cozumPenceresi.showModal();
    cozumCalismaAlani ??= Blockly.inject(cozumAlani, {
      readOnly: true,
      renderer: 'zelos',
      theme: EV3_TEMASI,
      zoom: { startScale: 0.9 },
      move: { scrollbars: false, drag: false, wheel: false },
    });
    Blockly.serialization.workspaces.load(ders?.cozum ?? cozumler[aktif], cozumCalismaAlani);
    Blockly.svgResize(cozumCalismaAlani);
  };

  dugmeler();
  return {
    /** Görevler menüsünden bir görev seçildi (Görev 1–4 düğmeleri menüde). */
    gorevSec: (no) => gorevSecildi(no),
    sec(no) {
      aktif = no;
      ders = null;
      guncelle();
    },
    /** Öğretim programı dersi seçildi (bloklar Serbest gibi açık). */
    dersGoster(d) {
      aktif = serbest.no;
      ders = d;
      guncelle();
    },
    tamamlananlar(kume) {
      tamamlanan = kume;
      guncelle();
    },
  };
}
