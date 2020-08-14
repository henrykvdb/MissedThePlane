const TILE_SHIFT_X = 147
const TILE_SHIFT_Y = 85

class World {
    constructor(game, tiles) {
        // Init code of world
        this.game = game
        this.tiles = tiles

        //Define game drawing constants
        this.game.levelSize = this.tiles.length
        this.game.tileScale = SIZE_Y / this.game.levelSize / 240 //TODO move constants into world object
        this.game.shiftX = 1.02 * this.game.tileScale * TILE_SHIFT_X
        this.game.shiftY = 1.02 * this.game.tileScale * TILE_SHIFT_Y

        this.createSprites()

        this.buttonSounds = [this.game.sound.add('buttonDown'), this.game.sound.add('buttonUp'), this.game.sound.add('buttonBlocked')]
        for (var i = 0; i < 4; i++) { // loop through each viewAngle
            this.game.anims.create({
                key: 'shrink' + i,
                frames: [{ key: 'mountain0' + i }, { key: 'mountain1' + i }, { key: 'mountain2' + i }, { key: 'mountain3' + i }],
                frameRate: 18,
                hideOnComplete: true,
                repeat: 0
            })
            this.game.anims.create({
                key: 'grow' + i,
                frames: [{ key: 'mountain3' + i }, { key: 'mountain2' + i }, { key: 'mountain1' + i }, { key: 'mountain0' + i }],
                frameRate: 18,
                repeat: 0
            })
        }
    }

    // Given a list of tiles, convert the runway's E and R to R0, R1, etc
    markRunway() {
        var endCoords = this.findCoord(TILES.RUNWAY_END)
        if (endCoords == undefined) { console.log("No end tile found!"); return }

        // Find runway direction
        var neighbourRunway = getNeighbourCoords(endCoords, this.tiles.length)
            .filter(c => this.tiles[c[0]][c[1]] == TILES.RUNWAY || this.tiles[c[0]][c[1]] == TILES.RUNWAY_START)[0]
        var dir = endCoords.map((e, i) => e - neighbourRunway[i])

        // Choose asset types
        var runwayStartAssetIndex = (dir[0] - dir[1] > 0 ? 2 : 0) + (dir[0] == 0)
        var runwayMiddleAssetIndex = dir[0] == 0 ? 1 : 0
        var runwayEndAssetIndex = (dir[0] == 0 ? 1 : 0) + (dir[0] - dir[1] > 0 ? 2 : 0)
        this.runwayIndices = [runwayStartAssetIndex, runwayMiddleAssetIndex, runwayEndAssetIndex]

        // Mark middle
        var next = this.tiles[endCoords[0] - dir[0]]
        while (next != undefined && (next[endCoords[1] - dir[1]] == TILES.RUNWAY || next[endCoords[1] - dir[1]] == TILES.RUNWAY_START)) {
            endCoords = [endCoords[0] - dir[0], endCoords[1] - dir[1]]
            this.tiles[endCoords[0]][endCoords[1]] = TILES.RUNWAY
            next = this.tiles[endCoords[0] - dir[0]]
        }

        // Mark start
        this.tiles[endCoords[0]][endCoords[1]] = TILES.RUNWAY_START
    }

    createSprites() {
        this.markRunway()

        this.sprites = Array.from(Array(this.tiles.length)).map(() => Array.from(Array(this.tiles.length)).map(() => undefined))
        for (var x = 0; x < this.tiles.length; x++) {
            for (var y = 0; y < this.tiles[0].length; y++) {
                var tileSprites = [] // Array because it can be a mountain+grass combo
                var tileType = this.tiles[x][y]
                if (tileType == TILES.MOUNTAIN || tileType == TILES.GRASS) {
                    tileSprites.push(this.createTileSprite(x, y, TILES.GRASS)) // Always first grass
                    tileSprites.push(this.createTileSprite(x, y, TILES.MOUNTAIN))
                    if (tileType != TILES.MOUNTAIN) tileSprites[1].visible = false
                } else if (tileType == TILES.BUTTON) {
                    tileSprites.push(this.createTileSprite(x, y, TILES.BUTTON, 0))
                    tileSprites.push(this.createTileSprite(x, y, TILES.BUTTON, 1))
                    tileSprites[1].visible = false
                } else {
                    tileSprites.push(this.createTileSprite(x, y, this.tiles[x][y]))
                }
                this.sprites[x][y] = tileSprites
            }
        }
    }

    createTileSprite(x, y, tileTypeEnum, assetIndex) {  // tileType is TILES.GRASS, TILES.WATER, etc
        if (!Object.values(TILES).includes(tileTypeEnum)) console.log(tileTypeEnum, " is not registered in TILES")

        // Choose asset from the tile's asset dictionary
        var asset
        if (assetIndex != undefined) asset = tileTypeEnum.assets[assetIndex]
        else if (tileTypeEnum == TILES.RUNWAY_START) asset = tileTypeEnum.assets[this.runwayIndices[0]]
        else if (tileTypeEnum == TILES.RUNWAY) asset = tileTypeEnum.assets[this.runwayIndices[1]]
        else if (tileTypeEnum == TILES.RUNWAY_END) asset = tileTypeEnum.assets[this.runwayIndices[2]]
        else asset = Phaser.Utils.Array.GetRandom(tileTypeEnum.assets)

        //Create the sprite
        var coords = getScreenCoords(this.game, x, y)
        var sprite = this.game.add.sprite(coords[0], coords[1], asset)
        sprite.setScale(this.game.tileScale)
        sprite.setOrigin(0.5, (800 - 284 - 85 * 2) / 800)
        sprite.setDepth(x + y + tileTypeEnum.z_index)
        return sprite
    }

    collidesWith(coords, edge, collisionList) { // flying <=> plane, !flying <=> pilot
        //Check world bounds
        if (coords[0] < edge || coords[1] < edge || coords[0] > this.game.levelSize - edge || coords[1] > this.game.levelSize - edge)
            if (collisionList.includes(TILES.AIR)) return true

        //Check tile collision
        var collisionTiles = [[edge, 0], [-edge, 0], [0, edge], [0, -edge]].map(v => addArray(v, coords))
        collisionTiles = collisionTiles.filter(v => v[0] % 1 != 0 && v[1] % 1 != 0) //Remove bounds to make collision exclusive (needed for plane collision)
        collisionTiles = collisionTiles.filter(v => v[0] >= 0 && v[1] >= 0 && v[0] < this.game.levelSize && v[1] < this.game.levelSize) // remove tiles that are out of the map
        collisionTiles = collisionTiles.map(coords => this.getTile(coords))

        return collisionTiles.some(v => collisionList.includes(v))
    }

    getTile(coords) {
        if (coords[0] >= this.tiles.length || coords[0] < 0 || coords[1] >= this.tiles[0].length || coords[1] < 0) return TILES.AIR
        return this.tiles[Math.floor(coords[0])][Math.floor(coords[1])]
    }

    findCoord(tileType) {
        for (var x = 0; x < this.tiles.length; x++) {
            var y = this.tiles[x].indexOf(tileType)
            if (y > -1) return [x, y]
        }
    }

    triggerButton(coords) {
        var tilePos = [Math.floor(coords[0]), Math.floor(coords[1])]
        if (coords[0] < tilePos[0] + TILE_EDGE || coords[1] < tilePos[1] + TILE_EDGE ||
            coords[0] > tilePos[0] + 1 - TILE_EDGE || coords[1] > tilePos[1] + 1 - TILE_EDGE) return
        if (this.getTile(tilePos) != TILES.BUTTON) return // todo maybe throw error here or something

        var neighbours = getNeighbourCoords(tilePos, this.tiles.length)
        var withPlane = neighbours.filter(c => c[0] == Math.floor(this.game.plane.coords[0]) &&
            c[1] == Math.floor(this.game.plane.coords[1]) &&
            c[1] == Math.floor(this.game.plane.coords[1]) &&
            c[1] == Math.floor(this.game.plane.coords[1]) &&
            [TILES.MOUNTAIN, TILES.GRASS].includes(this.getTile(c)))
        if (withPlane.length > 0) { // The plane is flying over an adjacent, blocking tile
            var blockingTile = this.sprites[withPlane[0][0]][withPlane[0][1]][0]
            this.game.tweens.addCounter({ // We will tint the tile "red", or well, remove the other colors to make it dark red
                from: 50,
                to: 255,
                duration: 500, // ms to revert to normal tile color
                onUpdate: function (tween) {
                    var value = Math.floor(tween.getValue())
                    blockingTile.setTint(Phaser.Display.Color.GetColor(value, value, value))
                }
            })
            this.buttonSounds[2].play()
            return
        }
        this.buttonSounds[this.sprites[tilePos[0]][tilePos[1]][0].visible ? 0 : 1].play()
        this.sprites[tilePos[0]][tilePos[1]].forEach(s => s.visible = !s.visible)

        // We switch neighbouring tiles from grass to mountain and vice versa
        neighbours.filter(c => [TILES.MOUNTAIN, TILES.GRASS].includes(this.tiles[c[0]][c[1]])).forEach(c => {
            var sprite = this.sprites[c[0]][c[1]]
            if (this.tiles[c[0]][c[1]] == TILES.MOUNTAIN) {
                sprite[1].anims.play('shrink' + sprite[1].texture.key.substr(-1), true)
            } else {
                sprite[1].visible = true
                sprite[1].anims.play('grow' + sprite[1].texture.key.substr(-1), true)
            }
        })
        neighbours.forEach(c => { // Swap M to G and other way around in tiles and sprites
            if ([TILES.MOUNTAIN, TILES.GRASS].includes(this.getTile(c))) {
                this.tiles[c[0]][c[1]] = this.getTile(c) == TILES.MOUNTAIN ? TILES.GRASS : TILES.MOUNTAIN
                this.sprites[c[0]][c[1]].tileType = this.sprites[c[0]][c[1]].tileType == TILES.MOUNTAIN ? TILES.GRASS : TILES.MOUNTAIN
            }
        })
    }
}

// Returns screen coordinate of the top of the tile
function getScreenCoords(game, levelX, levelY) {
    var posX = SIZE_X / 2 + game.shiftX * (levelY - levelX)
    var posY = SIZE_Y / 2 + game.shiftY * (levelY + levelX - game.levelSize - 0.5)
    return [posX, posY]
}

function getNeighbourCoords(coords, fieldSize) {
    var tilePos = [Math.floor(coords[0]), Math.floor(coords[1])]
    var neighbours = []
    if (tilePos[0] != 0) neighbours.push([tilePos[0] - 1, tilePos[1]])
    if (tilePos[0] != fieldSize - 1) neighbours.push([tilePos[0] + 1, tilePos[1]])
    if (tilePos[1] != 0) neighbours.push([tilePos[0], tilePos[1] - 1])
    if (tilePos[1] != fieldSize - 1) neighbours.push([tilePos[0], tilePos[1] + 1])
    return neighbours
}
