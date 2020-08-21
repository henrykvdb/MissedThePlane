class UI {
    constructor(gameScene, playTesting) {
        this.MSG_BOTTOM_HEIGHT = 50 * MIN_XY / 600
        this.MSG_MOVE_TIME = 1200 // [ms]
        this.playTesting = playTesting

        // Save scene
        this.gameScene = gameScene

        // Next button
        this.btnNext = gameScene.add.sprite(SIZE_X - getXY(0.04), getXY(0.04), 'btn_next').setOrigin(1, 0).setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnNext.visible = false
        this.btnNext.on('pointerdown', function (pointer) {
            if (!playTesting) gameScene.scene.restart({ levelIndex: ++gameScene.levelIndex })
            else gameScene.returnToEditor()
        })

        // Restart button
        this.btnRestart = gameScene.add.sprite(SIZE_X - getXY(0.04), getXY(0.04), 'btn_restart').setOrigin(1, 0).setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnRestart.on('pointerdown', function (pointer) {
            gameScene.scene.restart({ levelIndex: gameScene.levelIndex, levelString: gameScene.levelString })
        })

        // Press button
        this.btnInteract = gameScene.add.sprite(SIZE_X - getXY(0.04), SIZE_Y - getXY(0.04), 'btn_interact').setOrigin(1, 1).setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnInteract.on('pointerdown', function (pointer) {
            gameScene.pilot.interact()
        })

        if (!this.playTesting) {
            this.btnMenu = gameScene.add.sprite(getXY(0.04), getXY(0.04), 'btn_menu').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
            this.btnMenu.on('pointerdown', function (pointer) {
                gameScene.scene.launch('MenuScene', {caller: gameScene.scene.key});
                gameScene.scene.pause()
            })
        } else {
            this.btnInteract = gameScene.add.sprite(getXY(0.04), getXY(0.04), 'btn_back').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
            this.btnInteract.on('pointerdown', function (pointer) {
                gameScene.returnToEditor()
            })
        }

        // Level completed/failed messages
        var complete = gameScene.add.sprite(SIZE_X / 2, -this.MSG_BOTTOM_HEIGHT, 'level_complete').setOrigin(0.5, 0).setScale(0.45 * MIN_XY / 600).setDepth(100)
        var failed = gameScene.add.sprite(SIZE_X / 2, -this.MSG_BOTTOM_HEIGHT, 'level_failed').setOrigin(0.5, 0).setScale(0.45 * MIN_XY / 600).setDepth(100)
        complete.visible = failed.visible = false
        this.popups = {}
        this.popups.sprites = [complete, failed]

        // Add level text
        if (this.playTesting) gameScene.add.text(getXY(0.04), SIZE_Y - getXY(0.04), 'Testing').setOrigin(0, 1).setColor("0").setFontSize(50 * MIN_XY / 600).setDepth(100)
        else if (gameScene.levelIndex == 0) gameScene.add.text(getXY(0.04), SIZE_Y - getXY(0.04), 'Home').setOrigin(0, 1).setColor("0").setFontSize(50 * MIN_XY / 600).setDepth(100)
        else gameScene.add.text(getXY(0.04), SIZE_Y - getXY(0.04), "Level " + gameScene.levelIndex).setOrigin(0, 1).setColor("0").setFontSize(50 * MIN_XY / 600).setDepth(100)

        this.showTutorial(gameScene.levelIndex) // Will show a tutorial if there is one for this level index
    }

    startPopupAnimation(success) {
        this.popups.typePopup = success
        this.popups.sprites[success ? 0 : 1].visible = true
        this.popups.timeAnimating = 1
    }

    updatePopup(dt) {
        if (this.popups.timeAnimating <= 0) return
        this.popups.timeAnimating += dt
        var newYPos = this.MSG_BOTTOM_HEIGHT * Math.sin(this.popups.timeAnimating / this.MSG_MOVE_TIME * Math.PI - Math.PI / 2)
        this.popups.sprites[this.popups.typePopup ? 0 : 1].y = newYPos
        if (this.popups.timeAnimating >= this.MSG_MOVE_TIME) this.popups.timeAnimating = 0
    }
    
    showTutorial(index) {
        if (![1].includes(index)) return // Add all levels with tutorials here
        var tutorialElements = []
        // TODO: stop inputs during tutorial?
        tutorialElements.push(this.gameScene.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(150).setOrigin(0).setTint(0, 0, 0).setAlpha(0.4))
        if (index == 1) {
            var title = this.gameScene.add.text(SIZE_X / 2, getXY(0.14), "Plane turns RIGHT before a mountain", { fill: '#ffffff', fontSize: 32 * MIN_XY / 600, fontStyle: 'bold' })
            title.setDepth(150).setOrigin(0.5, 0)
            tutorialElements.push(title)
            this.gameScene.anims.create({
                key: 'tutorial1',
                frames: [{key: 'tutorial10'}, {key: 'tutorial11'},{key: 'tutorial12'},{key: 'tutorial13'},{key: 'tutorial14'},{key: 'tutorial15'}],
                frameRate: 5,
                hideOnComplete: false,
                repeat: -1
            })
            var tutorialCard = this.gameScene.add.sprite(SIZE_X / 2, SIZE_Y / 2, 'tutorial10').setOrigin(0.5, 0.5).setScale(0.65 * MIN_XY / 600).setDepth(150)
            tutorialCard.anims.play('tutorial1')
            tutorialElements.push(tutorialCard)
        }
        tutorialElements.forEach(e => this.gameScene.tweens.add({
            delay: 6000,
            targets: e,
            alpha: 0,
            duration: 1000
        }))

    }
}