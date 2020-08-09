const TILE_EDGE = 0.1
const PILOT_MOVE_SPEED = 0.0018 // [tiles/ms]
const IMPASSABLE_TILES = ['W', 'M','A'] // 'A' meaning 'Air'

function Pilot(game, coords, dir) {

    //Move sprite in given dir
    this.move = function (dirVector, dt) {
        //Return if no move
        if (dirVector[0] == 0 && dirVector[1] == 0) return

        //Calculate move vars
        var length = Math.sqrt(dirVector[0] * dirVector[0] + dirVector[1] * dirVector[1])
        var originalCoords = this.coords.slice()

        //Move x
        this.coords[0] += PILOT_MOVE_SPEED * dt * dirVector[0] / length
        if (this.game.world.collidesWith(this.coords, TILE_EDGE, IMPASSABLE_TILES)) this.coords = originalCoords.slice()
        else originalCoords = this.coords.slice()

        //Move y
        this.coords[1] += PILOT_MOVE_SPEED * dt * dirVector[1] / length
        if (this.game.world.collidesWith(this.coords, TILE_EDGE, IMPASSABLE_TILES)) this.coords = originalCoords

        //Update orientation
        var dir = 0
        if (dirVector[0] < 0 && dirVector[1] < 0) dir = 0
        else if (dirVector[0] < 0 && dirVector[1] == 0) dir = 1
        else if (dirVector[0] < 0 && dirVector[1] > 0) dir = 2
        else if (dirVector[0] == 0 && dirVector[1] > 0) dir = 3
        else if (dirVector[0] > 0 && dirVector[1] > 0) dir = 4
        else if (dirVector[0] > 0 && dirVector[1] == 0) dir = 5
        else if (dirVector[0] > 0 && dirVector[1] < 0) dir = 6
        else if (dirVector[0] == 0 && dirVector[1] < 0) dir = 7

        var worldCoords = getScreenCoords(this.game, this.coords[0], this.coords[1])
        this.shadow.x = worldCoords[0]
        this.shadow.y = worldCoords[1]
        this.sprites.forEach((s, index) => {
            s.visible = index == dir
            s.x = worldCoords[0]
            s.y = worldCoords[1]
        })
    }

    this.interact = function () {
        if (!this.game.world.isButton(this.coords)) return // silly user, there's no button here
        this.game.world.triggerButton(this.coords) // todo this is maybe pointless if but maybe we can show a message to the user or something
        this.game.sound.add('button').play()
    }

    // Init code of pilot
    this.coords = coords
    this.game = game

    //Create sprites
    var screenCoords = getScreenCoords(game, coords[0], coords[1])

    var shadow = game.add.sprite(screenCoords[0], screenCoords[1], 'shadow')
    shadow.setScale(game.tileScale / 4)
    shadow.setOrigin(0.5, (800 - 405) / 800)
    shadow.alpha = 0.2
    this.shadow = shadow

    this.sprites = []
    for (var i = 0; i < 8; i++) {
        var pilotSprite = game.add.sprite(screenCoords[0], screenCoords[1], 'pilot' + i)
        pilotSprite.setScale(game.tileScale / 2)
        pilotSprite.setOrigin(0.5, (800 - 265) / 800)
        pilotSprite.visible = false
        this.sprites.push(pilotSprite)
    }

    this.sprites[dir].visible = true

}
