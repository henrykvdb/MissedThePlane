const PLANE_MOVE_SPEED = 0.001 // [tiles/ms]
const PLANE_WAIT_TIME = 300 // [ms]
const PLANE_LANDING_LENGTH = 1.7 // [tiles] // TODO eventually: base this on strip length (although maybe even better to simply drive over ground after tile 2)
const PLANE_HEIGHT = 120 // [px]
const PLANE_IMPASSABLE_TILES = ['M','Q']
const PLANE_FINISH = ['R0', 'R1', 'R2', 'R3']

function Plane(game, coords, dir) {

    //Move sprite in given dir
    this.move = function (dt) {
        if (this.finished) return
        var originalCoords = this.coords.slice()
        this.coords[0] += PLANE_MOVE_SPEED * dt * this.dirVector[0]
        this.coords[1] += PLANE_MOVE_SPEED * dt * this.dirVector[1]

        // Rotate if collision
        if (this.dir % 2 == 0 || (this.game.world.collidesWith(this.coords, 0.5, PLANE_IMPASSABLE_TILES) &&  //Check half a tile in advance so plane stays centered
            PLANE_IMPASSABLE_TILES.includes(this.game.world.getTile(addArray(this.coords, this.dirVector))))) { // check if next is actually impassable
            this.coords = originalCoords
            this.waitTime -= dt

            if (this.waitTime < 0) {
                this.waitTime = PLANE_WAIT_TIME
                this.dir = (++this.dir) % 8

                if (this.dir % 2 == 1) {
                    //Rotate right
                    var oldDir = this.dirVector.slice()
                    this.dirVector[0] = oldDir[1]
                    this.dirVector[1] = -oldDir[0]

                    //Put the plane at exact the right spot so it doesn't accidently collide with other stuff
                    this.coords[0] = 0.5 + Math.round(this.coords[0] - 0.5)
                    this.coords[1] = 0.5 + Math.round(this.coords[1] - 0.5)
                }
            }
        }

        // handle landing of plane
        if (this.height != PLANE_HEIGHT && this.height > 0) this.height -= dt * PLANE_HEIGHT * PLANE_MOVE_SPEED / PLANE_LANDING_LENGTH
        if (this.height == PLANE_HEIGHT && this.game.world.collidesWith(this.coords, 0, PLANE_FINISH) &&
            this.game.world.getTile(addArray(this.coords, this.dirVector))[0] == "R") {  // check if the next tile is a runway as well
            console.log("Starting with landing!")
            this.height -= 0.001 // uhh, well, i mean
        }
        if (this.height <= 0 && !this.finished) {
            console.log("Victory!") //TODO sound
            this.finished = true;
            game.ui.btnRestart.visible = false;
            game.ui.startPopupAnimation(true)
            if (game.levelIndex < ALL_LEVELS.length - 1) game.ui.btnNext.visible = true;
        }

        // Check if plane is leaving world
        if (!this.escaped && (
            this.coords[0] < 0 && this.dir == 1 || this.coords[0] > this.game.world.tiles.length && this.dir == 5 || 
            this.coords[1] < 0 && this.dir == 7 || this.coords[1] > this.game.world.tiles[0].length && this.dir == 3)) {
                this.game.ui.startPopupAnimation(false)
                this.game.tweens.add({ // fade out shadow
                    targets: this.shadow,
                    alpha: 0,
                    duration: 300,
                    ease: 'Linear',
                    delay: 0
                });
                this.escaped = true;
        }

        // Update sprites
        var worldCoords = getScreenCoords(this.game, this.coords[0], this.coords[1])
        this.shadow.x = worldCoords[0]
        this.shadow.y = worldCoords[1]
        this.shadow.setDepth(this.coords[0] + this.coords[1])
        this.sprites.forEach((s, index) => {
            s.visible = index == this.dir
            s.x = worldCoords[0]
            s.y = worldCoords[1]
            s.setOrigin(0.5, (800 - 320 + this.height) / 800)
            s.setDepth(this.coords[0] + this.coords[1] + 2) // TODO base this on height, although it will always look awkward without player collision
        })
    }

    // Init code of plane
    this.dir = dir
    this.coords = coords
    this.game = game
    if (dir == 1) this.dirVector = [-1, 0]
    else if (dir == 3) this.dirVector = [0, 1]
    else if (dir == 5) this.dirVector = [1, 0]
    else if (dir == 7) this.dirVector = [0, -1]
    this.waitTime = PLANE_WAIT_TIME
    this.height = PLANE_HEIGHT
    this.finished = false;
    this.escaped = false;

    // Create sprites
    var screenCoords = getScreenCoords(game, coords[0], coords[1])

    var shadow = game.add.sprite(screenCoords[0], screenCoords[1], 'shadow')
    shadow.setScale(game.tileScale / 4)
    shadow.setOrigin(0.5, (800 - 405) / 800)
    shadow.alpha = 0.2
    shadow.setDepth(coords[0], coords[1])
    this.shadow = shadow

    this.sprites = []
    for (var i = 0; i < 8; i++) {
        var sprite = game.add.sprite(screenCoords[0], screenCoords[1], 'plane' + i)
        sprite.setScale(game.tileScale / 2)
        sprite.setOrigin(0.5, (800 - 320 + this.height) / 800)
        sprite.visible = false
        sprite.setDepth(coords[0] + coords[1] + 2)
        this.sprites.push(sprite)
    }
    this.sprites[dir].visible = true

}
