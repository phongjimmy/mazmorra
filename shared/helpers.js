var gen = require('random-seed')

// create predicatble random generator
var rand = gen.create()

var helpers = {
    // useful utils
    randInt: function(low, high) {
        return rand.intBetween(low, high)
    },

    randElm: function(array, start, end) {
        //ensure we have an array, and there are elements to check
        if(!array || !array.length)
            return null;

        //special case for 1 element
        if(array.length === 1)
            return array[0];

        //default for start
        if(!start || start < 0)
            start = start || 0;

        //default for end
        if(!end || end < 0)
            end = array.length - 1;

        return array[ this.randInt(start, end) ];
    },

    // useful constants
    TILE_TYPE: {
        EMPTY: 0,
        WALL: 1,
        FLOOR: 2
    },

    DIRECTION: {
        NONE: 1024,
        NORTH: 2048,
        SOUTH: 4096,
        EAST: 8192,
        WEST: 16384
    },

    CORNER: 65536,

    // game entities
    ENTITIES: {
      DOOR: 0,
      LIGHT: 1,
      CHEST: 3,
      PLAYER: 10,
      TEXT_EVENT: 11,

      // items 100~400
      ITEM_COIN: 100,

      ENEMY: 1000,
    },

    // common classes
    Room: function() {
        this.position = { x: 0, y: 0 };
        this.size = { x: 0, y: 0 };
        this.tiles = [];
        this.walls = []; //indexes for wall tiles
    }
};

module.exports = helpers
