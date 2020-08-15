const TILE_EDGE = 0.15
const PILOT_MOVE_SPEED = 0.0018 // [tiles/ms]

class Pilot {
    constructor(game, coords, dir, speedMod) {
        // Init code of pilot
        this.coords = coords
        this.dirVector = [0, 0]
        this.game = game
        this.speedMod = (speedMod ? speedMod : 1)
        this.dir = dir
        this.foundDoor = false // Bool just for home level, but eh
        this.path = [] // Array of coordinates, in order of which to go to next

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
        // Play directional idle animation if no new direction
        if (this.dirVector[0] == 0 && this.dirVector[1] == 0) {
            this.pilotSprite.anims.play('idle' + this.dir);
            return
        }

        // Play directional walk animation
        if (this.dirVector[0] < 0 && this.dirVector[1] < 0) this.dir = 0
        else if (this.dirVector[0] <  0 && this.dirVector[1] == 0) this.dir = 1
        else if (this.dirVector[0] <  0 && this.dirVector[1] >  0) this.dir = 2
        else if (this.dirVector[0] == 0 && this.dirVector[1] >  0) this.dir = 3
        else if (this.dirVector[0] >  0 && this.dirVector[1] >  0) this.dir = 4
        else if (this.dirVector[0] >  0 && this.dirVector[1] == 0) this.dir = 5
        else if (this.dirVector[0] >  0 && this.dirVector[1] <  0) this.dir = 6
        else if (this.dirVector[0] == 0 && this.dirVector[1] <  0) this.dir = 7
        this.pilotSprite.anims.play('walk' + this.dir, true)

        
        this.moveForward(dt)
        this.updateSprites()
        this.checkWalkComplete()

        // Door check for level 0
        this.checkDoor()
    }

    moveForward(dt) {
        // Calculate move vars
        var length = Math.sqrt(this.dirVector[0] * this.dirVector[0] + this.dirVector[1] * this.dirVector[1])
        var originalCoords = this.coords.slice()

        // Move x
        this.coords[0] += PILOT_MOVE_SPEED * dt * this.speedMod * this.dirVector[0] / length
        if (this.game.world.collidesWith(this.coords, TILE_EDGE, TILES_IMPASSABLE_PILOT)) this.coords = originalCoords.slice()
        else originalCoords = this.coords.slice()

        // Move y
        this.coords[1] += PILOT_MOVE_SPEED * dt * this.speedMod * this.dirVector[1] / length
        if (this.game.world.collidesWith(this.coords, TILE_EDGE, TILES_IMPASSABLE_PILOT)) this.coords = originalCoords
    }

    updateSprites() {
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
        if (this.foundDoor || !(this.game.world.getTile(this.coords) == TILES.MISC_3 && this.coords[0] < 0.3)) return
        this.foundDoor = true
        this.game.ui.btnRestart.visible = false
        this.game.ui.startPopupAnimation(true)
        audio.playPopup(true)
        if (this.game.levelIndex < ALL_LEVELS.length - 1) this.game.ui.btnNext.visible = true
    }

    interact() {
        if (this.game.world.getTile(this.coords) != TILES.BUTTON) return
        this.game.world.triggerButton(this.coords)
    }

    // Sets a given path for this pilot to follow
    setPath(path) {
        // TODO - if path already exists, choose a smart way to break it off or something
        // TODO - (commented out stuck below) - if we are not currently on the center of our tile, add that to our path to go to first (breaks in setNextDir)
        // if (Math.hypot(this.coords[0] - (Math.floor(this.coords[0])+0.5), this.coords[1] - (Math.floor(this.coords[1])+0.5)) > 0.05)
        //     path.push([Math.floor(this.coords[0]), Math.floor(this.coords[1])])
        var currentlyOnPath = this.nextTile != undefined
        this.path = path
        if (!currentlyOnPath) this.setNextDirVector() // If we are already on a path, they will set the nextDir for us (+ we might be on a weird float right now)
    }

    // Checks if we have arrived at this.nextTile, and if so, get a new direction vector and tile to walk to from the path.
    checkWalkComplete() {
        if (this.nextTile == undefined) return
        if (Math.hypot(this.coords[0] - (this.nextTile[0]+0.5), this.coords[1] - (this.nextTile[1]+0.5)) > 0.03) return
        this.coords = [this.nextTile[0] + 0.5, this.nextTile[1] + 0.5]
        this.setNextDirVector()
    }

    // Updates dirvector as well as nextTile by getting the next tile to walk to from the current path
    setNextDirVector() {
        if (this.path.length == 0) { // We are done 
            this.dirVector = [0, 0]
            this.nextTile = undefined
            return
        }
        var currentPos = [Math.floor(this.coords[0]), Math.floor(this.coords[1])]
        this.nextTile = this.path.pop()
        this.dirVector = this.nextTile.map((e, i) => e - currentPos[i]) // TODO - assert that this is not some wonky vector?
    }
}
