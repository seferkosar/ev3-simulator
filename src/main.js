// Oyun sayfası: görev kartı (üst), blok editörü (sol), simülatör ve Python (sağ), konsol (alt).
import { Blockly, EV3_TEMASI } from './bloklar/blocklyKurulum.js';
import { dinamikKategorileriBagla, GOREVDE_KAPALI } from './bloklar/kayit.js';
import { pythonKoduUret, BASLANGIC_BLOGU } from './bloklar/pythonKodu.js';
import { jsKoduUret, programDurumu } from './bloklar/jsKodu.js';
import { blokAra } from './bloklar/blokAra.js';
import { programCalistir } from './calistirici/calistirici.js';
import { ekranOlustur, komutuUygula, EKRAN_GENISLIGI, EKRAN_YUKSEKLIGI } from './ekran/ekranModeli.js';
import { ciziciOlustur } from './ekran/ekranCizici.js';
import {
  GOREVLER, SERBEST, HIKAYE, IPUCLARI, COZUMLER, aracKutusu, gorevBul, izinliMi,
} from './seviye/otoparkEkrani.js';
import { gorevKontrolEt, asciiDisiVarMi } from './seviye/gorevKontrol.js';
import { programOzeti } from './seviye/programOzeti.js';
import { ilerlemeYukle, ilerlemeKaydet } from './seviye/ilerleme.js';
import { calismaAlanindanDonanim } from './simulasyon/donanimBul.js';
import { konsolOlustur } from './arayuz/konsol.js';
import { programPaketle, programCoz } from './arayuz/programDosyasi.js';
import { programiSakla, saklananProgram } from './arayuz/otomatikKayit.js';
import { gorevKartiOlustur } from './arayuz/gorevKarti.js';
import { simulatorPaneliOlustur } from './arayuz/simulatorPaneli.js';
import { sesMotoruOlustur } from './arayuz/ses.js';
import { sahneCiziciOlustur } from './arayuz/sahneCizici.js';
import { SAHNELER, sahneBul } from './simulasyon/sahneler.js';
import { dunyaOlustur } from './simulasyon/dunya.js';
import { DERS_GORUNUMU, dersProgrami } from './dersler/dersGorevleri.js';
import { ETKINLIK_GORUNUMU, etkinlikBul, etkinlikProgrami } from './etkinlikler/etkinlikler.js';
import { dersMenusuOlustur } from './arayuz/dersMenusu.js';
import { ASAMA_GORUNUMU, asamaBul, asamaCozumu, asamaBaslangici } from './asamalar/asamalar.js';
import { asamaSahnesi, asamaKontrol } from './asamalar/asamaSahnesi.js';
import { asamaMenusuOlustur } from './arayuz/asamaMenusu.js';

const $ = (id) => document.getElementById(id);
const konsol = konsolOlustur($('konsol'));
const ses = sesMotoruOlustur();

/** Görünüm tercihleri yalnızca bu tarayıcıda (kontrast, yazı boyutu, yavaş çekim, ses). */
const tercih = {
  al(ad, varsayilan) {
    try {
      return JSON.parse(localStorage.getItem(`ev3-simulator:tercih:${ad}`)) ?? varsayilan;
    } catch {
      return varsayilan;
    }
  },
  koy(ad, deger) {
    try {
      localStorage.setItem(`ev3-simulator:tercih:${ad}`, JSON.stringify(deger));
    } catch {
      // kapalıysa atla
    }
  },
};

const indir = (icerik, ad, tur) => {
  const baglanti = document.createElement('a');
  baglanti.href = URL.createObjectURL(new Blob([icerik], { type: tur }));
  baglanti.download = ad;
  baglanti.click();
  URL.revokeObjectURL(baglanti.href);
};

// ---------------------------------------------------------------- Blok editörü
let aktifGorev = 1;
let aramaSorgusu = '';

const calismaAlani = Blockly.inject($('bloklar'), {
  toolbox: aracKutusu(aktifGorev),
  renderer: 'zelos',
  theme: EV3_TEMASI,
  trashcan: true,
  zoom: { controls: true, startScale: 0.8, wheel: true, pinch: true },
  grid: { spacing: 24, length: 2, colour: '#3a3c42', snap: false },
  move: { scrollbars: true, drag: true, wheel: false },
});
Blockly.ShortcutItems?.registerNavigationShortcuts?.();
dinamikKategorileriBagla(calismaAlani, {
  aramaSonuclari: () => ({ sorgu: aramaSorgusu, ogeler: blokAra(aramaSorgusu, (t) => izinliMi(t, aktifGorev)) }),
});
new ResizeObserver(() => Blockly.svgResize(calismaAlani)).observe($('bloklar'));

// Şapka bloğuna bağlı olmayan bloklar soluk görünür ve çalışmaz.
calismaAlani.addChangeListener(Blockly.Events.disableOrphans);

function baslangicBlogunuKoy() {
  const blok = calismaAlani.newBlock(BASLANGIC_BLOGU);
  blok.initSvg();
  blok.render();
  blok.moveBy(40, 40);
}

/** Görevde izin verilmeyen bloklar (dosyadan gelen, önceki görevden kalan, aramadan gelen) gri olur. */
function gorevIzinleriniUygula(bloklar = calismaAlani.getAllBlocks(false)) {
  let kapatilan = 0;
  for (const blok of bloklar) {
    const izinli = izinliMi(blok.type, aktifGorev);
    if (!izinli && !blok.hasDisabledReason(GOREVDE_KAPALI)) kapatilan++;
    blok.setDisabledReason(!izinli, GOREVDE_KAPALI);
  }
  return kapatilan;
}
calismaAlani.addChangeListener((olay) => {
  if (olay.type !== Blockly.Events.BLOCK_CREATE) return;
  const bloklar = olay.ids.map((id) => calismaAlani.getBlockById(id)).filter(Boolean);
  gorevIzinleriniUygula(bloklar);
});

// ---------------------------------------------------------------- Python, geri al, otomatik kayıt
let kayitZamanlayici = null;
let donanimZamanlayici = null;
function guncelle() {
  $('python').textContent = pythonKoduUret(calismaAlani);
  $('geri-al').disabled = calismaAlani.getUndoStack().length === 0;
  $('yinele').disabled = calismaAlani.getRedoStack().length === 0;
}
calismaAlani.addChangeListener((olay) => {
  if (olay.isUiEvent) return;
  guncelle();
  clearTimeout(kayitZamanlayici);
  kayitZamanlayici = setTimeout(
    () => programiSakla({ program: Blockly.serialization.workspaces.save(calismaAlani), gorev: aktifGorev }),
    400,
  );
  clearTimeout(donanimZamanlayici);
  donanimZamanlayici = setTimeout(donanimiYenile, 150);
});
$('geri-al').onclick = () => calismaAlani.undo(false);
$('yinele').onclick = () => calismaAlani.undo(true);

$('python-indir').onclick = () => {
  indir(pythonKoduUret(calismaAlani), 'main.py', 'text/x-python');
  konsol.basari('main.py indirildi. Pybricks ile gerçek EV3\'e yükleyebilirsin.');
};

// ---------------------------------------------------------------- Blok arama
$('blok-ara').addEventListener('input', (olay) => {
  aramaSorgusu = olay.target.value;
  const kutu = calismaAlani.getToolbox();
  if (aramaSorgusu.trim()) {
    kutu.setSelectedItem(kutu.getToolboxItems()[0]);
    calismaAlani.refreshToolboxSelection();
  } else {
    kutu.clearSelection();
  }
});
$('blok-ara').addEventListener('keydown', (olay) => {
  if (olay.key === 'Escape') {
    olay.target.value = '';
    olay.target.dispatchEvent(new Event('input'));
  }
});

// ---------------------------------------------------------------- Sanal EV3 ekranı
const cizici = ciziciOlustur($('ekran'), 2);
const kucukCizici = ciziciOlustur($('sahne-ekran'), 1);
let ekran = ekranOlustur();
let cizimIstendi = false;
const ekraniCiz = () => {
  if (cizimIstendi) return;
  cizimIstendi = true;
  requestAnimationFrame(() => {
    cizimIstendi = false;
    cizici.ciz(ekran.ogeler(), { hedef: gorevBul(aktifGorev).hedef });
    kucukCizici.ciz(ekran.ogeler());
  });
};

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

// Ekranı büyütme: tıkla ya da Enter; Esc kapatır.
const ekraniBuyut = (buyuk = !$('panel-robot').classList.contains('buyuk')) => {
  $('panel-robot').classList.toggle('buyuk', buyuk);
  $('ekran').setAttribute('aria-label', buyuk ? 'EV3 ekranı (büyük). Küçültmek için tıkla.' : 'EV3 ekranı. Büyütmek için tıkla.');
};
$('ekran').addEventListener('click', () => ekraniBuyut());
$('ekran').addEventListener('keydown', (olay) => {
  if (olay.key === 'Enter' || olay.key === ' ') {
    olay.preventDefault();
    ekraniBuyut();
  }
});
document.addEventListener('keydown', (olay) => {
  if (olay.key === 'Escape') ekraniBuyut(false);
});

// ---------------------------------------------------------------- Simülatör paneli (portlar, sensörler)
let calisma = null;
const ISIK_SINIFI = { GREEN: 'yesil', RED: 'kirmizi', ORANGE: 'turuncu', OFF: '' };
const simulator = simulatorPaneliOlustur({
  motorKap: $('motor-portlari'),
  sensorKap: $('sensor-portlari'),
  dugmeler: document.querySelectorAll('.yd'),
  isiklar: document.querySelectorAll('.isik'),
  onDegisim: () => calisma?.donanimGonder(guncelDonanim()),
});
// Sahne'deki "Dokunmaya bas" düğmesi: programdaki bütün dokunma sensörleri basılı sayılır.
let sahneDokunma = false;
function guncelDonanim() {
  const d = simulator.donanim();
  if (sahneDokunma) {
    for (const s of Object.values(d.sensorler)) if (s.tur === 'dokunma') s.basili = true;
  }
  return d;
}
let sonCakisma = '';
function donanimiYenile() {
  const bulunan = calismaAlanindanDonanim(calismaAlani);
  simulator.portlariGuncelle(bulunan);
  const cakisma = bulunan.cakismalar.join(',');
  if (cakisma && cakisma !== sonCakisma) {
    konsol.uyari(`${bulunan.cakismalar.join(' ve ')}. porta iki farklı sensör bağlamışsın; ilk kullanılan sayıldı.`);
  }
  sonCakisma = cakisma;
  calisma?.donanimGonder(guncelDonanim());
}

let yavas = tercih.al('yavas', false);
const yavasGoster = () => $('yavas').setAttribute('aria-pressed', String(yavas));
$('yavas').onclick = () => {
  yavas = !yavas;
  tercih.koy('yavas', yavas);
  yavasGoster();
  konsol.bilgi(yavas ? 'Yavaş çekim açık: her blok sırayla parlayacak.' : 'Yavaş çekim kapalı.');
};
const sesGoster = () => {
  $('sessiz').setAttribute('aria-pressed', String(ses.sessizMi()));
  $('sessiz').textContent = ses.sessizMi() ? '🔇 Sessiz' : '🔊 Ses';
};
ses.sessizYap(tercih.al('sessiz', false));
$('sessiz').onclick = () => {
  ses.sessizYap(!ses.sessizMi());
  tercih.koy('sessiz', ses.sessizMi());
  sesGoster();
};
$('tam-ekran').onclick = () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else $('sag-panel').requestFullscreen?.();
};

// ---------------------------------------------------------------- Görevler, ilerleme, görev kartı
const tamamlanan = ilerlemeYukle();
const kart = gorevKartiOlustur({
  dugmeKap: $('gorevler'),
  metinKap: $('gorev-metni'),
  ipucuDugmesi: $('ipucu'),
  ipucuBalonu: $('ipucu-balonu'),
  cozumDugmesi: $('cozum'),
  cozumPenceresi: $('cozum-penceresi'),
  cozumAlani: $('cozum-alani'),
  gorevler: GOREVLER,
  serbest: SERBEST,
  ipuclari: IPUCLARI,
  cozumler: COZUMLER,
  gorevSecildi: (no) => {
    aktifDers = null;
    aktifAsama = null;
    tercih.koy('ders', null);
    tercih.koy('asama', null);
    gorevSec(no);
    const g = gorevBul(no);
    konsol.bilgi(g.serbest ? 'Serbest çalışma açıldı: bütün bloklar açık.' : `Görev ${no} açıldı: ${g.metin}`);
    if (g.hedef) konsol.bilgi('Ekranda kesikli çizgili kutu hedefin. Fareyle üstüne gelip konumunu bul.');
  },
});

// ---------------------------------------------------------------- Görevler menüsü (öğretim programı dersleri)
let aktifDers = null;
function dersiUygula(d) {
  aktifDers = d;
  aktifAsama = null;
  tercih.koy('ders', d.anahtar);
  tercih.koy('asama', null);
  if ($('sahne-sec').value === 'ozel') $('sahne-sec').value = SAHNELER[0].anahtar;
  gorevSec(SERBEST.no); // dersler bütün blokları kullanır
  kart.dersGoster(
    d.etkinlik
      ? { metin: `Etkinlik: ${d.baslik}. ${d.aciklama}`, ipucu: d.ipucu, ekNot: [d.uyarlama, d.gelistir && `Geliştir: ${d.gelistir}`].filter(Boolean).join(' ') }
      : d,
  );
  if (d.mod === 'sahne' && d.etkinlik) {
    ozelSahneyiKur({ anahtar: 'ozel', ad: `Etkinlik: ${d.baslik}`, gorev: d.ipucu, sahne: d.sahne, kontrol: null });
    sekmeAc($('sekme-sahne'));
  } else if (d.mod === 'sahne') {
    aktifSahne = sahneBul(d.sahne);
    $('sahne-sec').value = aktifSahne.anahtar;
    sahneyiBaslat();
    sekmeAc($('sekme-sahne'));
  } else if (d.mod === 'elle') {
    sekmeAc($('sekme-robot'));
  }
}
dersMenusuOlustur({
  menu: $('ders-menusu'),
  liste: $('ders-listesi'),
  pencere: $('ders-penceresi'),
  alanlar: {
    ust: $('ders-ust'), baslik: $('ders-baslik'), durum: $('ders-durum'), bilgi: $('ders-bilgi'),
    yukle: $('ders-yukle'), bos: $('ders-bos'),
  },
  gorevler: () => ({
    baslik: 'Otopark Ekranı görevleri',
    alt: 'Robotun ekranını programla: Görev 1–4.',
    ogeler: GOREVLER.map((g) => ({
      no: g.no,
      metin: g.metin,
      tamam: tamamlanan.has(g.no),
      secili: !aktifDers && !aktifAsama && aktifGorev === g.no,
      sec: () => kart.gorevSec(g.no),
    })),
  }),
  etkinlikler: ETKINLIK_GORUNUMU,
  seviyeler: DERS_GORUNUMU,
  dersSecildi: (d, ornekYukle) => {
    calismaAlani.clear();
    if (ornekYukle) Blockly.serialization.workspaces.load(d.etkinlik ? etkinlikProgrami(d) : dersProgrami(d.anahtar), calismaAlani);
    else baslangicBlogunuKoy();
    calismaAlani.clearUndo();
    dersiUygula(d);
    guncelle();
    if (d.etkinlik) {
      konsol.bilgi(`Etkinlik: ${d.baslik}. ${d.ipucu}`);
      if (d.uyarlama) konsol.uyari(`Uyarlama: ${d.uyarlama}`);
    } else {
      konsol.bilgi(`Ders: Seviye ${d.seviye}, Hafta ${d.hafta} — ${d.baslik}. ${d.ipucu}`);
      if (d.ekNot) konsol.uyari(d.ekNot);
    }
  },
});

// ---------------------------------------------------------------- Aşamalar menüsü (Robot Yolculuğu)
let aktifAsama = null;
const asamaYildizlari = () => tercih.al('asamaYildiz', {}) ?? {};
const asamaSahnesiOlustur = (a) => ({
  anahtar: 'ozel',
  ad: `Aşama ${a.no} (${a.baslik})`,
  gorev: a.hikaye,
  sahne: asamaSahnesi(a),
  kontrol: (d) => asamaKontrol(a, d.anlik()),
});
function asamayiUygula(a) {
  aktifAsama = a;
  aktifDers = null;
  tercih.koy('asama', a.anahtar);
  tercih.koy('ders', null);
  gorevSec(SERBEST.no); // aşamalar bütün blokları kullanır
  kart.dersGoster({
    metin: `Aşama ${a.no}: ${a.baslik}. ${a.hikaye}`,
    ipucu: a.ipucu,
    ekNot: a.ogrenilen ? `Öğreneceğin: ${a.ogrenilen}` : '',
    cozum: asamaCozumu(a),
  });
  ozelSahneyiKur(asamaSahnesiOlustur(a));
  sekmeAc($('sekme-sahne'));
}
/** Hazır sahneler dışındaki bir sahne (aşama, etkinlik): seçim listesine "özel" seçenek olarak girer. */
let ozelSahne = null;
function ozelSahneyiKur(s) {
  ozelSahne = s;
  aktifSahne = s;
  let secenek = $('sahne-sec').querySelector('option[value="ozel"]');
  if (!secenek) {
    secenek = document.createElement('option');
    secenek.value = 'ozel';
    $('sahne-sec').append(secenek);
  }
  secenek.textContent = s.ad;
  $('sahne-sec').value = 'ozel';
  sahneyiBaslat();
}
const asamaMenusu = asamaMenusuOlustur({
  menu: $('asama-menusu'),
  liste: $('asama-listesi'),
  pencere: $('asama-penceresi'),
  alanlar: {
    ust: $('asama-ust'), baslik: $('asama-baslik'), hikaye: $('asama-hikaye'),
    bloklar: $('asama-bloklar'), hedef: $('asama-hedef'), not: $('asama-not'),
  },
  dunyalar: ASAMA_GORUNUMU,
  yildizlar: asamaYildizlari,
  asamaSecildi: (a) => {
    calismaAlani.clear();
    Blockly.serialization.workspaces.load(asamaBaslangici(a), calismaAlani);
    calismaAlani.clearUndo();
    asamayiUygula(a);
    guncelle();
    konsol.bilgi(`Aşama ${a.no}: ${a.baslik}. ${a.hikaye}`);
    if (a.hataAvi) konsol.uyari('Hata avı: bu program hatalı. Çalıştır, izle, hatayı bul ve düzelt.');
  },
});
/** Aşama tamamlanınca blok sayısına göre yıldız (oyundaki gibi: par = 3 yıldız). */
function asamaYildiziVer() {
  const blokSayisi = calismaAlani.getAllBlocks(false).filter((b) => !b.isShadow() && b.isEnabled() && !b.outputConnection && b.type !== 'olay_program_basladiginda').length;
  const a = aktifAsama;
  const y = blokSayisi <= a.par ? 3 : blokSayisi <= a.par + 2 ? 2 : 1;
  const kayit = asamaYildizlari();
  if ((kayit[a.anahtar] ?? 0) < y) tercih.koy('asamaYildiz', { ...kayit, [a.anahtar]: y });
  konsol.basari(`${'★'.repeat(y)}${'☆'.repeat(3 - y)} ${blokSayisi} komut bloğu kullandın (3 yıldız için en fazla ${a.par}).`);
  if (a.ogrenilen) konsol.bilgi(a.ogrenilen);
  const sonraki = ASAMA_GORUNUMU.flatMap((d) => d.asamalar).find((x) => x.no === a.no + 1);
  if (sonraki) konsol.bilgi(`Sıradaki: Aşama ${sonraki.no}, "${sonraki.baslik}". Aşamalar menüsünden aç.`);
  else konsol.basari('Bütün aşamaları bitirdin. Robotunun bütün parçalarını kullanabiliyorsun!');
}

function gorevSec(no) {
  aktifGorev = no;
  calismaAlani.updateToolbox(aracKutusu(no));
  kart.sec(no);
  $('sahne-serbest-notu').hidden = no === SERBEST.no;
  ekraniCiz();
  const kapatilan = gorevIzinleriniUygula();
  if (kapatilan) konsol.uyari(`Bu görevde kullanılamayan ${kapatilan} blok soluklaştırıldı; çalışmaz.`);
  programiSakla({ program: Blockly.serialization.workspaces.save(calismaAlani), gorev: aktifGorev });
}

function gorevSonucunuGoster() {
  const gunluk = ekran.gunluk();
  if (asciiDisiVarMi(gunluk)) {
    konsol.uyari('EV3 ekranı Türkçe harfleri (ş, ğ, ı, ö, ü, ç) gösteremeyebilir. Yerine s, g, i, o, u, c kullan.');
  }
  if (gorevBul(aktifGorev).serbest) return;
  const sonuc = gorevKontrolEt(aktifGorev, { gunluk, ozet: programOzeti(calismaAlani) });
  if (!sonuc.basarili) {
    konsol.uyari(`Görev ${aktifGorev} henüz tamamlanmadı. ${sonuc.mesaj}`);
    return;
  }
  konsol.basari(`Tebrikler! Görev ${aktifGorev} tamamlandı. ${sonuc.mesaj}`);
  tamamlanan.add(aktifGorev);
  ilerlemeKaydet(tamamlanan);
  kart.tamamlananlar(tamamlanan);
  const sonraki = GOREVLER.find((g) => !tamamlanan.has(g.no));
  konsol.bilgi(sonraki ? `Sıradaki: Görev ${sonraki.no}.` : 'Bu seviyedeki bütün görevleri bitirdin! Serbest çalışmada motorları ve sensörleri deneyebilirsin.');
}

// ---------------------------------------------------------------- Dışa / içe aktar, yeni program
$('disa-aktar').onclick = () => {
  const ad = aktifGorev ? `otopark-ekrani-gorev-${aktifGorev}.json` : 'ev3-serbest.json';
  indir(programPaketle(Blockly.serialization.workspaces.save(calismaAlani), aktifGorev), ad, 'application/json');
  konsol.basari(`Program "${ad}" olarak kaydedildi.`);
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
    const gecerli = veri.gorev === SERBEST.no || GOREVLER.some((g) => g.no === veri.gorev);
    gorevSec(gecerli ? veri.gorev : aktifGorev);
  } catch (hata) {
    calismaAlani.clear();
    Blockly.serialization.workspaces.load(eski, calismaAlani);
    const neden = hata.message.includes('block type') ? 'Dosyada tanımadığım bloklar var.' : hata.message;
    konsol.hata(`"${dosya.name}" açılamadı. ${neden}`);
  }
};

$('yeni-program').onclick = () => $('yeni-penceresi').showModal();
$('yeni-penceresi').addEventListener('close', () => {
  if ($('yeni-penceresi').returnValue !== 'evet') return;
  calismaAlani.clear();
  baslangicBlogunuKoy();
  calismaAlani.clearUndo();
  guncelle();
  konsol.bilgi('Yeni program: "program başladığında" bloğuyla başla.');
});

// ---------------------------------------------------------------- Sağ panel sekmeleri
const sekmeler = [
  [$('sekme-robot'), $('panel-robot')],
  [$('sekme-sahne'), $('panel-sahne')],
  [$('sekme-python'), $('panel-python')],
];
// Simülasyon modu: "sahne" = robot sahnede gezer, sensörler dünyadan; "elle" = sensörler kaydırıcılardan.
// Son açılan Robot ya da Sahne sekmesi belirler (Python sekmesi değiştirmez).
let simModu = 'elle';
function sekmeAc(sekme) {
  for (const [s, panel] of sekmeler) {
    s.setAttribute('aria-selected', String(s === sekme));
    panel.hidden = s !== sekme;
  }
  if (sekme === $('sekme-sahne')) {
    simModu = 'sahne';
    sahneCizici.ciz();
  } else if (sekme === $('sekme-robot')) {
    simModu = 'elle';
  }
}
for (const [sekme] of sekmeler) sekme.onclick = () => sekmeAc(sekme);

// ---------------------------------------------------------------- Sahne (robot üstten görünüşte gezer)
const RENK_ADI = {
  RED: 'kırmızı', GREEN: 'yeşil', BLUE: 'mavi', YELLOW: 'sarı', BLACK: 'siyah',
  WHITE: 'beyaz', BROWN: 'kahverengi', NONE: 'yok',
};
const sahneCizici = sahneCiziciOlustur($('sahne'));
let aktifSahne = sahneBul(tercih.al('sahne', 'otopark'));
let sonRobot = null;
let calismaBaslangici = 0;

function hudGuncelle(robot) {
  const s = robot?.sensorler;
  $('hud-mesafe').textContent = s ? `${sayiTr(s.mesafe)} cm` : '–';
  $('hud-renk').textContent = s ? RENK_ADI[s.renk] : '–';
  $('hud-yansiyan').textContent = s ? `%${s.yansiyan}` : '–';
  $('hud-aci').textContent = s ? `${s.aci}°` : '–';
  $('hud-dokunma').textContent = s ? (s.dokunma ? 'basılı' : 'değil') : '–';
  const toplam = aktifSahne.sahne.yildizlar?.length ?? 0;
  $('hud-yildiz').textContent = toplam ? `${robot?.puan ?? 0} / ${toplam}` : '–';
}
const sayiTr = (n) => n.toLocaleString('tr-TR', { maximumFractionDigits: 1 });
function tekerleriGoster(tekerler = {}) {
  const metin = Object.entries(tekerler).map(([p, d]) => `${p}: ${d}°`).join(' ');
  $('hud-teker').textContent = metin || '–';
}

function sahneyiBaslat() {
  const baslangic = dunyaOlustur(aktifSahne.sahne).anlik();
  sonRobot = baslangic;
  sahneCizici.sahneAyarla(aktifSahne.sahne, baslangic);
  hudGuncelle(baslangic);
  $('hud-teker').textContent = '–';
  $('hud-sure').textContent = '0,0 sn';
  // Ders seçiliyse sahnenin kendi görevi yerine dersin ipucu gösterilir.
  $('sahne-gorev').textContent = aktifAsama
    ? `Aşama ${aktifAsama.no}: ${aktifAsama.hikaye}`
    : aktifDers?.mod === 'sahne' ? `${aktifDers.etkinlik ? 'Etkinlik' : 'Ders'}: ${aktifDers.ipucu}` : aktifSahne.gorev;
}

$('sahne-sec').replaceChildren(
  ...SAHNELER.map((s) => {
    const o = document.createElement('option');
    o.value = s.anahtar;
    o.textContent = s.ad;
    return o;
  }),
);
$('sahne-sec').value = aktifSahne.anahtar;
$('sahne-sec').onchange = (olay) => {
  if (olay.target.value === 'ozel' && ozelSahne) {
    aktifSahne = ozelSahne;
    sahneyiBaslat();
    return;
  }
  aktifSahne = sahneBul(olay.target.value);
  tercih.koy('sahne', aktifSahne.anahtar);
  sahneyiBaslat();
  konsol.bilgi(`Sahne: ${aktifSahne.ad}. ${aktifSahne.gorev}`);
};
$('sahne-sifirla').onclick = () => sahneyiBaslat();
$('sahne-kamera').onclick = () => {
  const takip = $('sahne-kamera').getAttribute('aria-pressed') !== 'true';
  $('sahne-kamera').setAttribute('aria-pressed', String(takip));
  sahneCizici.kamera(takip ? 'takip' : 'tum');
};
$('sahne-iz').onclick = () => {
  const acik = $('sahne-iz').getAttribute('aria-pressed') !== 'true';
  $('sahne-iz').setAttribute('aria-pressed', String(acik));
  sahneCizici.izGoster(acik);
};

// Cetvel: sahnede sürükleyerek iki nokta arası cm ölç.
let cetvelAcik = false;
let cetvelBaslangic = null;
$('sahne-cetvel').onclick = () => {
  cetvelAcik = !cetvelAcik;
  $('sahne-cetvel').setAttribute('aria-pressed', String(cetvelAcik));
  $('sahne').classList.toggle('olcum', cetvelAcik);
  if (!cetvelAcik) sahneCizici.cetvel(null);
  else konsol.bilgi('Cetvel açık: sahnede bir noktadan diğerine sürükle.');
};
const sahneNoktasi = (olay) => {
  const k = $('sahne').getBoundingClientRect();
  return sahneCizici.dunyaya(olay.clientX - k.left, olay.clientY - k.top);
};
$('sahne').addEventListener('pointerdown', (olay) => {
  if (!cetvelAcik) return;
  cetvelBaslangic = sahneNoktasi(olay);
  $('sahne').setPointerCapture(olay.pointerId);
  sahneCizici.cetvel({ a: cetvelBaslangic, b: cetvelBaslangic });
});
$('sahne').addEventListener('pointermove', (olay) => {
  if (cetvelAcik && cetvelBaslangic) sahneCizici.cetvel({ a: cetvelBaslangic, b: sahneNoktasi(olay) });
});
$('sahne').addEventListener('pointerup', () => {
  cetvelBaslangic = null;
});
new ResizeObserver(() => sahneCizici.ciz()).observe($('sahne'));

const dokunmaAyarla = (basili) => {
  if (sahneDokunma === basili) return;
  sahneDokunma = basili;
  $('sahne-dokun').setAttribute('aria-pressed', String(basili));
  calisma?.donanimGonder(guncelDonanim());
};
$('sahne-dokun').addEventListener('pointerdown', (o) => {
  o.preventDefault();
  dokunmaAyarla(true);
});
for (const olay of ['pointerup', 'pointerleave', 'pointercancel']) $('sahne-dokun').addEventListener(olay, () => dokunmaAyarla(false));
$('sahne-dokun').addEventListener('keydown', (o) => (o.key === ' ' || o.key === 'Enter') && (o.preventDefault(), dokunmaAyarla(true)));
$('sahne-dokun').addEventListener('keyup', () => dokunmaAyarla(false));

$('serbeste-gec').onclick = () => {
  gorevSec(SERBEST.no);
  konsol.bilgi('Serbest çalışma açıldı: hareket ve sensör blokları açık.');
};

/** Program bitince: sahne görevi ve "tahmin et, sonra ölç". */
function sahneSonucunuGoster() {
  if (!sonRobot) return;
  const { x: bx, y: by } = aktifSahne.sahne.baslangic;
  const gidilen = Math.hypot(sonRobot.x - bx, sonRobot.y - by);
  const tahmin = $('tahmin').value.trim();
  if (tahmin !== '') {
    const fark = Math.abs(gidilen - Number(tahmin));
    konsol.bilgi(
      `Robot başlangıçtan ${sayiTr(gidilen)} cm uzaklaştı. Tahminin ${tahmin} cm idi; fark ${sayiTr(fark)} cm.`,
    );
    if (fark <= 2) konsol.basari('Harika tahmin!');
  }
  if (!aktifSahne.kontrol) return;
  const r = sonRobot;
  const sonuc = aktifSahne.kontrol({
    hedefte: (h) => r.x >= h.x && r.x <= h.x + h.g && r.y >= h.y && r.y <= h.y + h.h,
    anlik: () => r,
  });
  if (sonuc.basarili) konsol.basari(`Tebrikler! ${aktifSahne.ad} görevi tamamlandı. ${sonuc.mesaj}`);
  else konsol.uyari(`${aktifSahne.ad}: ${sonuc.mesaj}`);
  if (sonuc.basarili && aktifAsama && aktifSahne.anahtar === 'ozel') asamaYildiziVer();
}

// ---------------------------------------------------------------- Çalıştır / Durdur / Yeniden başlat
function calismaGorunumu(calisiyor) {
  const dugme = $('calistir');
  dugme.classList.toggle('dugme-dur', calisiyor);
  dugme.title = calisiyor ? 'Programı durdur (Ctrl+Enter)' : 'Programı çalıştır (Ctrl+Enter)';
  dugme.querySelector('span').textContent = calisiyor ? 'Durdur' : 'Çalıştır';
  dugme.querySelector('path').setAttribute('d', calisiyor ? 'M7 7h10v10H7z' : 'M8 5l11 7-11 7z');
  simulator.isik(calisiyor ? 'yesil' : '');
}

const SONUC_MESAJI = {
  bitti: (_mesaj, _sinir, mod) => {
    konsol.basari('Program bitti.');
    if (mod === 'sahne') sahneSonucunuGoster();
    else gorevSonucunuGoster();
  },
  durduruldu: () => konsol.bilgi('Programı durdurdun.'),
  zaman_asimi: (_mesaj, sinir) =>
    konsol.hata(
      sinir === 'toplam'
        ? 'Program 5 dakikadan uzun sürdü, durduruldu.'
        : 'Program 3 saniye boyunca yanıt vermedi, durduruldu.',
    ),
  hata: (mesaj) => konsol.hata(`Programda bir hata var: ${mesaj}`),
};

function komutGeldi(komut) {
  switch (komut.tur) {
    case 'isik':
      simulator.isik(ISIK_SINIFI[komut.renk]);
      break;
    case 'motorlar':
      simulator.motorlariGuncelle(komut);
      break;
    case 'ses':
      ses.calis(komut);
      break;
    case 'blok':
      calismaAlani.highlightBlock(komut.id);
      break;
    case 'robot':
      sonRobot = komut;
      sahneCizici.robotGuncelle(komut);
      hudGuncelle(komut);
      tekerleriGoster(komut.tekerler);
      $('hud-sure').textContent = `${((Date.now() - calismaBaslangici) / 1000).toFixed(1).replace('.', ',')} sn`;
      break;
    case 'carpisma':
      konsol.uyari('Robot bir engele çarptı.');
      break;
    case 'yildiz':
      konsol.basari(`Yıldız toplandı! (${komut.puan})`);
      break;
    case 'paket':
      konsol.bilgi({ tut: 'Kol indi: paketi tuttun.', birak: 'Paketi bıraktın ama teslim alanında (Z) değil.', teslim: 'Paket teslim alanına bırakıldı!' }[komut.islem]);
      break;
    case 'tamam':
      konsol.basari('Bayrağa vardın, görev tamam! Program durduruluyor.');
      break;
    default:
      komutuUygula(ekran, komut);
      ekraniCiz();
  }
}

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
  ses.hazirla();
  ses.sifirla();
  // Her çalıştırma boş ekran ve sıfırlanmış motorlarla başlar.
  ekran = ekranOlustur();
  ekraniCiz();
  simulator.motorlariSifirla();
  donanimiYenile();
  const mod = simModu;
  if (mod === 'sahne') {
    sahneyiBaslat();
  } else {
    sekmeAc($('sekme-robot'));
  }
  calismaBaslangici = Date.now();
  konsol.bilgi(yavas ? 'Program yavaş çekimde çalışıyor...' : 'Program çalışıyor...');
  calismaGorunumu(true);

  calisma = programCalistir(jsKoduUret(calismaAlani), {
    komutGeldi,
    yavas,
    donanim: guncelDonanim(),
    sahne: mod === 'sahne' ? aktifSahne.sahne : null,
    dinliyor: () => konsol.bilgi('Program olayları bekliyor (sensör, düğme...). Bitirmek için Durdur\'a bas.'),
  });
  const { durum: sonuc, mesaj, sinir } = await calisma.sonuc;
  calisma = null;
  calismaAlani.highlightBlock(null);
  simulator.motorlariDurdur();
  ses.durdur();
  calismaGorunumu(false);
  SONUC_MESAJI[sonuc](mesaj, sinir, mod);
}

const calistirVeyaDurdur = () => (calisma ? calisma.durdur() : calistir());
$('calistir').onclick = calistirVeyaDurdur;
$('yeniden-baslat').onclick = async () => {
  if (calisma) {
    const bitis = calisma.sonuc;
    calisma.durdur();
    await bitis;
  }
  calistir();
};
document.addEventListener('keydown', (olay) => {
  if (olay.key === 'Enter' && (olay.ctrlKey || olay.metaKey)) {
    olay.preventDefault();
    calistirVeyaDurdur();
  }
});
$('konsol-temizle').onclick = () => konsol.temizle();

// ---------------------------------------------------------------- Erişilebilirlik ve yazdırma
const YAZI_BOYUTLARI = ['', 'yazi-buyuk', 'yazi-cok-buyuk'];
let yaziBoyutu = tercih.al('yazi', 0);
let kontrast = tercih.al('kontrast', false);
function gorunumuUygula() {
  const kok = document.documentElement;
  kok.classList.remove(...YAZI_BOYUTLARI.filter(Boolean));
  if (YAZI_BOYUTLARI[yaziBoyutu]) kok.classList.add(YAZI_BOYUTLARI[yaziBoyutu]);
  kok.classList.toggle('yuksek-kontrast', kontrast);
  $('kontrast').setAttribute('aria-pressed', String(kontrast));
  calismaAlani.setScale(0.8 + yaziBoyutu * 0.15);
  Blockly.svgResize(calismaAlani);
}
$('kontrast').onclick = () => {
  kontrast = !kontrast;
  tercih.koy('kontrast', kontrast);
  gorunumuUygula();
};
$('yazi-buyut').onclick = () => {
  yaziBoyutu = Math.min(YAZI_BOYUTLARI.length - 1, yaziBoyutu + 1);
  tercih.koy('yazi', yaziBoyutu);
  gorunumuUygula();
};
$('yazi-kucult').onclick = () => {
  yaziBoyutu = Math.max(0, yaziBoyutu - 1);
  tercih.koy('yazi', yaziBoyutu);
  gorunumuUygula();
};
$('klavye').onclick = () => $('klavye-penceresi').showModal();
/** Bloklar için yazdırılabilir SVG: araç kutusu, kaydırma çubukları vb. çıkarılır, bloklara göre kırpılır. */
function bloklarinResmi() {
  const kopya = $('bloklar').querySelector('svg.blocklySvg').cloneNode(true);
  for (const e of kopya.querySelectorAll(
    '.blocklyFlyout, .blocklyScrollbarHorizontal, .blocklyScrollbarVertical, .blocklyZoom, .blocklyTrash, .blocklyMainBackground',
  )) e.remove();
  for (const t of kopya.querySelectorAll('.blocklyBlockCanvas, .blocklyBubbleCanvas')) t.removeAttribute('transform');
  const k = calismaAlani.getBlocksBoundingBox();
  const [g, y] = [k.right - k.left + 20, k.bottom - k.top + 20];
  kopya.setAttribute('viewBox', `${k.left - 10} ${k.top - 10} ${g} ${y}`);
  kopya.setAttribute('width', g);
  kopya.setAttribute('height', y);
  kopya.setAttribute('class', 'blocklySvg yazdir-bloklar');
  return kopya;
}
$('yazdir').onclick = () => {
  $('yazdir-baslik').textContent = $('gorev-metni').textContent;
  $('yazdir-bloklar').replaceChildren(bloklarinResmi());
  $('yazdir-python').textContent = pythonKoduUret(calismaAlani);
  window.print();
};

// ---------------------------------------------------------------- Başlangıç
$('hikaye').textContent = HIKAYE;
kart.tamamlananlar(tamamlanan);
yavasGoster();
sesGoster();
gorunumuUygula();

const saklanan = saklananProgram();
let geriGeldi = false;
if (saklanan) {
  try {
    Blockly.serialization.workspaces.load(saklanan.program, calismaAlani);
    geriGeldi = true;
  } catch {
    calismaAlani.clear();
  }
}
if (!geriGeldi) baslangicBlogunuKoy();
const baslangicGorevi = saklanan && (saklanan.gorev === SERBEST.no || GOREVLER.some((g) => g.no === saklanan.gorev)) ? saklanan.gorev : 1;
gorevSec(baslangicGorevi);
sahneyiBaslat();
const kayitliDers =
  DERS_GORUNUMU.flatMap((s) => s.dersler).find((d) => d.anahtar === tercih.al('ders', null)) ??
  etkinlikBul(tercih.al('ders', null));
if (kayitliDers && baslangicGorevi === SERBEST.no) dersiUygula(kayitliDers);
const kayitliAsama = asamaBul(tercih.al('asama', null));
if (kayitliAsama && baslangicGorevi === SERBEST.no) asamayiUygula(kayitliAsama);
calismaAlani.clearUndo();
guncelle();
donanimiYenile();
konsol.bilgi(
  geriGeldi
    ? 'Hoş geldin! Son programın geri yüklendi.'
    : 'Hoş geldin! Blokları "program başladığında" bloğunun altına tak.',
);
