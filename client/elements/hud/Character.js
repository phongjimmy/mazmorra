import { MeshText2D, textAlign } from 'three-text2d'
import { MAX_CHAR_WIDTH, MAX_CHAR_HEIGHT, Resources } from '../character/Resources'
import LevelUpButton from './LevelUpButton';
import NearPlayerOpacity from '../../behaviors/NearPlayerOpacity';

export default class Character extends THREE.Object3D {

  constructor () {
    super()

    this.sprite = ResourceManager.getHUDElement("character-body-0-hud-face")

    this.width = (MAX_CHAR_WIDTH *  config.HUD_SCALE)
    this.height = (MAX_CHAR_HEIGHT *  config.HUD_SCALE)

    const margin = config.HUD_MARGIN * 2 + 1;

    this.levelText = new MeshText2D(" ", {
      align: textAlign.left,
      font: config.DEFAULT_FONT,
      fillStyle: '#d0c01c',
      antialias: false
    })
    this.levelText.position.x = margin * config.HUD_SCALE;
    this.levelText.position.y = this.levelText.height - margin;

    // Damage
    this.damageIcon = ResourceManager.getHUDElement("icons-damage");
    this.damageIcon.position.y = -this.sprite.height * 1.5;

    this.damageText = new MeshText2D("0", {
      align: textAlign.left,
      font: config.DEFAULT_FONT,
      fillStyle: '#dce1e2',
      antialias: false
    });
    this.damageText.position.x = margin * config.HUD_SCALE;
    this.damageText.position.y = this.damageIcon.position.y + this.damageIcon.height / 2;

    // Armor
    this.armorIcon = ResourceManager.getHUDElement("icons-armor");
    this.armorIcon.position.y = this.damageIcon.position.y - this.damageIcon.height - margin;

    this.armorText = new MeshText2D("0", {
      align: textAlign.left,
      font: config.DEFAULT_FONT,
      fillStyle: '#dce1e2',
      antialias: false
    });
    this.armorText.position.x = margin * config.HUD_SCALE;
    this.armorText.position.y = this.armorIcon.position.y + this.armorIcon.height / 2;

    // Attack speed
    this.attackSpeedIcon = ResourceManager.getHUDElement("icons-attack-speed");
    this.attackSpeedIcon.position.y = this.armorIcon.position.y - this.armorIcon.height - margin;

    this.attackSpeedText = new MeshText2D("0", {
      align: textAlign.left,
      font: config.DEFAULT_FONT,
      fillStyle: '#dce1e2',
      antialias: false
    });
    this.attackSpeedText.position.x = margin * config.HUD_SCALE;
    this.attackSpeedText.position.y = this.attackSpeedIcon.position.y + this.attackSpeedIcon.height / 2;

    // Movement speed
    this.movementSpeedIcon = ResourceManager.getHUDElement("icons-movement-speed");
    this.movementSpeedIcon.position.y = this.attackSpeedIcon.position.y - this.attackSpeedIcon.height - margin;

    this.movementSpeedText = new MeshText2D("0", {
      align: textAlign.left,
      font: config.DEFAULT_FONT,
      fillStyle: '#dce1e2',
      antialias: false
    });
    this.movementSpeedText.position.x = margin * config.HUD_SCALE;
    this.movementSpeedText.position.y = this.movementSpeedIcon.position.y + this.movementSpeedIcon.height / 2;

    // Attack distance
    this.attackDistanceIcon = ResourceManager.getHUDElement("icons-attack-distance");
    this.attackDistanceIcon.position.y = this.movementSpeedIcon.position.y - this.movementSpeedIcon.height - margin;

    this.attackDistanceText = new MeshText2D("0", {
      align: textAlign.left,
      font: config.DEFAULT_FONT,
      fillStyle: '#dce1e2',
      antialias: false
    });
    this.attackDistanceText.position.x = margin * config.HUD_SCALE;
    this.attackDistanceText.position.y = this.attackDistanceIcon.position.y + this.attackDistanceIcon.height / 2;

    // Level up button
    this.lvlUpButton = new LevelUpButton();
    this.lvlUpButton.position.y = this.attackDistanceIcon.position.y - this.attackDistanceIcon.height - (margin * 2);
    this.lvlUpButton.addEventListener("click", () => this.onLevelUpClick());

    // Strength
    this.strIcon = ResourceManager.getHUDElement("icons-red");
    this.strIcon.position.y = this.attackDistanceIcon.position.y - this.attackDistanceIcon.height - (margin * 2);

    this.strText = new MeshText2D("0", {
      align: textAlign.left,
      font: config.DEFAULT_FONT,
      fillStyle: '#d00000',
      antialias: false
    });
    this.strText.position.x = margin * config.HUD_SCALE;
    this.strText.position.y = this.strIcon.position.y + this.strIcon.height / 2;

    // Agility
    this.agiIcon = ResourceManager.getHUDElement("icons-green");
    this.agiIcon.position.y = this.strIcon.position.y - this.strIcon.height - margin;

    this.agiText = new MeshText2D("0", {
      align: textAlign.left,
      font: config.DEFAULT_FONT,
      fillStyle: '#7cac20',
      antialias: false
    });
    this.agiText.position.x = margin * config.HUD_SCALE;
    this.agiText.position.y = this.agiIcon.position.y + this.agiIcon.height / 2;

    // Intelligence
    this.intIcon = ResourceManager.getHUDElement("icons-blue");
    this.intIcon.position.y = this.agiIcon.position.y - this.agiIcon.height - margin;

    this.intText = new MeshText2D("0", {
      align: textAlign.left,
      font: config.DEFAULT_FONT,
      fillStyle: '#1c80e4',
      antialias: false
    });
    this.intText.position.x = margin * config.HUD_SCALE;
    this.intText.position.y = this.intIcon.position.y + this.intIcon.height / 2;

    // Atribute lvl ups
    this.strUpButton = new LevelUpButton();
    this.strUpButton.position.x = this.strText.position.x + this.strText.width * config.HUD_SCALE;
    this.strUpButton.position.y = this.strText.position.y - this.strIcon.height / 2;
    this.strUpButton.addEventListener("click", this.onIncreaseAttribute.bind('strength'));
    this.strUpButton.show();

    this.agiUpButton = new LevelUpButton();
    this.agiUpButton.position.x = this.agiText.position.x + this.agiText.width * config.HUD_SCALE;
    this.agiUpButton.position.y = this.agiText.position.y - this.agiIcon.height / 2;
    this.agiUpButton.addEventListener("click", this.onIncreaseAttribute.bind('agility'));
    this.agiUpButton.show();

    this.intUpButton = new LevelUpButton();
    this.intUpButton.position.x = this.intText.position.x + this.intText.width * config.HUD_SCALE;
    this.intUpButton.position.y = this.intText.position.y - this.intIcon.height / 2;
    this.intUpButton.addEventListener("click", this.onIncreaseAttribute.bind('intelligence'));
    this.intUpButton.show();

    this.add(this.sprite)
    this.add(this.levelText);

    this.add(this.damageIcon)
    this.add(this.damageText);
    this.add(this.armorIcon)
    this.add(this.armorText);
    this.add(this.attackSpeedIcon)
    this.add(this.attackSpeedText);
    this.add(this.movementSpeedIcon)
    this.add(this.movementSpeedText);
    this.add(this.attackDistanceIcon)
    this.add(this.attackDistanceText);

    this.lvlUpButton.show();

    // lvl up buttons
    this.add(this.lvlUpButton);
    this.add(this.strUpButton);
    this.add(this.agiUpButton);
    this.add(this.intUpButton);
  }

  update (data) {
    if (!data) {
      return;
    }

    const statsModifiers = {};
    for (const slotName in data.equipedItems.slots) {
      const item = data.equipedItems.slots[slotName];
      if (item) {
        item.modifiers.forEach(modifier => {
          if (statsModifiers[modifier.attr] === undefined) {
            statsModifiers[modifier.attr] = 0;
          }
          statsModifiers[modifier.attr] += modifier.modifier;
        });
      }
    }

    // var hpMax = (data.attributes.strength + statsModifiers['strength']) * 5;
    // var mpMax = (data.attributes.intelligence + statsModifiers['intelligence']) * 3;

    this.levelText.text = "Level " + data.lvl;

    this.movementSpeedText.text = (statsModifiers.movementSpeed || 0).toFixed(1);
    this.attackSpeedText.text = (data.attributes.agility * 0.5 + (statsModifiers.attackSpeed || 0)).toFixed(1);
    this.attackDistanceText.text = 1 + (statsModifiers.attackDistance || 0);

    // damage
    let damage = data.attributes[data.primaryAttribute] + (statsModifiers[data.primaryAttribute] || 0);
    if (statsModifiers.damage) { damage = `${damage}-${damage + statsModifiers.damage}` }
    this.damageText.text = damage;

    const baseArmor = { strength: 0, agility: -1, intelligence: -2 };
    this.armorText.text = ((statsModifiers.armor || 0) + (data.attributes.agility * 0.16) + baseArmor[data.primaryAttribute]).toFixed(1);

    // base attributes
    let strength = data.attributes.strength;
    if (statsModifiers.strength) { strength += `+${statsModifiers.strength}` }
    this.strText.text = strength;

    let agility = data.attributes.agility;
    if (statsModifiers.agility) { agility += `+${statsModifiers.agility}` }
    this.agiText.text = agility;

    let intelligence = data.attributes.intelligence;
    if (statsModifiers.intelligence) { intelligence += `+${statsModifiers.intelligence}` }
    this.intText.text = intelligence;
  }

  onLevelUpClick () {
    const hud = this.parent;

    if (!hud.inventory.isOpen) {
      hud.openInventoryButton.onClick();// FIXME: this is repeated on at least 3 places.
      hud.onToggleInventory();
      this.onOpenInventory();
    }
  }

  onIncreaseAttribute (attribute) {
  }

  onOpenInventory () {
    this.add(this.strIcon)
    this.add(this.strText);
    this.add(this.agiIcon)
    this.add(this.agiText);
    this.add(this.intIcon)
    this.add(this.intText);


    if (this.lvlUpButton.isActive) {
      this.lvlUpButton.hide();
      this.strUpButton.show();
      this.agiUpButton.show();
      this.intUpButton.show();
    }

    // this.add(this.attackSpeedIcon)
    // this.add(this.attackSpeedText);
    // this.add(this.movementSpeedIcon)
    // this.add(this.movementSpeedText);
    // this.add(this.attackDistanceIcon)
    // this.add(this.attackDistanceText);
  }

  onCloseInventory() {
    this.remove(this.strIcon)
    this.remove(this.strText);
    this.remove(this.agiIcon)
    this.remove(this.agiText);
    this.remove(this.intIcon)
    this.remove(this.intText);

    this.strUpButton.hide();
    this.agiUpButton.hide();
    this.intUpButton.hide();

    // this.remove(this.attackSpeedIcon)
    // this.remove(this.attackSpeedText);
    // this.remove(this.movementSpeedIcon)
    // this.remove(this.movementSpeedText);
    // this.remove(this.attackDistanceIcon)
    // this.remove(this.attackDistanceText);
  }

  set composition (instance) {
    this.sprite.material.map = Resources.get(instance, 'hud-face')
    this.sprite.scale.normalizeWithHUDTexture(this.sprite.material.map)
  }

}
