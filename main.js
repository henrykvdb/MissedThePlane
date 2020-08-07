var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    scene: {
        preload: preload,
        create: create
    }
};

var game = new Phaser.Game(config);

function preload ()
{
    
    this.load.image('tile', 'tile.png'); //359x 208y shift for one block shift
}

function create ()
{
    this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF");

    for(var j = 0; j<10; j++){
        for(var i = 11; i<21; i++){
            var sprite = this.add.sprite(0.26*147*(i-j), 0.26*85*(i+j), 'tile');
            sprite.setScale(0.25);
        }
    }
}
