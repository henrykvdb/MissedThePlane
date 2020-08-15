var audio
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
        this.load.image('btn_level_home', 'assets/menu/button_level_home.png');
        this.load.image('level_complete', 'assets/menu/level_complete.png');
        this.load.image('level_failed', 'assets/menu/level_failed.png');
        this.load.image('pilot_tip', 'assets/menu/pilot_tip.png')

        // Load terain tile assets
        for (var i = 0; i < 7; i++) this.load.image('grass' + i, 'assets/tiles/grass' + i + '.png')
        for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) this.load.image('mountain' + i + j, 'assets/tiles/mountain' + i + j + '.png')
        for (var i = 0; i < 4; i++) this.load.image('mountainwater' + i, 'assets/tiles/mountainwater' + i + '.png')

        // Load runway
        for (var i = 0; i < 4; i++) this.load.image('stripend' + i, 'assets/tiles/stripend' + i + '.png')
        for (var i = 0; i < 4; i++) this.load.image('stripstart' + i, 'assets/tiles/stripstart' + i + '.png')
        for (var i = 0; i < 2; i++) this.load.image('stripmiddle' + i, 'assets/tiles/stripmiddle' + i + '.png')

        //Special
        for (var i = 0; i < 4; i++) this.load.image('misc' + i, 'assets/tiles/wallhalf' + i + '.png')
        this.load.image('misc4', 'assets/tiles/clockdrawer.png')
        this.load.image('misc5', 'assets/tiles/bed0.png')
        this.load.image('misc6', 'assets/tiles/bed1.png')

        this.load.image('plank', 'assets/tiles/plank.png')
        this.load.image('water', 'assets/tiles/water.png')
        this.load.image('button0', 'assets/tiles/button0.png')
        this.load.image('button1', 'assets/tiles/button1.png')

        // Load entitiy assets
        this.load.multiatlas('pilot', 'assets/entities/pilot.json', 'assets/entities/');
        for (var i = 0; i < 8; i++) this.load.image('plane' + i, 'assets/entities/plane' + i + '.png')
        this.load.image('shadow', 'assets/entities/shadow.png')

        // Load audio
        this.load.audio('music', ['assets/audio/music.ogg', 'assets/audio/music.aac'])
        this.load.audio('levelFailed', ['assets/audio/levelFailed.ogg', 'assets/audio/levelFailed.aac'])
        this.load.audio('levelWon', ['assets/audio/levelWon.ogg', 'assets/audio/levelWon.aac'])
        this.load.audio('buttonUp', ['assets/audio/buttonUp.ogg', 'assets/audio/buttonUp.aac'])
        this.load.audio('buttonDown', ['assets/audio/buttonDown.ogg', 'assets/audio/buttonDown.aac'])
        this.load.audio('buttonBlocked', ['assets/audio/buttonBlocked.ogg', 'assets/audio/buttonBlocked.aac'])

        // On complete load listener
        this.load.on('complete', this.complete, { scene: this.scene });
    }

    complete(game) {
        audio = new Audio(game.scene)
        game.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        game.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', function () {
            game.scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            game.scene.scene.launch('GameScene', { levelIndex: 0 });
            audio.start()
        })
        game.scene.add.text(getX(0.5), getY(0.05), '[Press space to start]', { fill: '#a92a17', fontSize: getXY(0.05), fontStyle: 'bold' }).setOrigin(0.5, 0.5).setDepth(200)
    }
}

function getX(ratioX){
    return SIZE_X*ratioX
}

function getY(ratioY){
    return SIZE_Y*ratioY
}

function getXY(ratio){
    return MIN_XY*ratio
}
