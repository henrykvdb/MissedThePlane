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
        create: create
    }
};

var game = new Phaser.Game(config);

var assets;
function preload ()
{
    this.load.image('grass1', 'assets/tiles/grass1.png');
    this.load.image('heighttile', 'assets/tiles/heighttile.png');
    this.load.image('water1', 'assets/tiles/water1.png');
    assets = ['grass1','heighttile','water1']
}

function create ()
{
    this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF");

    for(var j = -5; j<5; j++){
        for(var i = -5; i<5; i++){
            var asset = assets[Math.floor(Math.random() * assets.length)];
            var sprite = this.add.sprite(sizeX/2 + 0.26*shiftX*(i-j), sizeY/2 + 0.26*shiftY*(i+j), asset);
            sprite.setScale(0.25);
        }
    }
}
