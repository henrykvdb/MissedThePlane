class UI {
    constructor(scene, playTesting) {
        this.MSG_BOTTOM_HEIGHT = 50 * MIN_XY / 600
        this.MSG_MOVE_TIME = 1200 // [ms]
        this.playTesting = playTesting

        // Save scene
        this.scene = scene

        // Next button
        this.btnNext = scene.add.sprite(SIZE_X - getXY(0.04), getXY(0.04), 'btn_next').setOrigin(1, 0).setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnNext.visible = false
        this.btnNext.on('pointerdown', function (pointer) {
            if (!playTesting) scene.scene.restart({ levelIndex: ++scene.levelIndex })
            else scene.returnToEditor(true)
        })

        // Restart button
        this.btnRestart = scene.add.sprite(SIZE_X - getXY(0.04), getXY(0.04), 'btn_restart').setOrigin(1, 0).setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnRestart.on('pointerdown', function (pointer) {
            scene.scene.restart({ levelIndex: scene.levelIndex, levelString: scene.levelString })
        })

        // Press button
        this.btnInteract = scene.add.sprite(SIZE_X - getXY(0.04), SIZE_Y - getXY(0.04), 'btn_interact').setOrigin(1, 1).setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnInteract.on('pointerdown', function (pointer) {
            scene.pilot.interact()
        })

        // Back/menu button
        if (!this.playTesting) {
            this.btnMenu = scene.add.sprite(getXY(0.04), getXY(0.04), 'btn_menu').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
            this.btnMenu.on('pointerdown', function (pointer) {
                scene.ui.toggleVisibility(false)
                scene.scene.launch('MenuScene', {caller: scene.scene.key});
                scene.scene.pause()
            })
        } else {
            this.btnInteract = scene.add.sprite(getXY(0.04), getXY(0.04), 'btn_back').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
            this.btnInteract.on('pointerdown', function (pointer) {
                scene.returnToEditor(scene.levelStatus == LEVEL_STATUS.COMPLETED)
            })
        }

        // Level completed/failed messages
        var complete = scene.add.sprite(SIZE_X / 2, -this.MSG_BOTTOM_HEIGHT, 'level_complete').setOrigin(0.5, 0).setScale(0.45 * MIN_XY / 600).setDepth(100)
        var failed = scene.add.sprite(SIZE_X / 2, -this.MSG_BOTTOM_HEIGHT, 'level_failed').setOrigin(0.5, 0).setScale(0.45 * MIN_XY / 600).setDepth(100)
        complete.visible = failed.visible = false
        this.popups = {}
        this.popups.sprites = [complete, failed]

        // Add level text
        if (this.playTesting) this.cornerText = scene.add.text(getXY(0.04), SIZE_Y - getXY(0.04), 'Testing').setOrigin(0, 1).setColor("0").setFontSize(50 * MIN_XY / 600).setDepth(100)
        else if (scene.levelIndex == 0) this.cornerText = scene.add.text(getXY(0.04), SIZE_Y - getXY(0.04), 'Home').setOrigin(0, 1).setColor("0").setFontSize(50 * MIN_XY / 600).setDepth(100)
        else this.cornerText = scene.add.text(getXY(0.04), SIZE_Y - getXY(0.04), "Level " + scene.levelIndex).setOrigin(0, 1).setColor("0").setFontSize(50 * MIN_XY / 600).setDepth(100)

        this.showTutorial(scene.levelIndex) // Will show a tutorial if there is one for this level index
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
        this.btnInteract.visible = on
        this.btnMenu = on
        this.btnNext.visible = on && this.scene.levelStatus == LEVEL_STATUS.COMPLETED && !this.scene.public
        this.btnRestart.visible = on && this.scene.levelStatus != LEVEL_STATUS.COMPLETED
        this.popups.sprites[0].visible = on && this.scene.levelStatus == LEVEL_STATUS.COMPLETED
        this.popups.sprites[1].visible = on && this.scene.levelStatus == LEVEL_STATUS.FAILED
    }

    showRatingOptions() {
        var rateText = this.scene.add.text(SIZE_X / 2, getXY(0.24), "How did you like this level?", { fill: '#FFFFFF', fontSize: 40 * MIN_XY / 600, fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(150).setAlpha(0)
        var background = this.scene.add.tileSprite(0, 0, 2 * SIZE_X, SIZE_Y, 'menu_invisible').setDepth(120).setOrigin(0, 0).setTint("0x000000").setAlpha(0).setInteractive()

        this.upvote = this.scene.add.sprite(SIZE_X / 2 - getXY(0.25), SIZE_Y / 2, 'btn_upvote_square').setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(150).setAlpha(0).setTint("0x777777")
        this.upvote.on('pointerdown', () => this.setVote(true))

        this.downvote = this.scene.add.sprite(SIZE_X / 2 + getXY(0.25), SIZE_Y / 2, 'btn_downvote_square').setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(150).setAlpha(0).setTint("0x777777")
        this.downvote.on('pointerdown', () => this.setVote(false))

        this.btnConfirm = this.scene.add.sprite(SIZE_X / 2, SIZE_Y - getXY(0.2), 'btn_next').setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(150).setAlpha(0)
        this.btnConfirm.on('pointerdown', () => this.scene.returnToBrowser())

        var ratingElements = [background, rateText, this.upvote, this.downvote, this.btnConfirm]
        ratingElements.forEach(b => this.scene.tweens.add({
            targets: b,
            alpha: b == background ? 0.4 : 1,
            duration: 1100,
            ease: 'Expo',
            delay: 1300
        }))
    }

    setVote(upvote) {
        this.upvote.setTint(upvote ? "0xffffff" : "0x777777")
        this.downvote.setTint(upvote ? "0x777777" : "0xffffff")
        this.currentVote = upvote
    }
    
    showTutorial(index) {
        var LEVELS_WITH_TUTORIAL = [1, 2]
        var SHOW_TIMES = {1: 6000, 2: 8000}
        if (!LEVELS_WITH_TUTORIAL.includes(index)) return // Add all levels with tutorials here
        var tutorialElements = []
        // TODO: stop inputs during tutorial?
        tutorialElements.push(this.scene.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(150).setOrigin(0).setTint(0, 0, 0).setAlpha(0.6).setInteractive())
        if (index == 1) {
            var title = this.scene.add.text(SIZE_X / 2, getXY(0.14), "Plane turns RIGHT before a mountain", { fill: '#ffffff', fontSize: 32 * MIN_XY / 600, fontStyle: 'bold' })
            title.setDepth(150).setOrigin(0.5, 0)
            tutorialElements.push(title)
            this.scene.anims.create({
                key: 'tutorial1',
                frames: [{key: 'tutorial10'}, {key: 'tutorial11'},{key: 'tutorial12'},{key: 'tutorial13'},{key: 'tutorial14'},{key: 'tutorial15'}],
                frameRate: 5,
                hideOnComplete: false,
                repeat: -1
            })
            var tutorialCard = this.scene.add.sprite(SIZE_X / 2, SIZE_Y / 2, 'tutorial10').setOrigin(0.5, 0.5).setScale(0.65 * MIN_XY / 600).setDepth(150)
            tutorialCard.anims.play('tutorial1')
            tutorialElements.push(tutorialCard)
        }
        if (index == 2) {
            var title = this.scene.add.text(SIZE_X / 2, getXY(0.14), "Buttons toggle adjacent tiles", { fill: '#ffffff', fontSize: 32 * MIN_XY / 600, fontStyle: 'bold' })
            tutorialElements.push(this.scene.add.text(SIZE_X - getXY(0.03), SIZE_Y / 2, "Use with", { fill: '#ffffff', fontSize: 32 * MIN_XY / 600, fontStyle: 'bold' }).setOrigin(1, 1).setDepth(150))
            tutorialElements.push(this.scene.add.sprite(SIZE_X - getXY(0.08), SIZE_Y - getXY(0.27), 'arrow_down').setOrigin(0.5, 0.5).setScale(0.35 * MIN_XY / 600).setDepth(150).setOrigin(1, 1))
            title.setDepth(150).setOrigin(0.5, 0)
            tutorialElements.push(title)
            this.scene.anims.create({
                key: 'tutorial2',
                frames: [{key: 'tutorial20'}, {key: 'tutorial21'}],
                frameRate: 1.5,
                hideOnComplete: false,
                repeat: -1
            })
            var tutorialCard = this.scene.add.sprite(SIZE_X / 2, SIZE_Y / 2, 'tutorial20').setOrigin(0.5, 0.5).setScale(0.65 * MIN_XY / 600).setDepth(150)
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