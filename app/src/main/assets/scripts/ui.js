class UI {
    constructor(gameScene, playTesting) {
        this.MSG_BOTTOM_HEIGHT = 50 * MIN_XY / 600
        this.MSG_MOVE_TIME = 1200 // [ms]
        this.playTesting = playTesting

        // Save scene
        this.gameScene = gameScene

        // Next button
        this.btnNext = gameScene.add.sprite(SIZE_X - getXY(0.04), getXY(0.04), 'btn_next').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnNext.visible = false
        this.btnNext.on('pointerdown', function (pointer) {
            if (!playTesting) gameScene.scene.restart({ levelIndex: ++gameScene.levelIndex })
            else gameScene.returnToEditor()
        })

        // Restart button
        this.btnRestart = gameScene.add.sprite(SIZE_X - getXY(0.04), getXY(0.04), 'btn_restart').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnRestart.on('pointerdown', function (pointer) {
            gameScene.scene.restart({ levelIndex: gameScene.levelIndex, levelString: gameScene.levelString })
        })

        // Press button
        this.btnInteract = gameScene.add.sprite(SIZE_X - getXY(0.04), SIZE_Y - getXY(0.04), 'btn_interact').setOrigin(1, 1).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnInteract.on('pointerdown', function (pointer) {
            gameScene.pilot.interact()
        })

        if (!this.playTesting) {
            // Level change button
            this.btnLevels = gameScene.add.sprite(getXY(0.04), getXY(0.04), 'btn_levels').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
            this.btnLevels.on('pointerdown', function (pointer) {
                gameScene.scene.pause()
                gameScene.scene.launch('LevelSelectScene')
            })

            // Remove ads button
            this.btnInteract = gameScene.add.sprite(getXY(0.04), getXY(0.16), 'btn_removeads').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
            this.btnInteract.on('pointerdown', function (pointer) {
                gameScene.scene.stop()
                gameScene.scene.start('LevelEditScene');
            })

            // Info button
            this.btnInteract = gameScene.add.sprite(getXY(0.04), getXY(0.305), 'btn_info').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
            this.btnInteract.on('pointerdown', function (pointer) {
                //TODO
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

    showLevelText(levelIndex) {
        return //TODO RE-ADD
        var margin = 15 * MIN_XY / 600
        var shiftY = 40 * MIN_XY / 600
        var startY = getY(0.9)
        if (levelIndex == 0) {
            this.gameScene.add.text(margin, startY - 2 * shiftY, 'Oh no! You').setOrigin(0, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100)
            this.gameScene.add.text(margin, startY - 1 * shiftY, 'missed the plane.').setOrigin(0, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100);
            this.gameScene.add.text(margin, startY - 0 * shiftY, "...and you're the pilot!", { fontStyle: "Bold" }).setOrigin(0, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100)

            this.gameScene.add.text(SIZE_X - margin, startY - 2 * shiftY, 'Autopilot keeps').setOrigin(1, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100)
            this.gameScene.add.text(SIZE_X - margin, startY - 1 * shiftY, 'it in the air, but').setOrigin(1, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100)
            this.gameScene.add.text(SIZE_X - margin, startY - 0 * shiftY, 'you need to help it!').setOrigin(1, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100)
        }
        if (levelIndex == 1) {
            this.gameScene.add.text(margin, startY - 3 * shiftY, 'Autopilot').setOrigin(0, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100)
            this.gameScene.add.text(margin, startY - 2 * shiftY, 'turns right', { fontStyle: "bold" }).setOrigin(0, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100);
            this.gameScene.add.text(margin, startY - 1 * shiftY, 'before a mountain').setOrigin(0, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100)
            this.gameScene.add.text(margin, startY - 0 * shiftY, 'to avoid a crash.').setOrigin(0, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100)

            this.gameScene.add.text(SIZE_X - margin, startY - 2 * shiftY, 'Get the').setColor("0").setOrigin(1, 0.5).setFontSize(28 * MIN_XY / 600).setDepth(100)
            this.gameScene.add.text(SIZE_X - margin, startY - 1 * shiftY, 'plane to the').setColor("0").setOrigin(1, 0.5).setFontSize(28 * MIN_XY / 600).setDepth(100)
            this.gameScene.add.text(SIZE_X - margin, startY - 0 * shiftY, 'landing strip!', { fontStyle: "Bold" }).setOrigin(1, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100)
        }

        if (levelIndex == 2) {
            this.gameScene.add.text(margin, startY - 3 * shiftY, 'Buttons', { fontStyle: "bold" }).setOrigin(0, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100)
            this.gameScene.add.sprite(margin + 140 * MIN_XY / 600, startY - 3 * shiftY, TILES.BUTTON.assets[0]).setOrigin(0, 0.65).setDepth(100).setScale(0.1 * MIN_XY / 600)
            this.gameScene.add.text(margin, startY - 2 * shiftY, 'toggle adjacent').setOrigin(0, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100);
            this.gameScene.add.text(margin, startY - 1 * shiftY, 'tiles between').setOrigin(0, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100)
            this.gameScene.add.text(margin, startY - 0 * shiftY, 'grass and mountains.').setOrigin(0, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100)

            this.gameScene.add.text(SIZE_X - margin, startY - 3 * shiftY, 'Use them').setOrigin(1, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100)
            this.gameScene.add.text(SIZE_X - margin - 130 * MIN_XY / 600, startY - 2 * shiftY, 'with ').setOrigin(1, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100)
            this.gameScene.add.text(SIZE_X - margin, startY - 2 * shiftY, 'spacebar', { fontStyle: "Bold" }).setOrigin(1, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100)
            this.gameScene.add.text(SIZE_X - margin, startY - 1 * shiftY, 'when nearby.').setOrigin(1, 0.5).setColor("0").setFontSize(28 * MIN_XY / 600).setDepth(100)
        }

        if (levelIndex == 3) {
            startY += 10
            this.gameScene.add.text(margin, startY - 2 * shiftY, 'Tip:', { fontStyle: "bold" }).setOrigin(0, 0.5).setColor("0").setFontSize(28).setDepth(100)
            this.gameScene.add.text(margin, startY - 1 * shiftY, 'You can press R to restart.').setOrigin(0, 0.5).setColor("0").setFontSize(28).setDepth(100)
        }
    }
}