function Pilot(game, coords) {
    this.coords = coords
    this.game = game

    this.sprites = []
    for (var i = 0; i < 4; i++) this.sprites.push(createSprite(game, coords[0], coords[1], 'pilot'+i))
    this.sprites.forEach(s=>{s.setScale(s.scaleX / 1.5); s.visible = false})
    this.sprites[0].visible = true
    this.dir = 0 // SW, NW, NE, SE

    this.rotate = function(left) { // Left is a boolean indicating direction
        this.dir = this.dir + (left ? -1 : 1) < 0 ? this.sprites.length - 1 : (this.dir + (left ? -1 : 1) >= this.sprites.length ? 0 : this.dir + (left ? -1 : 1));
        this.updateSprites()
    }

    this.step = function(forward) { // also a boolean
        // todo, check out of bounds, collisions, etc
        if (this.dir == 0) this.coords[0] += forward ? 1 : - 1
        if (this.dir == 1) this.coords[1] -= forward ? 1 : - 1
        if (this.dir == 2) this.coords[0] -= forward ? 1 : - 1
        if (this.dir == 3) this.coords[1] += forward ? 1 : - 1
        this.updateSprites()
    }

    this.updateSprites = function() {  // dit zou niet moeten met een eigen renderer :(
        this.sprites.forEach((s, index)=>{
            s.visible = index == this.dir
            var worldCoords = getScreenCoords(this.game, coords[0], coords[1])
            s.x = worldCoords[0]
            s.y = worldCoords[1]
        })
    }
    
}