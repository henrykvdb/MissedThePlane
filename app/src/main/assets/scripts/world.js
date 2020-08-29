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
        if (!this.parameters.seed) this.parameters.seed = Math.random() * 100000
        this.seed = this.parameters.seed

        //Define game drawing constants
        this.game.levelSize = this.tiles.length
        this.game.tileScale = SIZE_Y / this.game.levelSize / 240 //TODO move constants into world object
        this.game.shiftX = 1.02 * this.game.tileScale * TILE_SHIFT_X
        this.game.shiftY = 1.02 * this.game.tileScale * TILE_SHIFT_Y

        this.runwayCoords = []
        this.createSprites()

        // Instantiate pilot and plane with given parameters
        this.pilot = new Pilot(this.game, this.parameters.pilot.slice(0, 2), this.parameters.pilot[2])
        this.plane = new Plane(this.game, this.parameters.plane.slice(0, 2), this.parameters.plane[2])

        this.buttonSounds = [this.game.sound.add('buttonDown'), this.game.sound.add('buttonUp'), this.game.sound.add('buttonBlocked')]
    }

    createSprites() {
        for (var i = 0; i < 4; i++) {
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
                this.sprites[x][y] = this.createTileSprite(x, y, true, this.pseudoRandom(x*this.tiles.length+y))
            }
        }
    }

    createTileSprite(x, y, random, rng) {  // random is bool indicating if it should be a random sprite, rng is either 0-1 value or asset index if not random
        var tileTypeEnum = this.tiles[x][y]
        if (!Object.values(TILES).includes(tileTypeEnum)) console.log(tileTypeEnum, " is not registered in TILES")

        // Choose asset from the tile's asset dictionary
        var asset;
        if (tileTypeEnum == TILES.RUNWAY) {
            this.runwayCoords.push([x, y])
            var neighbours = getNeighbourCoords([x, y]).map((c, i) => [this.getTile(c), i]).filter(t => t[0] == TILES.RUNWAY)
            if (neighbours.length == 0) asset = tileTypeEnum.assets[2] // default orientation 1 long runway
            else if (neighbours.length == 1) asset = tileTypeEnum.assets[2 + neighbours[0][1]] // End runway
            else asset = tileTypeEnum.assets[neighbours[0][1]] // Center runway
        }
        else if (tileTypeEnum == TILES.BUTTON || tileTypeEnum == TILES.BUTTON_OTHER){
            if(random) asset = tileTypeEnum.assets[0]
            else asset = tileTypeEnum.assets[rng]
        }
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

    nextAsset(coords) {
        var x = Math.floor(coords[0]); var y = Math.floor(coords[1])
        var tile = this.tiles[x][y]
        var sprite = this.sprites[x][y]

        this.sprites[x][y].destroy()
        var nextAsset = (tile.assets.indexOf(sprite.texture.key) + 1) % tile.assets.length
        this.sprites[x][y] = this.createTileSprite(x, y, false, nextAsset)
    }

    setTile(coords, type) {
        var x = coords[0]; var y = coords[1]
        this.tiles[x][y] = type
        this.sprites[x][y].destroy()
        this.sprites[x][y] = this.createTileSprite(x, y, true, this.pseudoRandom(x*this.tiles.length+y))
    }

    getTile(coords) {
        if (isNaN(coords[0]) || isNaN(coords[1])) return TILES.AIR
        if (coords[0] >= this.tiles.length || coords[0] < 0 || coords[1] >= this.tiles[0].length || coords[1] < 0) return TILES.AIR
        return this.tiles[Math.floor(coords[0])][Math.floor(coords[1])]
    }

    triggerButton() {
        var coords = this.pilot.coords
        var tilePos = [Math.floor(coords[0]), Math.floor(coords[1])]
        if (coords[0] < tilePos[0] + TILE_EDGE || coords[1] < tilePos[1] + TILE_EDGE ||
            coords[0] > tilePos[0] + 1 - TILE_EDGE || coords[1] > tilePos[1] + 1 - TILE_EDGE) return
        if (this.getTile(tilePos) != TILES.BUTTON && this.getTile(tilePos) != TILES.BUTTON_OTHER) return

        // Check if blocked
        var neighbours = this.getTile(tilePos) == TILES.BUTTON ?getNeighbourCoords(tilePos):getNeighbourDiagonalCoords(tilePos)
        var withPlane = neighbours.filter(c => c[0] == Math.floor(this.plane.coords[0]) &&
            c[1] == Math.floor(this.plane.coords[1]) &&
            [TILES.MOUNTAIN, TILES.GRASS].includes(this.getTile(c)))
        if (withPlane.length > 0) { // The plane is flying over an adjacent, blocking tile
            var blockingTile = this.sprites[withPlane[0][0]][withPlane[0][1]]
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

        // Play button sound, swap texture and cancel route
        var x = Math.floor(coords[0]); var y = Math.floor(coords[1])
        this.buttonSounds[this.tiles[x][y].assets.indexOf(this.sprites[x][y].texture.key)].play()
        this.nextAsset(tilePos)
        this.updatePilotPath(tilePos)

        // We switch neighbouring tiles from grass to mountain and vice versa
        neighbours.filter(c => [TILES.MOUNTAIN, TILES.GRASS].includes(this.getTile(c))).forEach(c => {
            var scene = this
            var tile = this.tiles[c[0]][c[1]]
            var sprite = this.sprites[c[0]][c[1]]
            var animationIndex = Math.floor(this.pseudoRandom(c[0]*this.tiles.length+c[1])*4)

            // Play switch animation
            if (sprite.anims.isPlaying) sprite.anims.reverse('grow'+animationIndex)
            else {
                if (tile == TILES.MOUNTAIN) sprite.anims.playReverse('grow'+animationIndex)
                else sprite.anims.play('grow'+animationIndex)
                sprite.on('animationcomplete', function () {
                    sprite.destroy()
                    scene.sprites[c[0]][c[1]] = scene.createTileSprite(c[0], c[1], true, scene.pseudoRandom(c[0]*scene.tiles.length+c[1]))
                })
            }

            // Flip tiles
            this.tiles[c[0]][c[1]] = this.getTile(c) == TILES.MOUNTAIN ? TILES.GRASS : TILES.MOUNTAIN
        })
    }

    // The plane is landing and called this function. If the pilot is standing on the runway, he should path to an accessible tile and the
    // runway should be make inaccessible to ensure he doesn't walk on it again
    clearRunway() {
        if (TILES.RUNWAY == this.getTile(this.pilot.coords)) { // The pilot is a snobhead and needs to move out of the way
            // Get neighbour tiles of the runways
            var neighbourRunway = []
            this.runwayCoords.forEach(c => getNeighbourCoords(c).forEach(c => neighbourRunway.push(c)))
            neighbourRunway = neighbourRunway.filter(c => !TILES_IMPASSABLE_PILOT.includes(this.getTile(c)) && TILES.RUNWAY != this.getTile(c)).map(c => {
                // We have filtered out all inaccessible neighbours, now we need to find the closest one to the pilot (using eucledian distance as runway is a straight line anyway)
                return { coord: c, distance: Math.hypot(c[0] + 0.5 - this.pilot.coords[0], c[1] + 0.5 - this.pilot.coords[1]) }
            })
            neighbourRunway.sort((c1, c2) => c1.distance - c2.distance)

            // Path to closest accessible tile
            if (neighbourRunway.length != 0) this.updatePilotPath(neighbourRunway[0].coord)
            // If there are no free tiles anywhere next to the runway, we move to the back or the front depending on how long the runway is
            else {
                var startTile = [Math.floor(this.plane.coords[0]), Math.floor(this.plane.coords[1])]
                if (this.runwayCoords.length > PLANE_LANDING_LENGTH + 1) { //Path to end
                    var endTile = this.runwayCoords.filter(c => TILES.RUNWAY.assets.indexOf(this.sprites[c[0]][c[1]].texture.key) >= 2)
                    endTile = endTile.filter(c => c[0] != startTile[0] || c[1] != startTile[1])
                    this.updatePilotPath(endTile[0])
                }
                else { //Path to beginning
                    this.updatePilotPath(startTile)
                }
            }
        }
    }

    // Filters out tiles based on multiple conditions
    isValidNeighbour(pos1, nextPos) {
        var nextTile = this.getTile(nextPos)
        if (TILES_IMPASSABLE_PILOT.includes(nextTile)) return false

        var diff = nextPos.map((e, i) => e - pos1[i])
        if (Math.abs(diff[0]) > 1 || Math.abs(diff[1]) > 1) return false
        if (diff[0] == 1 && diff[1] == 0  && nextTile == TILES.ONEWAY_0) return false
        if (diff[0] == -1 && diff[1] == 0 && nextTile == TILES.ONEWAY_2) return false
        if (diff[0] == 0 && diff[1] == 1  && nextTile == TILES.ONEWAY_3) return false
        if (diff[0] == 0 && diff[1] == -1 && nextTile == TILES.ONEWAY_1) return false

        if (diff[0] == 1 && diff[1] == 1 && [TILES.ONEWAY_0, TILES.ONEWAY_3].includes(nextTile)) return false
        if (diff[0] == -1 && diff[1] == 1 && [TILES.ONEWAY_2, TILES.ONEWAY_3].includes(nextTile)) return false
        if (diff[0] == 1 && diff[1] == -1 && [TILES.ONEWAY_0, TILES.ONEWAY_1].includes(nextTile)) return false
        if (diff[0] == -1 && diff[1] == -1 && [TILES.ONEWAY_1, TILES.ONEWAY_2].includes(nextTile)) return false

        if (this.game.levelStatus == LEVEL_STATUS.COMPLETED && nextTile == TILES.RUNWAY) return false // If the game is complete, we forbid pathing over runways
        return true
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
        if ([[pos[0] - 1, pos[1]], [pos[0], pos[1] - 1]].filter(c => this.isValidNeighbour(pos, c)).length == 2) neighbours.push([pos[0] - 1, pos[1] - 1])
        if ([[pos[0] - 1, pos[1]], [pos[0], pos[1] + 1]].filter(c => this.isValidNeighbour(pos, c)).length == 2) neighbours.push([pos[0] - 1, pos[1] + 1])
        if ([[pos[0] + 1, pos[1]], [pos[0], pos[1] - 1]].filter(c => this.isValidNeighbour(pos, c)).length == 2) neighbours.push([pos[0] + 1, pos[1] - 1])
        if ([[pos[0] + 1, pos[1]], [pos[0], pos[1] + 1]].filter(c => this.isValidNeighbour(pos, c)).length == 2) neighbours.push([pos[0] + 1, pos[1] + 1])

        neighbours = neighbours.filter(c => this.isValidNeighbour(pos, c)) // filters out impassable neighbours as well as out-of-borders tiles (since air is impassable)
        return neighbours
    }

    // Returns a list of coordinates which present a pilot passable path from start to finish, startCoord excluded
    calculatePath(startCoord, endCoord) {
        startCoord = [Math.floor(startCoord[0]), Math.floor(startCoord[1])]
        // console.log("Going from ", startCoord + " to " + endCoord)
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
                if (!(costSoFar[c[0] * size + c[1]] == undefined || newCost < costSoFar[c[0]*size+c[1]])) return // "continue" in the foreach
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
        if (clickedTile[0] == Math.floor(this.pilot.coords[0]) && clickedTile[1] == Math.floor(this.pilot.coords[1])) { // If we click on the tile below us, we stop
            if (!this.pilot.nextTile) return // The user is clicking on the tile below the pilot while the pilot isn't moving, this function doesn't need to do anything
            if (clickedTile[0] == this.pilot.nextTile[0] && clickedTile[1] == this.pilot.nextTile[1]) this.pilot.path = [] // We're already going there, we simply need to clear path
            else if (clickedTile[0] == this.pilot.prevTile[0] && clickedTile[1] == this.pilot.prevTile[1]) this.pilot.cancelCurrent() // We come from here, we cancel this plan
            else console.log("ERROR: Clicked on tile below pilot without it being related to it?")
            return
        }
        if (!this.pilot.nextTile) { this.pilot.setPath(this.calculatePath(this.pilot.coords, clickedTile)); return } // We are not on a path already, no need for optimization mess

        var canGoBack = this.isValidNeighbour([Math.floor(this.pilot.coords[0]), Math.floor(this.pilot.coords[1])], this.pilot.prevTile)
        if (clickedTile[0] == this.pilot.prevTile[0] && clickedTile[1] == this.pilot.prevTile[1] && canGoBack) // We want to go where we just came from, might as well simply cancel our current movement
                this.pilot.cancelCurrent()

        // If we are already on a path, check if it is faster to cancel the current movement to the next tile instead of pathing from there.
        var pathFromNext = this.calculatePath(this.pilot.nextTile, clickedTile)
        var pathFromPrevious = this.calculatePath(this.pilot.prevTile, clickedTile)
        var lengthNext = pathFromNext.totalLength + Math.hypot(this.pilot.coords[0] - (this.pilot.nextTile[0] + 0.5), this.pilot.coords[1] - (this.pilot.nextTile[1] + 0.5))
        var lengthPrev = pathFromPrevious.totalLength + Math.hypot(this.pilot.coords[0] - (this.pilot.prevTile[0] + 0.5), this.pilot.coords[1] - (this.pilot.prevTile[1] + 0.5))
        this.pilot.setPath(lengthNext > lengthPrev && canGoBack ? pathFromPrevious : pathFromNext, lengthNext > lengthPrev && canGoBack)
    }

    handleMouseInput(mouseX, mouseY) {
        var endCoord = getGridCoords(this.game, mouseX, mouseY)
        this.updatePilotPath(endCoord)
    }

    rotateOneways() {
        for (var x = 0; x < this.tiles.length; x++) {
            for (var y = 0; y < this.tiles[0].length; y++) {
                if (![TILES.ONEWAY_0, TILES.ONEWAY_1, TILES.ONEWAY_2, TILES.ONEWAY_3].includes(this.getTile([x, y]))) continue;
                this.setTile([x, y], eval("TILES.ONEWAY_" + ((parseInt(this.sprites[x][y].texture.key.substr(-1)) + 1) % 4)))
            }
        }
    }

    // Save it in a string of format {"size": size, "tiles": [[1,1,1,2],[1,1,1,etc]], "pilot":[pilotX, pilotY, pilotDir], "plane":[planeX, planeY, planeDir]}
    exportWorldAsString() {
        var exportObject = { "size": this.tiles.length }
        exportObject.tiles = this.tiles.map(row => row.map(tile => tile.id))
        exportObject.pilot = [this.pilot.coords[0], this.pilot.coords[1], this.pilot.dir]
        exportObject.plane = [this.plane.coords[0], this.plane.coords[1], this.plane.dir]
        exportObject.difficulty = this.parameters.difficulty
        exportObject.seed = this.parameters.seed
        return JSON.stringify(exportObject)
    }

    pseudoRandom(posNumber) {
        var x = Math.sin(this.seed + posNumber) * 10000;
        return x - Math.floor(x);
    }

    destroy() {
        this.sprites.forEach(row => row.forEach(sprite => sprite.destroy()))
        this.plane.destroy()
        this.pilot.destroy()
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
    return [Math.floor(posX), Math.floor(posY)]
}

function getNeighbourCoords(coords) {
    var tilePos = [Math.floor(coords[0]), Math.floor(coords[1])]
    var neighbours = [] // NE first then clockwise, runways rely on this
    neighbours.push([tilePos[0] - 1, tilePos[1]])
    neighbours.push([tilePos[0], tilePos[1] + 1])
    neighbours.push([tilePos[0] + 1, tilePos[1]])
    neighbours.push([tilePos[0], tilePos[1] - 1])
    return neighbours
}

function getNeighbourDiagonalCoords(coords) {
    var tilePos = [Math.floor(coords[0]), Math.floor(coords[1])]
    var neighbours = [] // NE first then clockwise, runways rely on this
    neighbours.push([tilePos[0] - 1, tilePos[1] - 1])
    neighbours.push([tilePos[0] - 1, tilePos[1] + 1])
    neighbours.push([tilePos[0] + 1, tilePos[1] + 1])
    neighbours.push([tilePos[0] + 1, tilePos[1] - 1])
    return neighbours
}
