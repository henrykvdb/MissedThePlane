var assets
class LoadingScene extends Phaser.Scene {

    constructor() {
        super({ key: 'LoadingScene' });
    }

    preload() {
        //Draw loading scene
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        this.text = this.add.text(500, 300, '', { fill: '#000000' }).setOrigin(0.5, 0.5)
        this.text.text = "loading scene lul";

        //this.scene.stop('GameScene');
        this.load.image('btn_next', 'assets/menu/button_next.png');
        this.load.image('btn_restart', 'assets/menu/button_restart.png');
        this.load.image('btn_volume', 'assets/menu/button_volume.png');
        this.load.image('btn_levels', 'assets/menu/button_levels.png');

        //Add terain tile assets
        for (var i = 0; i < 7; i++) this.load.image('G' + i, 'assets/tiles/grass' + i + '.png')
        for (var i = 0; i < 4; i++) this.load.image('M' + i, 'assets/tiles/mountain' + i + '.png')
        for (var i = 0; i < 10; i++) this.load.image('R' + i, 'assets/tiles/strip' + i + '.png')
        this.load.image('W', 'assets/tiles/water0.png')
        this.load.image('B0', 'assets/tiles/button0.png')
        this.load.image('B1', 'assets/tiles/button1.png')
        assets = {
            'G': Array.from(new Array(7), (v, i) => "G" + i),
            'M': Array.from(new Array(4), (v, i) => "M" + i),
        }

        //Add pilot assets
        for (var i = 0; i < 8; i++) this.load.image('pilot' + i, 'assets/entities/pilot' + i + '.png')
        for (var i = 0; i < 8; i++) this.load.image('plane' + i, 'assets/entities/plane' + i + '.png')
        this.load.image('shadow', 'assets/entities/shadow.png')

        //Load audio
        this.load.audio('music', ['assets/audio/music.wav'])
        this.load.audio('button', ['assets/audio/button.wav'])

        //On complete listener
        var hello = this;
        this.load.on('complete', this.complete, { scene: this.scene });
    }

    complete(game) {
        this.scene.start('GameScene',{ levelIndex: 0});
        this.scene.stop()
    }
}
