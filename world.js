// File for managing everything related to a world

const IMPASSABLE_TILES = ['W']

function World(game, tiles) {

    this.createLevel = function(tiles) {
        //Define game drawing constants
        this.game.levelSize = tiles.length
        this.game.tileScale = SIZE_Y / this.game.levelSize / 240
        this.game.shiftX = 1.02 * this.game.tileScale * SHIFT_X
        this.game.shiftY = 1.02 * this.game.tileScale * SHIFT_Y

        //Create tile sprites
        var sprites = Array(this.game.levelSize).fill(Array(this.game.levelSize))
        for (var x = 0; x < tiles.length; x++) {
            for (var y = 0; y < tiles[0].length; y++) {
                var asset = Phaser.Utils.Array.GetRandom(assets[tiles[x][y]])
                coords = getScreenCoords(this.game, x, y)
                var sprite = this.game.add.sprite(coords[0], coords[1], asset)
                sprite.setScale(this.game.tileScale)
                sprite.setOrigin(0.5, (800 - 284 - 85 * 2) / 800)
                sprites[x][y] = sprite
            }
        }
        return sprites
    }

    this.randomTiles = function(size) {
        return Array.from(Array(size)).map(() => Array.from(Array(size)).map(() => Phaser.Utils.Array.GetRandom(['G', 'W'])))
    }

    this.isPassable = function(coords) {
        return !IMPASSABLE_TILES.includes(this.tiles[Math.floor(coords[0])][Math.floor(coords[1])])
    }

    // Init code of world
    this.game = game;
    if (tiles == undefined) tiles = randomTiles(5);
    this.tiles = tiles;
    this.world = this.createLevel(tiles)
}

// Returns screen coordinate of the top of the tile
function getScreenCoords(game, levelX, levelY) {
    var posX = SIZE_X / 2 + game.shiftX * (levelY - levelX)
    var posY = SIZE_Y / 2 + game.shiftY * (levelY + levelX - game.levelSize - 0.5)
    return [posX, posY]
}