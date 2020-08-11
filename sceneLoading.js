var assets
class LoadingScene extends Phaser.Scene {

    constructor() {
        super({ key: 'LoadingScene' });
    }

    preload() {
        //Draw loading scene
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        this.add.text(500, 300, 'loading scene lul"', { fill: '#000000' }).setOrigin(0.5, 0.5)
        
        // Load menu assets
        this.load.image('btn_next', 'assets/menu/button_next1.png');
        this.load.image('btn_restart', 'assets/menu/button_restart1.png');
        this.load.image('btn_volume', 'assets/menu/button_volume1.png');
        this.load.image('btn_volume_head', 'assets/menu/button_volume_head.png');
        this.load.image('btn_levels', 'assets/menu/button_levels.png');
        this.load.image('btn_close', 'assets/menu/button_close.png');
        this.load.image('btn_level_0', 'assets/menu/button_level_0.png');
        this.load.image('btn_level_1', 'assets/menu/button_level_1.png');
        this.load.image('btn_level_2', 'assets/menu/button_level_2.png');
        this.load.image('btn_level_3', 'assets/menu/button_level_3.png');
        this.load.image('btn_level_4', 'assets/menu/button_level_4.png');
        this.load.image('btn_level_todo', 'assets/menu/button_level_todo.png');

        // Load terain tile assets
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

        // Load entitiy assets
        for (var i = 0; i < 8; i++) this.load.image('pilot' + i, 'assets/entities/pilot' + i + '.png')
        for (var i = 0; i < 8; i++) this.load.image('plane' + i, 'assets/entities/plane' + i + '.png')
        this.load.image('shadow', 'assets/entities/shadow.png')

        // Load audio
        this.load.audio('music', ['assets/audio/music.wav'])
        this.load.audio('buttonUp', ['assets/audio/buttonUp.wav'])
        this.load.audio('buttonDown', ['assets/audio/buttonDown.wav'])

        // On complete load listener
        this.load.on('complete', this.complete, { scene: this.scene });
    }

    complete(game) {
        this.scene.start('GameScene',{ levelIndex: 3 - 1});
        this.scene.stop()
    }

    musicEnabled = false
}
