HIGHER_TILES = ["M", "Q", "4", "5", "6"]

class World {
    constructor(game, tiles) {
        // Init code of world
        this.game = game
        this.tiles = convertRunwayTiles(tiles)

        //Define game drawing constants
        this.game.levelSize = this.tiles.length
        this.game.tileScale = SIZE_Y / this.game.levelSize / 240 //TODO move constants into world object
        this.game.shiftX = 1.02 * this.game.tileScale * SHIFT_X
        this.game.shiftY = 1.02 * this.game.tileScale * SHIFT_Y
        
        this.sprites = Array.from(Array(this.tiles.length)).map(() => Array.from(Array(this.tiles.length)).map(() => undefined))
        this.createSprites()

        this.buttonSounds = [this.game.sound.add('buttonDown'), this.game.sound.add('buttonUp'), this.game.sound.add('buttonBlocked')]
        this.createAnimations()
    }

    createSprites() {
        this.sprites = Array.from(Array(this.tiles.length)).map(() => Array.from(Array(this.tiles.length)).map(() => undefined))
        for (var x = 0; x < this.tiles.length; x++) {
            for (var y = 0; y < this.tiles[0].length; y++) {
                var tileSprites = [] // Array because it can be a mountain+grass combo
                if (this.tiles[x][y] == "M" || this.tiles[x][y] == "G") {
                    tileSprites.push(this.createTileSprite(x, y, "G")) // Always first grass
                    tileSprites.push(this.createTileSprite(x, y, "M"))
                    if (this.tiles[x][y] != "M") tileSprites[1].visible = false
                } else if (this.tiles[x][y] == "B") {
                    tileSprites.push(this.createTileSprite(x, y, "B0"))
                    tileSprites.push(this.createTileSprite(x, y, "B1"))
                    tileSprites[1].visible = false
                } else tileSprites.push(this.createTileSprite(x, y, this.tiles[x][y]))
                this.sprites[x][y] = tileSprites
            }
        }
    }

    createTileSprite(x, y, tileType) {  // tileType is "G", "W", etc
        var asset = assets[tileType] == undefined ? tileType : Phaser.Utils.Array.GetRandom(assets[tileType])
        var coords = getScreenCoords(this.game, x, y)
        if (tileType == "M") var sprite = this.createMountainSprite(coords)
        else var sprite = this.game.add.sprite(coords[0], coords[1], asset)
        sprite.setScale(this.game.tileScale)
        sprite.setOrigin(0.5, (800 - 284 - 85 * 2) / 800)
        sprite.setDepth(x + y + (HIGHER_TILES.includes(tileType) ? 1 : 0))
        return sprite
    }

    createAnimations() {
        for (var i = 0; i < 4; i++) { // loop through each viewAngle
            this.game.anims.create({
                key: 'shrink' + i,
                frames: [{ key: 'mountain', frame: 'mountain0' + i }, { key: 'mountain', frame: 'mountain1' + i }, { key: 'mountain', frame: 'mountain2' + i }, { key: 'mountain', frame: 'mountain3' + i }],
                frameRate: 18,
                hideOnComplete: true,
                repeat: 0
            })
            this.game.anims.create({
                key: 'grow' + i,
                frames: [{ key: 'mountain', frame: 'mountain3' + i }, { key: 'mountain', frame: 'mountain2' + i }, { key: 'mountain', frame: 'mountain1' + i }, { key: 'mountain', frame: 'mountain0' + i }],
                frameRate: 18,
                repeat: 0
            })
        }
    }

    createMountainSprite(coords) {
        var viewAngle = Math.floor(Math.random() * 3)
        var mountainSprite = this.game.add.sprite(coords[0], coords[1], 'mountain', 'mountain0' + viewAngle)
        mountainSprite.viewAngle = viewAngle
        return mountainSprite
    }

    getTile(coords) {
        if (coords[0] >= this.tiles.length || coords[0] < 0 || coords[1] >= this.tiles[0].length || coords[1] < 0) return 'A'
        return this.tiles[Math.floor(coords[0])][Math.floor(coords[1])]
    }

    collidesWith(coords, edge, collideList) {
        //Check world bounds
        if (coords[0] < edge || coords[1] < edge || coords[0] > this.game.levelSize - edge || coords[1] > this.game.levelSize - edge)
            if (collideList.includes('A')) return true

        //Check tile collision
        var collisionTiles = [[edge, 0], [-edge, 0], [0, edge], [0, -edge]].map(v => addArray(v, coords))
        collisionTiles = collisionTiles.filter(v => v[0] % 1 != 0 && v[1] % 1 != 0) //Remove bounds to make collision exclusive (needed for plane collision)
        collisionTiles = collisionTiles.filter(v => v[0] >= 0 && v[1] >= 0 && v[0] < this.game.levelSize && v[1] < this.game.levelSize) // remove tiles that are out of the map
        collisionTiles = collisionTiles.map(coords => this.getTile(coords))
        return collisionTiles.map(v => collideList.includes(v)).includes(true)
    }

    triggerButton(coords) {
        var tilePos = [Math.floor(coords[0]), Math.floor(coords[1])]
        if (coords[0] < tilePos[0] + TILE_EDGE || coords[1] < tilePos[1] + TILE_EDGE ||
            coords[0] > tilePos[0] + 1 - TILE_EDGE || coords[1] > tilePos[1] + 1 - TILE_EDGE) return
        if (this.getTile(tilePos) != "B") return // todo maybe throw error here or something

        var neighbours = getNeighbourCoords(tilePos, this.tiles.length)
        var withPlane = neighbours.filter(c => c[0] == Math.floor(this.game.plane.coords[0]) &&
            c[1] == Math.floor(this.game.plane.coords[1]) &&
                                          c[1] == Math.floor(this.game.plane.coords[1]) && 
            c[1] == Math.floor(this.game.plane.coords[1]) &&
            ["M", "G"].includes(this.getTile(c)))
        if (withPlane.length > 0) { // The plane is flying over an adjacent, blocking tile
            var blockingTile = this.sprites[withPlane[0][0]][withPlane[0][1]][0]
            this.game.tweens.addCounter({ // We will tint the tile "red", or well, remove the other colors to make it dark red
                from: 50,
                to: 255,
                duration: 500, // ms to revert to normal tile color
                onUpdate: function (tween) {
                    var value = Math.floor(tween.getValue())
                    blockingTile.setTint(Phaser.Display.Color.GetColor(255, value, value))
                }
            })
            this.buttonSounds[2].play()
            return
        }
        this.buttonSounds[this.sprites[tilePos[0]][tilePos[1]][0].visible ? 0 : 1].play()
        this.sprites[tilePos[0]][tilePos[1]].forEach(s => s.visible = !s.visible)

        // We switch neighbouring tiles from grass to mountain and vice versa
        neighbours.filter(c => ["M", "G"].includes(this.tiles[c[0]][c[1]])).forEach(c => {
            var sprite = this.sprites[c[0]][c[1]]
            if (this.tiles[c[0]][c[1]] == "M") {
                sprite[1].anims.play('shrink' + sprite[1].viewAngle, true)
            } else {
                sprite[1].visible = true
                sprite[1].anims.play('grow' + sprite[1].viewAngle, true)
            }
        })
        neighbours.forEach(c => { // Swap M to G and other way around in tiles and sprites
            if (["M", "G"].includes(this.getTile(c))) {
                this.tiles[c[0]][c[1]] = this.getTile(c) == "M" ? "G" : "M"
                this.sprites[c[0]][c[1]].tileType = this.sprites[c[0]][c[1]].tileType  == "M" ? "G" : "M"
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

function findCoord(worldTiles, tileType) {
    for (var x = 0; x < worldTiles.length; x++) {
        var y = worldTiles[x].indexOf(tileType)
        if (y > -1) return [x, y]
    }
}

// Given a list of tiles, convert the runway's E and R to R0, R1, etc
function convertRunwayTiles(tiles) {
    var endCoords = findCoord(tiles, "E")
    if (endCoords == undefined) { console.log("No end tile found!"); return tiles }
    var neighbourRunway = getNeighbourCoords(endCoords, tiles.length).filter(c => tiles[c[0]][c[1]] == "R")[0]
    var dir = endCoords.map((e, i) => e - neighbourRunway[i])
    tiles[endCoords[0]][endCoords[1]] = "R" + ((dir[0] == 0 ? 5 : 4) + (dir[0] - dir[1] > 0 ? 2 : 0)) // replace with ending piece
    while (tiles[endCoords[0] - dir[0]] != undefined && tiles[endCoords[0] - dir[0]][endCoords[1] - dir[1]] == "R") {
        endCoords = [endCoords[0] - dir[0], endCoords[1] - dir[1]]
        tiles[endCoords[0]][endCoords[1]] = "R" + (8 + (dir[0] == 0)) // replace with runway piece
    }
    tiles[endCoords[0]][endCoords[1]] = "R" + ((dir[0] - dir[1] > 0 ? 2 : 0) + (dir[0] == 0)) // replace with start piece
    return tiles
}