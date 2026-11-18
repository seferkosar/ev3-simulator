// Blockly'yi tek yerden hazırlar: çekirdek + hazır bloklar + Türkçe + EV3 blokları + tema.
// Uygulama ve testler Blockly'yi bu modül üzerinden alır.
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as Tr from 'blockly/msg/tr';
import { bloklariKaydet } from './kayit.js';
import { EV3_TEMASI } from './tema.js';
import { daireKategoriyiKaydet } from './daireKategori.js';

daireKategoriyiKaydet();

Blockly.setLocale(Tr);
// Değişken bloklarını ortaokul öğrencisi için daha doğal Türkçeyle yaz.
Blockly.Msg.VARIABLES_SET = '%1 değerini %2 yap';
Blockly.Msg.MATH_CHANGE_TITLE = '%1 değerini %2 artır';
bloklariKaydet();

export { Blockly, EV3_TEMASI };
