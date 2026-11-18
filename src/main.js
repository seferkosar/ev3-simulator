// Oyun sayfası: blok editörü (sol), EV3 tuğlası ve Python (sağ), konsol (alt).
import { Blockly, EV3_TEMASI } from './bloklar/blocklyKurulum.js';
import { dinamikKategorileriBagla, GOREVDE_KAPALI } from './bloklar/kayit.js';
import { pythonKoduUret, BASLANGIC_BLOGU } from './bloklar/pythonKodu.js';
import { jsKoduUret, programDurumu } from './bloklar/jsKodu.js';
import { programCalistir } from './calistirici/calistirici.js';
import { ekranOlustur, komutuUygula, EKRAN_GENISLIGI, EKRAN_YUKSEKLIGI } from './ekran/ekranModeli.js';
import { ciziciOlustur } from './ekran/ekranCizici.js';
import { GOREVLER, HIKAYE, IPUCLARI, aracKutusu, gorevBul, izinliMi } from './seviye/otoparkEkrani.js';
import { gorevKontrolEt, asciiDisiVarMi } from './seviye/gorevKontrol.js';
import { programOzeti } from './seviye/programOzeti.js';
import { ilerlemeYukle, ilerlemeKaydet } from './seviye/ilerleme.js';
import { konsolOlustur } from './arayuz/konsol.js';
import { programPaketle, programCoz } from './arayuz/programDosyasi.js';

const $ = (id) => document.getElementById(id);
const konsol = konsolOlustur($('konsol'));

// --- Blok editörü ---
let aktifGorev = 1;

const calismaAlani = Blockly.inject($('bloklar'), {
  toolbox: aracKutusu(aktifGorev),
  renderer: 'zelos',
  theme: EV3_TEMASI,
  trashcan: true,
  zoom: { controls: true, startScale: 0.8, wheel: true, pinch: true },
  grid: { spacing: 24, length: 2, colour: '#3a3c42', snap: false },
  move: { scrollbars: true, drag: true, wheel: false },
});
dinamikKategorileriBagla(calismaAlani);
new ResizeObserver(() => Blockly.svgResize(calismaAlani)).observe($('bloklar'));

// "program başladığında" bloğuna bağlı olmayan bloklar soluk görünür ve çalışmaz.
calismaAlani.addChangeListener(Blockly.Events.disableOrphans);

function baslangicBlogunuKoy() {
  const blok = calismaAlani.newBlock(BASLANGIC_BLOGU);
  blok.initSvg();
  blok.render();
  blok.moveBy(40, 40);
}

/** Görevde izin verilmeyen bloklar (dosyadan gelen ya da önceki görevden kalan) gri olur. */
function gorevIzinleriniUygula() {
  let kapatilan = 0;
  for (const blok of calismaAlani.getAllBlocks(false)) {
    const izinli = izinliMi(blok.type, aktifGorev);
    if (!izinli && !blok.hasDisabledReason(GOREVDE_KAPALI)) kapatilan++;
    blok.setDisabledReason(!izinli, GOREVDE_KAPALI);
  }
  return kapatilan;
}

// --- Python sekmesi ve geri al / yinele ---
function guncelle() {
  $('python').textContent = pythonKoduUret(calismaAlani);
  $('geri-al').disabled = calismaAlani.getUndoStack().length === 0;
  $('yinele').disabled = calismaAlani.getRedoStack().length === 0;
}
calismaAlani.addChangeListener((olay) => {
  if (!olay.isUiEvent) guncelle();
});
$('geri-al').onclick = () => calismaAlani.undo(false);
$('yinele').onclick = () => calismaAlani.undo(true);

// --- Sanal EV3 ekranı ---
const cizici = ciziciOlustur($('ekran'), 2);
let ekran = ekranOlustur();
const ekraniCiz = () => cizici.ciz(ekran.ogeler(), { hedef: gorevBul(aktifGorev).hedef });

$('sifirla').onclick = () => {
  ekran = ekranOlustur();
  ekraniCiz();
  konsol.bilgi('Ekran sıfırlandı.');
};

// Öğrencinin konumu bulabilmesi için farenin ekrandaki yeri (1'den başlar, bloklardaki gibi).
$('ekran').addEventListener('mousemove', (olay) => {
  const kutu = olay.currentTarget.getBoundingClientRect();
  const x = Math.min(EKRAN_GENISLIGI, Math.floor(((olay.clientX - kutu.left) / kutu.width) * EKRAN_GENISLIGI) + 1);
  const y = Math.min(EKRAN_YUKSEKLIGI, Math.floor(((olay.clientY - kutu.top) / kutu.height) * EKRAN_YUKSEKLIGI) + 1);
  $('fare-konumu').textContent = `x: ${x}, y: ${y}`;
});

// --- Görevler ve ilerleme ---
const tamamlanan = ilerlemeYukle();

function gorevDugmeleriniGuncelle() {
  for (const dugme of $('gorevler').children) {
    const no = Number(dugme.dataset.no);
    dugme.setAttribute('aria-pressed', String(no === aktifGorev));
    dugme.classList.toggle('tamam', tamamlanan.has(no));
    dugme.setAttribute('aria-label', `Görev ${no}${tamamlanan.has(no) ? ' (tamamlandı)' : ''}`);
  }
}

function gorevSec(no) {
  aktifGorev = no;
  const gorev = gorevBul(no);
  calismaAlani.updateToolbox(aracKutusu(no));
  $('gorev-metni').textContent = `Görev ${no}${gorev.ek ? ' (ek)' : ''}: ${gorev.metin}`;
  gorevDugmeleriniGuncelle();
  ekraniCiz();
  const kapatilan = gorevIzinleriniUygula();
  if (kapatilan) {
    konsol.uyari(`Bu görevde kullanılamayan ${kapatilan} blok soluklaştırıldı; çalışmaz.`);
  }
}

$('hikaye').textContent = HIKAYE;
$('gorevler').replaceChildren(
  ...GOREVLER.map((g) => {
    const dugme = document.createElement('button');
    dugme.dataset.no = g.no;
    dugme.textContent = `Görev ${g.no}`;
    dugme.onclick = () => {
      gorevSec(g.no);
      konsol.bilgi(`Görev ${g.no} açıldı: ${g.metin}`);
      if (g.hedef) konsol.bilgi('Ekranda kesikli çizgili kutu hedefin. Fareyle üstüne gelip konumunu bul.');
    };
    return dugme;
  }),
);

function gorevSonucunuGoster() {
  const gunluk = ekran.gunluk();
  if (asciiDisiVarMi(gunluk)) {
    konsol.uyari('EV3 ekranı Türkçe harfleri (ş, ğ, ı, ö, ü, ç) gösteremeyebilir. Yerine s, g, i, o, u, c kullan.');
  }
  const sonuc = gorevKontrolEt(aktifGorev, { gunluk, ozet: programOzeti(calismaAlani) });
  if (!sonuc.basarili) {
    konsol.uyari(`Görev ${aktifGorev} henüz tamamlanmadı. ${sonuc.mesaj}`);
    return;
  }
  konsol.basari(`Tebrikler! Görev ${aktifGorev} tamamlandı. ${sonuc.mesaj}`);
  tamamlanan.add(aktifGorev);
  ilerlemeKaydet(tamamlanan);
  gorevDugmeleriniGuncelle();
  const sonraki = GOREVLER.find((g) => !tamamlanan.has(g.no));
  konsol.bilgi(sonraki ? `Sıradaki: Görev ${sonraki.no}.` : 'Bu seviyedeki bütün görevleri bitirdin!');
}

// --- İpuçları (düğmeyle, sırayla) ---
let ipucuSirasi = 0;
$('ipucu').onclick = () => {
  konsol.ipucu(`İpucu ${ipucuSirasi + 1}: ${IPUCLARI[ipucuSirasi]}`);
  ipucuSirasi = (ipucuSirasi + 1) % IPUCLARI.length;
  $('ipucu-yazi').textContent = ipucuSirasi === 0 ? 'İpucu' : `İpucu ${ipucuSirasi + 1}`;
};

// --- Dışa / içe aktar ---
$('disa-aktar').onclick = () => {
  const durum = Blockly.serialization.workspaces.save(calismaAlani);
  const dosya = new Blob([programPaketle(durum, aktifGorev)], { type: 'application/json' });
  const baglanti = document.createElement('a');
  baglanti.href = URL.createObjectURL(dosya);
  baglanti.download = `otopark-ekrani-gorev-${aktifGorev}.json`;
  baglanti.click();
  URL.revokeObjectURL(baglanti.href);
  konsol.basari(`Program "${baglanti.download}" olarak kaydedildi.`);
};

$('ice-aktar').onclick = () => $('dosya-sec').click();
$('dosya-sec').onchange = async (olay) => {
  const dosya = olay.target.files[0];
  olay.target.value = '';
  if (!dosya) return;
  const eski = Blockly.serialization.workspaces.save(calismaAlani);
  try {
    const veri = programCoz(await dosya.text());
    calismaAlani.clear();
    Blockly.serialization.workspaces.load(veri.program, calismaAlani);
    konsol.basari(`"${dosya.name}" açıldı.`);
    gorevSec(GOREVLER.some((g) => g.no === veri.gorev) ? veri.gorev : aktifGorev);
  } catch (hata) {
    calismaAlani.clear();
    Blockly.serialization.workspaces.load(eski, calismaAlani);
    const neden = hata.message.includes('block type') ? 'Dosyada tanımadığım bloklar var.' : hata.message;
    konsol.hata(`"${dosya.name}" açılamadı. ${neden}`);
  }
};

// --- Sağ panel sekmeleri ---
const sekmeler = [
  [$('sekme-robot'), $('panel-robot')],
  [$('sekme-python'), $('panel-python')],
];
function sekmeAc(sekme) {
  for (const [s, panel] of sekmeler) {
    s.setAttribute('aria-selected', String(s === sekme));
    panel.hidden = s !== sekme;
  }
}
for (const [sekme] of sekmeler) sekme.onclick = () => sekmeAc(sekme);

// --- Çalıştır / Durdur ---
let calisma = null;

function calismaGorunumu(calisiyor) {
  const dugme = $('calistir');
  dugme.classList.toggle('dugme-dur', calisiyor);
  dugme.title = calisiyor ? 'Programı durdur' : 'Programı çalıştır';
  dugme.querySelector('span').textContent = calisiyor ? 'Durdur' : 'Çalıştır';
  dugme.querySelector('path').setAttribute('d', calisiyor ? 'M7 7h10v10H7z' : 'M8 5l11 7-11 7z');
  for (const isik of document.querySelectorAll('.isik')) isik.classList.toggle('yesil', calisiyor);
}

const SONUC_MESAJI = {
  bitti: () => {
    konsol.basari('Program bitti.');
    gorevSonucunuGoster();
  },
  durduruldu: () => konsol.bilgi('Programı durdurdun.'),
  zaman_asimi: () => konsol.hata('Program 3 saniyede bitmedi, durduruldu.'),
  hata: (mesaj) => konsol.hata(`Programda bir hata var: ${mesaj}`),
};

async function calistir() {
  const durum = programDurumu(calismaAlani);
  if (!durum.baslangicVar) {
    konsol.hata('Önce "program başladığında" bloğunu çalışma alanına koy.');
    return;
  }
  if (!durum.blokVar) {
    konsol.bilgi('"program başladığında" bloğunun altında blok yok.');
    return;
  }
  // Her çalıştırma boş ekranla başlar.
  ekran = ekranOlustur();
  ekraniCiz();
  sekmeAc($('sekme-robot'));
  konsol.bilgi('Program çalışıyor...');
  calismaGorunumu(true);

  calisma = programCalistir(jsKoduUret(calismaAlani), {
    komutGeldi: (komut) => {
      komutuUygula(ekran, komut);
      ekraniCiz();
    },
  });
  const { durum: sonuc, mesaj } = await calisma.sonuc;
  calisma = null;
  calismaGorunumu(false);
  SONUC_MESAJI[sonuc](mesaj);
}

$('calistir').onclick = () => (calisma ? calisma.durdur() : calistir());
$('konsol-temizle').onclick = () => konsol.temizle();

// --- Başlangıç ---
baslangicBlogunuKoy();
gorevSec(aktifGorev);
calismaAlani.clearUndo();
guncelle();
konsol.bilgi('Hoş geldin! Blokları "program başladığında" bloğunun altına tak.');
