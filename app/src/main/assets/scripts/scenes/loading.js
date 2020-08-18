var audio
class LoadingScene extends Phaser.Scene {

    constructor() {
        super({ key: 'LoadingScene' });
    }

    preload() {
        //Draw loading scene
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#59AACA")
        this.splash = this.add.sprite(SIZE_X / 2, SIZE_Y / 2, 'splash').setScale(MIN_XY / 800).setDepth(100);

        // Load menu assets
        this.load.image('btn_next', 'assets/menu/button_next.png')
        this.load.image('btn_restart', 'assets/menu/button_restart.png')
        this.load.image('btn_interact', 'assets/menu/button_interact.png')
        this.load.image('btn_levels', 'assets/menu/button_levels.png')
        this.load.image('btn_close', 'assets/menu/button_close.png')
        this.load.image('btn_removeads', 'assets/menu/button_removeads.png')
        this.load.image('btn_info', 'assets/menu/button_info.png')
        this.load.image('btn_rotate', 'assets/menu/button_rotate.png')
        this.load.image('btn_save', 'assets/menu/button_save.png')
        this.load.image('btn_open', 'assets/menu/button_open.png')
        this.load.image('btn_shift_toggle', 'assets/menu/button_shift_toggle.png')
        this.load.image('btn_plus', 'assets/menu/button_plus.png')
        this.load.image('btn_minus', 'assets/menu/button_minus.png')
        this.load.image('btn_playtest', 'assets/menu/button_playtest.png')
        this.load.image('btn_wrench', 'assets/menu/button_wrench.png')
        this.load.image('btn_menu', 'assets/menu/button_menu.png')
        this.load.image('btn_back', 'assets/menu/button_back.png')
        for (var i = 0; i < 5; i++) this.load.image('btn_level_' + i, 'assets/menu/button_level_' + i + '.png')
        for (var i = 0; i < 4; i++) this.load.image('btn_shift_' + i, 'assets/menu/button_shift_' + i + '.png')
        this.load.image('btn_level_todo', 'assets/menu/button_level_todo.png')
        this.load.image('btn_level_home', 'assets/menu/button_level_home.png')
        this.load.image('level_complete', 'assets/menu/level_complete.png')
        this.load.image('level_failed', 'assets/menu/level_failed.png')
        this.load.image('pilot_tip', 'assets/menu/pilot_tip.png')
        this.load.image('menu_invisible', 'assets/menu/menu_invisible.png')

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
        this.load.audio('music', ['assets/audio/music.ogg'])
        this.load.audio('levelFailed', ['assets/audio/levelFailed.ogg'])
        this.load.audio('levelWon', ['assets/audio/levelWon.ogg'])
        this.load.audio('buttonUp', ['assets/audio/buttonUp.ogg'])
        this.load.audio('buttonDown', ['assets/audio/buttonDown.ogg'])
        this.load.audio('buttonBlocked', ['assets/audio/buttonBlocked.ogg'])

        // On complete load listener
        //this.load.on('complete', this.complete, { scene: this.scene });
    }

    create() {
        audio = new Audio(this) //TODO START
        this.splash.destroy()

        // Make sure that: BUTTON_HEIGHT*4 + BUTTON_SPACING*3 <= SIZE_Y
        const BUTTON_WIDTH = getXY(0.5)
        const BUTTON_HEIGHT = getXY(0.14)
        const BUTTON_SPACING = getXY(0.08)

/*         const START_Y = (SIZE_Y - BUTTON_HEIGHT * 4 - BUTTON_HEIGHT * 3 / 2) / 2
        var menuGraphics = []
        var graphics = this.add.graphics({ fillStyle: { color: 0x0000ff } });
        for (var i = 0; i < 4; i++) {
            var rect = new Phaser.Geom.Rectangle((SIZE_X - BUTTON_WIDTH) / 2, START_Y + i * BUTTON_HEIGHT * 3 / 2, BUTTON_WIDTH, BUTTON_HEIGHT);
            var graphics = this.add.graphics({ fillStyle: { color: 0x0000ff } });
            graphics.fillRectShape(rect);
            graphics.setInteractive(rect, function(gameObject){
                console.log('hey: ', menuGraphics.indexOf(gameObject))
            });
            menuGraphics.push(rect)
        } */


        //this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        //game.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', function () {
        //this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        this.scene.launch('GameScene', { levelIndex: 0 })
        audio.start()
        //})
        //this.add.text(getX(0.5), getY(0.05), '[Press space to start]', { fill: '#a92a17', fontSize: getXY(0.05), fontStyle: 'bold' }).setOrigin(0.5, 0.5).setDepth(200)
    }
}

function getX(ratioX) {
    return SIZE_X * ratioX
}

function getY(ratioY) {
    return SIZE_Y * ratioY
}

function getXY(ratio) {
    return MIN_XY * ratio
}
