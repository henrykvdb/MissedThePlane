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

        const BUTTON_SPACING = getXY(0.18)
        var scene = this.scene
        this.btnCampaign = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 - 1.5 * BUTTON_SPACING, 'btn_levels').setScale(0.4 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnCampaign.on('pointerdown', function (pointer) {
            scene.launch('LevelSelectScene', { levelIndex: 0 })
            audio.start()
        })

        this.btnUserLevels = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 - 0.5 * BUTTON_SPACING, 'btn_levels').setScale(0.4 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnUserLevels.on('pointerdown', function (pointer) {
            console.log("not implemented") //TODO
            audio.start()
        })

        this.btnLevelEdit = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 + 0.5 * BUTTON_SPACING, 'btn_levels').setScale(0.4 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnLevelEdit.on('pointerdown', function (pointer) {
            scene.launch('LevelEditScene', { levelIndex: 0 })
            audio.start()

        })

        this.btnAbout = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 + 1.5 * BUTTON_SPACING, 'btn_levels').setScale(0.4 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnAbout.on('pointerdown', function (pointer) {
            console.log("not implemented") //TODO
            audio.start()
        })

        this.btnReturn = this.add.sprite(getXY(0.04), getXY(0.04), 'btn_removeads').setOrigin(0, 0).setScale(0.4 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnReturn.on('pointerdown', function (pointer) {
            //TODO unpause whatever tf is running
            audio.start()
        })

        this.btnRemoveAds = this.add.sprite(getXY(0.04), SIZE_Y - getXY(0.04), 'btn_removeads').setOrigin(0, 1).setScale(0.4 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnRemoveAds.on('pointerdown', function (pointer) {
            //TODO CALL TO KOTLIN TO SHOW ANDROID PAYMENT POPUP
            audio.start()
        })

        this.btnSettings = this.add.sprite(SIZE_X - getXY(0.04), SIZE_Y - getXY(0.04), 'btn_removeads').setOrigin(1, 1).setScale(0.4 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnSettings.on('pointerdown', function (pointer) {
            console.log("not implemented") //TODO
            audio.start()
        })
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
