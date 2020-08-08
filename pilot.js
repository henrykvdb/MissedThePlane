function Pilot(game, coords) {
    this.coords = coords
    this.game = game

    this.sprites = []
    for (var i = 0; i < 4; i++) this.sprites.push(createSprite(game, coords[0], coords[1], 'pilot' + i))
    this.sprites.forEach(s => { s.setScale(s.scaleX / 1.5); s.visible = false })
    this.sprites[0].visible = true
    this.dir = 0 // SW, NW, NE, SE

    this.move = function (dir) {
        if (this.dir == dir){
            if (this.dir == 0) this.coords[0] += 1
            if (this.dir == 1) this.coords[1] -= 1
            if (this.dir == 2) this.coords[0] -= 1
            if (this.dir == 3) this.coords[1] += 1
        }

        this.dir = dir
        this.coords = this.coords.map(c => Math.min(Math.max(c, 0), this.game.levelSize - 1))
        this.updateSprites()
    }

    this.updateSprites = function () {  // dit zou niet moeten met een eigen renderer :(
        this.sprites.forEach((s, index) => {
            s.visible = index == this.dir
            var worldCoords = getScreenCoords(this.game, this.coords[0], this.coords[1])
            s.x = worldCoords[0]
            s.y = worldCoords[1]
        })
    }
}
