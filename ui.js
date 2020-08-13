const MSG_BOTTOM_HEIGHT = 50
const MSG_MOVE_TIME = 1200 // [ms]

class UI {
    constructor(gameScene) {
        // Save scene
        this.gameScene = gameScene

        // Next button
        this.btnNext = gameScene.add.sprite(900, 100, 'btn_next').setScale(0.25).setInteractive().setDepth(100);
        this.btnNext.visible = false
        this.btnNext.on('pointerdown', function (pointer) {
            gameScene.scene.restart({ levelIndex: ++gameScene.levelIndex })
        })

        // Restart button
        this.btnRestart = gameScene.add.sprite(900, 100, 'btn_restart').setScale(0.25).setInteractive().setDepth(100);
        this.btnRestart.on('pointerdown', function (pointer) {
            gameScene.scene.restart({ levelIndex: gameScene.levelIndex })
        })

        // Sound change button
        this.soundButtons = []
        for (var i = 0; i < 4; i++) {
            var button = gameScene.add.sprite(45, 160, 'btn_volume_' + i).setScale(0.14).setInteractive().setDepth(100)
            this.soundButtons.push(button)
            button.visible = false
            button.on('pointerdown', function (pointer) {
                this.soundButtons[audio.volumeIndex].visible = false
                audio.toggleVolume()
                this.soundButtons[audio.volumeIndex].visible = true
            })
        }
        this.soundButtons[audio.volumeIndex].visible = true

        // Level change button
        this.btnLevels = gameScene.add.sprite(90, 90, 'btn_levels').setScale(0.25).setInteractive().setDepth(100);
        this.btnLevels.on('pointerdown', function (pointer) {
            gameScene.scene.pause()
            gameScene.scene.launch('LevelSelectScene')
        })

        // Level completed/failed messages
        var complete = gameScene.add.sprite(SIZE_X / 2, -MSG_BOTTOM_HEIGHT, 'level_complete').setScale(0.45).setDepth(100)
        var failed = gameScene.add.sprite(SIZE_X / 2, -MSG_BOTTOM_HEIGHT, 'level_failed').setScale(0.45).setDepth(100)
        complete.visible = failed.visible = false
        this.popups = {}
        this.popups.sprites = [complete, failed]

        // Add level text
        if (gameScene.levelIndex == 0) gameScene.add.text(10, 10, 'Home').setColor("0").setFontSize(50).setDepth(100)
        else gameScene.add.text(10, 10, 'Level ' + gameScene.levelIndex + "/" + (ALL_LEVELS.length - 1)).setColor("0").setFontSize(50).setDepth(100)
    }

    startPopupAnimation(success) {
        this.popups.typePopup = success
        this.popups.sprites[success ? 0 : 1].visible = true
        this.popups.timeAnimating = 1
    }

    updatePopup(dt) {
        if (this.popups.timeAnimating <= 0) return
        this.popups.timeAnimating += dt
        var newYPos = MSG_BOTTOM_HEIGHT * Math.sin(this.popups.timeAnimating / MSG_MOVE_TIME * Math.PI - Math.PI / 2)
        this.popups.sprites[this.popups.typePopup ? 0 : 1].y = newYPos
        if (this.popups.timeAnimating >= MSG_MOVE_TIME) this.popups.timeAnimating = 0
    }

    showLevelText(levelIndex) {
        var margin = 15; var shiftY = 40; var startY = 420
        if (levelIndex == 0) {
            startY = 460
            shiftY = 44
            this.gameScene.add.text(margin, startY + 0 * shiftY, 'Oh no! You').setColor("0").setFontSize(28).setDepth(100)
            this.gameScene.add.text(margin, startY + 1 * shiftY, 'missed the plane.').setColor("0").setFontSize(28).setDepth(100);
            this.gameScene.add.text(margin, startY + 2 * shiftY, "...and you're the pilot!", { fontStyle: "Bold" }).setColor("0").setFontSize(28).setDepth(100)

            this.gameScene.add.text(SIZE_X - margin, startY + 0 * shiftY, 'Autopilot keeps').setColor("0").setFontSize(28).setDepth(100).setOrigin(1, 0)
            this.gameScene.add.text(SIZE_X - margin, startY + 1 * shiftY, 'it in the air, but').setColor("0").setFontSize(28).setDepth(100).setOrigin(1, 0)
            this.gameScene.add.text(SIZE_X - margin, startY + 2 * shiftY, 'you need to help it!').setColor("0").setFontSize(28).setDepth(100).setOrigin(1, 0)
        }
        if (levelIndex == 1) {
            this.gameScene.add.text(margin, startY + 0 * shiftY, 'Autopilot').setColor("0").setFontSize(28).setDepth(100)
            this.gameScene.add.text(margin, startY + 1 * shiftY, 'turns right', { fontStyle: "bold" }).setColor("0").setFontSize(28).setDepth(100);
            this.gameScene.add.text(margin, startY + 2 * shiftY, 'before a mountain').setColor("0").setFontSize(28).setDepth(100)
            this.gameScene.add.text(margin, startY + 3 * shiftY, 'to avoid a crash.').setColor("0").setFontSize(28).setDepth(100)

            this.gameScene.add.text(SIZE_X - margin, startY + 0 * shiftY, 'Get the').setColor("0").setFontSize(28).setDepth(100).setOrigin(1, 0)
            this.gameScene.add.text(SIZE_X - margin, startY + 1 * shiftY, 'plane to the').setColor("0").setFontSize(28).setDepth(100).setOrigin(1, 0)
            this.gameScene.add.text(SIZE_X - margin, startY + 2 * shiftY, 'landing strip!', { fontStyle: "Bold" }).setColor("0").setFontSize(28).setDepth(100).setOrigin(1, 0)
        }

        if (levelIndex == 2) {
            this.gameScene.add.text(margin, startY + 0 * shiftY, 'Buttons', { fontStyle: "bold" }).setColor("0").setFontSize(28).setDepth(100)
            this.gameScene.add.sprite(margin + 140, startY, 'B0').setDepth(100).setScale(0.1)
            this.gameScene.add.text(margin, startY + 1 * shiftY, 'toggle adjacent').setColor("0").setFontSize(28).setDepth(100);
            this.gameScene.add.text(margin, startY + 2 * shiftY, 'tiles between').setColor("0").setFontSize(28).setDepth(100)
            this.gameScene.add.text(margin, startY + 3 * shiftY, 'grass and mountains.').setColor("0").setFontSize(28).setDepth(100)

            this.gameScene.add.text(SIZE_X - margin, startY + 1 * shiftY, 'Use them').setColor("0").setFontSize(28).setDepth(100).setOrigin(1, 0)
            this.gameScene.add.text(SIZE_X - margin - 130, startY + 2 * shiftY, 'with ').setColor("0").setFontSize(28).setDepth(100).setOrigin(1, 0)
            this.gameScene.add.text(SIZE_X - margin, startY + 2 * shiftY, 'spacebar', { fontStyle: "Bold" }).setColor("0").setFontSize(28).setDepth(100).setOrigin(1, 0)
            this.gameScene.add.text(SIZE_X - margin, startY + 3 * shiftY, 'when nearby.').setColor("0").setFontSize(28).setDepth(100).setOrigin(1, 0)
        }

        if (levelIndex == 3) {
            startY += 10
            this.gameScene.add.text(margin, startY + 2 * shiftY, 'Tip:', { fontStyle: "bold" }).setColor("0").setFontSize(28).setDepth(100)
            this.gameScene.add.text(margin, startY + 3 * shiftY, 'You can press R to restart.').setColor("0").setFontSize(28).setDepth(100)
        }
    }
}