class MenuScene extends Phaser.Scene {

    constructor() {
        super({ key: 'MenuScene' });
    }

    init(data) {
        this.caller = data.caller
        // TODO: pass on the scene that launched this menu, so we can resume/kill it when switching scenes with this menu

        if (this.caller == 'GameScene' || this.caller == 'LevelEditScene'){
            this.background = this.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(50).setOrigin(0, 0).setTint("0x000000").setAlpha(0.5)
        }
        else this.background = this.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(50).setOrigin(0, 0).setTint("0x59AACA")
    }

    create() {

        const BUTTON_SPACING = getXY(0.18)
        var scene = this

        //this.background = this.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(50).setOrigin(0, 0).setTint("0x000000").setAlpha(0.5)

        this.btnCampaign = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 - 1.5 * BUTTON_SPACING, 'btn_main_campaign').setScale(0.6 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnCampaign.on('pointerdown', () => scene.startScene('LevelSelectScene'))

        this.btnUserLevels = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 - 0.5 * BUTTON_SPACING, 'btn_main_browser').setScale(0.6 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnUserLevels.on('pointerdown', () => console.log("not implemented"))

        this.btnLevelEdit = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 + 0.5 * BUTTON_SPACING, 'btn_main_editor').setScale(0.6 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnLevelEdit.on('pointerdown', () => scene.startScene('LevelEditScene'))

        this.btnAbout = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 + 1.5 * BUTTON_SPACING, 'btn_main_about').setScale(0.6 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnAbout.on('pointerdown',( ) => console.log("not implemented"))

        if (this.caller != 'LoadingScene') {
            this.btnReturn = this.add.sprite(getXY(0.04), getXY(0.04), 'btn_close').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
            this.btnReturn.on('pointerdown', () => scene.continue())
        }

        this.btnRemoveAds = this.add.sprite(getXY(0.04), SIZE_Y - getXY(0.04), 'btn_removeads').setOrigin(0, 1).setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnRemoveAds.on('pointerdown', function (pointer) {
            //TODO CALL TO KOTLIN TO SHOW ANDROID PAYMENT POPUP
        })

        this.btnSettings = this.add.sprite(SIZE_X - getXY(0.04), SIZE_Y - getXY(0.04), 'btn_settings').setOrigin(1, 1).setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnSettings.on('pointerdown', () =>  console.log("not implemented")) //TODO settings
    }

    // Handles everything related to starting a scene
    startScene(sceneKey) {
        if (this.caller == sceneKey) {this.continue(); return} // We are already here, we simply go back
        if (this.caller) this.scene.stop(this.caller)
        this.scene.start(sceneKey)
    }

    // Go back to what we were doing before we opened this menu
    continue() {
        this.scene.resume(this.caller)
        this.scene.stop()
    }
}