import { type } from "@colyseus/schema";

import helpers from "../../shared/helpers";

// Entities
import { Player } from "./Player";
import { Potion, POTION_1_MODIFIER, POTION_2_MODIFIER, POTION_4_MODIFIER, POTION_3_MODIFIER } from "./items/consumable/Potion";
import { Scroll } from "./items/consumable/Scroll";
import { ConsumableItem } from "./items/ConsumableItem";
import { Key } from "./items/consumable/Key";
import { NUM_LEVELS_PER_CHECKPOINT, MAX_LEVELS } from "../utils/ProgressionConfig";

export class NPC extends Player {
  @type("string") kind: string;

  wanderer: boolean = true;

  constructor (kind, npcHero = {}, state?) {
    super(undefined, npcHero as any, state);

    // // only used for Player
    // delete this['properties'];

    this.type = helpers.ENTITIES.NPC;
    this.kind = kind;

    this.walkable = true;
  }

  updateMovementSpeed () {
    this.statsModifiers.movementSpeed = -this.state.rand.intBetween(200, 300);
  }

  interact (moveEvent, player: Player, state) {
    moveEvent.cancel();

    this.updateDirection(player.position.x, player.position.y);

    const isLastLevel = (state.progress === MAX_LEVELS);

    if (this.kind === "elder") {
      const items = [];

      const hpPotion = new Potion();
      hpPotion.addModifier({ attr: "hp", modifier: this.getPotionModifierForPlayer(player, 'hp') });
      items.push(hpPotion);

      const mpPotion = new Potion();
      mpPotion.addModifier({ attr: "mp", modifier: this.getPotionModifierForPlayer(player, 'mp') });
      items.push(mpPotion);

      const scroll = new Scroll();
      items.push(scroll);

      player.setTradingItems(items);

    } else if (this.kind === "merchant") {
      const progress = player.latestProgress + NUM_LEVELS_PER_CHECKPOINT;
      player.setTradingItems([
        this.state.roomUtils.createArmor({ progress }),
        this.state.roomUtils.createBoot({ progress }),
        this.state.roomUtils.createHelmet({ progress }),
        this.state.roomUtils.createShield({ progress }),
        this.state.roomUtils.createWeapon(player.primaryAttribute, { progress }),
      ]);

    } else if (this.kind === "majesty") {
      const genericMessages = (!isLastLevel) ? [
        `I don't reveal the source of my weapons.`,
        `You can't handle my potions!`,
        `The prophecy is true.`,
        `Demons are amongst us`,
      ] : [
        `What happened?`,
        `I wish things could be different.`,
      ];

      state.createTextEvent(genericMessages[Math.floor(Math.random() * genericMessages.length)], this.position, 'white', 1000);

      setTimeout(() => {
        const itemDropOptions = {
          progress: (!isLastLevel)
            ? player.latestProgress + NUM_LEVELS_PER_CHECKPOINT
            : MAX_LEVELS * 2,
          isMagical: true,
          isRare: true
        };

        const items = [];

        const potion1 = new Potion();
        potion1.addModifier({ attr: "xp", modifier: this.getPotionModifierForPlayer(player, 'xp') });
        items.push(potion1);

        [
          this.state.roomUtils.createArmor(itemDropOptions),
          this.state.roomUtils.createBoot(itemDropOptions),
          this.state.roomUtils.createHelmet(itemDropOptions),
          this.state.roomUtils.createShield(itemDropOptions),
          this.state.roomUtils.createWeapon(player.primaryAttribute, itemDropOptions),
        ].forEach(item => {
          item.premium = true;
          items.push(item);
        });

        player.setTradingItems(items);
      }, 1000);

    } else if (this.kind === "locksmith") {
      const items = [
        helpers.ENTITIES.KEY_GRASS,
        helpers.ENTITIES.KEY_ROCK,
        helpers.ENTITIES.KEY_CAVE,
        helpers.ENTITIES.KEY_ICE,
        helpers.ENTITIES.KEY_INFERNO
      ].map(type => {
        const key = new Key();
        key.type = type;
        return key;
      });

      player.setTradingItems(items);

    } else {
      const messages = (!isLastLevel) ? [
        `PvP is coming eventually!`,
        `Join the Discord Server!`,
        `Save us from their curse!`,
        `Be safe!`,
      ] : [
        `You're awesome!`,
        `Majesty has the best items you can find.`
      ];

      if (
        !player.equipedItems.slots['left'] ||
        player.equipedItems.slots['left'].damageAttribute !== player.primaryAttribute
      ) {
        const weapons = {
          agility: 'bow',
          intelligence: 'staff',
          strength: 'melee weapon',
        };
        messages.push(`You need a ${weapons[player.primaryAttribute]}!`);
      }

      state.createTextEvent(messages[Math.floor(Math.random() * messages.length)], this.position, 'white', 1000);
    }

    // prevent NPC from moving right after talking.
    this.position.lastMove += 500;
  }

  getPotionModifierForPlayer(player, attr: 'hp' | 'mp' | 'xp') {
    let modifier = POTION_1_MODIFIER;

    if (player[attr].max > POTION_4_MODIFIER) {
      modifier = POTION_4_MODIFIER;

    } else if (player[attr].max > POTION_3_MODIFIER) {
      modifier = POTION_3_MODIFIER;

    } else if (player[attr].max > POTION_2_MODIFIER) {
      modifier = POTION_2_MODIFIER;
    }

    return modifier;
  }

  update (currentTime) {
    super.update(currentTime);

    if (this.position.pending.length === 0 && this.wanderer) {
      this.updateMovementSpeed();
      const nextPosition = this.state.roomUtils.getRandomPosition();

      // NPC's shouldn't walk over each other.
      if (!this.state.gridUtils.getEntityAt(nextPosition.x, nextPosition.y)) {
        this.state.move(this, nextPosition);
      }
    }
  }

}
