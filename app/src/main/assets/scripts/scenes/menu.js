class MenuScene extends Phaser.Scene {

    constructor() {
        super({ key: 'MenuScene' })
    }

    init(data) {
        this.ASK_CLOSE = ['GameScene', 'EditorScene']
        this.caller = data.caller

        // Return button gets initialised here already (will be hidden if this is a main menu)
        this.mainReturn = this.add.sprite(getXY(0.04), getXY(0.04), 'btn_back').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainReturn.on('pointerdown', () => {
            if (this.caller == 'GameScene') this.scene.get('GameScene').ui.toggleVisibility(true)
            this.scene.resume(this.caller); this.scene.stop()
        })

        return // TODO move name dialog to first publish
        // Ask name dialog
        var scene = this
        var inputDialog = createInputDialog(this,"What's your name?","cancel","continue")
        inputDialog.on('button.click', function (button, groupName, index) {
            if (index == 1){
                var input = scene.userInput
                if(input && input.length >= 3){
                    console.log(scene.userInput)
                }
                else console.log("too short")
            }
            else inputDialog.destroy()
        }, this)
    }

    preload() {
    }

    create() {
        const BUTTON_SPACING = getXY(0.21)
        const TEXT_SPACING = getXY(0.09)
        var scene = this

        // MAIN MENU

        this.upvote = this.add.sprite(SIZE_X / 2 - getXY(0.2), SIZE_Y / 2 + 1 * BUTTON_SPACING, 'btn_upvote_square').setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100).setTint("0x777777").setVisible(false)
        this.upvote.on('pointerdown', () => {
            scene.scene.get('GameScene').ui.setVote(true)
            scene.upvote.setTint("0xffffff"); scene.downvote.setTint("0x777777")
        })

        this.downvote = this.add.sprite(SIZE_X / 2 + getXY(0.2), SIZE_Y / 2 + 1 * BUTTON_SPACING, 'btn_downvote_square').setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100).setTint("0x777777").setVisible(false)
        this.downvote.on('pointerdown', () => {
            scene.scene.get('GameScene').ui.setVote(false)
            scene.downvote.setTint("0xffffff"); scene.upvote.setTint("0x777777")
        })

        this.mainMenu = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 - 0.5 * BUTTON_SPACING, 'btn_main_menu').setScale(0.6 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainMenu.on('pointerdown', () => scene.switchToMainMenu()) // todo reset this menu?

        this.mainCampaign = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 - 1.5 * BUTTON_SPACING, 'btn_main_campaign').setScale(0.6 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainCampaign.on('pointerdown', () => scene.startScene('LevelSelectScene', SELECT_MODES.PLAY))

        this.mainUserLevels = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 - 0.5 * BUTTON_SPACING, 'btn_main_browser').setScale(0.6 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainUserLevels.on('pointerdown', () => scene.startScene('BrowserScene'))

        this.mainLevelEdit = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 + 0.5 * BUTTON_SPACING, 'btn_main_editor').setScale(0.6 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainLevelEdit.on('pointerdown', () => scene.startScene('LevelSelectScene', SELECT_MODES.EDIT))

        this.mainAbout = this.add.sprite(SIZE_X / 2, SIZE_Y / 2 + 1.5 * BUTTON_SPACING, 'btn_main_about').setScale(0.6 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainAbout.on('pointerdown', () => scene.openSideMenu(true))

        this.mainRemoveAds = this.add.sprite(getXY(0.04), SIZE_Y - getXY(0.04), 'btn_removeads').setOrigin(0, 1).setScale(0.2 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainRemoveAds.on('pointerdown', function (pointer) { }) //TODO CALL TO KOTLIN TO SHOW ANDROID PAYMENT POPUP

        this.mainSettings = this.add.sprite(SIZE_X - getXY(0.04), SIZE_Y - getXY(0.04), 'btn_settings').setOrigin(1, 1).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        this.mainSettings.on('pointerdown', () => scene.openSideMenu(false)) //TODO settings

        this.pauseText = this.add.text(SIZE_X / 2,  SIZE_Y / 2 - 1.5 * BUTTON_SPACING, 'Game paused', { fill: '#FFFFFF', fontSize: 50 * MIN_XY / 600, fontStyle: 'bold' }).setDepth(100).setOrigin(0.5, 0.5)
        this.solidBackground = this.add.tileSprite(0, 0, 2 * SIZE_X, SIZE_Y, 'menu_invisible').setDepth(50).setOrigin(0, 0).setTint("0x59AACA")
        this.transBackground = this.add.tileSprite(0, 0, 2 * SIZE_X, SIZE_Y, 'menu_invisible').setDepth(50).setOrigin(0, 0).setTint("0x000000").setAlpha(0.4)

        this.mainMenuSprites = [this.mainCampaign, this.mainUserLevels, this.mainLevelEdit, this.mainAbout, this.solidBackground]
        this.pauseMenuSprites = [this.mainMenu, this.mainReturn, this.pauseText, this.transBackground]
        if (this.caller == 'GameScene' && this.scene.get('GameScene').public) 
            {this.pauseMenuSprites.push(this.upvote); this.pauseMenuSprites.push(this.downvote)}

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

        // If menu was launched from a scene without pause, we show main menu, otherwise we show pause menu
        this.setVisibility(!this.caller || !this.ASK_CLOSE.includes(this.caller))
    }

    setVisibility(isMainMenu) {
        this.mainMenuSprites.forEach(s => s.visible = isMainMenu)
        this.pauseMenuSprites.forEach(s => s.visible = !isMainMenu)
    }

    switchToMainMenu() {
        if (this.caller == null) return // should never happen
        if (!this.ASK_CLOSE.includes(this.caller)) {
            this.setVisibility(true)
            this.scene.stop(this.caller)
        } else if (this.caller == "EditorScene" && !this.scene.get('EditorScene').state.madeChanges) {
            this.setVisibility(true)
            this.scene.stop(this.caller)
        } else if (this.caller == "GameScene" && (this.scene.get('GameScene').levelStatus != LEVEL_STATUS.PLAYING ||
                                                  this.scene.get('GameScene').timePlaying < 4000)) {
                this.setVisibility(true)
                this.scene.stop(this.caller)
        } else {
            if (this.dialog) this.dialog.destroy()
            var stopInputs = this.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(499).setOrigin(0, 0).setAlpha(0.01).setInteractive()
            this.dialog = createTextDialog(this, 'Leaving world', 'Stop without saving?', 'Cancel', 'Continue')
            this.dialog.on('button.click', function (button, groupName, index) {
                this.dialog.destroy()
                stopInputs.destroy()
                if (index == 1) {
                    this.scene.stop(this.caller)
                    this.setVisibility(true)
                }
            }, this)
        }
        this.caller = null
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
