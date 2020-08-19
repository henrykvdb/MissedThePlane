class MenuScene extends Phaser.Scene {

    constructor() {
        super({ key: 'MenuScene' });
    }

    init(data) {
        this.caller = data.caller

        if (!this.caller || this.caller == 'LevelSelectScene') { // Opaque background
            this.background = this.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(50).setOrigin(0, 0).setTint("0x59AACA")
        }
        else { // Transparant background + return button
            this.background = this.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(50).setOrigin(0, 0).setTint("0x000000").setAlpha(0.5)
            this.mainReturn = this.add.sprite(getXY(0.04), getXY(0.04), 'btn_close').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
            this.mainReturn.on('pointerdown', () => this.resume())
        }
    }

    create() {
        const TWEEN_DURATION = 1000
        const BUTTON_SPACING = getXY(0.18)
        var scene = this

        // MAIN MENU

        this.mainCampaign = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 - 1.5 * BUTTON_SPACING, 'btn_main_campaign').setScale(0.6 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainCampaign.on('pointerdown', () => scene.startScene('LevelSelectScene', SELECT_MODES.OPEN))

        this.mainUserLevels = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 - 0.5 * BUTTON_SPACING, 'btn_main_browser').setScale(0.6 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainUserLevels.on('pointerdown', () => console.log("not implemented"))

        this.mainLevelEdit = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 + 0.5 * BUTTON_SPACING, 'btn_main_editor').setScale(0.6 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainLevelEdit.on('pointerdown', () => scene.startScene('LevelSelectScene', SELECT_MODES.EDIT))

        this.mainAbout = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 + 1.5 * BUTTON_SPACING, 'btn_main_about').setScale(0.6 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainAbout.on('pointerdown', () => scene.openAbout(TWEEN_DURATION))

        this.mainRemoveAds = this.add.sprite(getXY(0.04), SIZE_Y - getXY(0.04), 'btn_removeads').setOrigin(0, 1).setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainRemoveAds.on('pointerdown', function (pointer) { }) //TODO CALL TO KOTLIN TO SHOW ANDROID PAYMENT POPUP

        this.mainSettings = this.add.sprite(SIZE_X - getXY(0.04), SIZE_Y - getXY(0.04), 'btn_settings').setOrigin(1, 1).setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainSettings.on('pointerdown', () => scene.openSettings(TWEEN_DURATION)) //TODO settings

        this.mainMenu = [this.mainCampaign, this.mainUserLevels, this.mainLevelEdit, this.mainAbout, this.mainRemoveAds, this.mainSettings, this.mainReturn].filter(x => x)
        this.mainMenu = this.mainMenu.map(sprite => [sprite, sprite.x, sprite.y])

        // SETTINGS MENU

        this.settingsReturn = this.add.sprite(getXY(0.04), getXY(0.04), 'btn_back').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        this.settingsReturn.on('pointerdown', () => scene.openMain(TWEEN_DURATION))

        const Y_START = 200 * MIN_XY / 600 //TODO figure out what to do with this stupid text and var
        this.settingsText = this.add.text(SIZE_X / 2, Y_START / 3, "SETTINGS LOL", { fill: '#000000', fontSize: 40 * MIN_XY / 600, fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(100)

        this.settingsMenu = [this.settingsText, this.settingsReturn]
        this.settingsMenu = this.settingsMenu.map(sprite => [sprite, sprite.x, sprite.y])

        // ABOUT MENU

        this.aboutReturn = this.add.sprite(getXY(0.04), getXY(0.04), 'btn_back').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        this.aboutReturn.on('pointerdown', () => scene.openMain(TWEEN_DURATION))

        this.aboutText = this.add.text(SIZE_X / 2, Y_START / 3, "MADE BY XYZ", { fill: '#000000', fontSize: 40 * MIN_XY / 600, fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(100)

        this.aboutMenu = [this.aboutText, this.aboutReturn]
        this.aboutMenu = this.aboutMenu.map(sprite => [sprite, sprite.x, sprite.y])

        // Bring the menus to their default position
        this.openMain(0)
    }

    // Handles everything related to starting a scene
    startScene(sceneKey, option) {
        audio.start()
        if (this.caller == sceneKey && this.lastOption == option) { this.resume(); return } // We are already here, we simply go back
        if (this.caller && sceneKey) this.scene.stop(this.caller)

        this.scene.start(sceneKey, { option: option })
        this.lastOption = option
    }

    // Go back to what we were doing before we opened this menu
    resume() {
        this.scene.resume(this.caller)
        this.scene.stop()
    }

    tweenMenu(menu, SHIFT_X, SHIFT_Y, duration) {
        const scene = this
        menu.forEach(function (sprite, i) {
            scene.tweens.add({
                targets: menu[i][0],
                x: menu[i][1] + SHIFT_X,
                y: menu[i][2] + SHIFT_Y,
                duration: duration, delay: 0,
                ease: 'Expo'
            });
        })
    }

    openMain(duration) {
        this.tweenMenu(this.mainMenu, 0, 0, duration)
        this.tweenMenu(this.settingsMenu, SIZE_X, 0, duration)
        this.tweenMenu(this.aboutMenu, 0, SIZE_Y, duration)
    }

    openSettings(duration) {
        this.tweenMenu(this.mainMenu, -SIZE_X, 0, duration)
        this.tweenMenu(this.settingsMenu, 0, 0, duration)
        this.tweenMenu(this.aboutMenu, 0, SIZE_Y, duration)
    }

    openAbout(duration) {
        this.tweenMenu(this.mainMenu, 0, -SIZE_Y, duration)
        this.tweenMenu(this.settingsMenu, SIZE_X, 0, duration)
        this.tweenMenu(this.aboutMenu, 0, 0, duration)
    }
}
