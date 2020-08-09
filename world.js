// File for managing everything related to a world
function World(game, tiles) {

    this.createLevel = function (tiles) {
        //Define game drawing constants
        this.game.levelSize = tiles.length
        this.game.tileScale = SIZE_Y / this.game.levelSize / 240
        this.game.shiftX = 1.02 * this.game.tileScale * SHIFT_X
        this.game.shiftY = 1.02 * this.game.tileScale * SHIFT_Y

        //Create tile sprites
        var sprites = Array.from(Array(tiles.length)).map(() => Array.from(Array(tiles.length)).map(() => undefined))
        for (var x = 0; x < tiles.length; x++) {
            for (var y = 0; y < tiles[0].length; y++) {
                var tileSprites = [] // Array because it can be a mountain+grass combo
                if (tiles[x][y] == "M" || tiles[x][y] == "G") {
                    tileSprites.push(this.createTileSprite(x, y, "G")) // Always first grass
                    tileSprites.push(this.createTileSprite(x, y, "M"))
                    tileSprites[tiles[x][y] == "M" ? 0 : 1].visible = false
                } else if (tiles[x][y] == "B") {
                    tileSprites.push(this.createTileSprite(x, y, "B0")) // Always first grass
                    tileSprites.push(this.createTileSprite(x, y, "B1"))
                    tileSprites[1].visible = false
                } else tileSprites.push(this.createTileSprite(x, y, tiles[x][y]))
                tileSprites.tileType = tiles[x][y]
                sprites[x][y] = tileSprites
            }
        }
        return sprites
    }

    this.createTileSprite = function (x, y, tileType) {  // tileType is "G", "W", etc
        var asset = Phaser.Utils.Array.GetRandom(assets[tileType])
        coords = getScreenCoords(this.game, x, y)
        var sprite = this.game.add.sprite(coords[0], coords[1], asset)
        sprite.setScale(this.game.tileScale)
        sprite.setOrigin(0.5, (800 - 284 - 85 * 2) / 800)
        sprite.setDepth(x+y + (tileType == "M" ? 1 : 0))
        return sprite
    }

    this.randomTiles = function (size) {
        return Array.from(Array(size)).map(() => Array.from(Array(size)).map(() => Phaser.Utils.Array.GetRandom(['G', 'G', 'G', 'G', 'W', 'M', 'B']))) // Ground bias xd
    }

    this.collidesWith = function (coords, edge, collideList) {
        //Check world bounds
        if (coords[0] < edge || coords[1] < edge || coords[0] > this.game.levelSize - edge || coords[1] > this.game.levelSize - edge)
            if (collideList.includes('A')) return true

        //Check tile collision
        var collisionTiles = [[edge, 0], [-edge, 0], [0, edge], [0, -edge]].map(v => addArray(v, coords))
        collisionTiles = collisionTiles.filter(v => v[0] % 1 != 0 && v[1] % 1 != 0) //Remove bounds to make collision exclusive (needed for plane collision)
        collisionTiles = collisionTiles.filter(v => v[0] >= 0 && v[1] >= 0 && v[0] < this.game.levelSize && v[1] < this.game.levelSize) // remove tiles that are out of the map
        collisionTiles = collisionTiles.map(v => this.tiles[Math.floor(v[0])][Math.floor(v[1])])
        return collisionTiles.map(v => collideList.includes(v)).includes(true)
    }

    this.isButton = function (coords) {
        return this.tiles[Math.floor(coords[0])][Math.floor(coords[1])] == "B"
    }

    this.getNeighbourCoords = function (coords) {
        var tilePos = [Math.floor(coords[0]), Math.floor(coords[1])]
        var neighbours = []
        if (tilePos[0] != 0) neighbours.push([tilePos[0] - 1, tilePos[1]])
        if (tilePos[0] != this.tiles.length - 1) neighbours.push([tilePos[0] + 1, tilePos[1]])
        if (tilePos[1] != 0) neighbours.push([tilePos[0], tilePos[1] - 1])
        if (tilePos[1] != this.tiles.length - 1) neighbours.push([tilePos[0], tilePos[1] + 1])
        return neighbours
    }

    this.triggerButton = function (coords) {
        var tilePos = [Math.floor(coords[0]), Math.floor(coords[1])]
        if (coords[0] < tilePos[0] + TILE_EDGE || coords[1] < tilePos[1] + TILE_EDGE ||
            coords[0] > tilePos[0] + 1 - TILE_EDGE || coords[1] > tilePos[1] + 1 - TILE_EDGE) return
        if (this.tiles[tilePos[0]][tilePos[1]] != "B") return // todo maybe throw error here or something
        this.sprites[tilePos[0]][tilePos[1]].forEach(s => s.visible = !s.visible)

        // We switch neighbouring tiles from grass to mountain and vice versa
        this.getNeighbourCoords(tilePos).map(c => this.sprites[c[0]][c[1]]).filter(n => ["G", "M"].includes(n.tileType)).forEach(sprites => sprites.forEach(s => s.visible = !s.visible))
        this.getNeighbourCoords(tilePos).forEach(c => { if (["M", "G"].includes(this.tiles[c[0]][c[1]])) this.tiles[c[0]][c[1]] = (this.tiles[c[0]][c[1]] == "M" ? "G" : "M") }) // Swap M to G and other way around in tiles
    }

    // Init code of world
    this.game = game
    if (tiles == undefined) tiles = this.randomTiles(5)
    this.tiles = tiles
    this.sprites = this.createLevel(tiles)
}

// Returns screen coordinate of the top of the tile
function getScreenCoords(game, levelX, levelY) {
    var posX = SIZE_X / 2 + game.shiftX * (levelY - levelX)
    var posY = SIZE_Y / 2 + game.shiftY * (levelY + levelX - game.levelSize - 0.5)
    return [posX, posY]
}