function Pilot(game, coords) {
    this.coords = coords
    this.game = game

    this.sprites = []
    for (var i = 0; i < 8; i++) this.sprites.push(createSprite(game, coords[0], coords[1], 'pilot' + i))
    this.sprites.forEach(s => { s.setScale(s.scaleX / 1.5); s.visible = false })
    this.sprites[0].visible = true

    const speed = 0.05;
    this.dir = [false, false, false, false]; //UP DOWN RIGHT LEFT

    this.move = function () {
        if (this.dir == [false, false, false, false].toString()) return;

        var orientation;

        if (this.dir == [true, false, false, false].toString()) { // N
            orientation = 0
            this.coords[0] -= speed;
            this.coords[1] -= speed;
        }
        else if (this.dir == [true, false, true, false].toString()) { // NE
            orientation = 1
            this.coords[0] -= speed;
        }
        else if (this.dir == [false, false, true, false].toString()) { // E
            orientation = 2
            this.coords[0] -= speed;
            this.coords[1] += speed;
        }
        else if (this.dir == [false, true, true, false].toString()) { // SE
            orientation = 3
            this.coords[1] += speed;
        }
        else if (this.dir == [false, true, false, false].toString()) { // S
            orientation = 4
            this.coords[0] += speed;
            this.coords[1] += speed;
        }
        else if (this.dir == [false, true, false, true].toString()) { // SW
            orientation = 5
            this.coords[0] += speed;
        }
        else if (this.dir == [false, false, false, true].toString()) { // W
            orientation = 6
            this.coords[0] += speed;
            this.coords[1] -= speed;
        }
        else if (this.dir == [true, false, false, true].toString()) { // NW
            orientation = 7
            this.coords[1] -= speed;
        }

        this.dir = [false, false, false, false]
        this.coords = this.coords.map(c => Math.min(Math.max(c, 0), this.game.levelSize - 1))

        this.sprites.forEach((s, index) => {
            s.visible = index == orientation
            var worldCoords = getScreenCoords(this.game, this.coords[0], this.coords[1])
            s.x = worldCoords[0]
            s.y = worldCoords[1]
        })
    }
}
