// Kaynak: ~/Desktop/lego/LEGO EV3 Öğretim Programı.html, "Robot Yolculuğu" kodlama oyunu (kullanıcının sitesi), 18.11.2026.
// 9 dünya, 26 aşama. Harita: S başlangıç, G bayrak, * yıldız, # taş/duvar, r/b renkli karo, o paket, Z teslim alanı.
// yon: 0 yukarı, 1 sağ, 2 aşağı, 3 sol. Simülasyonda bir kare 30 cm (oyunda 20 cm; robotun dönebilmesi için).
// araclar (oyun blokları): f ileri, l/r sola/sağa dön, gl/gr gyro ile dön, grab/drop kol, show ekran, beep ses,
//   rep tekrarla, forever sürekli, wh ... olduğu sürece, dw yap-sonra-bak, if eğer, call kendi bloğum.
// koşullar: fb önüm kapalı, ff önüm açık, rf sağım açık, touch dokunma, cr/cb zemin kırmızı/mavi.
export const DUNYALAR = [
  {
    "ad": "Sıra",
    "aciklama": "Robot komutları yukarıdan aşağıya, sırayla uygular. Sürüş motorlarını kullanırsın.",
    "kavram": "sıralı programlama"
  },
  {
    "ad": "Tekrar",
    "aciklama": "Aynı işi tekrar tekrar yazmak yerine ‘tekrarla’ bloğunu kullan; programın kısalır.",
    "kavram": "döngüler"
  },
  {
    "ad": "Sürekli ve koşullu döngü",
    "aciklama": "‘Sürekli tekrarla’ hiç bitmez. ‘… olduğu sürece’ önce bakar, sonra yapar. ‘Yap, sonra … olduğu sürece’ (do-while) önce yapar, sonra bakar.",
    "kavram": "sürekli, while ve do-while döngüleri"
  },
  {
    "ad": "Mesafe sensörü",
    "aciklama": "Robot çevresine bakıp karar verebilir: ‘eğer … ise … değilse …’. Önündeki duvarı mesafe sensörüyle görür.",
    "kavram": "koşullar"
  },
  {
    "ad": "Renk ve dokunma",
    "aciklama": "Renk sensörü zemini okur, dokunma sensörü çarpmayı hisseder. Bu sensörlerle yol bulursun.",
    "kavram": "sensörle karar"
  },
  {
    "ad": "Kol motoru",
    "aciklama": "Robot kolunu kullanarak paket alır ve teslim eder. Tekrar eden işi kendi bloğuna dönüştürürsün.",
    "kavram": "motor ve fonksiyon"
  },
  {
    "ad": "Kendi bloğun",
    "aciklama": "Sık kullandığın bir diziyi bir kere yaz, ona ad ver, istediğin kadar çağır.",
    "kavram": "fonksiyon (My Block)"
  },
  {
    "ad": "Hata avı",
    "aciklama": "Program çalışmıyor! Hatayı bul, düzelt. Gerçek programcılar zamanlarının çoğunu bunu yaparak geçirir.",
    "kavram": "hata ayıklama"
  },
  {
    "ad": "Tam donanım",
    "aciklama": "Final görevleri: robotunun bütün parçalarını kullanırsın: motorlar, kol, renk, mesafe, dokunma, gyro, ekran ve ses.",
    "kavram": "hepsi birlikte"
  }
];

export const ASAMALAR = [
  {
    "no": 1,
    "id": "0",
    "dunya": 0,
    "baslik": "Evden çık",
    "hikaye": "Robot evinin kapısında, bayrak (hedef) ise sokağın köşesindeki otobüs durağı. Robotu durağa götür. Komutlar yukarıdan aşağıya sırayla çalışır. Her ‘ileri’ bloğu robotu bir kare (30 cm) götürür.",
    "ipucu": "Bayrak 4 kare ileride. Dört kez ‘ileri’ ekle.",
    "harita": [
      ".....",
      ".....",
      "S...G"
    ],
    "yon": 1,
    "araclar": [
      "f"
    ],
    "kosullar": [],
    "par": 4
  },
  {
    "no": 2,
    "id": "1",
    "dunya": 0,
    "baslik": "Okul yolunda köşeyi dön",
    "hikaye": "Robot yukarı bakıyor; okul ise sağ üstte. Okula varmak için bir yerde dönmen gerekiyor.",
    "ipucu": "Önce iki kare yukarı, sonra sağa dön, sonra iki kare ileri.",
    "harita": [
      "....",
      "..G.",
      "....",
      "S..."
    ],
    "yon": 0,
    "araclar": [
      "f",
      "l",
      "r"
    ],
    "kosullar": [],
    "par": 5
  },
  {
    "no": 3,
    "id": "2",
    "dunya": 0,
    "baslik": "Market alışverişi",
    "hikaye": "Annenin listesinde iki şey var: ekmek ve süt (yıldızlar). Marketten ikisini de al, sonra eve (bayrak) dön. Taşlar (duvarlar) arasından geçemezsin.",
    "ipucu": "Sağa git, aşağı in, sola dön. Yolu önce kâğıda çiz.",
    "harita": [
      "S*..",
      "###.",
      "G.*."
    ],
    "yon": 1,
    "araclar": [
      "f",
      "l",
      "r"
    ],
    "kosullar": [],
    "par": 10,
    "not": "Bu program 10 blok oldu. Aynı blokları çok yazmak yorucu değil mi? Sıradaki dünyada bunu kısaltacaksın."
  },
  {
    "no": 4,
    "id": "3",
    "dunya": 1,
    "baslik": "Uzun koridorda sınıf",
    "hikaye": "Okul koridoru çok uzun. Aynı bloğu 8 kez yazmak yerine ‘tekrarla’ bloğunu kullan; sınıf (bayrak) koridorun sonunda.",
    "ipucu": "‘Tekrarla’ ekle, sayıyı 8 yap, ardından ‘ileri’ ekle; yeni blok otomatik olarak tekrarın içine girer.",
    "harita": [
      "#########",
      "S.......G",
      "#########"
    ],
    "yon": 1,
    "araclar": [
      "f",
      "l",
      "r",
      "rep"
    ],
    "kosullar": [],
    "par": 2
  },
  {
    "no": 5,
    "id": "4",
    "dunya": 1,
    "baslik": "Apartman merdiveni",
    "hikaye": "Her kat sahanlığında bir paket bırakman gerekiyor (yıldızlar). Aynı küçük desen basamaklarda tekrar ediyor; en üst kata (bayrak) çık.",
    "ipucu": "Desen: ileri, sola dön, ileri, sağa dön. Bunu 4 kez tekrarla.",
    "harita": [
      "####G",
      "###*.",
      "##*.#",
      "#*.##",
      "S.###"
    ],
    "yon": 1,
    "araclar": [
      "f",
      "l",
      "r",
      "rep"
    ],
    "kosullar": [],
    "par": 5
  },
  {
    "no": 6,
    "id": "5",
    "dunya": 1,
    "baslik": "Bahçe çitinin çevresi",
    "hikaye": "Bahçıvan robot çitin çevresini dolaşıp başladığı yere dönmeli ve üç köşedeki fidanı (yıldız) sulamalı. Tekrarın içinde tekrar da olabilir.",
    "ipucu": "Bir kenar: 3 kez ileri, sonra sola dön. Bunu 4 kez tekrarla. İçteki tekrar 3, dıştaki 4.",
    "harita": [
      ".*..*.",
      "......",
      "......",
      ".S..*."
    ],
    "yon": 1,
    "araclar": [
      "f",
      "l",
      "r",
      "rep"
    ],
    "kosullar": [],
    "par": 4,
    "hedefKare": [
      1,
      3
    ]
  },
  {
    "no": 7,
    "id": "n1",
    "dunya": 2,
    "baslik": "Otoyolda sabit hızla",
    "hikaye": "Otoyolun kaç kare olduğunu saymak zorunda değilsin; arabanın sürücüsü varış noktasını görünce durur. ‘Sürekli tekrarla’ bloğunun içine ‘ileri’ koy; robot bayrağa (varış) gelince görev biter.",
    "ipucu": "‘Sürekli tekrarla’ ekle, sonra ‘ileri’ ekle. Sayı yok!",
    "harita": [
      "###########",
      "S.........G",
      "###########"
    ],
    "yon": 1,
    "araclar": [
      "f",
      "rep",
      "forever"
    ],
    "kosullar": [],
    "par": 2,
    "ogrenilen": "‘Sürekli tekrarla’ kendi kendine durmaz; oyunda bayrak görevi bitirdi. Gerçek robotta durdurmak için bir koşul gerekir."
  },
  {
    "no": 8,
    "id": "n2",
    "dunya": 2,
    "baslik": "Garajın sonunda dur",
    "hikaye": "Garaja girerken arka duvara çarpmadan dur ve Brick ekranı ile haber ver. ‘… olduğu sürece tekrarla’ önce koşula bakar: önün açıksa ilerler, değilse hiç çalışmaz.",
    "ipucu": "‘Önüm açık olduğu sürece tekrarla’ içine ‘ileri’ koy. Döngüden sonra ‘göster’ ekle.",
    "harita": [
      "###########",
      "S.........G",
      "###########"
    ],
    "yon": 1,
    "araclar": [
      "f",
      "rep",
      "forever",
      "wh",
      "show"
    ],
    "kosullar": [
      "ff",
      "fb"
    ],
    "par": 3,
    "ogrenilen": "‘Sürekli tekrarla’ duvara çarpardı; ‘olduğu sürece’ duvarın önünde durdu.",
    "haberVer": true
  },
  {
    "no": 9,
    "id": "n3",
    "dunya": 2,
    "baslik": "Kırmızı halıdan geç",
    "hikaye": "Evin koridorunda kırmızı bir halı var. Robot süpürge halının üstünde olduğu sürece ilerlesin; halı bitince dursun, o da bayrak. Robot halının dışından başlıyor, bu yüzden önce bir kez ilerlemesi gerek.",
    "ipucu": "‘Yap, sonra zemin kırmızı olduğu sürece tekrarla’ kullan; içine ‘ileri’ koy. Önce yapar, sonra renge bakar.",
    "harita": [
      "######",
      "SrrrrG",
      "######"
    ],
    "yon": 1,
    "araclar": [
      "f",
      "rep",
      "wh",
      "dw"
    ],
    "kosullar": [
      "cr"
    ],
    "par": 2,
    "ogrenilen": "Do-while (yap-sonra-bak) döngüsü gövdeyi en az bir kez çalıştırır. ‘Olduğu sürece’ döngüsüyle bunu çözmek için fazladan bir ‘ileri’ gerekirdi."
  },
  {
    "no": 10,
    "id": "n4",
    "dunya": 2,
    "baslik": "Sokağı dolaş, çöpleri topla",
    "hikaye": "Mahalle sokağı uzun; kaç adım atacağını saymak zor. ultrasonik sensör ile duvarı (bina köşesi) gör, ‘sürekli tekrarla’ ile sokağı dolaş, yerdeki çöpleri (yıldızlar) topla.",
    "ipucu": "Sürekli tekrarla içine: eğer önüm kapalı → sağa dön, değilse → ileri.",
    "harita": [
      "S..*...",
      "G#####.",
      ".#####*",
      ".#####.",
      "...*..."
    ],
    "yon": 1,
    "araclar": [
      "f",
      "l",
      "r",
      "rep",
      "if",
      "forever",
      "wh"
    ],
    "kosullar": [
      "fb"
    ],
    "par": 4,
    "ogrenilen": "Tekrar sayısını bilmeyince ‘sürekli tekrarla’ en doğal seçimdir."
  },
  {
    "no": 11,
    "id": "n5",
    "dunya": 2,
    "baslik": "Odayı topla",
    "hikaye": "Robot odanın dört duvarını dolaşıp başladığı yere dönecek ve üç köşedeki oyuncağı (yıldız) toplayacak. Her kenar için ‘önüm açık olduğu sürece ileri’ kullan.",
    "ipucu": "4 kez tekrarla: (önüm açık olduğu sürece → ileri) sonra sağa dön.",
    "harita": [
      "S....*",
      "......",
      "......",
      "*....*"
    ],
    "yon": 1,
    "araclar": [
      "f",
      "l",
      "r",
      "rep",
      "if",
      "forever",
      "wh",
      "dw"
    ],
    "kosullar": [
      "ff",
      "fb"
    ],
    "par": 4,
    "ogrenilen": "Döngünün içinde başka bir döngü: dıştaki 4 kenarı, içteki her kenarın uzunluğunu halletti.",
    "hedefKare": [
      0,
      0
    ]
  },
  {
    "no": 12,
    "id": "6",
    "dunya": 3,
    "baslik": "Yolun sonunda dön",
    "hikaye": "Park yolu duvarla bitene kadar gidiyor ve robot yolu bilmiyor. Tıpkı park sensörü gibi ultrasonik sensör ile önünü kontrol et: duvar varsa sağa dön, yoksa ileri git.",
    "ipucu": "Tekrarla (20) içine ‘eğer önüm kapalı’ koy. Eğer kısmına ‘sağa dön’, değilse kısmına ‘ileri’.",
    "harita": [
      "S...",
      "G##.",
      ".##.",
      "...."
    ],
    "yon": 1,
    "araclar": [
      "f",
      "l",
      "r",
      "rep",
      "if",
      "forever"
    ],
    "kosullar": [
      "fb"
    ],
    "par": 4,
    "ogrenilen": "Robot yolun şeklini bilmiyordu; sadece önünün kapalı olup olmadığına baktı."
  },
  {
    "no": 13,
    "id": "7",
    "dunya": 3,
    "baslik": "Sola kıvrılan patika",
    "hikaye": "Bu sefer orman patikası sola kıvrılıyor. Yol boyunca mantarları (yıldızlar) topla ve kamp yerine (bayrak) var.",
    "ipucu": "Geçen seviyedeki programın aynısı, ama duvarda sola dön.",
    "harita": [
      "..*.S",
      ".###G",
      "*###.",
      ".###.",
      "..*.."
    ],
    "yon": 3,
    "araclar": [
      "f",
      "l",
      "r",
      "rep",
      "if",
      "forever"
    ],
    "kosullar": [
      "fb"
    ],
    "par": 4
  },
  {
    "no": 14,
    "id": "8",
    "dunya": 3,
    "baslik": "Bahçe labirenti",
    "hikaye": "Parktaki çit labirentinden çıkış yolunu bul! Ünlü bir kural var: sağ elini duvarda tut. Sağdaki mesafe sensörün açıksa dön ve ilerle; değilse önün açıksa ilerle; o da kapalıysa sola dön.",
    "ipucu": "Tekrarla içine: eğer ‘sağım açık’ → (sağa dön, ileri); değilse → eğer ‘önüm kapalı’ → (sola dön), değilse → (ileri).",
    "harita": [
      "S.....#",
      "###.#.#",
      "....#.#",
      ".#####.",
      "......G"
    ],
    "yon": 1,
    "araclar": [
      "f",
      "l",
      "r",
      "rep",
      "if",
      "forever"
    ],
    "kosullar": [
      "fb",
      "rf"
    ],
    "par": 7,
    "ogrenilen": "İç içe kararlar: kararın içinde karar."
  },
  {
    "no": 15,
    "id": "9",
    "dunya": 4,
    "baslik": "Kırmızı işaretli kavşak",
    "hikaye": "Şehirde yerdeki kırmızı işaretler ‘burada sola dön’ demek. Robotun altındaki renk sensörü zemini okur. Kırmızı görünce sola dön, sonra ileri git; kırmızı değilse ileri git.",
    "ipucu": "Tekrarla içine ‘eğer zemin kırmızı’ koy: ise → (sola dön, ileri); değilse → ileri.",
    "harita": [
      "G..r#",
      "###.#",
      "###.#",
      "S..r#"
    ],
    "yon": 1,
    "araclar": [
      "f",
      "l",
      "r",
      "rep",
      "if",
      "forever"
    ],
    "kosullar": [
      "cr"
    ],
    "par": 5,
    "ogrenilen": "Renk sensörü yola işaret koymanı sağlar: zemin robota yön söyler."
  },
  {
    "no": 16,
    "id": "10",
    "dunya": 4,
    "baslik": "İki işaretli yol",
    "hikaye": "Fabrikanın yerinde iki işaret var: kırmızı = sola dön, mavi = sağa dön. Taşıyıcı robot için iki ayrı karar gerekecek.",
    "ipucu": "Tekrarla içine: eğer kırmızı → (sola dön, ileri); değilse → eğer mavi → (sağa dön, ileri); değilse → ileri.",
    "harita": [
      "######",
      "##b..G",
      "##.###",
      "S.r###"
    ],
    "yon": 1,
    "araclar": [
      "f",
      "l",
      "r",
      "rep",
      "if",
      "forever"
    ],
    "kosullar": [
      "cr",
      "cb"
    ],
    "par": 8,
    "ogrenilen": "Üç durum (kırmızı, mavi, başka) için iç içe iki karar yazdın."
  },
  {
    "no": 17,
    "id": "11",
    "dunya": 4,
    "baslik": "Otomatik kapı tamponu",
    "hikaye": "dokunma sensörü robotun burnundaki tampondur: market arabası gibi duvara değince basılır. Duvara dokununca sağa dön, dokunmuyorsa ileri git. Yıldızları da topla.",
    "ipucu": "Tekrarla (20) içine ‘eğer dokunma sensörü basılı’ koy. Ise → sağa dön; değilse → ileri.",
    "harita": [
      "S.*.",
      "G##.",
      ".##*",
      "...."
    ],
    "yon": 1,
    "araclar": [
      "f",
      "l",
      "r",
      "rep",
      "if",
      "forever"
    ],
    "kosullar": [
      "touch"
    ],
    "par": 4,
    "ogrenilen": "Dokunma sensörü robota ‘çarptım’ bilgisi verir."
  },
  {
    "no": 18,
    "id": "12",
    "dunya": 5,
    "baslik": "Kargoyu teslim et",
    "hikaye": "Kapının önünde bir kargo paketi var. Kurye robot orta motor ile kolunu indirip paketi tutsun, teslim noktasına (Z) götürüp kolunu kaldırarak bıraksın, sonra bayrağa (araç) gitsin.",
    "ipucu": "Üç kare ileri git, kolu indir (tut). Sola dön, iki kare ileri git (Z), kolu kaldır (bırak). Sağa dön, ileri.",
    "harita": [
      "...ZG",
      ".....",
      "S..o."
    ],
    "yon": 1,
    "araclar": [
      "f",
      "l",
      "r",
      "rep",
      "grab",
      "drop"
    ],
    "kosullar": [],
    "par": 9,
    "ogrenilen": "Kol motoru robota nesne taşıma gücü verir."
  },
  {
    "no": 19,
    "id": "13",
    "dunya": 5,
    "baslik": "Üç adrese kargo",
    "hikaye": "Mahallede üç yönde üç paket var. Her paket için aynı yolculuk: git, tut, geri dön, bırak. Bunu bir kere yazıp ‘Kendi bloğum’ olarak çağır.",
    "ipucu": "Kendi bloğuma: ileri, ileri, tut, sola, sola, ileri, ileri, bırak. Ana programda: bloğu iki kez çağır, sağa dön, bir kez daha çağır.",
    "harita": [
      "..o..",
      ".....",
      "..S.o",
      ".....",
      "..o.."
    ],
    "yon": 0,
    "araclar": [
      "f",
      "l",
      "r",
      "rep",
      "grab",
      "drop",
      "call"
    ],
    "kosullar": [],
    "par": 12,
    "ogrenilen": "Bir yolculuğu fonksiyona çevirmek programı üçte bire indirdi.",
    "hedefKare": [
      2,
      2
    ],
    "teslimKare": [
      2,
      2
    ],
    "kendiBlok": true
  },
  {
    "no": 20,
    "id": "14",
    "dunya": 6,
    "baslik": "Çukurların etrafından",
    "hikaye": "Yolda üç çukur var. Bisikletle bir çukurun etrafından dolanmak 8 blok sürüyor. Bunu bir kere yazıp ‘Kendi bloğum’ olarak çağır.",
    "ipucu": "Kendi bloğuma şunu yaz: sola dön, ileri, sağa dön, ileri, ileri, sağa dön, ileri, sola dön. Sonra ana programda ileri ve ‘Kendi bloğum’ bloklarını sırayla kullan.",
    "harita": [
      "...........",
      "S.#.#..#..G",
      "..........."
    ],
    "yon": 1,
    "araclar": [
      "f",
      "l",
      "r",
      "rep",
      "call"
    ],
    "kosullar": [],
    "par": 15,
    "not": "Bloğu 3 kez yazsaydın 28 blok olurdu.",
    "kendiBlok": true
  },
  {
    "no": 21,
    "id": "15",
    "dunya": 6,
    "baslik": "Yolu görerek ilerle",
    "hikaye": "Yoldaki çukurların yeri değişti ama robot kendi karar verebilir: ultrasonik sensör önü kapalı görürse çukurun etrafından dolansın, değilse ilerlesin.",
    "ipucu": "Önce Kendi bloğumu yaz (taşın etrafından dolan). Ana programda: tekrarla → eğer önüm kapalı → Kendi bloğum, değilse ileri.",
    "harita": [
      "............",
      "S..#..#.#..G",
      "............"
    ],
    "yon": 1,
    "araclar": [
      "f",
      "l",
      "r",
      "rep",
      "if",
      "call",
      "forever"
    ],
    "kosullar": [
      "fb"
    ],
    "par": 12,
    "ogrenilen": "Tekrar + karar + kendi blok: üçü birlikte güçlü bir program.",
    "kendiBlok": true
  },
  {
    "no": 22,
    "id": "16",
    "dunya": 7,
    "baslik": "Navigasyon yanlış yöne götürüyor",
    "hikaye": "Bu program evden okula varmalıydı ama robot duvara çarpıyor. Hatayı bul ve düzelt.",
    "ipucu": "Dönme yönüne bak: bayrak yukarı çıktıktan sonra hangi tarafta?",
    "harita": [
      "...G",
      "....",
      "....",
      "S..."
    ],
    "yon": 0,
    "araclar": [
      "f",
      "l",
      "r"
    ],
    "kosullar": [],
    "par": 7,
    "baslangicProgrami": {
      "main": [
        {
          "k": "f"
        },
        {
          "k": "f"
        },
        {
          "k": "f"
        },
        {
          "k": "l"
        },
        {
          "k": "f"
        },
        {
          "k": "f"
        },
        {
          "k": "f"
        }
      ],
      "fn": []
    }
  },
  {
    "no": 23,
    "id": "17",
    "dunya": 7,
    "baslik": "Bahçe turu yarım kalmış",
    "hikaye": "Robot bahçenin çevresini bir tur atıp başladığı yere dönmeliydi ama yarıda bırakıyor. Neresi eksik?",
    "ipucu": "Karenin kaç kenarı var? Tekrar sayısına dokun ve değiştir.",
    "harita": [
      ".*.*.",
      ".....",
      ".S.*."
    ],
    "yon": 1,
    "araclar": [
      "f",
      "l",
      "r",
      "rep"
    ],
    "kosullar": [],
    "par": 4,
    "hedefKare": [
      1,
      2
    ],
    "baslangicProgrami": {
      "main": [
        {
          "k": "rep",
          "n": 3,
          "body": [
            {
              "k": "rep",
              "n": 2,
              "body": [
                {
                  "k": "f"
                }
              ]
            },
            {
              "k": "l"
            }
          ]
        }
      ],
      "fn": []
    }
  },
  {
    "no": 24,
    "id": "18",
    "dunya": 7,
    "baslik": "Tarif karışmış",
    "hikaye": "Yemek tarifindeki gibi bloklar doğru ama sırası yanlış (önce yumurta, sonra kırmak!). Robot çite çarpıyor. Hangi blok yanlış yerde?",
    "ipucu": "Robot ikinci karede dönmeli. Dönmeden önce bir kare daha gitmesi gerekiyor.",
    "harita": [
      "#####",
      "....G",
      ".####",
      "S####"
    ],
    "yon": 0,
    "araclar": [
      "f",
      "l",
      "r"
    ],
    "kosullar": [],
    "par": 7,
    "baslangicProgrami": {
      "main": [
        {
          "k": "f"
        },
        {
          "k": "r"
        },
        {
          "k": "f"
        },
        {
          "k": "f"
        },
        {
          "k": "f"
        },
        {
          "k": "f"
        },
        {
          "k": "f"
        }
      ],
      "fn": []
    }
  },
  {
    "no": 25,
    "id": "19",
    "dunya": 8,
    "baslik": "Deprem arama kurtarma 1",
    "hikaye": "Koridorda mavi zeminin altında bir ilaç kutusu var. Robot renk sensörü ile mavi zemini tanıyıp kolunu indirerek kutuyu alsın, sağlık noktasına (Z) götürüp bıraksın. Koridorun sonundaki ultrasonik sensör duvarı gördüğünde Brick ekranı ve hoparlörle ‘görev tamam’ desin.",
    "ipucu": "İleri, ileri; eğer zemin mavi → kolu indir (tut). İleri, ileri; kolu kaldır (bırak). İleri; eğer önüm kapalı → ekranda göster, bip çal.",
    "harita": [
      "######",
      "S.b.ZG",
      "######"
    ],
    "yon": 1,
    "araclar": [
      "f",
      "rep",
      "if",
      "grab",
      "drop",
      "show",
      "beep"
    ],
    "kosullar": [
      "cb",
      "fb"
    ],
    "par": 11,
    "ogrenilen": "Sürüş, renk, mesafe, kol, ekran ve ses: altı parça tek görevde.",
    "paketKareleri": [
      [
        2,
        1
      ]
    ],
    "haberVer": true
  },
  {
    "no": 26,
    "id": "20",
    "dunya": 8,
    "baslik": "Arama kurtarma finali",
    "hikaye": "Final görevi! Robot koridorun sonuna dokunma sensörü ile dokunsun, gyro sensörü ile sola dönsün, kırmızı zeminde duran yardım paketini renk sensörü ile bulup alsın, yukarıdaki sağlık noktasına bıraksın, sonra bayrağın yanında Brick ekranı ve ses ile ekibe haber versin. Dönüşler gyro ile yapılmalı.",
    "ipucu": "4 kare ileri; eğer dokunma sensörü basılı → gyro ile sola dön. 2 kare ileri; eğer zemin kırmızı → kolu indir. İleri; eğer önüm kapalı → kolu kaldır. Gyro ile sola dön, ileri, ekranda göster, bip çal.",
    "harita": [
      "###GZ",
      "####r",
      "####.",
      "S...."
    ],
    "yon": 1,
    "araclar": [
      "f",
      "l",
      "r",
      "gl",
      "gr",
      "rep",
      "if",
      "grab",
      "drop",
      "show",
      "beep"
    ],
    "kosullar": [
      "touch",
      "fb",
      "cr"
    ],
    "par": 15,
    "ogrenilen": "Bütün envanterini tek programda kullandın: tam donanımlı robot!",
    "paketKareleri": [
      [
        4,
        1
      ]
    ],
    "haberVer": true
  }
];
