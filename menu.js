var assets
var text
class MenuScene extends Phaser.Scene {

    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('play', 'assets/menu/button_play.png');
        this.load.image('levels', 'assets/menu/button_levels.png');
        this.load.image('options', 'assets/menu/button_options.png');
        this.load.image('menu', 'assets/menu/button_menu.png');

        //Add terain tile assets
        for (var i = 0; i < 7; i++) this.load.image('G' + i, 'assets/tiles/grass' + i + '.png')
        for (var i = 0; i < 4; i++) this.load.image('M' + i, 'assets/tiles/mountain' + i + '.png')
        this.load.image('W0', 'assets/tiles/water0.png')
        this.load.image('B0', 'assets/tiles/button0.png')
        this.load.image('B1', 'assets/tiles/button1.png')
        this.load.image('F0', 'assets/tiles/heighttile.png')
        assets = {
            'G': Array.from(new Array(7), (v, i) => "G" + i),
            "W": ['W0'],
            'M': Array.from(new Array(4), (v, i) => "M" + i),
            'F': ['F0'],
            'B0': ['B0'],
            'B1': ['B1']
        }

        //Add pilot assets
        for (var i = 0; i < 8; i++) this.load.image('pilot' + i, 'assets/entities/pilot' + i + '.png')
        for (var i = 0; i < 8; i++) this.load.image('plane' + i, 'assets/entities/plane' + i + '.png')
        this.load.image('shadow', 'assets/entities/shadow.png')

        //Load audio
        this.load.audio('music', ['assets/audio/music.wav'])
        this.load.audio('button', ['assets/audio/button.wav'])
    }

    create() {
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        text = this.add.text(250, 16, '', { fill: '#000000' })
        text.text = "Welcome to this shit menu";

        var scene = this.scene
        this.btnPlay = this.add.sprite(500, 300, 'play').setOrigin(0.5, 1.5).setScale(0.5).setInteractive();
        this.btnPlay.on('pointerdown', function (pointer) {
            scene.start('GameScene');
        });

        this.btnLevels = this.add.sprite(500, 300, 'levels').setOrigin(0.5, 0.5).setScale(0.5).setInteractive();
        this.btnLevels.on('pointerdown', function (pointer) {
            text.text = 'you clicked level?'
        });

        this.btnOptions = this.add.sprite(500, 300, 'options').setOrigin(0.5, -.5).setScale(0.5).setInteractive();
        this.btnOptions.on('pointerdown', function (pointer) {
            text.text = 'not implemented haha'
        });

    }
}
