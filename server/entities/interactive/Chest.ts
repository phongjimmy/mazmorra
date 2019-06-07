import { type } from "@colyseus/schema";

import { Interactive } from "../Interactive";
import helpers from "../../../shared/helpers";
import { Action } from "../../actions/Action";

export class Chest extends Interactive {
  @type("string") kind: string;

  walkable = true;

  constructor (position, kind: string) {
    super(helpers.ENTITIES.CHEST, position)

    this.kind = kind;
  }

  interact (moveEvent, player, state) {
    if (!this.action) {
      this.action = new Action("open", true);
      state.dropItemFrom(this);
      moveEvent.cancel()
    }
  }

}
