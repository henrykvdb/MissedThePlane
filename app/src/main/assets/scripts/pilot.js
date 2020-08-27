const TILE_EDGE = 0.15
const PILOT_MOVE_SPEED = 0.0018 // [tiles/ms]

class Pilot {
    constructor(game, coords, dir) {
        // Init code of pilot
        this.coords = coords
        this.dirVector = [0, 0]
        this.game = game
        this.dir = dir
        this.foundDoor = false // Bool just for home level, but eh
        this.path = [] // Array of coordinates, in order of which to go to next
        this.prevTile = [Math.floor(this.coords[0]), Math.floor(this.coords[1])] // The previous tile in our path, to calculate how long we have been moving for to the next one

        // Create shadow sprite
        var screenCoords = getScreenCoords(game, coords[0], coords[1])
        var shadow = game.add.sprite(screenCoords[0], screenCoords[1], 'shadow')
        shadow.setScale(game.tileScale / 6)
        shadow.setOrigin(0.5, (800 - 405) / 800)
        shadow.alpha = 0.2
        shadow.setDepth(coords[0] + coords[1])
        this.shadow = shadow

        // Create pilot sprite
        this.pilotSprite = game.add.sprite(screenCoords[0], screenCoords[1], 'pilot', 'pilot' + this.dir)
        this.pilotSprite.setScale(game.tileScale / 4)
        this.pilotSprite.setOrigin(0.5, (800 - 204) / 800)
        this.pilotSprite.setDepth(coords[0] + coords[1])
        for (var i = 0; i < 8; i++) {
            game.anims.create({
                key: 'walk' + i,
                frames: [
                    { key: 'pilot', frame: 'pilot' + i },
                    { key: 'pilot', frame: 'pilot' + i + 'R' },
                    { key: 'pilot', frame: 'pilot' + i },
                    { key: 'pilot', frame: 'pilot' + i + 'L' },
                ],
                frameRate: 8,
                repeat: -1
            })
            game.anims.create({
                key: 'idle' + i,
                frames: [{ key: 'pilot', frame: 'pilot' + i },],
                frameRate: 0,
                repeat: 0
            })
        }
    }

    update(dt) {
        this.moveAlongPath(dt)
        this.updateSprites()
        this.checkDoor() // Door check for level 0
    }

    moveAlongPath(dt) {
        // Consume dt to update position until there's no more dt or end of path has been reached
        while (dt > 0) {
            if (this.nextTile == undefined) return // There's nothing more to path to
            var timeToNextTile = Math.hypot(this.coords[0] - (this.nextTile[0] + 0.5), this.coords[1] - (this.nextTile[1] + 0.5)) / PILOT_MOVE_SPEED // ms remaining for pilot
            var totalTimeToNextTile = Math.hypot(this.prevTile[0] - this.nextTile[0], this.prevTile[1] - this.nextTile[1]) / PILOT_MOVE_SPEED // total ms needed
            if (dt > timeToNextTile) { // We have more dt than time is needed to reach this tile, so we teleport to this tile and restart the loop
                this.setNextDirVector()
            } else { // We are on our way between two tiles, we update our position with the % of the time we have already spent between these tiles
                this.coords[0] = this.prevTile[0] + 0.5 + (totalTimeToNextTile - timeToNextTile + dt) / totalTimeToNextTile * (this.nextTile[0] - this.prevTile[0])
                this.coords[1] = this.prevTile[1] + 0.5 + (totalTimeToNextTile - timeToNextTile + dt) / totalTimeToNextTile * (this.nextTile[1] - this.prevTile[1])
            }
            dt = Math.max(dt - timeToNextTile, 0)
        }

        if (this.game.world.collidesWith(this.coords, TILE_EDGE, TILES_IMPASSABLE_PILOT)) console.log("ERROR: Illegal position?")
    }

    updateSprites() {
        // Update animation based on dirvector
        if (this.dirVector[0] < 0 && this.dirVector[1] < 0) this.dir = 0
        else if (this.dirVector[0] < 0 && this.dirVector[1] == 0) this.dir = 1
        else if (this.dirVector[0] < 0 && this.dirVector[1] > 0) this.dir = 2
        else if (this.dirVector[0] == 0 && this.dirVector[1] > 0) this.dir = 3
        else if (this.dirVector[0] > 0 && this.dirVector[1] > 0) this.dir = 4
        else if (this.dirVector[0] > 0 && this.dirVector[1] == 0) this.dir = 5
        else if (this.dirVector[0] > 0 && this.dirVector[1] < 0) this.dir = 6
        else if (this.dirVector[0] == 0 && this.dirVector[1] < 0) this.dir = 7

        this.pilotSprite.anims.play((this.dirVector[0] == 0 && this.dirVector[1] == 0 ? 'idle' : 'walk') + this.dir, true);

        // Update shadow position
        var worldCoords = getScreenCoords(this.game, this.coords[0], this.coords[1])
        this.shadow.x = worldCoords[0]
        this.shadow.y = worldCoords[1]
        this.shadow.setDepth(this.coords[0] + this.coords[1] + 0.2)

        // Update pilot position
        this.pilotSprite.x = worldCoords[0]
        this.pilotSprite.y = worldCoords[1]
        this.pilotSprite.setDepth(this.coords[0] + this.coords[1] + 0.2)
    }

    checkDoor() {
        if (this.foundDoor || this.game.world.getTile(this.coords) != TILES.MISC_3) return
        this.foundDoor = true
        this.game.setLevelStatus(LEVEL_STATUS.COMPLETED)
    }

    // Sets a given path for this pilot to follow
    setPath(path, cancelLast) {
        if (path.length == 0) return // TODO eventually: maybe add 'tapping on air' to stop? idk
        var currentlyOnPath = this.nextTile != undefined
        // If the first tile we would go to is in the exact opposite of our current direction, we instantly flip around
        var firstTile = path[path.length - 1]

        var nextTileIsOpposite = (Math.floor(this.coords[0]) - this.dirVector[0] == firstTile[0] && // If we are moving in a direction and see the first tile we have to move to is
            Math.floor(this.coords[1]) - this.dirVector[1] == firstTile[1]) || // In the exact opposite direction, we set this to true to instantly cancel the current move
            cancelLast // If the pathing algorithm tells us the path would be faster if we got back to our previous tile first, we cancel the current move too
        if (nextTileIsOpposite) this.cancelCurrent()
        this.path = path
        if (!currentlyOnPath && !nextTileIsOpposite) this.setNextDirVector()
    }

    // Cancels the current walking operation by pathing back to the tile we come from
    cancelCurrent() {
        if (!this.nextTile) return // We're not moving to somewhere, so no need to cancel
        this.path = []
        var s = this.nextTile; this.nextTile = this.prevTile; this.prevTile = s // Swap next and prev tile (don't try to use SO magic, i wasted an hour here)
        this.dirVector = this.nextTile.map((e, i) => e - this.prevTile[i])
    }

    // Updates dirvector as well as nextTile by getting the next tile to walk to from the current path
    setNextDirVector() {
        var currentPos = [Math.floor(this.coords[0]), Math.floor(this.coords[1])]
        this.prevTile = currentPos
        if (this.path.length == 0) { // We are done 
            this.dirVector = [0, 0]
            this.nextTile = undefined
            return
        }
        this.nextTile = this.path.pop()
        this.dirVector = this.nextTile.map((e, i) => e - currentPos[i])
        if (Math.abs(this.dirVector[0]) > 1 || Math.abs(this.dirVector[1]) > 1) console.log("ERROR: Weird pathing dirvector detected!")
    }

    destroy() {
        this.shadow.destroy()
        this.pilotSprite.destroy()
    }
}
