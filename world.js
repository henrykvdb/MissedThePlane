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
        var sprites = Array.from(Array(tiles.length)).map(() => Array.from(Array(tiles.length)).map(()=>undefined))
        for (var x = 0; x < tiles.length; x++) {
            for (var y = 0; y < tiles[0].length; y++) {
                var tileSprites = [] // Array because it can be a mountain+grass combo
                if (tiles[x][y] == "M" || tiles[x][y] == "G") {
                    tileSprites.push(this.createTileSprite(x, y, "G")) // Always first grass
                    tileSprites.push(this.createTileSprite(x, y, "M"))
                    tileSprites[tiles[x][y] == "M" ? 0 : 1].visible = false
                } else tileSprites.push(this.createTileSprite(x, y, tiles[x][y]))
                tileSprites.tileType = tiles[x][y]
                sprites[x][y] = tileSprites
            }
        }
        return sprites
    }

    this.createTileSprite = function(x, y, tileType) {  // tileType is "G", "W", etc
        var asset = Phaser.Utils.Array.GetRandom(assets[tileType]);
        coords = getScreenCoords(this.game, x, y);
        var sprite = this.game.add.sprite(coords[0], coords[1], asset);
        sprite.setScale(this.game.tileScale);
        sprite.setOrigin(0.5, (800 - 284 - 85 * 2) / 800);
        return sprite;
    }

    this.randomTiles = function(size) {
        return Array.from(Array(size)).map(() => Array.from(Array(size)).map(() => Phaser.Utils.Array.GetRandom(['G', 'W'])))
    }

    this.isPassable = function(coords) {
        return !IMPASSABLE_TILES.includes(this.tiles[Math.floor(coords[0])][Math.floor(coords[1])])
    }

    this.isButton = function(coords) {
        return this.tiles[Math.floor(coords[0])][Math.floor(coords[1])] == "B"
    }

    this.getNeighbourTiles = function(coords) {
        var tilePos = [Math.floor(coords[0]), Math.floor(coords[1])]
        var neighbours = [] // beautiful formatting, ahem ahem
        if (tilePos[0] != 0)                    neighbours.push(this.sprites[tilePos[0]-1][tilePos[1]])
        if (tilePos[0] != this.tiles.length-1)  neighbours.push(this.sprites[tilePos[0]+1][tilePos[1]])
        if (tilePos[1] != 0)                    neighbours.push(this.sprites[tilePos[0]][tilePos[1]-1])
        if (tilePos[1] != this.tiles.length-1)  neighbours.push(this.sprites[tilePos[0]][tilePos[1]+1])
        return neighbours
    }

    this.triggerButton = function(coords) {
        var tilePos = [Math.floor(coords[0]), Math.floor(coords[1])]
        if (this.tiles[tilePos[0]][tilePos[1]] != "B") return // todo maybe throw error here or something

        // We switch neighbouring tiles from grass to mountain and vice versa
        this.getNeighbourTiles(tilePos).filter(n=>["G", "M"].includes(n.tileType)).forEach(sprites => sprites.forEach(s => s.visible = !s.visible))
    }

    // Init code of world
    this.game = game;
    if (tiles == undefined) tiles = randomTiles(5);
    this.tiles = tiles;
    this.sprites = this.createLevel(tiles)
}

// Returns screen coordinate of the top of the tile
function getScreenCoords(game, levelX, levelY) {
    var posX = SIZE_X / 2 + game.shiftX * (levelY - levelX)
    var posY = SIZE_Y / 2 + game.shiftY * (levelY + levelX - game.levelSize - 0.5)
    return [posX, posY]
}