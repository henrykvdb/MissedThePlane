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
function preload() {
    for (var i = 0; i < 7; i++) this.load.image('G' + i, 'assets/tiles/grass' + i + '.png');
    this.load.image('W1', 'assets/tiles/water1.png');
    assets = {
        'G': Array.from(new Array(7),(v,i)=> "G" + i),
        "W": ['W1']
    };
    for (var i = 0; i < 8; i++) this.load.image('pilot' + i, 'assets/entities/pilot' + i + '.png')
}

function getScreenCoords(game, levelX, levelY) {
    var scale = sizeY / game.levelSize / shiftY / 2.8
    var posX = sizeX / 2 + 1.02 * scale * shiftX * (levelY - levelX)
    var posY = sizeY / 2 + 1.02 * scale * shiftY * (levelY + levelX - game.levelSize)
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
    return Array.from(Array(size)).map(() => Array.from(Array(size)).map(() => Phaser.Utils.Array.GetRandom(['W', 'G'])))
}

function create() {
    this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF");
    this.cursors = this.input.keyboard.createCursorKeys();
    this.levelSize = 5 // todo level design fixen zodra we effectief mechanics hebben
    //createLevel(this, [['G','G','W'],['G','W','W'],['G','G','W']]);
    this.currentWorld = createLevel(this, randomTiles(this.levelSize));
    this.pilot = new Pilot(this, [3, 3]);
}

function update() {
    if (this.cursors.up.isDown) this.pilot.dir[0] = true;
    else if (this.cursors.down.isDown) this.pilot.dir[1] = true;
    if (this.cursors.right.isDown) this.pilot.dir[2] = true;
    else if (this.cursors.left.isDown) this.pilot.dir[3] = true;

    this.pilot.move();
}
