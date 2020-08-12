var assets
var volumeIndex = 2
var music
const VOLUME_STEP = 0.3
class LoadingScene extends Phaser.Scene {

    constructor() {
        super({ key: 'LoadingScene' });
    }

    preload() {
        //Draw loading scene
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        this.add.sprite(0, 0, 'splash').setOrigin(0, 0).setDepth(100);

        // Load menu assets
        this.load.image('btn_next', 'assets/menu/button_next.png');
        this.load.image('btn_restart', 'assets/menu/button_restart.png');
        this.load.image('btn_levels', 'assets/menu/button_levels.png');
        this.load.image('btn_close', 'assets/menu/button_close.png');
        for (var i = 0; i < 5; i++) this.load.image('btn_level_' + i, 'assets/menu/button_level_' + i + '.png')
        for (var i = 0; i < 4; i++) this.load.image('btn_volume_' + i, 'assets/menu/button_volume_' + i + '.png')
        this.load.image('btn_level_todo', 'assets/menu/button_level_todo.png');
        this.load.image('level_complete', 'assets/menu/level_complete.png');
        this.load.image('level_failed', 'assets/menu/level_failed.png');

        // Load terain tile assets
        for (var i = 0; i < 7; i++) this.load.image('G' + i, 'assets/tiles/grass' + i + '.png')
        // for (var i = 0; i < 4; i++) this.load.image('M' + i, 'assets/tiles/mountain' + i + '.png')
        for (var i = 0; i < 4; i++) this.load.image('Q' + i, 'assets/tiles/watermountain' + i + '.png')
        for (var i = 0; i < 10; i++) this.load.image('R' + i, 'assets/tiles/strip' + i + '.png')
        this.load.image('W', 'assets/tiles/water.png')
        this.load.image('B0', 'assets/tiles/button0.png')
        this.load.image('B1', 'assets/tiles/button1.png')
        assets = {
            'G': Array.from(new Array(7), (v, i) => "G" + i),
            'M': Array.from(new Array(4), (v, i) => "M" + i),
            'Q': Array.from(new Array(4), (v, i) => "Q" + i),
        }

        // Load entitiy assets
        this.load.multiatlas('pilot', 'assets/entities/pilot.json', 'assets/entities/');
        for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) this.load.image('mountain' + i + j, 'assets/tiles/mountain/mountain' + i + j + '.png')
        for (var i = 0; i < 8; i++) this.load.image('plane' + i, 'assets/entities/plane' + i + '.png')
        this.load.image('shadow', 'assets/entities/shadow.png')

        // Load audio
        this.load.audio('music', ['assets/audio/music.ogg','assets/audio/music.aac'])
        this.load.audio('levelFailed', ['assets/audio/levelFailed.ogg','assets/audio/levelFailed.aac'])
        this.load.audio('levelWon', ['assets/audio/levelWon.ogg','assets/audio/levelWon.aac'])
        this.load.audio('buttonUp', ['assets/audio/buttonUp.ogg','assets/audio/buttonUp.aac'])
        this.load.audio('buttonDown', ['assets/audio/buttonDown.ogg','assets/audio/buttonDown.aac'])
        this.load.audio('buttonBlocked', ['assets/audio/buttonBlocked.ogg','assets/audio/buttonBlocked.aac'])

        // On complete load listener
        this.load.on('complete', this.complete, { scene: this.scene });
    }

    complete(game) {
        game.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        game.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', function () {
            game.scene.scene.start('GameScene', { levelIndex: 2 - 1 });
            music = game.scene.sound.add('music', { loop: true })
            music.play()
            game.scene.sound.setVolume(volumeIndex * VOLUME_STEP)
            game.scene.sound.pauseOnBlur = false
        })
        game.scene.add.text(500, 30, '[Press space to start]', { fill: '#a92a17', fontSize: 30, fontStyle: 'bold' }).setOrigin(0.5, 0.5).setDepth(200)
    }
}
