const TILE_EDGE = 0.15
const PILOT_MOVE_SPEED = 0.0018 // [tiles/ms]
const IMPASSABLE_TILES = ['W', 'M', 'Q', 'A', '4', '5', '6']

class Pilot {
    constructor(game, coords, dir, speedMod) {
        // Init code of pilot
        this.coords = coords
        this.game = game
        this.speedMod = (speedMod ? speedMod : 1)
        this.dir = dir
        this.foundDoor = false // Bool just for home level, but eh

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

    move(dirVector, dt) {
        // Play directional idle animation if no new direction
        if (dirVector[0] == 0 && dirVector[1] == 0) {
            this.pilotSprite.anims.play('idle' + this.dir);
            return
        }

        // Play directional walk animation
        if (dirVector[0] < 0 && dirVector[1] < 0) this.dir = 0
        else if (dirVector[0] < 0 && dirVector[1] == 0) this.dir = 1
        else if (dirVector[0] < 0 && dirVector[1] > 0) this.dir = 2
        else if (dirVector[0] == 0 && dirVector[1] > 0) this.dir = 3
        else if (dirVector[0] > 0 && dirVector[1] > 0) this.dir = 4
        else if (dirVector[0] > 0 && dirVector[1] == 0) this.dir = 5
        else if (dirVector[0] > 0 && dirVector[1] < 0) this.dir = 6
        else if (dirVector[0] == 0 && dirVector[1] < 0) this.dir = 7
        this.pilotSprite.anims.play('walk' + this.dir, true)

        // Calculate move vars
        var length = Math.sqrt(dirVector[0] * dirVector[0] + dirVector[1] * dirVector[1])
        var originalCoords = this.coords.slice()

        // Move x
        this.coords[0] += PILOT_MOVE_SPEED * dt * this.speedMod * dirVector[0] / length
        if (this.game.world.collidesWith(this.coords, TILE_EDGE, IMPASSABLE_TILES)) this.coords = originalCoords.slice()
        else originalCoords = this.coords.slice()

        // Move y
        this.coords[1] += PILOT_MOVE_SPEED * dt * this.speedMod * dirVector[1] / length
        if (this.game.world.collidesWith(this.coords, TILE_EDGE, IMPASSABLE_TILES)) this.coords = originalCoords

        // Update shadow position
        var worldCoords = getScreenCoords(this.game, this.coords[0], this.coords[1])
        this.shadow.x = worldCoords[0]
        this.shadow.y = worldCoords[1]
        this.shadow.setDepth(this.coords[0] + this.coords[1] + 0.2)

        // Update pilot position
        this.pilotSprite.x = worldCoords[0]
        this.pilotSprite.y = worldCoords[1]
        this.pilotSprite.setDepth(this.coords[0] + this.coords[1] + 0.2)

        // Door check for level 0
        this.checkDoor()
    }

    checkDoor() {
        if (this.foundDoor || !(this.game.world.getTile(this.coords) == "3" && this.coords[0] < 0.3)) return
        this.foundDoor = true
        this.game.ui.btnRestart.visible = false
        this.game.ui.startPopupAnimation(true)
        audio.playPopup(true)
        if (this.game.levelIndex < ALL_LEVELS.length - 1) this.game.ui.btnNext.visible = true
    }

    interact() {
        if (this.game.world.getTile(this.coords) != "B") return
        this.game.world.triggerButton(this.coords)
    }
}
