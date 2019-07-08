import helpers from "../../../../shared/helpers";
import { ConsumableItem } from "../ConsumableItem";

export class PotionPoints extends ConsumableItem {

  constructor () {
    super();

    this.type = helpers.ENTITIES.POINTS_POTION_1;
  }

  getPrice() {
    return 10;
    // return 800;
  }

  use(player, state) {
    const amount = 1;
    if (
      player.attributes.strength > amount &&
      player.attributes.agility > amount &&
      player.attributes.intelligence > amount
    ) {
      player.attributes.strength -= amount;
      player.attributes.agility -= amount;
      player.attributes.intelligence -= amount;
      player.pointsToDistribute += amount * 3;
      state.events.emit("sound", "potion", player);
      return true;

    } else {
      state.createTextEvent(`Need ${amount} on each attribute.`, player.position, "white", 200);
      return false;
    }

  }

}