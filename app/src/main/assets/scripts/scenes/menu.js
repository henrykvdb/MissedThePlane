class MenuScene extends Phaser.Scene {

    constructor() {
        super({ key: 'MenuScene' })
    }

    init(data) {
        this.ASK_CLOSE = ['GameScene', 'EditorScene']
        this.caller = data.caller

        if (!this.caller || !this.ASK_CLOSE.includes(this.caller)) { // Opaque background
            this.background = this.add.tileSprite(0, 0, 2 * SIZE_X, SIZE_Y, 'menu_invisible').setDepth(50).setOrigin(0, 0).setTint("0x59AACA")
        }
        else { // Transparant background + return button
            this.background = this.add.tileSprite(0, 0, 2 * SIZE_X, SIZE_Y, 'menu_invisible').setDepth(50).setOrigin(0, 0).setTint("0x000000").setAlpha(0.4)
            this.mainReturn = this.add.sprite(getXY(0.04), getXY(0.04), 'btn_back').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
            this.mainReturn.on('pointerdown', () => this.resume())
        }
    }

    preload() {
        this.load.scenePlugin({ key: 'rexuiplugin', url: 'scripts/libraries/rexuiplugin.min.js', sceneKey: 'rexUI' })
    }

    create() {
        const BUTTON_SPACING = getXY(0.21)
        const TEXT_SPACING = getXY(0.09)
        var scene = this

        // MAIN MENU

        this.mainCampaign = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 - 1.5 * BUTTON_SPACING, 'btn_main_campaign').setScale(0.6 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainCampaign.on('pointerdown', () => scene.startSceneAsk('LevelSelectScene', SELECT_MODES.PLAY))

        this.mainUserLevels = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 - 0.5 * BUTTON_SPACING, 'btn_main_browser').setScale(0.6 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainUserLevels.on('pointerdown', () => scene.startSceneAsk('BrowserScene'))

        this.mainLevelEdit = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 + 0.5 * BUTTON_SPACING, 'btn_main_editor').setScale(0.6 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainLevelEdit.on('pointerdown', () => scene.startSceneAsk('LevelSelectScene', SELECT_MODES.EDIT))

        this.mainAbout = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 + 1.5 * BUTTON_SPACING, 'btn_main_about').setScale(0.6 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainAbout.on('pointerdown', () => scene.openSideMenu(true))

        this.mainRemoveAds = this.add.sprite(getXY(0.04), SIZE_Y - getXY(0.04), 'btn_removeads').setOrigin(0, 1).setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainRemoveAds.on('pointerdown', function (pointer) { }) //TODO CALL TO KOTLIN TO SHOW ANDROID PAYMENT POPUP

        this.mainSettings = this.add.sprite(SIZE_X - getXY(0.04), SIZE_Y - getXY(0.04), 'btn_settings').setOrigin(1, 1).setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainSettings.on('pointerdown', () => scene.openSideMenu(false)) //TODO settings

        this.mainMenu = [this.mainCampaign, this.mainUserLevels, this.mainLevelEdit, this.mainAbout, this.mainRemoveAds, this.mainSettings, this.mainReturn].filter(x => x)
        this.mainMenu = this.mainMenu.map(sprite => [sprite, sprite.x, sprite.y])

        // SHARED - side menu return button

        this.sideReturn = this.add.sprite(SIZE_X + getXY(0.04), getXY(0.04), 'btn_back').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        this.sideReturn.on('pointerdown', () => scene.tweenSideMenu(SIZE_X / 2))

        // SETTINGS MENU

        const Y_START = 200 * MIN_XY / 600 / 3
        this.settingsText = this.add.text(SIZE_X + SIZE_X / 2, Y_START, "Settings", { fill: '#000000', fontSize: 40 * MIN_XY / 600, fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(100)
        this.settingsPilot = this.add.sprite(2 * SIZE_X - getXY(0.04), SIZE_Y, 'pilot_tip').setDepth(100).setScale(MIN_XY / 600).setOrigin(1, 1)

        this.settingsMenu = [this.settingsText, this.settingsPilot]

        // ABOUT MENU

        this.aboutHeaderContainer = scene.add.container(0, 0).setDepth(100)
        const version = getAndroid() ? "Version: " + Android.getVersion() : "version: 0.0.0"
        this.aboutHeaderContainer.add(this.add.text(0, Y_START, "Missed The Plane", { fill: '#000000', fontSize: 40 * MIN_XY / 600, fontStyle: 'bold' }))
        this.aboutHeaderContainer.add(this.add.text(0, Y_START + 1 * TEXT_SPACING, version, { fill: '#000000', fontSize: 36 * MIN_XY / 600, }))
        const START_X = 3 * SIZE_X / 2 - this.aboutHeaderContainer.getBounds().width / 2
        this.aboutHeaderContainer.x = START_X

        this.aboutCredits0 = this.add.text(START_X, Y_START + 2.5 * TEXT_SPACING, "Winand Appels (Code/Art)", { fill: '#000000', fontSize: 25 * MIN_XY / 600, fontStyle: 'bold' }).setDepth(100)
        this.aboutCredits1 = this.add.text(START_X, Y_START + 3.5 * TEXT_SPACING, "Henryk Van der Bruggen (Code/Art)", { fill: '#000000', fontSize: 25 * MIN_XY / 600, fontStyle: 'bold' }).setDepth(100)
        this.aboutCredits2 = this.add.text(START_X, Y_START + 4.5 * TEXT_SPACING, "Markus W00d (Music/SFX)", { fill: '#000000', fontSize: 25 * MIN_XY / 600, fontStyle: 'bold' }).setDepth(100)
        this.aboutPlane = this.add.sprite(SIZE_X + getXY(0.04), SIZE_Y - getXY(0.04), 'plane3').setDepth(100).setScale(MIN_XY / 600).setOrigin(211 / 800, 1 - 249 / 800)

        this.aboutMenu = [this.aboutHeaderContainer, this.aboutCredits0, this.aboutCredits1, this.aboutCredits2, this.aboutPlane]
    }

    startSceneAsk(sceneKey, option) {
        audio.start()

        // NO INPUT NEEDED:
        // - We are already here, we simply go back
        if (this.caller == sceneKey && this.lastOption == option) {
            this.resume(); return
        } // - No previous, just open
        else if (!this.caller) {
            this.startScene(sceneKey, option); return
        } // - Previous not important enough, just close
        else if (!this.ASK_CLOSE.includes(this.caller)) {
            this.scene.stop(this.caller)
            this.startScene(sceneKey, option); return
        } // We come from editing, but changes are saved
        else if (this.caller == "EditorScene" && !this.scene.get('EditorScene').state.madeChanges) {
            this.scene.stop(this.caller)
            this.startScene(sceneKey, option); return
        }

        if (this.dialog) this.dialog.destroy()
        this.dialog = this.rexUI.add.dialog({
            x: SIZE_X / 2, y: SIZE_Y / 2,
            background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0).setInteractive(),

            title: this.rexUI.add.label({
                background: this.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x003c8f).setInteractive(),
                text: this.add.text(0, 0, 'Unsaved progress', { fontSize: 35 * MIN_XY / 600, fontStyle: 'bold' }),
                space: {
                    left: 15,
                    right: 15,
                    top: 10,
                    bottom: 10
                }
            }),

            content: this.add.text(0, 0, 'You are about to start a new instance,\nany unsaved progress will be lost', { fontSize: 30 * MIN_XY / 600 }),

            actions: [
                this.rexUI.add.label({
                    background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x5e92f3),
                    text: this.add.text(0, 0, 'Cancel', { fontSize: 30 * MIN_XY / 600, fontStyle: 'bold' }),
                    space: { left: 10, right: 10, top: 10, bottom: 10 }
                }),
                this.rexUI.add.label({
                    background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x5e92f3),
                    text: this.add.text(0, 0, 'Continue', { fontSize: 30 * MIN_XY / 600, fontStyle: 'bold' }),
                    space: { left: 10, right: 10, top: 10, bottom: 10 }
                })
            ],

            space: {
                title: 25,
                content: 25,
                action: 15,

                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
            },

            align: { actions: 'right' },
            expand: { content: false }
        }).layout().popUp(500).setDepth(500);

        this.dialog.on('button.click', function (button, groupName, index) {
            this.dialog.destroy()
            if (index == 1) {
                this.scene.stop(this.caller)
                this.startScene(sceneKey, option)
            }
        }, this).on('button.over', function (button, groupName, index) {
            button.getElement('background').setStrokeStyle(1, 0xffffff);
        }).on('button.out', function (button, groupName, index) {
            button.getElement('background').setStrokeStyle();
        });
    }

    // Handles everything related to starting a scene
    startScene(sceneKey, option) {
        // Reset camera
        this.cameras.main.centerOnX(SIZE_X / 2)
        this.scene.get(this.caller ? this.caller : 'MenuScene').cameras.main.centerOnX(SIZE_X / 2)

        // Start new scene
        this.scene.start(sceneKey, { option: option })
        this.lastOption = option
    }

    // Go back to what we were doing before we opened this menu
    resume() {
        this.scene.resume(this.caller)
        this.scene.stop()
    }

    tweenSideMenu(targetX) {
        const scene = this
        this.tweens.addCounter({
            from: scene.cameras.main.midPoint.x,
            to: targetX,
            duration: 1000,
            ease: 'Expo',
            onUpdate: function (tween) {
                // Move cameras
                scene.cameras.main.centerOnX(tween.getValue())
                scene.scene.get(scene.caller ? scene.caller : 'MenuScene').cameras.main.centerOnX(tween.getValue()) //TODO level editor tiles in background bug

                // Fade background
                if (scene.caller && scene.ASK_CLOSE.includes(scene.caller)) {
                    var progress = (3 * SIZE_X / 2 - tween.getValue()) / SIZE_X
                    scene.background.setAlpha(0.4 * progress) // Fade alpha from 0.4 -> 0 and back
                }
            }
        })
    }

    openSideMenu(isAbout) {
        this.settingsMenu.forEach(sprite => sprite.visible = !isAbout)
        this.aboutMenu.forEach(sprite => sprite.visible = isAbout)
        this.tweenSideMenu(3 * SIZE_X / 2)
    }
}
