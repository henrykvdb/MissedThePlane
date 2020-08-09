const TILE_EDGE = 0.1
const MOVE_SPEED = 0.03

function Pilot(game, coords, dir) {

    //Move sprite in given dir
    this.move = function (dir) {
        //Return if no move
        if (dir[0] == 0 && dir[1] == 0) return

        //Update coords
        var length = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1])
        var originalCoords = this.coords.slice()
        this.coords[0] += MOVE_SPEED * dir[0] / length
        this.coords[1] += MOVE_SPEED * dir[1] / length

        if (!this.game.world.isPassable(this.coords, TILE_EDGE)) this.coords = originalCoords

        //Update orientation
        var orientation = 0
        if (dir[0] < 0 && dir[1] < 0) orientation = 0
        else if (dir[0] < 0 && dir[1] == 0) orientation = 1
        else if (dir[0] < 0 && dir[1] > 0) orientation = 2
        else if (dir[0] == 0 && dir[1] > 0) orientation = 3
        else if (dir[0] > 0 && dir[1] > 0) orientation = 4
        else if (dir[0] > 0 && dir[1] == 0) orientation = 5
        else if (dir[0] > 0 && dir[1] < 0) orientation = 6
        else if (dir[0] == 0 && dir[1] < 0) orientation = 7

        this.sprites.forEach((s, index) => {
            s.visible = index == orientation
            var worldCoords = getScreenCoords(this.game, this.coords[0], this.coords[1])
            s.x = worldCoords[0]
            s.y = worldCoords[1]
        })
    }

    // Init code of pilot
    this.coords = coords
    this.game = game

    //Create sprites
    this.sprites = []
    for (var i = 0; i < 8; i++) {
        var screenCoords = getScreenCoords(game, coords[0], coords[1])
        var sprite = game.add.sprite(screenCoords[0], screenCoords[1], 'pilot' + i)
        sprite.setScale(game.tileScale / 1.5)
        sprite.setOrigin(0.5, (800 - 265) / 800)
        sprite.visible = false
        this.sprites.push(sprite)
    }
    this.sprites[dir].visible = true

}
