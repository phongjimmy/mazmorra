import Dungeon from '../../../../shared/Dungeon'
import helpers from '../../../../shared/helpers'

import GameObject from '../../behaviors/GameObject'
import HasLifebar from '../../behaviors/HasLifebar'

import Character from '../../entities/Character'
import Enemy from '../../entities/Enemy'
import Item from '../../entities/Item'
import Chest from '../../entities/Chest'
import Fountain from '../../entities/Fountain'
import Rock from '../../entities/Rock'
import Aesthetic from '../../entities/Aesthetic'
import TileSelectionPreview from '../../entities/TileSelectionPreview'
import LightPole from '../../entities/LightPole'
import Door from '../../entities/Door'
import TextEvent from '../../entities/TextEvent'

export default class LevelGenerator {

  constructor (level, container, colyseus) {
    this.level = level
    this.container = container
    this.colyseus = colyseus

    // visual groups
    this.ground = []
    this.wall = []
  }

  setGrid (grid) {
    this.grid = grid
  }

  createEntity (data) {
    var element = null

    switch (data.type) {
      case helpers.ENTITIES.DOOR:
        element = new Door(data)
        break;

      case helpers.ENTITIES.ENEMY:
        element = new Enemy(data)
        break;

      case helpers.ENTITIES.PLAYER:
        element = new Character(data)
        if (data.id !== this.colyseus.id) {
          element.addBehaviour(new HasLifebar, this)
        }
        break;

      case helpers.ENTITIES.LIGHT:
        element = new LightPole()
        break;

      case helpers.ENTITIES.AESTHETICS:
        element = new Aesthetic()
        break;

      case helpers.ENTITIES.ROCK:
        element = new Rock()
        break;

      case helpers.ENTITIES.CHEST:
        element = new Chest(data)
        break;

      case helpers.ENTITIES.FOUNTAIN:
        element = new Fountain(data)
        break;

      case helpers.ENTITIES.TEXT_EVENT:
        element = new TextEvent(data)
        break;

      // TODO: refactor me.
      // items
      case helpers.ENTITIES.BOOK_BLUE:
      case helpers.ENTITIES.BOOK_GREEN:
      case helpers.ENTITIES.BOOK_RED:
      case helpers.ENTITIES.BOOK_REGULAR:
      case helpers.ENTITIES.BOOK_YELLOW:
      case helpers.ENTITIES.BOOK:
      case helpers.ENTITIES.BOOTS_BLUE:
      case helpers.ENTITIES.BOOTS_GOLD_BLUE:
      case helpers.ENTITIES.BOOTS_GOLD_GREEN:
      case helpers.ENTITIES.BOOTS_GOLD_RED:
      case helpers.ENTITIES.BOOTS_GOLD:
      case helpers.ENTITIES.BOOTS_GREEN:
      case helpers.ENTITIES.BOOTS_METAL_BLUE:
      case helpers.ENTITIES.BOOTS_METAL_GOLD:
      case helpers.ENTITIES.BOOTS_METAL_GREEN:
      case helpers.ENTITIES.BOOTS_METAL_RED:
      case helpers.ENTITIES.BTORCHOOTS_METAL:
      case helpers.ENTITIES.BOOTS_RED:
      case helpers.ENTITIES.BOOTS_REGULAR:
      case helpers.ENTITIES.BOOTS_SUPERIOR:
      case helpers.ENTITIES.BOOTS:
      case helpers.ENTITIES.DIAMOND:
      case helpers.ENTITIES.ELIXIR_HEAL:
      case helpers.ENTITIES.ELIXIR_POTION:
      case helpers.ENTITIES.GOLD_BAG:
      case helpers.ENTITIES.GOLD:
      case helpers.ENTITIES.HAT_SUPERIOR:
      case helpers.ENTITIES.HAT:
      case helpers.ENTITIES.HELMET_METAL_GOLD:
      case helpers.ENTITIES.HELMET_METAL:
      case helpers.ENTITIES.KNIFE_SUPERIOR:
      case helpers.ENTITIES.KNIFE:
      case helpers.ENTITIES.LIFE_HEAL:
      case helpers.ENTITIES.LIFE_POTION:
      case helpers.ENTITIES.LITTLE_MACE_SUPERIOR:
      case helpers.ENTITIES.LITTLE_MACE:
      case helpers.ENTITIES.LONG_SWORD_BLUE:
      case helpers.ENTITIES.LONG_SWORD_GREEN:
      case helpers.ENTITIES.LONG_SWORD_RED:
      case helpers.ENTITIES.LONG_SWORD:
      case helpers.ENTITIES.MANA_HEAL:
      case helpers.ENTITIES.MANA_POTION:
      case helpers.ENTITIES.SHIELD_METAL_GOLD:
      case helpers.ENTITIES.SHIELD_METAL:
      case helpers.ENTITIES.SHIELD_WOOD_METAL:
      case helpers.ENTITIES.SHIELD_WOOD_SUPERIOR:
      case helpers.ENTITIES.SHIELD_WOOD:
      case helpers.ENTITIES.STICK_SUPERIOR:
      case helpers.ENTITIES.STICK:
      case helpers.ENTITIES.SWORD_BLUE:
      case helpers.ENTITIES.SWORD_GREEN:
      case helpers.ENTITIES.SWORD_RED:
      case helpers.ENTITIES.SWORD:
      case helpers.ENTITIES.TORCH:
        element = new Item(data)
        break;
    }

    this.fixTilePosition(element.position, data.position.y, data.position.x)
    this.container.add(element)

    element.addBehaviour(new GameObject, this)
    element.userData = data
    return element
  }

  createTiles (mapkind = 'grass') {
    var xlen = this.grid.length
      , ylen = this.grid[0].length;

    for (var x = 0; x < xlen; ++x) {
      for (var y = 0; y < ylen; ++y) {
        var tile = this.grid[x][y];

        if (tile & helpers.TILE_TYPE.EMPTY) {
          continue;
        }

        // map 3d coordinates (-width/2~width/2 x -height/2~height/2)
        this.addTile(mapkind, tile, x, y);
      }
    }
  }

  addTile (mapkind, type, x, y) {
    var resource = null
      , group = null

    if (type & helpers.TILE_TYPE.FLOOR) {
      resource = 'tile-'+mapkind+'-ground'

    } else if (type & helpers.TILE_TYPE.WALL) {
      resource = (type & helpers.CORNER) ? null : 'tile-'+mapkind+'-wall'
    }

    // ignore corners for a while
    if (resource === null) return

    var tile = ResourceManager.createTileMesh(resource)

    // set tile position
    this.fixTilePosition(tile.position, x, y)

    if (type & helpers.TILE_TYPE.FLOOR) {
      group = this.ground

      // keep tile x/y reference on Object3D
      tile.userData.x = x
      tile.userData.y = y

      tile.position.y = -0.5;
      tile.rotation.x = Math.PI / 2;

      //
      // Add wall tiles on room connections
      //
      if (type & helpers.DIRECTION.NORTH) {
        this.addTile(mapkind, helpers.TILE_TYPE.WALL | helpers.DIRECTION.EAST, x, y);
        this.addTile(mapkind, helpers.TILE_TYPE.WALL | helpers.DIRECTION.WEST, x, y);
        this.addTile(mapkind, helpers.TILE_TYPE.WALL | helpers.DIRECTION.EAST, x, y + 1);
        this.addTile(mapkind, helpers.TILE_TYPE.WALL | helpers.DIRECTION.WEST, x, y + 1);

      } else if (type & helpers.DIRECTION.SOUTH) {
        this.addTile(mapkind, helpers.TILE_TYPE.WALL | helpers.DIRECTION.EAST, x, y);
        this.addTile(mapkind, helpers.TILE_TYPE.WALL | helpers.DIRECTION.WEST, x, y);
        this.addTile(mapkind, helpers.TILE_TYPE.WALL | helpers.DIRECTION.EAST, x, y - 1);
        this.addTile(mapkind, helpers.TILE_TYPE.WALL | helpers.DIRECTION.WEST, x, y - 1);

      } else if (type & helpers.DIRECTION.EAST) {
        this.addTile(mapkind, helpers.TILE_TYPE.WALL | helpers.DIRECTION.SOUTH, x, y);
        this.addTile(mapkind, helpers.TILE_TYPE.WALL | helpers.DIRECTION.NORTH, x, y);
        this.addTile(mapkind, helpers.TILE_TYPE.WALL | helpers.DIRECTION.SOUTH, x - 1, y);
        this.addTile(mapkind, helpers.TILE_TYPE.WALL | helpers.DIRECTION.NORTH, x - 1, y);

      } else if (type & helpers.DIRECTION.WEST) {
        this.addTile(mapkind, helpers.TILE_TYPE.WALL | helpers.DIRECTION.SOUTH, x, y);
        this.addTile(mapkind, helpers.TILE_TYPE.WALL | helpers.DIRECTION.NORTH, x, y);
        this.addTile(mapkind, helpers.TILE_TYPE.WALL | helpers.DIRECTION.SOUTH, x + 1, y);
        this.addTile(mapkind, helpers.TILE_TYPE.WALL | helpers.DIRECTION.NORTH, x + 1, y);
      }

    } else if (type & helpers.TILE_TYPE.WALL) {
      group = this.wall

      tile.position.y = 1
      tile.rotation.x = Math.PI;

      if (type & helpers.DIRECTION.NORTH) {
        tile.position.z += TILE_SIZE / 2

      } else if (type & helpers.DIRECTION.SOUTH) {
        tile.position.z -= TILE_SIZE / 2

      } else if (type & helpers.DIRECTION.EAST) {
        tile.rotation.y = Math.PI / 2
        tile.position.x -= TILE_SIZE / 2

      } else if (type & helpers.DIRECTION.WEST) {
        tile.rotation.y = Math.PI / 2
        tile.position.x += TILE_SIZE / 2

      }
    }

    group.push(tile)
    this.container.add(tile)
  }

  fixTilePosition(vec, x, y) {
    var xlen = this.grid.length
      , ylen = this.grid[0].length;

    vec.x = (x - (xlen / 2)) * TILE_SIZE
    vec.z = (y - (ylen / 2)) * TILE_SIZE

    return vec
  }

  cleanup () {
    let l = this.ground.length;
    while (l--) this.ground[l].parent.remove(this.ground[l])

    l = this.wall.length;
    while (l--) this.wall[l].parent.remove(this.wall[l])

    this.ground = []
    this.wall = []
  }

}