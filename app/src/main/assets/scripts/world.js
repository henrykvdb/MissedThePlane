const TILE_SHIFT_X = 147
const TILE_SHIFT_Y = 85

class World {
    constructor(game, inputString) {

        // Init code of world
        this.game = game

        this.parameters = JSON.parse(inputString)
        var idToTile = {}
        Object.keys(TILES).forEach(name => idToTile[TILES[name].id] = TILES[name])
        this.tiles = this.parameters.tiles.map(row => row.map(tileId => idToTile[tileId]))
        this.seed = this.parameters.seed
        this.markRunway()

        //Define game drawing constants
        this.game.levelSize = this.tiles.length
        this.game.tileScale = SIZE_Y / this.game.levelSize / 240 //TODO move constants into world object
        this.game.shiftX = 1.02 * this.game.tileScale * TILE_SHIFT_X
        this.game.shiftY = 1.02 * this.game.tileScale * TILE_SHIFT_Y

        this.createSprites()

        // Instantiate pilot and plane with given parameters
        this.game.pilot = new Pilot(this.game, this.parameters.pilot.slice(0,2), this.parameters.pilot[2])
        this.game.plane = new Plane(this.game, this.parameters.plane.slice(0,2), this.parameters.plane[2])

        this.buttonSounds = [this.game.sound.add('buttonDown'), this.game.sound.add('buttonUp'), this.game.sound.add('buttonBlocked')]
    }

    // Given a list of tiles, convert the runway's E and R to R0, R1, etc
    markRunway() {
        var endCoords = this.findCoord(TILES.RUNWAY_END)
        if (endCoords == undefined) { console.log("No end tile found!"); return }
        this.runwayTiles = [endCoords]

        // Find runway direction
        var neighbourRunway = getNeighbourCoords(endCoords, this.tiles.length)
            .filter(c => this.tiles[c[0]][c[1]] == TILES.RUNWAY || this.tiles[c[0]][c[1]] == TILES.RUNWAY_START)[0]
        if(neighbourRunway==undefined) return
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
            this.runwayTiles.push(endCoords)
            next = this.tiles[endCoords[0] - dir[0]]
        }

        // Mark start
        this.tiles[endCoords[0]][endCoords[1]] = TILES.RUNWAY_START
    }

    createSprites() {
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

        this.sprites = Array.from(Array(this.tiles.length)).map(() => Array.from(Array(this.tiles.length)).map(() => undefined))
        for (var x = 0; x < this.tiles.length; x++) {
            for (var y = 0; y < this.tiles[0].length; y++) {
                var rng = this.pseudoRandom() // We always get a rng, even if it is not necessary, to ensure the seed will be the same for each tile afterwards
                var tileSprites = [] // Array because it can be a mountain+grass combo
                var tileType = this.tiles[x][y]
                if (tileType == TILES.MOUNTAIN || tileType == TILES.GRASS) {
                    tileSprites.push(this.createTileSprite(x, y, TILES.GRASS, true, rng)) // Always first grass
                    tileSprites.push(this.createTileSprite(x, y, TILES.MOUNTAIN, true, rng))
                    if (tileType != TILES.MOUNTAIN) tileSprites[1].visible = false
                } else if (tileType == TILES.BUTTON) {
                    tileSprites.push(this.createTileSprite(x, y, TILES.BUTTON, false, 0))
                    tileSprites.push(this.createTileSprite(x, y, TILES.BUTTON, false, 1))
                    tileSprites[1].visible = false
                } else {
                    tileSprites.push(this.createTileSprite(x, y, this.tiles[x][y], true, rng))
                }
                this.sprites[x][y] = tileSprites
            }
        }
    }

    createTileSprite(x, y, tileTypeEnum, random, rng) {  // random is bool indicating if it should be a random sprite, rng is either 0-1 value or asset index if not random
        if (!Object.values(TILES).includes(tileTypeEnum)) console.log(tileTypeEnum, " is not registered in TILES")
        // Choose asset from the tile's asset dictionary
        var asset;
        if (tileTypeEnum == TILES.RUNWAY_START && this.runwayIndices != undefined) asset = tileTypeEnum.assets[this.runwayIndices[0]]
        else if (tileTypeEnum == TILES.RUNWAY && this.runwayIndices != undefined) asset = tileTypeEnum.assets[this.runwayIndices[1]]
        else if (tileTypeEnum == TILES.RUNWAY_END && this.runwayIndices != undefined) asset = tileTypeEnum.assets[this.runwayIndices[2]]
        else if (!random) asset = tileTypeEnum.assets[rng]
        else if (random) asset = tileTypeEnum.assets[Math.floor(rng * tileTypeEnum.assets.length)]
        else asset = Phaser.Utils.Array.GetRandom(tileTypeEnum.assets)

        //Create the sprite
        var coords = getScreenCoords(this.game, x, y)
        var sprite = this.game.add.sprite(coords[0], coords[1], asset)
        sprite.setScale(this.game.tileScale)
        sprite.setOrigin(0.5, (800 - 284 - 85 * 2) / 800) // Magic numbers for our specific 400x800 tile resolution
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
        if (isNaN(coords[0]) || isNaN(coords[1])) return TILES.AIR
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
        neighbours.filter(c => [TILES.MOUNTAIN, TILES.GRASS].includes(this.getTile(c))).forEach(c => { // Swap M to G and other way around in tiles
            this.tiles[c[0]][c[1]] = this.getTile(c) == TILES.MOUNTAIN ? TILES.GRASS : TILES.MOUNTAIN
        })
    }

    // The plane is landing and called this function. If the pilot is standing on the runway, he should path to an accessible tile and the
    // runway should be make inaccessible to ensure he doesn't walk on it again
    clearRunway() {
        var runwayTiles = [TILES.RUNWAY, TILES.RUNWAY_START, TILES.RUNWAY_END]
        if (runwayTiles.includes(this.getTile(this.game.pilot.coords))) { // The pilot is a snobhead and needs to move out of the way
            var neighbourRunway = []
            this.runwayTiles.forEach(c => getNeighbourCoords(c, this.tiles.length).forEach(n => neighbourRunway.push(n))) // We add all tiles next to each runway tile (has duplicates)
            neighbourRunway = neighbourRunway.filter(c => !TILES_IMPASSABLE_PILOT.includes(this.getTile(c)) && !runwayTiles.includes(this.getTile(c))).map(c => {
                // We have filtered out all inaccessible neighbours, now we need to find the closest one to the pilot (using eucledian distance as runway is a straight line anyway)
                return {coord: c, distance: Math.hypot(c[0]+0.5 - this.game.pilot.coords[0], c[1]+0.5 - this.game.pilot.coords[1])}
            })
            neighbourRunway.sort((c1, c2) => c1.distance - c2.distance)
            if (neighbourRunway.length != 0) this.updatePilotPath(neighbourRunway[0].coord) // Path to closest accessible tile
            else // If there are no free tiles anywhere next to the runway, we move to the back or the front depending on how long the runway is
                this.updatePilotPath(this.findCoord(this.runwayTiles.length > PLANE_LANDING_LENGTH + 1 ? TILES.RUNWAY_END : TILES.RUNWAY_START)) 
            // TODO check if PLANE_LANDING_LENGTH is great enough when on a small enclosed runway to kill the pilot
        }
        //TILES_IMPASSABLE_PILOT = TILES_IMPASSABLE_PILOT.concat(runwayTiles) // Now we have our path, we make the current tiles inaccessible.
    }

    // Returns all pilot passable neighbours from a given coordinate, as well as _diagonal_ neighbours on the condition that the two
    // adjacent tiles next to the diagonal are passable as well.
    getPathNeighbours(coords) {
        var pos = [Math.floor(coords[0]), Math.floor(coords[1])]
        var neighbours = []
        // Add straight orthogonally adjacent
        neighbours.push([pos[0] - 1, pos[1]])
        neighbours.push([pos[0] + 1, pos[1]])
        neighbours.push([pos[0], pos[1] - 1])
        neighbours.push([pos[0], pos[1] + 1])

        // Add diagonally adjacent if possible
        // I wanted to do this in a cool way but no built-in array equivalence check made it hard, you're free to try yourself
        if ([[pos[0] - 1, pos[1]], [pos[0], pos[1] - 1]].filter(c => !TILES_IMPASSABLE_PILOT.includes(this.getTile(c))).length == 2) neighbours.push([pos[0] - 1, pos[1] - 1])
        if ([[pos[0] - 1, pos[1]], [pos[0], pos[1] + 1]].filter(c => !TILES_IMPASSABLE_PILOT.includes(this.getTile(c))).length == 2) neighbours.push([pos[0] - 1, pos[1] + 1])
        if ([[pos[0] + 1, pos[1]], [pos[0], pos[1] - 1]].filter(c => !TILES_IMPASSABLE_PILOT.includes(this.getTile(c))).length == 2) neighbours.push([pos[0] + 1, pos[1] - 1])
        if ([[pos[0] + 1, pos[1]], [pos[0], pos[1] + 1]].filter(c => !TILES_IMPASSABLE_PILOT.includes(this.getTile(c))).length == 2) neighbours.push([pos[0] + 1, pos[1] + 1])

        neighbours = neighbours.filter(c => !TILES_IMPASSABLE_PILOT.includes(this.getTile(c))) // filters out impassable neighbours as well as out-of-borders tiles (since air is impassable)
        // If the game is complete, we forbid pathing over runways
        if (this.game.levelStatus == LEVEL_STATUS.COMPLETED) neighbours = neighbours.filter(c => ![TILES.RUNWAY, TILES.RUNWAY_END, TILES.RUNWAY_START].includes(this.getTile(c)))
        return neighbours
    }

    // Returns a list of coordinates which present a pilot passable path from start to finish, startCoord excluded
    // TODO - what if end coord is impassable? do we take a tile next to it or just ignore it altogether?
    calculatePath(startCoord, endCoord) {
        startCoord = [Math.floor(startCoord[0]), Math.floor(startCoord[1])]
        console.log("Going from ", startCoord + " to " + endCoord)
        var queue = new PriorityQueue({ comparator: function (a, b) { return a.priority - b.priority; } });
        queue.queue({ priority: 0, coord: startCoord })
        var size = this.tiles.length
        var cameFrom = {}; // Keys are coords, saved as Coord[0] * this.tiles.length + Coord[1]
        var costSoFar = {};
        costSoFar[startCoord[0] * size + startCoord[1]] = 0;

        var current = undefined
        while (queue.length > 0) {
            current = queue.dequeue()
            if (current.coord[0] == endCoord[0] && current.coord[1] == endCoord[1]) break

            this.getPathNeighbours(current.coord).forEach(c => {
                var oldCost = costSoFar[current.coord[0] * size + current.coord[1]]
                var newCost = oldCost + Math.hypot(c[0] - current.coord[0], c[1] - current.coord[1]) // If some tiles slow down/speed up, it's here you should add that
                if (!(costSoFar[c[0] * size + c[1]] == undefined || newCost < oldCost)) return // "continue" in the foreach
                costSoFar[c[0] * size + c[1]] = newCost
                var priority = newCost + Math.hypot(c[0] - endCoord[0], c[1] - endCoord[1]) // We use distance to end coord as heuristic
                queue.queue({ priority: priority, coord: c })
                cameFrom[c[0] * size + c[1]] = current.coord
            })
        }

        // We have generated our dictionaries, we work our way back using cameFrom to build the most efficient path
        current = current.coord
        var result = []
        if (queue.length == 0 && !(current[0] == endCoord[0] && current[1] == endCoord[1])) return result // We simply ran out of options, there's no path
        var totalLength = 0
        var next = undefined
        while (current[0] != startCoord[0] || current[1] != startCoord[1]) {
            result.push(current)
            next = cameFrom[current[0] * size + current[1]]
            totalLength += Math.hypot(current[0] - next[0], current[1] - next[1])
            current = next
        }
        result.totalLength = totalLength;

        return result
    }

    updatePilotPath(clickedTile) {
        if (clickedTile[0] == Math.floor(this.game.pilot.coords[0]) && clickedTile[1] == Math.floor(this.game.pilot.coords[1])) { // If we click on the tile below us, we stop
            if (!this.game.pilot.nextTile) return // The user is clicking on the tile below the pilot while the pilot isn't moving, this function doesn't need to do anything
            if (clickedTile[0] == this.game.pilot.nextTile[0] && clickedTile[1] == this.game.pilot.nextTile[1]) this.game.pilot.path = [] // We're already going there, we simply need to clear path
            else if (clickedTile[0] == this.game.pilot.prevTile[0] && clickedTile[1] == this.game.pilot.prevTile[1]) this.game.pilot.cancelCurrent() // We come from here, we cancel this plan
            else console.log("ERROR: Clicked on tile below pilot without it being related to it?")
            return
        }
        if (!this.game.pilot.nextTile) {this.game.pilot.setPath(this.calculatePath(this.game.pilot.coords, clickedTile)); return} // We are not on a path already, no need for optimization mess

        if (clickedTile[0] == this.game.pilot.prevTile[0] && clickedTile[1] == this.game.pilot.prevTile[1]) // We want to go where we just came from, might as well simply cancel our current movement
            this.game.pilot.cancelCurrent()

        // If we are already on a path, check if it is faster to cancel the current movement to the next tile instead of pathing from there.
        var pathFromNext = this.calculatePath(this.game.pilot.nextTile, clickedTile)
        var pathFromPrevious = this.calculatePath(this.game.pilot.prevTile, clickedTile)
        var lengthNext = pathFromNext.totalLength + Math.hypot(this.game.pilot.coords[0] - (this.game.pilot.nextTile[0] + 0.5), this.game.pilot.coords[1] - (this.game.pilot.nextTile[1] + 0.5))
        var lengthPrev = pathFromPrevious.totalLength + Math.hypot(this.game.pilot.coords[0] - (this.game.pilot.prevTile[0] + 0.5), this.game.pilot.coords[1] - (this.game.pilot.prevTile[1] + 0.5))
        this.game.pilot.setPath(lengthNext > lengthPrev ? pathFromPrevious : pathFromNext, lengthNext > lengthPrev)
    }

    handleMouseInput(mouseX, mouseY) { // TODO: mouse input doesn't really belong in world but the contents don't belong in game scene either really
       var endCoord = getGridCoords(this.game, mouseX, mouseY)
       this.updatePilotPath(endCoord)
    }

    // Save it in a string of format {"size": size, "tiles": [1,1,1,2,1,1,1,etc], "pilot":[pilotX, pilotY, pilotDir], "plane":[planeX, planeY, planeDir]}
    exportWorldAsString(seed) {
        var exportObject = {"size": this.tiles.length}
        exportObject.tiles = this.tiles.map(row => row.map(tile => tile.id))
        exportObject.pilot = this.parameters.pilot
        exportObject.plane = this.parameters.plane
        exportObject.seed = seed
        return JSON.stringify(exportObject)
    }

    pseudoRandom() {
        var x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }
}

// Returns screen coordinate of the top of the tile
function getScreenCoords(game, levelX, levelY) {
    var posX = SIZE_X / 2 + game.shiftX * (levelY - levelX)
    var posY = SIZE_Y / 2 + game.shiftY * (levelY + levelX - game.levelSize - 0.5)
    return [posX, posY]
}

function getGridCoords(game, screenX, screenY) {
    var posY = ((screenX - SIZE_X / 2) / game.shiftX + ((screenY - SIZE_Y / 2) / game.shiftY) + 0.5 + game.levelSize) / 2
    var posX = (screenY - SIZE_Y / 2) / game.shiftY + 0.5 + game.levelSize - posY
    // console.log("["+Math.floor(posX)+","+Math.floor(posY)+"] (actual: ["+posX+","+posY+"])")
    return [Math.floor(posX), Math.floor(posY)]
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