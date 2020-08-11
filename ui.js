function UI(gameScene) {

    // Start music
    //this.music = this.sound.add('music', { loop: true })
    //this.music.play()

    // Next button
    this.btnNext = gameScene.add.sprite(900, 100, 'btn_next').setScale(0.25).setInteractive().setDepth(100);
    this.btnNext.visible = false;
    this.btnNext.on('pointerdown', function (pointer) {
        gameScene.scene.restart({ levelIndex: ++gameScene.levelIndex })
    });

    // Restart button
    this.btnRestart = gameScene.add.sprite(900, 100, 'btn_restart').setScale(0.25).setInteractive().setDepth(100);
    this.btnRestart.on('pointerdown', function (pointer) {
        gameScene.scene.restart({ levelIndex: gameScene.levelIndex })
    });

    // Draw sound change bar
    gameScene.volumeSlider = []
    gameScene.graphics.fillStyle(0x000000, 0.4);
    var sliderTop = VOL_POS_Y - VOL_LENGTH - VOL_OFFSET;
    gameScene.volumeSlider.push(gameScene.graphics.fillRect(VOL_POS_X - VOL_THICKNESS / 2, sliderTop, VOL_THICKNESS, VOL_LENGTH).setInteractive().setDepth(100))
    gameScene.volumeSlider.push(gameScene.add.sprite(VOL_POS_X, sliderTop + VOL_LENGTH / 2, 'btn_volume_head'))
    gameScene.volumeSlider[0].visible = false
    gameScene.volumeSlider[1].setScale(2 * VOL_THICKNESS / 800).setInteractive({ draggable: true }).visible = false
    gameScene.volumeSlider[1].on('drag', function (pointer, dragX, dragY) {
        gameScene.volumeSlider[1].setPosition(gameScene.volumeSlider[1].x, Math.min(Math.max(dragY, VOL_POS_Y - VOL_LENGTH - VOL_OFFSET), VOL_POS_Y - VOL_OFFSET));
        gameScene.sound.volume = 1 - (gameScene.volumeSlider[1].y - sliderTop) / VOL_LENGTH
    })

    // Sound change button
    this.btnVolume = gameScene.add.sprite(VOL_POS_X, VOL_POS_Y, 'btn_volume').setScale(0.25).setInteractive().setDepth(100);
    this.btnVolume.on('pointerdown', function (pointer) {
        if (gameScene.volumeSlider[0].visible || gameScene.volumeSlider[0].visible) {
            gameScene.volumeSlider[0].visible = false
            gameScene.volumeSlider[1].visible = false
        }
        else {
            gameScene.volumeSlider[0].visible = true
            gameScene.volumeSlider[1].visible = true
        }
    });

    // Level change button
    this.btnLevels = gameScene.add.sprite(90, 90, 'btn_levels').setScale(0.25).setInteractive().setDepth(100);
    this.btnLevels.on('pointerdown', function (pointer) {
        //var nextLevelIndex = Math.floor(Math.random() * ALL_LEVELS.length) // Test your luck with random level selection
        //gameScene.scene.restart({ levelIndex: nextLevelIndex }) //TODO ACTUAL LEVEL SELECT MENU
        gameScene.scene.pause();
        gameScene.scene.launch('LevelSelectScene');
    });

    // Level completed/failed messages
    const BOTTOM_HEIGHT = 50
    const MOVE_TIME = 1200 // [ms]
    var complete = gameScene.add.sprite(SIZE_X/2, -BOTTOM_HEIGHT, 'level_complete').setScale(0.45).setDepth(100)
    var failed = gameScene.add.sprite(SIZE_X/2, -BOTTOM_HEIGHT, 'level_failed').setScale(0.45).setDepth(100)
    complete.visible = failed.visible = false
    this.popups = {}
    this.popups.sprites = [complete, failed]

    this.startPopupAnimation = function(success) {
        this.popups.typePopup = success
        this.popups.sprites[success ? 0 : 1].visible = true
        this.popups.timeAnimating = 1
    }

    this.updatePopup = function(dt) {
        if (this.popups.timeAnimating <= 0) return
        this.popups.timeAnimating += dt
        var newYPos = BOTTOM_HEIGHT * Math.sin(this.popups.timeAnimating / MOVE_TIME * Math.PI - Math.PI / 2)
        this.popups.sprites[this.popups.typePopup ? 0 : 1].y = newYPos
        if (this.popups.timeAnimating >= MOVE_TIME) this.popups.timeAnimating = 0
    }

    // Add level text
    gameScene.add.text(10, 10, 'Level ' + (gameScene.levelIndex + 1) + "/" + ALL_LEVELS.length).setColor("0").setFontSize(50).setDepth(100)
}