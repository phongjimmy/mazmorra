"use strict";

var Room = require('colyseus').Room
  , ClockTimer = require('clock-timer.js')

  , DungeonState = require('./states/DungeonState')

  , User = require('../db/models').User
  , Hero = require('../db/models').Hero

  , utils = require('colyseus').utils
  , protocol = require('colyseus').protocol
  , msgpack = require('msgpack-lite')

const TICK_RATE = 30

class DungeonRoom extends Room {

  constructor (options) {
    super(options)

    var mapkind = ['grass', 'rock', 'ice', 'inferno', 'castle']
    // var mapkind = ['rock', 'inferno']
      , i = Math.floor(Math.random() * mapkind.length)

    this.mapkind = options.mapkind || mapkind[i]
    console.log("Construct:", this.mapkind)
    // this.mapkind = 'rock'

    // this.mapkind = options.mapkind || "grass"
    this.progress = options.progress || 1
    this.difficulty = options.difficulty || 1

    this.players = new WeakMap()
    this.heroes = new WeakMap()
    this.clientMap = new WeakMap()

    this.setState(new DungeonState(
      this.mapkind,
      this.progress,
      this.difficulty,
      (['grass', 'ice', 'castle'].indexOf(this.mapkind) !== -1) // is daylight? // Math.random() > 0.5
      // false
    ))

    this.state.on('goto', this.onGoTo.bind(this))

    this.clock = new ClockTimer()
    this.tickInterval = setInterval(this.tick.bind(this), 1000 / TICK_RATE)
  }

  requestJoin (options) {
    var success = true;

    if (options.mapkind) success = (success && options.mapkind === this.mapkind)
    if (options.progress) success = (success && options.progress === this.progress)
    if (options.difficulty) success = (success && options.difficulty === this.difficulty)

    return ( success && this.clients.length < 10 )
  }

  onJoin (client, options) {
    console.log(client.id, 'joined')

    User.findOne({
      where: { token: options.token },
      include: [ Hero ]
    }).then(user => {
      if (!user) {
        console.log("WARNING: invalid token '"+ options.token +"'")
        return
      }
      let player = this.state.createPlayer(client, user.heros[0])
      this.heroes.set(client, user.heros[0].id)
      this.players.set(client, player)
      this.clientMap.set(player, client)
    })

    this.sendState(client)
  }

  onMessage (client, data) {
    let key = data[0]
      , value = data[1]
      , player = this.players.get(client)

    if (!player) {
      console.log("ERROR: message comming from invalid player.")
      return
    }

    if (key == 'pos') {
      this.state.move(player, value, true)
    } else if (key == 'msg') {
      // remove message after 3 seconds
      let entity = this.state.addMessage(player, value)
      this.clock.setTimeout(this.removeEntity.bind(this, entity), 3000)
    }
  }

  onGoTo (player, data) {
    this.send(this.clientMap.get(player), ['goto', data])
  }

  removeEntity (entity) {
    this.state.removeEntity(entity)
  }

  onLeave (client) {
    console.log(client.id, "leaved")

    var heroId = this.heroes.get(client)
      , player = this.players.get(client)

    if (!heroId) return;

    // sync
    Hero.update({
      lvl: player.lvl,
      gold: player.gold,
      diamond: player.diamond,
      hp: player.hp.current,
      mp: player.mp.current,
      xp: player.xp.current
    }, {
      where: { id: heroId }
    }).then(() => {
      this.players.delete(client)
      this.clientMap.delete(player)
      this.heroes.delete(client)
      this.state.removePlayer(player)
    })
  }

  tick () {
    // update game logic
    this.clock.tick()
    this.state.update(this.clock.currentTime)
  }

  dispose () {
    clearInterval(this.tickInterval)
    console.log("dispose MatchRoom", this.roomId)
  }

  _onLeave (client, isDisconnect) {
    // remove client from client list
    utils.spliceOne(this.clients, this.clients.indexOf(client))

    if (this.onLeave) this.onLeave(client)
    this.emit('leave', client, isDisconnect)

    if (!isDisconnect) {
      client.send( msgpack.encode( [protocol.LEAVE_ROOM, this.roomId] ), { binary: true }, utils.logError.bind(this) )
    }

    // // custom cleanup method & clear intervals
    // if (this.clients.length == 0) {
    //   if (this.dispose) this.dispose();
    //   clearInterval(this._patchInterval)
    //   this.emit('dispose')
    // }
  }

}

module.exports = DungeonRoom
