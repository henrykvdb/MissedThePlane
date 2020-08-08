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
}

function createLevel(game, tiles) {
    var scale = sizeY / tiles.length / shiftY / 2.8
    for (var x = 0; x < tiles.length; x++) {
        for (var y = 0; y < tiles.length; y++) {
            var posX = sizeX/2 + (scale*1.01)*shiftX*(y-x)
            var posY = sizeY/2 + (scale*1.01)*shiftY*(y+x-tiles.length)
            var asset = Phaser.Utils.Array.GetRandom(assets[tiles[x][y]])
            var sprite = game.add.sprite(posX, posY, asset);
            sprite.setScale(scale);
        }
    }
}

function randomTiles(size) {
    return Array.from(Array(size)).map(x=>Array.from(Array(size)).map(y=>Phaser.Utils.Array.GetRandom(['W','G'])))
}

function create () {
    this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF");
    //createLevel(this, [['G','G','W'],['G','W','W'],['G','G','W']]);
    createLevel(this, randomTiles(5));
   
}

function update() {
    
}
