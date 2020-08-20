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

        // if (gameScene.levelIndex < 1) { // TODO add here however many tutorial cards we have
        //     var tutorialCard = gameScene.add.sprite(SIZE_X / 2, SIZE_Y / 2, 'level_complete').setOrigin(0.5, 0.5).setScale(0.45 * MIN_XY / 600).setDepth(100)
        //     gameScene.tweens.add({
        //         delay: 6000,
        //         targets: tutorialCard,
        //         alpha: 0,
        //         duration: 1000
        //       })
        // }
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
}