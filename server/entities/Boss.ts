import { Enemy } from "./Enemy";
import { DBHero } from "../db/Hero";
import { StatsModifiers, Unit } from "./Unit";

export interface UnitSpawner {
  type: string[],
  lvl: number
}

export class Boss extends Enemy {
  unitSpawner?: UnitSpawner;

  lastUnitSpawnTime = Date.now() - 5800; // give some time for the spawn to appear during camera animation
  unitSpawnTime = 8000;

  thingsToUnlockWhenDead: any[] = [];

  constructor (kind, data: Partial<DBHero>, modifiers: Partial<StatsModifiers> = {}) {
    super(kind, data,modifiers);

    this.isBoss = true;

    // this.hp.current = 1;
  }

  get aiDistance () {
    return 4;
  }

  onDie () {
    // unlock chests and doors!
    this.thingsToUnlockWhenDead.forEach((thing) => {
      thing.isLocked = false;

      // FIXME: use .unlock instead.
      // thing.unlock();
    });

    // Announce boss killed only if user haven't progressed to next dungeons yet
    const playersWhoKilled = super.onDie().filter(player => (
      (player as any).latestProgress <= player.state.progress
    ));

    if (playersWhoKilled.length > 0) {
      // broadcast killed event for global chat.
      this.state.events.emit('event', {
        name: playersWhoKilled.map(p => (p as any).name).join(", "),
        progress: this.state.progress,
        killed: this.kind
      });
    }

    return playersWhoKilled;
  }

  update (currentTime) {
    super.update(currentTime);

    if (this.unitSpawner && this.isAlive) {
      const timeDiff = currentTime - this.lastUnitSpawnTime;
      const spawnAllowed = timeDiff > this.unitSpawnTime

      if (spawnAllowed) {
        const checkPositions = [
          [this.position.y - 1, this.position.x],
          [this.position.y + 1, this.position.x],
          [this.position.y, this.position.x + 1],
          [this.position.y, this.position.x - 1],
          [this.position.y - 1, this.position.x - 1],
          [this.position.y - 1, this.position.x + 1],
          [this.position.y + 1, this.position.x - 1],
          [this.position.y + 1, this.position.x + 1],
        ];

        const availablePosition = checkPositions.find((position) => {
          return (
            !this.state.gridUtils.getEntityAt(position[0], position[1], Unit) &&
            this.state.pathgrid.isWalkableAt(position[1], position[0])
          )
        });

        if (availablePosition) {
          const enemyType = this.unitSpawner.type[this.state.roomUtils.realRand.intBetween(0, this.unitSpawner.type.length - 1)];
          const enemy = this.state.roomUtils.createEnemy(enemyType, Enemy, this.unitSpawner.lvl);

          enemy.position.set({
            x: availablePosition[1],
            y: availablePosition[0]
          });

          enemy.walkable = true;
          enemy.doNotGiveXP = true;

          // disable drop for this unit.
          enemy.dropOptions = null;

          this.state.addEntity(enemy);
        }

        this.lastUnitSpawnTime = currentTime;
      }
    }
  }

}
