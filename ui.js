function UI(gameScene) {
    // Next button
    this.btnNext = gameScene.add.sprite(900, 100, 'btn_next').setScale(0.25).setInteractive().setDepth(100);
    this.btnNext.visible = false;
    this.btnNext.on('pointerdown', function (pointer) {
        gameScene.scene.restart({ levelIndex: ++gameScene.levelIndex })
        music.resume()
    });

    // Restart button
    this.btnRestart = gameScene.add.sprite(900, 100, 'btn_restart').setScale(0.25).setInteractive().setDepth(100);
    this.btnRestart.on('pointerdown', function (pointer) {
        gameScene.scene.restart({ levelIndex: gameScene.levelIndex })
        music.resume()
    });

    // Sound change button
    buttons = []
    for (var i = 0; i < 4; i++) {
        var button = gameScene.add.sprite(45, 160, 'btn_volume_' + i).setScale(0.14).setInteractive().setDepth(100)
        buttons.push(button)
        button.visible = false
        button.on('pointerdown', function (pointer) {
            buttons[audio.volumeIndex].visible = false
            audio.toggleVolume();
            buttons[audio.volumeIndex].visible = true
        });
    }
    buttons[audio.volumeIndex].visible = true

    // Level change button
    this.btnLevels = gameScene.add.sprite(90, 90, 'btn_levels').setScale(0.25).setInteractive().setDepth(100);
    this.btnLevels.on('pointerdown', function (pointer) {
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

    this.showLevelText = function(levelIndex) {
        var margin = 15; var shiftY = 40; var startY = 420;
        if (levelIndex == 0) {
            gameScene.add.text(margin, startY + 0 * shiftY, 'Autopilot').setColor("0").setFontSize(28).setDepth(100)
            gameScene.add.text(margin, startY + 1 * shiftY, 'turns right', {fontStyle: "bold"}).setColor("0").setFontSize(28).setDepth(100);
            gameScene.add.text(margin, startY + 2 * shiftY, 'before a mountain').setColor("0").setFontSize(28).setDepth(100)
            gameScene.add.text(margin, startY + 3 * shiftY, 'to avoid a crash.').setColor("0").setFontSize(28).setDepth(100)

            gameScene.add.text(SIZE_X - margin, startY + 0 * shiftY, 'Get the').setColor("0").setFontSize(28).setDepth(100).setOrigin(1, 0)
            gameScene.add.text(SIZE_X - margin, startY + 1 * shiftY, 'plane to the').setColor("0").setFontSize(28).setDepth(100).setOrigin(1, 0)
            gameScene.add.text(SIZE_X - margin, startY + 2 * shiftY, 'landing strip!', {fontStyle: "Bold"}).setColor("0").setFontSize(28).setDepth(100).setOrigin(1, 0)
        }

        if (levelIndex == 1) {
            gameScene.add.text(margin, startY + 0 * shiftY, 'Buttons', {fontStyle: "bold"}).setColor("0").setFontSize(28).setDepth(100)
            gameScene.add.sprite(margin + 140, startY, 'B0').setDepth(100).setScale(0.1)
            gameScene.add.text(margin, startY + 1 * shiftY, 'toggle adjacent').setColor("0").setFontSize(28).setDepth(100);
            gameScene.add.text(margin, startY + 2 * shiftY, 'tiles between').setColor("0").setFontSize(28).setDepth(100)
            gameScene.add.text(margin, startY + 3 * shiftY, 'grass and mountains.').setColor("0").setFontSize(28).setDepth(100)

            gameScene.add.text(SIZE_X - margin, startY + 1 * shiftY, 'Use them').setColor("0").setFontSize(28).setDepth(100).setOrigin(1, 0)
            gameScene.add.text(SIZE_X - margin - 130, startY + 2 * shiftY, 'with ').setColor("0").setFontSize(28).setDepth(100).setOrigin(1, 0)
            gameScene.add.text(SIZE_X - margin, startY + 2 * shiftY, 'spacebar', {fontStyle: "Bold"}).setColor("0").setFontSize(28).setDepth(100).setOrigin(1, 0)
            gameScene.add.text(SIZE_X - margin, startY + 3 * shiftY, 'when nearby.').setColor("0").setFontSize(28).setDepth(100).setOrigin(1, 0)
        }
    }

    // Add level text
    gameScene.add.text(10, 10, 'Level ' + (gameScene.levelIndex + 1) + "/" + ALL_LEVELS.length).setColor("0").setFontSize(50).setDepth(100)
}