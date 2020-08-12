const TILE_EDGE = 0.15
const PILOT_MOVE_SPEED = 0.0018 // [tiles/ms]
const IMPASSABLE_TILES = ['W', 'M', 'Q', 'A']

function Pilot(game, coords, dir, speedMod) {

    //Move sprite in given dir
    this.move = function (dirVector, dt) {
        // Play directional idle animation if no new direction
        if (dirVector[0] == 0 && dirVector[1] == 0){
            this.pilotSprite.anims.play('idle' + this.dir);
            return
        }
        
        // Play directional walk animation
        if (dirVector[0] < 0 && dirVector[1] < 0)       this.dir = 0
        else if (dirVector[0] < 0 && dirVector[1] == 0) this.dir = 1
        else if (dirVector[0] < 0 && dirVector[1] > 0)  this.dir = 2
        else if (dirVector[0] == 0 && dirVector[1] > 0) this.dir = 3
        else if (dirVector[0] > 0 && dirVector[1] > 0)  this.dir = 4
        else if (dirVector[0] > 0 && dirVector[1] == 0) this.dir = 5
        else if (dirVector[0] > 0 && dirVector[1] < 0)  this.dir = 6
        else if (dirVector[0] == 0 && dirVector[1] < 0) this.dir = 7
        this.pilotSprite.anims.play('walk' + this.dir, true);

        //Calculate move vars
        var length = Math.sqrt(dirVector[0] * dirVector[0] + dirVector[1] * dirVector[1])
        var originalCoords = this.coords.slice()

        //Move x
        this.coords[0] += PILOT_MOVE_SPEED * dt * this.speedMod * dirVector[0] / length
        if (this.game.world.collidesWith(this.coords, TILE_EDGE, IMPASSABLE_TILES)) this.coords = originalCoords.slice()
        else originalCoords = this.coords.slice()

        //Move y
        this.coords[1] += PILOT_MOVE_SPEED * dt * this.speedMod * dirVector[1] / length
        if (this.game.world.collidesWith(this.coords, TILE_EDGE, IMPASSABLE_TILES)) this.coords = originalCoords

        var worldCoords = getScreenCoords(this.game, this.coords[0], this.coords[1])
        this.shadow.x = worldCoords[0]
        this.shadow.y = worldCoords[1]
        this.shadow.setDepth(this.coords[0] + this.coords[1] + 0.2)

        this.pilotSprite.x  = worldCoords[0]
        this.pilotSprite.y  = worldCoords[1]
        this.pilotSprite.setDepth(this.coords[0] + this.coords[1] + 0.2)
    }

    this.interact = function () {
        if (this.game.world.getTile(this.coords) != "B") return // silly user, there's no button here
        this.game.world.triggerButton(this.coords) // todo this is maybe pointless if but maybe we can show a message to the user or something
    }

    // Init code of pilot
    this.coords = coords
    this.game = game
    this.speedMod = (speedMod ? speedMod : 1)
    this.dir = dir

    // Create shadow sprite
    var screenCoords = getScreenCoords(game, coords[0], coords[1])
    var shadow = game.add.sprite(screenCoords[0], screenCoords[1], 'shadow')
    shadow.setScale(game.tileScale / 6)
    shadow.setOrigin(0.5, (800 - 405) / 800)
    shadow.alpha = 0.2
    shadow.setDepth(coords[0] + coords[1])
    this.shadow = shadow

    // Create pilot sprite
    this.pilotSprite = game.add.sprite(screenCoords[0], screenCoords[1], 'pilot', 'pilot' + this.dir + '.png')
    this.pilotSprite.setScale(game.tileScale / 4)
    this.pilotSprite.setOrigin(0.5, (800 - 204) / 800)
    this.pilotSprite.setDepth(coords[0] + coords[1])
    for (var i = 0; i < 8; i++) {
        game.anims.create({
            key: 'walk' + i,
            frames: [
                { key: 'pilot', frame: 'pilot' + i + '.png' },
                { key: 'pilot', frame: 'pilot' + i + 'R.png' },
                { key: 'pilot', frame: 'pilot' + i + '.png' },
                { key: 'pilot', frame: 'pilot' + i + 'L.png' },
            ],
            frameRate: 8,
            repeat: -1
        })
        game.anims.create({
            key: 'idle' + i,
            frames: [{ key: 'pilot', frame: 'pilot' + i + '.png' },],
            frameRate: 0,
            repeat: 0
        })
    }
}
