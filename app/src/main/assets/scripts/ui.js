class UI {
    constructor(scene, playTesting) {
        this.MSG_BOTTOM_HEIGHT = 50 * MIN_XY / 600
        this.MSG_MOVE_TIME = 1200 // [ms]
        this.playTesting = playTesting

        // Save scene
        this.scene = scene

        // Next button
        this.buttonNext = scene.add.sprite(SIZE_X - getXY(0.04), getXY(0.04), 'menu', 'button_next').setOrigin(1, 0).setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100)
        this.buttonNext.visible = false
        this.buttonNext.on('pointerdown', function (pointer) {
            if (!playTesting) {
                scene.scene.restart({ levelIndex: ++scene.levelIndex })
                if (getAndroid()) Android.showAd()
            }
            else scene.returnToEditor(true)
        })

        // Restart button
        this.buttonRestart = scene.add.sprite(SIZE_X - getXY(0.04), getXY(0.04), 'menu', 'button_restart').setOrigin(1, 0).setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100)
        this.buttonRestart.on('pointerdown', function (pointer) {
            scene.scene.restart({ levelIndex: scene.levelIndex, levelString: scene.levelString })
        })

        // Press button
        this.buttonInteract = scene.add.sprite(SIZE_X - getXY(0.04), SIZE_Y - getXY(0.04), 'menu', 'button_interact').setOrigin(1, 1).setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100)
        this.buttonInteract.on('pointerdown', function (pointer) {
            scene.world.triggerButton()
        })

        // Back/menu button
        if (!this.playTesting) {
            this.buttonMenu = scene.add.sprite(getXY(0.04), getXY(0.04), 'menu', 'button_menu').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
            this.buttonMenu.on('pointerdown', function (pointer) {
                scene.ui.toggleVisibility(false)
                scene.scene.launch('MenuScene', { caller: scene.scene.key })
                scene.scene.pause()
            })
        } else {
            this.buttonInteract = scene.add.sprite(getXY(0.04), getXY(0.04), 'menu', 'button_back').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
            this.buttonInteract.on('pointerdown', function (pointer) {
                scene.returnToEditor(scene.levelStatus == LEVEL_STATUS.COMPLETED)
            })
        }

        // Level completed/failed messages
        var complete = scene.add.sprite(SIZE_X / 2, -this.MSG_BOTTOM_HEIGHT, 'menu', 'level_complete').setOrigin(0.5, 0).setScale(0.45 * MIN_XY / 600).setDepth(100)
        var failed = scene.add.sprite(SIZE_X / 2, -this.MSG_BOTTOM_HEIGHT, 'menu', 'level_failed').setOrigin(0.5, 0).setScale(0.45 * MIN_XY / 600).setDepth(100)
        complete.visible = failed.visible = false
        this.popups = {}
        this.popups.sprites = [complete, failed]

        // Add level text
        var levelText = (scene.levelName ? scene.levelName : (this.playTesting ? 'Testing' : (scene.levelIndex == 0 ? 'Home' : 'Level ' + scene.levelIndex)))
        this.cornerText = scene.add.bitmapText(getXY(0.04), SIZE_Y - getXY(0.04), 'voxel_font', levelText, 60 * MIN_XY / 600).setOrigin(0, 1).setTint(0).setDepth(100)

        if (!scene.levelString) this.showTutorial(scene.levelIndex) // Will show a tutorial if there is one for this level index
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

    toggleVisibility(on) {
        this.cornerText.visible = on
        this.buttonInteract.visible = on
        this.buttonMenu = on
        this.buttonNext.visible = on && this.scene.levelStatus == LEVEL_STATUS.COMPLETED && !this.scene.public
        this.buttonRestart.visible = on && this.scene.levelStatus != LEVEL_STATUS.COMPLETED
        this.popups.sprites[0].visible = on && this.scene.levelStatus == LEVEL_STATUS.COMPLETED
        this.popups.sprites[1].visible = on && this.scene.levelStatus == LEVEL_STATUS.FAILED
    }

    showRatingOptions() {
        var rateText = this.scene.add.bitmapText(SIZE_X / 2, getXY(0.24), 'voxel_font', "How did you like this level?", 50 * MIN_XY / 600).setOrigin(0.5, 0).setDepth(150).setAlpha(0)
        var background = this.scene.add.rectangle(0, 0, 2 * SIZE_X, SIZE_Y, 0x000000).setAlpha(0.001).setDepth(120).setOrigin(0).setInteractive()

        this.upvote = this.scene.add.sprite(SIZE_X / 2 - getXY(0.25), SIZE_Y / 2, 'button_upvote_square').setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(150).setAlpha(0)
        this.upvote.on('pointerdown', () => this.setVote(true))
        this.upvote.setTint(this.currentVote ? "0xffffff" : "0x777777") // combines both undefined and false, wow

        this.downvote = this.scene.add.sprite(SIZE_X / 2 + getXY(0.25), SIZE_Y / 2, 'button_downvote_square').setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(150).setAlpha(0).setTint("0x777777")
        this.downvote.on('pointerdown', () => this.setVote(false))
        this.downvote.setTint(this.currentVote == false ? "0xffffff" : "0x777777" )

        this.buttonConfirm = this.scene.add.sprite(SIZE_X / 2, SIZE_Y - getXY(0.2), 'button_next').setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(150).setAlpha(0)
        this.buttonConfirm.on('pointerdown', function () {
            this.scene.returnToBrowser()
            if (getAndroid()) Android.showAd()
        })

        var ratingElements = [background, rateText, this.upvote, this.downvote, this.buttonConfirm]
        ratingElements.forEach(b => this.scene.tweens.add({
            targets: b,
            alpha: b == background ? 0.4 : 1,
            duration: 1100,
            ease: 'Expo',
            delay: 1300
        }))
    }

    setVote(upvote) {
        this.currentVote = upvote
        if (!this.upvote || !this.downvote) return
        this.upvote.setTint(upvote ? "0xffffff" : "0x777777")
        this.downvote.setTint(upvote ? "0x777777" : "0xffffff")
    }

    showTutorial(index) {
        var LEVELS_WITH_TUTORIAL = [1, 2]
        var SHOW_TIMES = { 1: 6000, 2: 8000 }
        if (!LEVELS_WITH_TUTORIAL.includes(index)) return // Add all levels with tutorials here
        var tutorialElements = []
        tutorialElements.push(this.scene.add.rectangle(0, 0, SIZE_X, SIZE_Y, 0x000000).setAlpha(0.6).setDepth(150).setOrigin(0).setInteractive())
        if (index == 1) {
            var title = this.scene.add.bitmapText(SIZE_X / 2, getXY(0.14), 'voxel_font', "Plane turns RIGHT before a mountain", 42 * MIN_XY / 600)
            title.setDepth(150).setOrigin(0.5, 0)
            tutorialElements.push(title)
            this.scene.anims.create({
                key: 'tutorial1',
                frames: [{ key: 'tutorial', frame: 'turn0' }, { key: 'tutorial', frame: 'turn1' }, { key: 'tutorial', frame: 'turn2' }, { key: 'tutorial', frame: 'turn3' }, { key: 'tutorial', frame: 'turn4' }, { key: 'tutorial', frame: 'turn5' }],
                frameRate: 5,
                hideOnComplete: false,
                repeat: -1
            })
            var tutorialCard = this.scene.add.sprite(SIZE_X / 2, SIZE_Y / 2, 'tutorial', 'turn0').setOrigin(0.5, 0.5).setScale(0.65 * MIN_XY / 600).setDepth(150)
            tutorialCard.anims.play('tutorial1')
            tutorialElements.push(tutorialCard)
        }
        if (index == 2) {
            var title = this.scene.add.bitmapText(SIZE_X / 2, getXY(0.14), 'voxel_font', "Buttons toggle adjacent tiles", 42 * MIN_XY / 600)
            tutorialElements.push(this.scene.add.bitmapText(SIZE_X - getXY(0.03), SIZE_Y / 2, 'voxel_font', "Use with", 42 * MIN_XY / 600).setOrigin(1, 1).setDepth(150))
            tutorialElements.push(this.scene.add.sprite(SIZE_X - getXY(0.08), SIZE_Y - getXY(0.27), 'tutorial', 'arrow_down').setOrigin(0.5, 0.5).setScale(0.35 * MIN_XY / 600).setDepth(150).setOrigin(1, 1))
            title.setDepth(150).setOrigin(0.5, 0)
            tutorialElements.push(title)
            this.scene.anims.create({
                key: 'tutorial2',
                frames: [{ key: 'tutorial', frame: 'button0' }, { key: 'tutorial', frame: 'button1' }],
                frameRate: 1.5,
                hideOnComplete: false,
                repeat: -1
            })
            var tutorialCard = this.scene.add.sprite(SIZE_X / 2, SIZE_Y / 2, 'tutorial', 'button0').setOrigin(0.5, 0.5).setScale(0.65 * MIN_XY / 600).setDepth(150)
            tutorialCard.anims.play('tutorial2')
            tutorialElements.push(tutorialCard)
        }
        tutorialElements.forEach(e => this.scene.tweens.add({
            delay: SHOW_TIMES[index],
            targets: e,
            alpha: 0,
            duration: 1000
        }))

    }
}