// Araç kutusu kategorilerini Scratch tarzı renkli daire + altında ad olarak çizer.
import * as Blockly from 'blockly/core';

class DaireKategori extends Blockly.ToolboxCategory {
  createIconDom_() {
    const daire = document.createElement('span');
    daire.className = 'ev3-daire';
    daire.setAttribute('aria-hidden', 'true');
    daire.style.background = this.colour_;
    return daire;
  }

  // Varsayılan sol renk şeridini çizme; renk dairede.
  addColourBorder_() {}

  refreshTheme() {
    super.refreshTheme();
    if (this.iconDom_) this.iconDom_.style.background = this.colour_;
  }

  // Seçili kategori kendi rengiyle boyanmasın; CSS gri bir zemin verir.
  setSelected(secili) {
    super.setSelected(secili);
    if (this.rowDiv_) this.rowDiv_.style.backgroundColor = '';
  }
}

export function daireKategoriyiKaydet() {
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    DaireKategori,
    true,
  );
}
