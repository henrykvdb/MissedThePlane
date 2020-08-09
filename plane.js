const PLANE_MOVE_SPEED = 0.0005 // [tiles/ms]
const PLANE_WAIT_TIME = 300 // [ms]

function Plane(game, coords, dir) {

    //Move sprite in given dir
    this.move = function (dt) {
        var originalCoords = this.coords.slice()
        this.coords[0] += PLANE_MOVE_SPEED * dt * this.dirVector[0]
        this.coords[1] += PLANE_MOVE_SPEED * dt * this.dirVector[1]

        // Rotate if collision
        if (!this.game.world.isPassable(this.coords, 0.5, true)){ //Check half a tile in advance (exclusive bounds yuck)
            this.coords = originalCoords
            this.waitTime -= dt

            if (this.waitTime < 0){
                this.waitTime = PLANE_WAIT_TIME
                this.dir = (++this.dir)%8

                if(this.dir%2==1){
                    //Rotate right
                    var oldDir = this.dirVector.slice()
                    this.dirVector[0] = oldDir[1]
                    this.dirVector[1] = -oldDir[0]

                    //Put the plane at exact the right spot so it doesn't accidently collide with other stuff
                    this.coords[0] = 0.5 + Math.round(this.coords[0]-0.5)
                    this.coords[1] = 0.5 + Math.round(this.coords[1]-0.5)
                }
            }
        }

        // Update sprites
        var worldCoords = getScreenCoords(this.game, this.coords[0], this.coords[1])
        this.shadow.x = worldCoords[0];
        this.shadow.y = worldCoords[1];
        this.sprites.forEach((s, index) => {
            s.visible = index == this.dir
            s.x = worldCoords[0]
            s.y = worldCoords[1]
        })
    }

    this.interact = function () {
        if (!this.game.world.isButton(this.coords)) return // silly user, there's no button here
        this.game.world.triggerButton(this.coords) // TODO this is maybe pointless if but maybe we can show a message to the user or something
    }

    // Init code of plane
    this.dir = dir
    this.coords = coords
    this.game = game
    this.dirVector = [-1, 0]
    this.waitTime = PLANE_WAIT_TIME

    // Create sprites
    var screenCoords = getScreenCoords(game, coords[0], coords[1])

    var shadow = game.add.sprite(screenCoords[0], screenCoords[1], 'shadow')
    shadow.setScale(game.tileScale / 4)
    shadow.setOrigin(0.5, (800 - 405) / 800)
    shadow.alpha = 0.2
    this.shadow = shadow

    this.sprites = []
    for (var i = 0; i < 8; i++) {
        var sprite = game.add.sprite(screenCoords[0], screenCoords[1], 'plane' + i)
        sprite.setScale(game.tileScale / 2)
        sprite.setOrigin(0.5, (800 - 200) / 800)
        sprite.visible = false
        this.sprites.push(sprite)
    }
    this.sprites[dir].visible = true

}
