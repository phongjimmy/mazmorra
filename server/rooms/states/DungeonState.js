 'use strict';

var gen = require('random-seed')

  , dungeon  = require('../../../shared/Dungeon')
  , helpers  = require('../../../shared/helpers')

  , EventEmitter  = require('events').EventEmitter
  , PF = require('pathfinding')

  , GridUtils  = require('../../utils/GridUtils')

  // entities
  , Player  = require('../../entities/Player')
  , Enemy  = require('../../entities/Enemy')
  , Unit  = require('../../entities/Unit')
  , Entity  = require('../../entities/Entity')
  , Item  = require('../../entities/Item')
  , SwitchEntity  = require('../../entities/SwitchEntity')
  , Openable  = require('../../entities/Openable')


class DungeonState extends EventEmitter {

  constructor (mapkind, difficulty, daylight) {
    super()

    // predicatble random generator
    this.rand = gen.create()

    // (gridSize, minRoomSize, maxRoomSize, maxRooms) {
    // var data = dungeon.generate({x: 16, y: 16}, {x: 4, y: 4}, {x: 8, y: 8}, 24)
    var data = dungeon.generate(this.rand, {x: 24, y: 24}, {x: 6, y: 6}, {x: 12, y: 12}, 3)

    this.mapkind = mapkind
    this.daylight = daylight

    this.grid = data[0]
    this.rooms = data[1]

    this.entities = {}
    this.players = {}

    this.gridUtils = new GridUtils(this.entities)

    // 0 = walkable, 1 = blocked
    this.pathgrid = new PF.Grid(this.grid.map(line => { return line.map(type => (type & helpers.TILE_TYPE.FLOOR) ? 0 : 1) }))
    this.finder = new PF.AStarFinder(); // { allowDiagonal: true, dontCrossCorners: true }

    this.startPosition = this.getStartPosition()
    this.createEntities()
  }

  addEntity (entity) { this.entities[ entity.id ] = entity }
  removeEntity (entity) { delete this.entities[ entity.id ] }

  createPlayer (client) {
    var player = new Player(client.id)
    player.type = helpers.ENTITIES.PLAYER
    player.position.on('move', this.onEntityMove.bind(this))
    player.position.set(this.startPosition.y, this.startPosition.x)

    this.addEntity(player)
    this.players[ player.id ] = player

    // TODO: remove me!
    client.player = player

    return player
  }

  removePlayer (player) {
    delete this.players[ player.id ]
    this.removeEntity(player)
  }

  dropItemFrom (unit) {
    let dropped = new Item(helpers.ENTITIES.GOLD, unit.position)
    this.addEntity(dropped)
  }

  createEntities () {
    // entrance door door
    var entranceDoor = new SwitchEntity(helpers.ENTITIES.DOOR)
    entranceDoor.position.x = this.startPosition.y
    entranceDoor.position.y = this.startPosition.x
    entranceDoor.goto = { identifier: 'grass', mapkind: 'grass', difficulty: 1, progress: 1 }
    this.addEntity(entranceDoor)

    this.rooms.forEach(room => {
      // if (this.rand.intBetween(0, 3) === 3) {
        // var enemy = new Enemy('skeleton')
        var enemy = new Enemy('rabbit')
        enemy.type = helpers.ENTITIES.ENEMY
        enemy.position.on('move', this.onEntityMove.bind(this))
        enemy.position.set(
          room.position.y + 1 + this.rand.intBetween(0, room.size.y - 4), // ( isn't -3 to prevent enemies to be behide walls  )
          room.position.x + 1 + this.rand.intBetween(0, room.size.x - 3)
        )
        enemy.state = this
        this.addEntity(enemy)
      // }

        var enemy = new Enemy('skeleton')
        enemy.type = helpers.ENTITIES.ENEMY
        enemy.position.on('move', this.onEntityMove.bind(this))
        enemy.position.set(
          room.position.y + 1 + this.rand.intBetween(0, room.size.y - 4), // ( isn't -3 to prevent enemies to be behide walls  )
          room.position.x + 1 + this.rand.intBetween(0, room.size.x - 3)
        )
        enemy.state = this
        this.addEntity(enemy)

        var enemy = new Enemy('rat')
        enemy.type = helpers.ENTITIES.ENEMY
        enemy.position.on('move', this.onEntityMove.bind(this))
        enemy.position.set(
          room.position.y + 1 + this.rand.intBetween(0, room.size.y - 4), // ( isn't -3 to prevent enemies to be behide walls  )
          room.position.x + 1 + this.rand.intBetween(0, room.size.x - 3)
        )
        enemy.state = this
        this.addEntity(enemy)

        var entity = new Entity()
        entity.type = helpers.ENTITIES.ROCK
        entity.position = {
          x: room.position.y + 1 + this.rand.intBetween(0, room.size.y - 4),
          y: room.position.x + 1 + this.rand.intBetween(0, room.size.x - 3)
        }
        this.addEntity(entity)
        this.pathgrid.setWalkableAt(entity.position.x, entity.position.y, false)

        var entity = new Entity()
        entity.type = helpers.ENTITIES.AESTHETICS
        entity.position = {
          x: room.position.y + 1 + this.rand.intBetween(0, room.size.y - 4),
          y: room.position.x + 1 + this.rand.intBetween(0, room.size.x - 3)
        }
        this.addEntity(entity)

        var entity = new Openable(helpers.ENTITIES.CHEST)
        entity.position = {
          x: room.position.y + 1 + this.rand.intBetween(0, room.size.y - 4),
          y: room.position.x + 1 + this.rand.intBetween(0, room.size.x - 3)
        }
        this.addEntity(entity)

        // var enemy = new Enemy('rabbit')
        // enemy.type = helpers.ENTITIES.ENEMY
        // enemy.position.on('move', this.onEntityMove.bind(this))
        // enemy.position.set(
        //   room.position.y + 1 + this.rand.intBetween(0, room.size.y - 4), // ( isn't -3 to prevent enemies to be behide walls  )
        //   room.position.x + 1 + this.rand.intBetween(0, room.size.x - 3)
        // )
        // enemy.state = this
        // this.addEntity(enemy)

        // var heal = new Item(helpers.ENTITIES.LIFE_HEAL, {
        //   x: room.position.y + 1 + this.rand.intBetween(0, room.size.y - 4), // ( isn't -3 to prevent enemies to be behide walls  )
        //   y: room.position.x + 1 + this.rand.intBetween(0, room.size.x - 3)
        // })
        // this.addEntity(heal)
    })

  }

  onEntityMove (moveEvent, prevX, prevY, currentX, currentY) {
    var entity = moveEvent.target

    // check if target position has been changed
    if (entity.position.target) {

      // TODO: improve me
      if (entity.position.target instanceof Unit &&
          entity.position.target.isAlive &&
          currentX === entity.position.target.position.x &&
          currentY === entity.position.target.position.y) {
        moveEvent.cancel()
        return
      }

      if (
          entity.position.destiny && (
            entity.position.destiny.x !== entity.position.target.position.x ||
            entity.position.destiny.y !== entity.position.target.position.y
          )
      ) {
        entity.position.x = currentX
        entity.position.y = currentY
        this.move(entity, { x: entity.position.target.position.y, y: entity.position.target.position.x }, false)
      }

      // check if player picked up some item
      if (moveEvent.target instanceof Player) {
        this.checkOverlapingEntities(moveEvent.target, currentX, currentY)
      }
    }

    // if (prevX && prevY) this.pathgrid.setWalkableAt(prevX, prevY, true)
    // console.log(entity, currentX, currentY)
    // this.pathgrid.setWalkableAt(currentX, currentY, false)
  }

  checkOverlapingEntities (player, x, y) {
    var entities = this.gridUtils.getAllEntitiesAt(y, x)

    for (var i=0; i<entities.length; i++) {
      let entity = entities[i]
      if (!(entity instanceof Unit)) {

        // TODO: refactor me!
        if (entity.type === helpers.ENTITIES.GOLD) {
          let gold = Math.floor(Math.random() * 5)+1
          player.gold += gold
          this.addTextEvent("+" + gold, player.position, 'yellow', 100)
          this.removeEntity( entity )

        } else if (entity.type === helpers.ENTITIES.LIFE_HEAL) {
          let heal = Math.floor(Math.random() * 10)+10
          player.hp.current += heal
          this.addTextEvent("+" + heal, player.position, 'red', 100)
          this.removeEntity( entity )

        } else if (entity.type === helpers.ENTITIES.MANA_HEAL) {
          let heal = Math.floor(Math.random() * 10)+10
          player.mp.current += heal
          this.addTextEvent("+" + heal, player.position, 'blue', 100)
          this.removeEntity( entity )

        } else if (entity.type === helpers.ENTITIES.CHEST) {
          entity.action = {type: 'open'}

        } else if (entity.type === helpers.ENTITIES.DOOR) {
          console.log("ENTER DOOR!")
          this.emit('goto', player, entity.goto)
        }

      }
    }
  }

  move (player, destiny, allowChangeTarget) {
    if (destiny.x == player.position.y && destiny.y == player.position.x) {
      return false;
    }

    if (typeof(allowChangeTarget)==="undefined") {
      allowChangeTarget = true
    }

    var moves = this.finder.findPath(
      player.position.x, player.position.y,
      destiny.y, destiny.x, // TODO: why need to invert x/y here?
      this.pathgrid.clone() // FIXME: we shouldn't create leaks that way!
    );

    moves.shift() // first block is always the starting point, we don't need it

    if (allowChangeTarget) {
      player.position.target = this.gridUtils.getEntityAt(destiny.x, destiny.y)
      // TODO: refactor me
      if (player.position.target instanceof Unit && player.position.target.isAlive) {
        player.attack(player.position.target)
      } else {
        player.attack(null)
      }
    }

    player.position.moveTo(moves)
  }

  addMessage (player, message) {
    return this.addTextEvent(message, player.position, false, false, true)
  }

  addTextEvent (text, position, kind, ttl, small) {
    var textEvent = new Entity()
    if (kind) { textEvent.kind = kind }
    if (ttl) { textEvent.ttl = ttl }
    if (small) { textEvent.small = true }
    textEvent.type = helpers.ENTITIES.TEXT_EVENT
    textEvent.text = text
    textEvent.position = position
    this.addEntity(textEvent)
    return textEvent
  }

  update (currentTime) {
    for (var id in this.entities) {
      this.entities[id].update(currentTime)
    }
  }

  getStartPosition () {
    var firstRoom = this.rooms[0]
      , likelyTiles = []

    for (var i=1, l=firstRoom.size.x-2; i<=l; i++) {
      if (this.grid[firstRoom.position.x + i][firstRoom.position.y] & helpers.TILE_TYPE.WALL) {
        likelyTiles.push( firstRoom.position.x + i )
      }
    }

    var rand = this.rand.intBetween(0, likelyTiles.length-1)
    return { x: likelyTiles[ rand ], y: firstRoom.position.y + 1 }
  }

  toJSON () {
    return {
      mapkind: this.mapkind,
      daylight: this.daylight,
      grid: this.grid,
      // players: this.players,
      entities: this.entities,
    }
  }

}

module.exports = DungeonState
