import helpers from "../../shared/helpers";

  // Entities
import { Unit, StatsModifiers } from "./Unit";
import { Player } from "./Player";
import { type } from "@colyseus/schema";
import { DBHero } from "../db/Hero";
import { WeaponItem } from "./items/equipable/WeaponItem";
import { ItemModifier } from "./Item";
import { distance } from "../helpers/Math";

export class Enemy extends Unit {
  @type("string") kind: string;

  aiDistance: number = 3;
  aiUpdateTime = 500;
  lastUpdateTime = Date.now();

  constructor (kind, data: Partial<DBHero>, modifiers: Partial<StatsModifiers> = {}) {
    super(undefined, data);
    this.type = helpers.ENTITIES.ENEMY

    this.kind = kind;
    this.lvl = data.lvl || 1;

    // apply stats modifiers
    if (Object.keys(modifiers).length > 0) {
      // equip dummy item to allow stats calculation.
      const item = new WeaponItem();
      for (const statName in modifiers) {
        const modifier = new ItemModifier();
        modifier.attr = statName;
        modifier.modifier = modifiers[statName];
        item.modifiers.push(modifier);
      }
      this.equipedItems.add(item);

      this.recalculateStatsModifiers();
    }
  }

  update (currentTime) {
    super.update(currentTime)

    const timeDiff = currentTime - this.lastUpdateTime
    // const aiAllowed = timeDiff > this.aiUpdateTime
    const aiAllowed = false;

    if (aiAllowed && (!this.action || !this.action.isEligible)) {
      let closePlayer: Player;

      for (let sessionId in this.state.players) {
        const player: Player = this.state.players[sessionId];

        if (distance(this.position, player.position) <= this.aiDistance) {
          closePlayer = player;
          break;
        }
      }

      if (closePlayer) {
        this.state.move(this, { x: closePlayer.position.y, y: closePlayer.position.x })
      }

      this.lastUpdateTime = currentTime;
    }
  }

}
