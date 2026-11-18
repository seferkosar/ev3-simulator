// Kaynak: ~/Desktop/lego/LEGO EV3 Öğretim Programı.html (kullanıcının öğretim programı), 18.11.2026.
// Haftalık dersler: başlık, kazanım, disiplinler, anlatım önerisi, yaygın yanılgı ve EV3 Classroom
// örnek programları (kısaltılmış blok listeleri; ~ açılır liste seçeneği, "Türkçe|English").
// Bloklarımıza çevirme: src/dersler/donustur.js
export const SEVIYELER = [
  {
    "no": 1,
    "ad": "Kaşifler",
    "alt": "İlkokul 3–4 (2. sınıf için yönlendirmeli), EV3 Core Set, EV3 Classroom",
    "haftalar": [
      {
        "no": 1,
        "baslik": "Robot nedir? Kutuyu tanıyoruz",
        "kazanim": "Robotu algıla, karar ver, harekete geç döngüsüyle tanımlar; brick, motor ve renk sensörünü adlandırır.",
        "disiplin": "Fen Bilimleri, Türkçe",
        "anlatim": "Robotun beyni küçük bir kutudur; yalnızca bizim yazdığımız tarifi okur.",
        "yanilgi": "“Robot kendi kendine düşünür” yanılgısı. Yanlış komutta robotun yanlışı aynen yaptığını gösterin.",
        "proje": false,
        "programlar": []
      },
      {
        "no": 2,
        "baslik": "Brick’i uyandıralım",
        "kazanim": "Brick’i EV3 Classroom’a bağlar; bloklarla ekran, ışık ve ses çıktısı verir.",
        "disiplin": "Matematik, Türkçe",
        "anlatim": "Bloklar tarif adımlarıdır: yukarıdan aşağı okunur.",
        "yanilgi": "“Program başladığında” bloğu unutulur ya da yanlış brick’e bağlanılır. Brick’leri numaralayın.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "img",
              "~Sevgi|Love"
            ],
            [
              "beep",
              60,
              0.5
            ],
            [
              "wait",
              2
            ],
            [
              "clear"
            ]
          ]
        ]
      },
      {
        "no": 3,
        "baslik": "Motor ve tekerlek, ilk araç",
        "kazanim": "Motoru belirli tur ve yönde çalıştırır; bir turda gidilen yolu ölçer.",
        "disiplin": "Matematik, Fen Bilimleri",
        "anlatim": "Tekerlek bir turda kendi çevresi kadar yol alır.",
        "yanilgi": "Bir motor ters döner, araç yerinde döner. Tekerleğe işaret koyup yönü kontrol edin.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "mvfor",
              "~ileri|forward",
              1,
              "~dönüş|rotations"
            ]
          ]
        ]
      },
      {
        "no": 4,
        "baslik": "Sıra, algoritma ve hata avı",
        "kazanim": "Komutları doğru sırayla dizer; programdaki hatayı bulup düzeltir.",
        "disiplin": "Matematik, Hayat Bilgisi",
        "anlatim": "Böcek (bug) bulmak iyidir; program böyle güçlenir.",
        "yanilgi": "Dönüşün kaç tur olduğu tahmin edilir. Deneyerek bulun ve deftere yazın.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "mvfor",
              "~ileri|forward",
              2,
              "~dönüş|rotations"
            ],
            [
              "mvfor",
              "~sağ|right",
              1,
              "~dönüş|rotations"
            ],
            [
              "mvfor",
              "~ileri|forward",
              1,
              "~dönüş|rotations"
            ],
            [
              "mvstop"
            ]
          ]
        ]
      },
      {
        "no": 5,
        "baslik": "Dişliler ve döner mekanizmalar",
        "kazanim": "Büyük ve küçük dişlinin hız ve kuvvet farkını açıklar.",
        "disiplin": "Fen Bilimleri",
        "anlatim": "Küçük dişli çok koşar; büyük dişli az koşar ama güçlüdür.",
        "yanilgi": "Dişliler tam oturmaz ve kayar. Önce elle çevirerek deneyin.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "morun",
              "~A",
              "~saat yönünde|clockwise",
              10,
              "~saniye|seconds"
            ]
          ]
        ]
      },
      {
        "no": 6,
        "baslik": "Kollar ve kaldıraç",
        "kazanim": "Kaldıracın dayanak, yük ve kuvvet noktasını gösterir; motorlu bir kol yapar.",
        "disiplin": "Fen Bilimleri, Matematik",
        "anlatim": "Dayanağa yakın itersen ağır, uzaktan itersen hafif gelir.",
        "yanilgi": "Kol kısa kalır ve yükü kaldıramaz. Kolu uzatıp dayanağı kaydırın.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "morun",
              "~A",
              "~saat yönünde|clockwise",
              0.25,
              "~dönüş|rotations"
            ],
            [
              "wait",
              1
            ],
            [
              "morun",
              "~A",
              "~saat yönünün tersine|counterclockwise",
              0.25,
              "~dönüş|rotations"
            ]
          ]
        ]
      },
      {
        "no": 7,
        "baslik": "Renk sensörü ve trafik ışığı",
        "kazanim": "Renk sensörünün okuduğu rengi kullanarak “eğer … ise” kararı verdirir.",
        "disiplin": "Hayat Bilgisi, Fen Bilimleri",
        "anlatim": "Sensör robotun gözüdür; ışık değişince gördüğü de değişir.",
        "yanilgi": "Kart uzak ya da eğik tutulur. Kartı sensöre 1–2 cm yaklaştırın.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "until",
              [
                "iscolor",
                "~3",
                "~kırmızı|red"
              ]
            ],
            [
              "light",
              "~kırmızı|red"
            ],
            [
              "beep",
              60,
              0.5
            ],
            [
              "until",
              [
                "iscolor",
                "~3",
                "~yeşil|green"
              ]
            ],
            [
              "light",
              "~yeşil|green"
            ],
            [
              "morun",
              "~A",
              "~saat yönünde|clockwise",
              2,
              "~dönüş|rotations"
            ]
          ]
        ]
      },
      {
        "no": 8,
        "baslik": "Döngü ve dans eden robot",
        "kazanim": "Tekrarlayan davranışı döngüyle kısaltır; bir örüntüyü kodlar.",
        "disiplin": "Matematik, Müzik, Beden Eğitimi",
        "anlatim": "Aynı şeyi on kez yazmak yerine “bunu on kez yap” deriz.",
        "yanilgi": "Blok döngünün dışında kalır ve bir kez çalışır. Döngünün içini elle gösterin.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "rep",
              4,
              [
                [
                  "img",
                  "~Sevgi|Love"
                ],
                [
                  "beep",
                  64,
                  0.3
                ],
                [
                  "morun",
                  "~A",
                  "~saat yönünde|clockwise",
                  0.5,
                  "~dönüş|rotations"
                ],
                [
                  "morun",
                  "~A",
                  "~saat yönünün tersine|counterclockwise",
                  0.5,
                  "~dönüş|rotations"
                ]
              ]
            ]
          ]
        ]
      },
      {
        "no": 9,
        "baslik": "Eğim, sarsıntı ve deprem alarmı",
        "kazanim": "Gyro sensörünün açı değişimini kullanır; alarm sistemi tasarlar.",
        "disiplin": "Hayat Bilgisi, Fen Bilimleri",
        "anlatim": "Gyro sensörü robotun ne kadar eğildiğini ya da döndüğünü söyler; tepsi sallanınca açı değişir.",
        "yanilgi": "Alarm sürekli çalar ya da hiç çalmaz. Gyro’yu kule hareketsizken sıfırlayın; eşiği (10 derece) sınıfla tartışın.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "resetangle",
              "~2"
            ],
            [
              "forever",
              [
                [
                  "if",
                  [
                    "gt",
                    [
                      "angle",
                      "~2"
                    ],
                    10
                  ],
                  [
                    [
                      "light",
                      "~kırmızı|red"
                    ],
                    [
                      "beep",
                      72,
                      1
                    ],
                    [
                      "wait",
                      3
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      },
      {
        "no": 10,
        "baslik": "Hız yarışı ve ilk veri",
        "kazanim": "Aynı mesafeyi en kısa sürede giden aracı ölçerek bulur; sonuçları tabloya yazar.",
        "disiplin": "Matematik, Fen Bilimleri",
        "anlatim": "Tek ölçüm şans olabilir; bu yüzden üç kez deneriz.",
        "yanilgi": "Başlangıç çizgisi değişir. Ön tekerlek hep aynı çizgiye konur.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "mvfor",
              "~ileri|forward",
              5,
              "~dönüş|rotations"
            ]
          ]
        ]
      },
      {
        "no": 11,
        "baslik": "Hikâye anlatan robot",
        "kazanim": "Bir hikâyeyi üç sahneye bölüp ışık, ses ve hareketle anlatır.",
        "disiplin": "Türkçe, Görsel Sanatlar",
        "anlatim": "Programın da bir hikâye gibi başı, ortası ve sonu vardır.",
        "yanilgi": "Sahneler arasında bekleme yoktur; hikâye çok hızlı akar.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "img",
              "~Uyanık|Awake"
            ],
            [
              "beep",
              60,
              0.5
            ],
            [
              "wait",
              1
            ],
            [
              "morun",
              "~A",
              "~saat yönünde|clockwise",
              1,
              "~dönüş|rotations"
            ],
            [
              "img",
              "~Sersem|Dizzy"
            ],
            [
              "wait",
              1
            ],
            [
              "img",
              "~Sevgi|Love"
            ],
            [
              "beep",
              72,
              0.5
            ]
          ]
        ]
      },
      {
        "no": 12,
        "baslik": "Mucit pazarı",
        "kazanim": "Modelin ne yaptığını, nasıl çalıştığını ve neyi değiştirdiğini anlatarak sunar.",
        "disiplin": "Türkçe, Sosyal Bilgiler",
        "anlatim": "Bir mühendis, yaptığını anlatabildiği kadar iyidir.",
        "yanilgi": "Geri bildirim “çok güzel” ile sınırlı kalır. “Neden iyi çalıştı?” sorusunu ekleyin.",
        "proje": false,
        "programlar": []
      },
      {
        "no": 13,
        "baslik": "Proje: problemi seç",
        "kazanim": "Şehirden bir problem seçilir, tasarım cümlesi yazılır, iki fikir çizilir.",
        "yanilgi": "",
        "proje": true,
        "programlar": []
      },
      {
        "no": 14,
        "baslik": "Proje: prototipi kur",
        "kazanim": "Model kurulur ve ilk program yazılır.",
        "yanilgi": "",
        "proje": true,
        "programlar": []
      },
      {
        "no": 15,
        "baslik": "Proje: test et ve iyileştir",
        "kazanim": "Model test edilir, sonuç tabloya yazılır, bir şey değiştirilir.",
        "yanilgi": "",
        "proje": true,
        "programlar": []
      },
      {
        "no": 16,
        "baslik": "Proje: aile günü ve sergi",
        "kazanim": "Model, defter ve kısa video sergilenir.",
        "yanilgi": "",
        "proje": true,
        "programlar": []
      }
    ]
  },
  {
    "no": 2,
    "ad": "Mühendisler",
    "alt": "Ortaokul 5–6, EV3 Core Set, EV3 Classroom",
    "haftalar": [
      {
        "no": 1,
        "baslik": "Merhaba EV3",
        "kazanim": "EV3 brick’in tuşlarını, ekranını ve portlarını tanır; EV3 Classroom’a bağlanıp ilk programı çalıştırır.",
        "disiplin": "Bilişim, Fen Bilimleri",
        "anlatim": "Brick küçük bir bilgisayardır: kodu bilgisayarda yazar, brick’e yollarız.",
        "yanilgi": "Programın bilgisayarda çalıştığı sanılır. Brick’e indirildiğini canlı gösterin.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "write",
              "Merhaba|Hello"
            ],
            [
              "beep",
              60,
              0.5
            ],
            [
              "wait",
              2
            ],
            [
              "clear"
            ]
          ]
        ]
      },
      {
        "no": 2,
        "baslik": "Hareket ve sıralama",
        "kazanim": "Hareket bloklarıyla robotu ilerletir ve döndürür; sıranın sonucu değiştirdiğini açıklar.",
        "disiplin": "Matematik, Fen Bilimleri",
        "anlatim": "Program bir tariftir: sıra değişirse sonuç değişir.",
        "yanilgi": "Robot düz gitmez. Zemini ve tekerlekleri silin, motor hızlarını kontrol edin.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "mvfor",
              "~düz: 0|straight: 0",
              2,
              "~dönüş|rotations"
            ],
            [
              "mvfor",
              "~sağ: 100|right: 100",
              0.5,
              "~dönüş|rotations"
            ],
            [
              "mvfor",
              "~düz: 0|straight: 0",
              1,
              "~dönüş|rotations"
            ],
            [
              "mvstop"
            ]
          ]
        ]
      },
      {
        "no": 3,
        "baslik": "Port View ve ölçerek programlama",
        "kazanim": "Port View ile motor ve sensör değerini okur; ölçerek kalibrasyon sayısı bulur.",
        "disiplin": "Matematik, Fen Bilimleri",
        "anlatim": "Port View robotun sayacıdır; tahmin etmek yerine sayaca bakarız.",
        "yanilgi": "Değer önceki konumdan devam eder. Port View’dan çıkıp yeniden girerek sıfırlayın.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "moreset",
              "~B"
            ],
            [
              "mvfor",
              "~düz: 0|straight: 0",
              1000,
              "~derece|degrees"
            ],
            [
              "write",
              [
                "modeg",
                "~B"
              ]
            ],
            [
              "wait",
              5
            ]
          ]
        ]
      },
      {
        "no": 4,
        "baslik": "Döngü ve çokgenler",
        "kazanim": "Döngü sayısı ve dönüş açısıyla kare, üçgen ve altıgen çizer.",
        "disiplin": "Matematik, Görsel Sanatlar",
        "anlatim": "Bir tam tur 360 derecedir; kare için her köşede bunun dörtte biri kadar dönülür.",
        "yanilgi": "Üçgende 60 girilir. Dönüş açısı iç açı değil dış açıdır: 120 derece.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "rep",
              4,
              [
                [
                  "mvfor",
                  "~düz: 0|straight: 0",
                  20,
                  "~cm"
                ],
                [
                  "mvfor",
                  "~sağ: 100|right: 100",
                  185,
                  "~derece|degrees"
                ]
              ]
            ]
          ]
        ]
      },
      {
        "no": 5,
        "baslik": "Hız ve mesafe, 1. bölüm",
        "kazanim": "Mesafenin çevre × dönüş, hızın mesafe ÷ süre olduğunu açıklar; hız ölçen robotu kurar.",
        "disiplin": "Fen Bilimleri, Matematik",
        "anlatim": "Araba hızını iki şeyden bulur: ne kadar gitti, ne kadar sürede gitti.",
        "yanilgi": "Zamanlayıcı sıfırlanmaz. Sıfırlama bloğunu programın en başına koyun.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "resettimer"
            ],
            [
              "moreset",
              "~C"
            ],
            [
              "mvfor",
              "~düz: 0|straight: 0",
              4,
              "~dönüş|rotations"
            ],
            [
              "set",
              "~süre|time",
              [
                "timer"
              ]
            ],
            [
              "set",
              "~dönüş|rotations",
              [
                "div",
                [
                  "modeg",
                  "~C"
                ],
                360
              ]
            ]
          ]
        ]
      },
      {
        "no": 6,
        "baslik": "Hız ve mesafe, 2. bölüm",
        "kazanim": "Ortalama hızı hesaplayıp ekranda cm/sn ile gösterir; deneme tablosunu yorumlar.",
        "disiplin": "Matematik, Bilişim",
        "anlatim": "Bilgisayar çarpar ve böler ama birimi bilmez; birimi biz yazarız.",
        "yanilgi": "Derece ile dönüş karışır, hız 360 kat büyük çıkar. Derece ÷ 360 = dönüş.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "resettimer"
            ],
            [
              "moreset",
              "~C"
            ],
            [
              "mvfor",
              "~düz: 0|straight: 0",
              4,
              "~dönüş|rotations"
            ],
            [
              "set",
              "~hız|speed",
              [
                "div",
                [
                  "mul",
                  [
                    "div",
                    [
                      "modeg",
                      "~C"
                    ],
                    360
                  ],
                  17.6
                ],
                [
                  "timer"
                ]
              ]
            ],
            [
              "write",
              [
                "join",
                [
                  "round",
                  [
                    "var",
                    "hız|speed"
                  ]
                ],
                " cm/sn| cm/s"
              ]
            ],
            [
              "wait",
              5
            ]
          ]
        ]
      },
      {
        "no": 7,
        "baslik": "Sensörler: dokunma ve ultrasonik",
        "kazanim": "Dokunma ve ultrasonik sensörle robotu durdurur; sensörün geri bildirim verdiğini açıklar.",
        "disiplin": "Fen Bilimleri, Matematik",
        "anlatim": "Sensör ölçer, kuralı biz koyarız; robot kendi hızı yüzünden tam 20’de duramaz.",
        "yanilgi": "Robot eşiği geçip çarpar. Hızı düşürün ya da eşiği büyütün.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "mvspeed",
              30
            ],
            [
              "mvstart",
              "~düz: 0|straight: 0"
            ],
            [
              "until",
              [
                "lt",
                [
                  "dist",
                  "~4",
                  "~cm"
                ],
                20
              ]
            ],
            [
              "mvstop"
            ],
            [
              "beep",
              72,
              0.3
            ]
          ]
        ]
      },
      {
        "no": 8,
        "baslik": "Sensörler: Kaplumbağa",
        "kazanim": "Gyro açısını koşullarla kullanır; ışık, ekran ve sesle tepki veren bir yaratık tasarlar.",
        "disiplin": "Fen Bilimleri, Türkçe, Görsel Sanatlar",
        "anlatim": "Gyro robotun iç kulağıdır: ne yana yattığını söyler.",
        "yanilgi": "Gyro kayar. Robot sabitken sensörü çıkarıp yeniden takın.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "resetangle",
              "~2"
            ],
            [
              "forever",
              [
                [
                  "ifelse",
                  [
                    "gt",
                    [
                      "angle",
                      "~2"
                    ],
                    45
                  ],
                  [
                    [
                      "light",
                      "~turuncu|orange"
                    ],
                    [
                      "img",
                      "~Uyanık|Awake"
                    ]
                  ],
                  [
                    [
                      "ifelse",
                      [
                        "lt",
                        [
                          "angle",
                          "~2"
                        ],
                        -45
                      ],
                      [
                        [
                          "light",
                          "~kırmızı|red"
                        ],
                        [
                          "img",
                          "~Sersem|Dizzy"
                        ]
                      ],
                      [
                        [
                          "light",
                          "~yeşil|green"
                        ],
                        [
                          "img",
                          "~Sevgi|Love"
                        ]
                      ]
                    ]
                  ]
                ],
                [
                  "wait",
                  1
                ]
              ]
            ]
          ]
        ]
      },
      {
        "no": 9,
        "baslik": "Renk, yansıyan ışık ve çizgi izleme",
        "kazanim": "Yansıyan ışığı ölçüp eşik belirler; çizgi izleme mantığını açıklar.",
        "disiplin": "Fen Bilimleri, Matematik",
        "anlatim": "Çizgi izleyen robot zikzak yapar: çizgideyse bir yana, değilse öbür yana döner.",
        "yanilgi": "Sensör zeminden uzaktır. 0,5–1 cm’ye indirip yeniden ölçün.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "set",
              "~eşik|threshold",
              50
            ],
            [
              "forever",
              [
                [
                  "ifelse",
                  [
                    "lt",
                    [
                      "refl",
                      "~3"
                    ],
                    [
                      "var",
                      "eşik|threshold"
                    ]
                  ],
                  [
                    [
                      "mvstart",
                      "~sol: −40|left: -40"
                    ]
                  ],
                  [
                    [
                      "mvstart",
                      "~sağ: 40|right: 40"
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      },
      {
        "no": 10,
        "baslik": "Sürtünme laboratuvarı",
        "kazanim": "Kayma açısını ölçer, sürtünme katsayısını hesaplar, nesneleri sınıflar.",
        "disiplin": "Fen Bilimleri, Matematik, Türkçe",
        "anlatim": "Nesne kaymaya başladığı an sürtünme pes etmiştir; o açı sürtünmenin gücünü verir.",
        "yanilgi": "Platform düz zeminde değildir. Ölçümden önce zemini ve gyro’yu kontrol edin.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "resetangle",
              "~2"
            ],
            [
              "until",
              [
                "pressed",
                "~1",
                "~basılı|pressed"
              ]
            ],
            [
              "mospeed",
              "~A",
              10
            ],
            [
              "mostart",
              "~A",
              "~saat yönünde|clockwise"
            ],
            [
              "wait",
              0.5
            ],
            [
              "until",
              [
                "pressed",
                "~1",
                "~basılı|pressed"
              ]
            ],
            [
              "mostop",
              "~A"
            ],
            [
              "write",
              [
                "join",
                "Açı: |Angle: ",
                [
                  "angle",
                  "~2"
                ]
              ]
            ],
            [
              "wait",
              2
            ],
            [
              "write",
              [
                "join",
                "Katsayı: |Coefficient: ",
                [
                  "fn",
                  "~tan",
                  [
                    "angle",
                    "~2"
                  ]
                ]
              ]
            ],
            [
              "wait",
              10
            ]
          ]
        ]
      },
      {
        "no": 11,
        "baslik": "Sistem ve alt sistem, 1. bölüm",
        "kazanim": "Bir sistemi alt sistemlere böler; kalem kollu çizim sistemini tasarlar.",
        "disiplin": "Teknoloji ve Tasarım, Matematik, Sosyal Bilgiler",
        "anlatim": "Büyük problemi küçük parçalara bölünce her parça ayrı çözülür.",
        "yanilgi": "Alt sistemler birleşince motorlar çarpışır. Hareket aralığını önce elle deneyin.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "light",
              "~kırmızı|red"
            ],
            [
              "morun",
              "~C",
              "~saat yönünde|clockwise",
              0.25,
              "~dönüş|rotations"
            ],
            [
              "until",
              [
                "iscolor",
                "~3",
                "~beyaz|white"
              ]
            ],
            [
              "light",
              "~yeşil|green"
            ],
            [
              "until",
              [
                "pressed",
                "~1",
                "~basılı|pressed"
              ]
            ],
            [
              "resetangle",
              "~2"
            ],
            [
              "morun",
              "~C",
              "~saat yönünün tersine|counterclockwise",
              0.25,
              "~dönüş|rotations"
            ],
            [
              "mostart",
              "~B",
              "~saat yönünde|clockwise"
            ],
            [
              "until",
              [
                "gt",
                [
                  "angle",
                  "~2"
                ],
                30
              ]
            ],
            [
              "mostop",
              "~B"
            ],
            [
              "morun",
              "~C",
              "~saat yönünde|clockwise",
              0.25,
              "~dönüş|rotations"
            ]
          ]
        ]
      },
      {
        "no": 12,
        "baslik": "Sistem ve alt sistem, 2. bölüm",
        "kazanim": "Aynı deseni üç kez çizip hatayı santimetreyle ölçer; sistemi iyileştirir.",
        "disiplin": "Matematik, Fen Bilimleri",
        "anlatim": "Güvenilir makine, her seferinde aynı sonucu veren makinedir.",
        "yanilgi": "Robot her seferinde farklı yere konur. Kağıda işaret, robota hizalama köşesi ekleyin.",
        "proje": false,
        "programlar": [
          [
            [
              "def",
              "çizgi çiz|draw line"
            ],
            [
              "morun",
              "~C",
              "~saat yönünün tersine|counterclockwise",
              0.25,
              "~dönüş|rotations"
            ],
            [
              "resetangle",
              "~2"
            ],
            [
              "mostart",
              "~B",
              "~saat yönünde|clockwise"
            ],
            [
              "until",
              [
                "gt",
                [
                  "angle",
                  "~2"
                ],
                30
              ]
            ],
            [
              "mostop",
              "~B"
            ],
            [
              "morun",
              "~C",
              "~saat yönünde|clockwise",
              0.25,
              "~dönüş|rotations"
            ]
          ],
          [
            [
              "start"
            ],
            [
              "rep",
              3,
              [
                [
                  "until",
                  [
                    "pressed",
                    "~1",
                    "~basılı|pressed"
                  ]
                ],
                [
                  "call",
                  "çizgi çiz|draw line"
                ],
                [
                  "beep",
                  60,
                  0.2
                ]
              ]
            ]
          ]
        ]
      },
      {
        "no": 13,
        "baslik": "Proje: görevi seç",
        "kazanim": "Mini fabrika görevlerinden biri seçilir, tasarım cümlesi yazılır, alt sistemler çizilir.",
        "yanilgi": "",
        "proje": true,
        "programlar": []
      },
      {
        "no": 14,
        "baslik": "Proje: kur ve programla",
        "kazanim": "Model kurulur, ilk çalışan sürüm yazılır.",
        "yanilgi": "",
        "proje": true,
        "programlar": []
      },
      {
        "no": 15,
        "baslik": "Proje: ölç ve iyileştir",
        "kazanim": "On denemede başarı oranı ölçülür, bir şey değiştirilir, yeniden ölçülür.",
        "yanilgi": "",
        "proje": true,
        "programlar": []
      },
      {
        "no": 16,
        "baslik": "Proje: sergi",
        "kazanim": "Model, defter, video ve üç dakikalık sunum.",
        "yanilgi": "",
        "proje": true,
        "programlar": []
      }
    ]
  },
  {
    "no": 3,
    "ad": "Mucitler",
    "alt": "Ortaokul 7–8, EV3 Core Set, EV3 Classroom ve EV3 MicroPython",
    "haftalar": [
      {
        "no": 1,
        "baslik": "EV3 ileri başlangıç ve sürüş tabanı",
        "kazanim": "Brick’in portlarını ve EV3 Classroom arayüzünü tanır; sürüş tabanını kurup ilk programı çalıştırır.",
        "disiplin": "Bilişim, Fen Bilimleri",
        "anlatim": "Her motor ve sensörün bir port numarası ya da harfi vardır; programda aynı portu seçmek gerekir.",
        "yanilgi": "Programdaki port gerçek porttan farklıdır. Port şemasını masaya yapıştırın.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "write",
              "Merhaba|Hello"
            ],
            [
              "mvfor",
              "~ileri|forward",
              1,
              "~dönüş|rotations"
            ],
            [
              "mvfor",
              "~geri|backward",
              1,
              "~dönüş|rotations"
            ]
          ]
        ]
      },
      {
        "no": 2,
        "baslik": "Hassas hareket ve kalibrasyon",
        "kazanim": "Tekerlek çevresinden cm–derece dönüşümünü hesaplar; hatayı ölçer.",
        "disiplin": "Matematik, Fen Bilimleri",
        "anlatim": "Hesap bir tahmindir, ölçüm gerçektir; farkı bir sayıyla düzeltmek mühendisliktir.",
        "yanilgi": "Başlangıç noktası değişir. Zemine başlangıç bandı koyun.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "mvfor",
              "~ileri|forward",
              1023,
              "~derece|degrees"
            ],
            [
              "mvstop"
            ]
          ]
        ]
      },
      {
        "no": 3,
        "baslik": "Gyro ile yönelme",
        "kazanim": "Gyro ile istenen açıda döner; sürüklenmeyi açıklar.",
        "disiplin": "Matematik, Fen Bilimleri",
        "anlatim": "Tekerlek derecesi “ne kadar döndün”, gyro “nereye bakıyorsun” der.",
        "yanilgi": "Robot hedef açıyı geçer. Son 15 derecede hızı düşürün.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "rep",
              4,
              [
                [
                  "mvfor",
                  "~ileri|forward",
                  20,
                  "~cm"
                ],
                [
                  "resetangle",
                  "~2"
                ],
                [
                  "mvstart",
                  "~sağ: 100|right: 100"
                ],
                [
                  "until",
                  [
                    "gt",
                    [
                      "angle",
                      "~2"
                    ],
                    89
                  ]
                ],
                [
                  "mvstop"
                ]
              ]
            ]
          ]
        ]
      },
      {
        "no": 4,
        "baslik": "Olaylar ve koşullar",
        "kazanim": "Renk, mesafe ve dokunma sensörünü koşullarla kullanır.",
        "disiplin": "Fen Bilimleri, Matematik",
        "anlatim": "Koşul bir evet–hayır sorusudur; robot bu soruyu saniyede yüzlerce kez sorar.",
        "yanilgi": "Koşul döngünün dışında kalır ve bir kez sorulur. “Sürekli tekrarla” bloğunun içine alın.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "until",
              [
                "pressed",
                "~1",
                "~basılı|pressed"
              ]
            ],
            [
              "forever",
              [
                [
                  "ifelse",
                  [
                    "lt",
                    [
                      "dist",
                      "~4",
                      "~cm"
                    ],
                    15
                  ],
                  [
                    [
                      "mvstop"
                    ]
                  ],
                  [
                    [
                      "mvstart",
                      "~ileri|forward"
                    ]
                  ]
                ],
                [
                  "if",
                  [
                    "iscolor",
                    "~3",
                    "~kırmızı|red"
                  ],
                  [
                    [
                      "beep",
                      72,
                      0.3
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      },
      {
        "no": 5,
        "baslik": "Döngü, değişken ve ziyaretçi sayacı",
        "kazanim": "Değişkenle sayar; sonucu brick ekranında gösterir.",
        "disiplin": "Matematik, Sosyal Bilgiler, Bilişim",
        "anlatim": "Değişken, üzerine isim yazılmış bir kutudur.",
        "yanilgi": "Kapıda duran kişi tekrar tekrar sayılır. “Çıkana kadar bekle” ekleyin.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "set",
              "~sayaç|counter",
              0
            ],
            [
              "forever",
              [
                [
                  "until",
                  [
                    "lt",
                    [
                      "dist",
                      "~4",
                      "~cm"
                    ],
                    20
                  ]
                ],
                [
                  "change",
                  "~sayaç|counter",
                  1
                ],
                [
                  "write",
                  [
                    "var",
                    "sayaç|counter"
                  ]
                ],
                [
                  "until",
                  [
                    "gt",
                    [
                      "dist",
                      "~4",
                      "~cm"
                    ],
                    20
                  ]
                ]
              ]
            ]
          ]
        ]
      },
      {
        "no": 6,
        "baslik": "Çizgi izleme ve oransal kontrol",
        "kazanim": "Hatayla orantılı dönüş veren bir çizgi izleyici yazar.",
        "disiplin": "Matematik, Fen Bilimleri",
        "anlatim": "Direksiyonu şeritten ne kadar çıktığımıza göre çeviririz: az çıktıysak az, çok çıktıysak çok.",
        "yanilgi": "Kp büyük olunca robot salınır. Yarıya indirip yeniden deneyin.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "set",
              "~hedef|target",
              50
            ],
            [
              "set",
              "~Kp",
              0.6
            ],
            [
              "forever",
              [
                [
                  "set",
                  "~hata|error",
                  [
                    "sub",
                    [
                      "refl",
                      "~3"
                    ],
                    [
                      "var",
                      "hedef|target"
                    ]
                  ]
                ],
                [
                  "mvstart",
                  [
                    "mul",
                    [
                      "var",
                      "Kp"
                    ],
                    [
                      "var",
                      "hata|error"
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      },
      {
        "no": 7,
        "baslik": "Fonksiyon ve ayrıştırma",
        "kazanim": "Görevi alt görevlere böler; parametreli fonksiyon yazar.",
        "disiplin": "Matematik, Türkçe",
        "anlatim": "Fonksiyon bir tarif kartıdır: bir kez yazılır, istenildiği kadar çağrılır.",
        "yanilgi": "Fonksiyonun içinde sabit sayı kalır. Yerine parametreyi koyun.",
        "proje": false,
        "programlar": [
          [
            [
              "def",
              "git|go",
              "cm"
            ],
            [
              "mvfor",
              "~ileri|forward",
              [
                "var",
                "cm"
              ],
              "~cm"
            ]
          ],
          [
            [
              "def",
              "dön|turn",
              "açı|angle"
            ],
            [
              "resetangle",
              "~2"
            ],
            [
              "mvstart",
              "~sağ: 100|right: 100"
            ],
            [
              "until",
              [
                "gt",
                [
                  "angle",
                  "~2"
                ],
                [
                  "var",
                  "açı|angle"
                ]
              ]
            ],
            [
              "mvstop"
            ]
          ],
          [
            [
              "start"
            ],
            [
              "call",
              "git|go",
              30
            ],
            [
              "call",
              "dön|turn",
              90
            ],
            [
              "call",
              "git|go",
              20
            ]
          ]
        ]
      },
      {
        "no": 8,
        "baslik": "Labirent ve otonom navigasyon",
        "kazanim": "Sağ el kuralını karar ağacı olarak yazar; labirentte yol bulan robotu programlar.",
        "disiplin": "Matematik, Bilişim, Sosyal Bilgiler",
        "anlatim": "Algoritma, çıkmaz sokakta ne yapılacağını da söylemelidir.",
        "yanilgi": "Robot köşede duvara sürtünür. Dönmeden önce bir adım ilerleyin.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "forever",
              [
                [
                  "ifelse",
                  [
                    "gt",
                    [
                      "dist",
                      "~4",
                      "~cm"
                    ],
                    25
                  ],
                  [
                    [
                      "call",
                      "sağa dön|turn right"
                    ],
                    [
                      "call",
                      "git|go",
                      20
                    ]
                  ],
                  [
                    [
                      "ifelse",
                      [
                        "pressed",
                        "~1",
                        "~basılı|pressed"
                      ],
                      [
                        [
                          "call",
                          "sola dön|turn left"
                        ]
                      ],
                      [
                        [
                          "call",
                          "git|go",
                          5
                        ]
                      ]
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      },
      {
        "no": 9,
        "baslik": "Python’a geçiş, 1. bölüm (EV3 MicroPython)",
        "kazanim": "Aynı programı blokla ve EV3 MicroPython’la yazıp eşleştirir.",
        "disiplin": "Bilişim, İngilizce",
        "anlatim": "Python, yazıyla yapılan bloktur; bilgisayar boşluk ve harfte titizdir.",
        "yanilgi": "Girinti bozulur ya da dosyanın ilk satırı silinir. İlk gün şablonu aynen kopyalatın.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "write",
              "Merhaba|Hello"
            ],
            [
              "mvfor",
              "~ileri|forward",
              50,
              "~cm"
            ]
          ]
        ]
      },
      {
        "no": 10,
        "baslik": "Python, 2. bölüm",
        "kazanim": "Python’da döngü ve koşulla sensöre bağlı karar yazar; hata mesajını okur.",
        "disiplin": "Matematik, Bilişim",
        "anlatim": "Hata bir ipucudur: hangi satırda ne olduğunu söyler.",
        "yanilgi": "Sensör milimetre verir ama eşik santimetreyle düşünülür; 150 yerine 15 yazılırsa robot erken durur.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "mvstart",
              "~ileri|forward"
            ],
            [
              "until",
              [
                "lt",
                [
                  "dist",
                  "~4",
                  "~cm"
                ],
                15
              ]
            ],
            [
              "mvstop"
            ]
          ]
        ]
      },
      {
        "no": 11,
        "baslik": "Sıralama makinesi ve yapay zekâ okuryazarlığı",
        "kazanim": "Nesneleri sınıflara ayırır; kural tabanlı sistemle veriden öğrenen sistemin farkını açıklar.",
        "disiplin": "Bilişim, Fen Bilimleri, Etik",
        "anlatim": "İki sistem de verildiği örnek kadar iyidir: yalnızca gündüz örneği verirsek geceyi bilmez.",
        "yanilgi": "Eğitim ve test aynı parçalarla yapılır. Testte yeni parçalar kullanın.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "set",
              "~eşik|threshold",
              [
                "div",
                [
                  "add",
                  [
                    "var",
                    "ortalama A|mean A"
                  ],
                  [
                    "var",
                    "ortalama B|mean B"
                  ]
                ],
                2
              ]
            ],
            [
              "forever",
              [
                [
                  "until",
                  [
                    "pressed",
                    "~1",
                    "~basılı|pressed"
                  ]
                ],
                [
                  "ifelse",
                  [
                    "lt",
                    [
                      "refl",
                      "~3"
                    ],
                    [
                      "var",
                      "eşik|threshold"
                    ]
                  ],
                  [
                    [
                      "morun",
                      "~A",
                      "~saat yönünde|clockwise",
                      0.25,
                      "~dönüş|rotations"
                    ]
                  ],
                  [
                    [
                      "morun",
                      "~A",
                      "~saat yönünün tersine|counterclockwise",
                      0.25,
                      "~dönüş|rotations"
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      },
      {
        "no": 12,
        "baslik": "Otonom teslimat robotu",
        "kazanim": "Sensörleri bir öncelik sırasıyla birleştirir; güvenli durdurması olan otonom sistemi test eder.",
        "disiplin": "Bilişim, Sosyal Bilgiler, Etik",
        "anlatim": "Otonom robot kararını kendi verir ama kuralını biz yazarız; güvenlik kuralı en üstte durur.",
        "yanilgi": "Düşük öncelikli kural yüksek öncelikliyi bastırır. Koşulları öncelik sırasıyla yazın.",
        "proje": false,
        "programlar": [
          [
            [
              "start"
            ],
            [
              "forever",
              [
                [
                  "ifelse",
                  [
                    "pressed",
                    "~1",
                    "~basılı|pressed"
                  ],
                  [
                    [
                      "mvstop"
                    ],
                    [
                      "stop",
                      "~tümünü|all"
                    ]
                  ],
                  [
                    [
                      "ifelse",
                      [
                        "lt",
                        [
                          "dist",
                          "~4",
                          "~cm"
                        ],
                        15
                      ],
                      [
                        [
                          "mvstop"
                        ]
                      ],
                      [
                        [
                          "ifelse",
                          [
                            "iscolor",
                            "~3",
                            "~kırmızı|red"
                          ],
                          [
                            [
                              "mvstop"
                            ],
                            [
                              "wait",
                              3
                            ]
                          ],
                          [
                            [
                              "call",
                              "çizgiyi izle|follow line"
                            ]
                          ]
                        ]
                      ]
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      },
      {
        "no": 13,
        "baslik": "Proje: şartname",
        "kazanim": "Problem, nitel ve nicel ölçütler, kısıtlar ve alt sistem diyagramı yazılır.",
        "yanilgi": "",
        "proje": true,
        "programlar": []
      },
      {
        "no": 14,
        "baslik": "Proje: kur ve yaz",
        "kazanim": "Çalışan ilk sürüm; her alt sistem ayrı test edilir.",
        "yanilgi": "",
        "proje": true,
        "programlar": []
      },
      {
        "no": 15,
        "baslik": "Proje: test senaryoları",
        "kazanim": "Test senaryoları yazılır, on denemelik sonuç alınır, bir iyileştirme yapılır.",
        "yanilgi": "",
        "proje": true,
        "programlar": []
      },
      {
        "no": 16,
        "baslik": "Proje: sunum ve sergi",
        "kazanim": "Problem, çözüm, kanıt ve öğrenilen ders sunulur.",
        "yanilgi": "",
        "proje": true,
        "programlar": []
      }
    ]
  }
];
