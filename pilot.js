function Pilot(game, coords) {
    this.coords = coords
    this.game = game

    this.sprites = []
    for (var i = 0; i < 8; i++) this.sprites.push(createSprite(game, coords[0], coords[1], 'pilot' + i))
    this.sprites.forEach(s => { s.setScale(s.scaleX / 1.5); s.visible = false })
    this.sprites[0].visible = true

    const speed = 0.03;
    this.move = function (dir) {
        //Return if no move
        if (dir[0] == 0 && dir[1] == 0) return;

        //Update coords
        var length = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1])
        this.coords[0] += speed * dir[0] / length
        this.coords[1] += speed * dir[1] / length
        this.coords = this.coords.map(c => Math.min(Math.max(c, 0), this.game.levelSize - 1))

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
}
