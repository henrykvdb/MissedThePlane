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
}

function createLevel(game, size) {
    var scale = sizeY / size / shiftY / 2.8
    var level = []
    for (var x = 0; x < size; x++) {
        var column = []
        for (var y = 0; y < size; y++) {
            var asset = assets[Math.floor(Math.random() * assets.length)];
            var posX = sizeX/2 + scale*shiftX*(y-x)
            var posY = sizeY/2 + scale*shiftY*(y+x-size)
            var sprite = game.add.sprite(posX, posY, asset);
            sprite.setScale(scale);
            column.push(sprite)
        }
        level.push(column)
    }
    return level
}

function create () {
    this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF");
    createLevel(this, 6, 6)
   
}

function update() {
    
}
