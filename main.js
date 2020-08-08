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
    this.load.image('grass0', 'assets/tiles/grass0.png');
    this.load.image('grass1', 'assets/tiles/grass1.png');
    this.load.image('water1', 'assets/tiles/water1.png');
    assets = ['grass0','grass1','water1']
    for (var i = 0; i < 5; i++) this.load.image('pilot' + i, 'assets/entities/pilot' + i + '.png')
}

function createSprite(game, levelX, levelY, asset) {
    var scale = sizeY / game.levelSize / shiftY / 2.8
    var posX = sizeX/2 + scale*shiftX*(levelY-levelX)
    var posY = sizeY/2 + scale*shiftY*(levelY+levelX-game.levelSize)
    var sprite = game.add.sprite(posX, posY, asset)
    sprite.setScale(scale)
    return sprite
}

function createLevel(game) {
    var size = game.levelSize
    var level = []
    for (var x = 0; x < size; x++) {
        var column = []
        for (var y = 0; y < size; y++) {
            var asset = assets[Math.floor(Math.random() * assets.length)];
            column.push(createSprite(game, x, y, asset))
        }
        level.push(column)
    }
    return level
}

function create () {
    this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF");
    this.levelSize = 40
    var world = createLevel(this)
    var pilot = new Pilot(this, [1, 1])
}

function update() {
    
}
