const SIZE_X = 1000
const SIZE_Y = 600

//359x 208y for one block shift
const SHIFT_X = 147
const SHIFT_Y = 85

var config = {
    type: Phaser.AUTO,
    width: SIZE_X,
    height: SIZE_Y,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

var game = new Phaser.Game(config)

var assets
function preload() {
    //Add terain tile assets
    for (var i = 0; i < 7; i++) this.load.image('G' + i, 'assets/tiles/grass' + i + '.png')
    this.load.image('W1', 'assets/tiles/water1.png')
    assets = {
        'G': Array.from(new Array(7), (v, i) => "G" + i),
        "W": ['W1']
    }

    //Add pilot assets
    for (var i = 0; i < 8; i++) this.load.image('pilot' + i, 'assets/entities/pilot' + i + '.png')
}

// Returns screen coordinate of the top of the tile
function getScreenCoords(game, levelX, levelY) {
    var posX = SIZE_X / 2 + game.shiftX * (levelY - levelX)
    var posY = SIZE_Y / 2 + game.shiftY * (levelY + levelX - game.levelSize - 0.5)
    return [posX, posY]
}

function createLevel(game, tiles) {
    //Define game drawing constants
    game.levelSize = tiles.length
    game.tileScale = SIZE_Y / game.levelSize / 240
    game.shiftX = 1.02 * game.tileScale * SHIFT_X
    game.shiftY = 1.02 * game.tileScale * SHIFT_Y

    //Create tile sprites
    var sprites = Array(game.levelSize).fill(Array(game.levelSize))
    for (var x = 0; x < tiles.length; x++) {
        for (var y = 0; y < tiles[0].length; y++) {
            var asset = Phaser.Utils.Array.GetRandom(assets[tiles[x][y]])
            coords = getScreenCoords(game, x, y)
            var sprite = game.add.sprite(coords[0], coords[1], asset)
            sprite.setScale(game.tileScale)
            sprite.setOrigin(0.5, (800 - 284 - 85 * 2) / 800)
            sprites[x][y] = sprite
        }
    }
    return sprites
}

function randomTiles(size) {
    return Array.from(Array(size)).map(() => Array.from(Array(size)).map(() => Phaser.Utils.Array.GetRandom(['G', 'W'])))
}

function create() {
    this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
    this.cursors = this.input.keyboard.createCursorKeys()

    //createLevel(this, [['G','G','W'],['G','W','W'],['G','G','W']])
    this.currentWorld = createLevel(this, randomTiles(5))
    this.pilot = new Pilot(this, [1, 1])
}

//Handle input
function update() {
    var dir = [0, 0]
    if (this.cursors.up.isDown) dir = addvector(dir, [-1, -1])
    if (this.cursors.down.isDown) dir = addvector(dir, [1, 1])
    if (this.cursors.right.isDown) dir = addvector(dir, [-1, 1])
    if (this.cursors.left.isDown) dir = addvector(dir, [1, -1])

    this.pilot.move(dir)
}

function addvector(a, b) {
    return a.map((e, i) => e + b[i]) //Magic, don't touch
}
