const sizeX = 1000;
const sizeY = 600;

//359x 208y for one block shift
const shiftX = 147;
const shiftY = 85;

var config = {
    type: Phaser.AUTO,
    width: sizeX,
    height: sizeY,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var assets;
function preload () {
    this.load.image('G0', 'assets/tiles/grass0.png');
    this.load.image('G1', 'assets/tiles/grass1.png');
    this.load.image('W1', 'assets/tiles/water1.png');
    assets = {
        'G': ['G0','G1'],
        "W": ['W1']
    };
    for (var i = 0; i < 4; i++) this.load.image('pilot' + i, 'assets/entities/pilot' + i + '.png')
}

function getScreenCoords(game, levelX, levelY) {
    var scale = sizeY / game.levelSize / shiftY / 2.8
    var posX = sizeX/2 + 1.02*scale*shiftX*(levelY-levelX)
    var posY = sizeY/2 + 1.02*scale*shiftY*(levelY+levelX-game.levelSize)
    return [posX, posY, scale] // sneakily add scale as well
}

function createSprite(game, levelX, levelY, asset) {
    coords = getScreenCoords(game, levelX, levelY)
    var sprite = game.add.sprite(coords[0], coords[1], asset)
    sprite.setScale(coords[2])
    return sprite
}

function createLevel(game, tiles) {
    var sprites = []
    for (var x = 0; x < tiles.length; x++) {
        var column = []
        for (var y = 0; y < tiles[0].length; y++) {
            var asset = Phaser.Utils.Array.GetRandom(assets[tiles[x][y]])
            column.push(createSprite(game, x, y, asset))
        }
        sprites.push(column)
    }
    return sprites
}

function randomTiles(size) {
    return Array.from(Array(size)).map(()=>Array.from(Array(size)).map(()=>Phaser.Utils.Array.GetRandom(['W','G'])))
}

function create () {
    this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF");
    this.cursors = this.input.keyboard.createCursorKeys();
    this.levelSize = 5 // todo level design fixen zodra we effectief mechanics hebben
    //createLevel(this, [['G','G','W'],['G','W','W'],['G','G','W']]);
    this.currentWorld = createLevel(this, randomTiles(this.levelSize));
    this.currentPilot = new Pilot(this, [3, 3])
}

function update() {
    processMovement(this)
}

var currentlyDown = [false, false, false, false] // to prevent 1000 triggers during a short keypress
function processMovement(game) {
    if (!currentlyDown[0] && game.cursors.left.isDown) {
        game.currentPilot.rotate(true)
        currentlyDown[0] = true
    }
    if (!currentlyDown[1] && game.cursors.right.isDown) {
        game.currentPilot.rotate(false)
        currentlyDown[1] = true
    } 
    if (!currentlyDown[2] && game.cursors.up.isDown) {
        game.currentPilot.step(true)
        currentlyDown[2] = true
    }
    if (!currentlyDown[3] && game.cursors.down.isDown) {
        // todo achteruit bewegen is mss verwarrend?
        game.currentPilot.step(false)
        currentlyDown[3] = true
    }
    if (currentlyDown[0] && game.cursors.left.isUp)  currentlyDown[0] = false
    if (currentlyDown[1] && game.cursors.right.isUp) currentlyDown[1] = false
    if (currentlyDown[2] && game.cursors.up.isUp)    currentlyDown[2] = false
    if (currentlyDown[3] && game.cursors.down.isUp)  currentlyDown[3] = false
}
