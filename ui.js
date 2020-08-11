// Volume slider settings
VOL_POS_X = 900
VOL_POS_Y = 500
VOL_THICKNESS = 40
VOL_LENGTH = 200
VOL_OFFSET = 70

function UI(gameScene) {
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

    // Sound change button
    buttons = []
    for (var i = 0; i < 4; i++) {
        var button = gameScene.add.sprite(VOL_POS_X, VOL_POS_Y, 'btn_volume_' + i).setScale(0.25).setInteractive().setDepth(100)
        buttons.push(button)
        button.visible = false
        button.on('pointerdown', function (pointer) {
            buttons[volumeIndex].visible = false
            volumeIndex = ++volumeIndex%4
            buttons[volumeIndex].visible = true
            gameScene.sound.volume = VOLUME_STEP * volumeIndex
        });
    }
    buttons[volumeIndex].visible = true

    // Level change button
    this.btnLevels = gameScene.add.sprite(90, 90, 'btn_levels').setScale(0.25).setInteractive().setDepth(100);
    this.btnLevels.on('pointerdown', function (pointer) {
        //var nextLevelIndex = Math.floor(Math.random() * ALL_LEVELS.length) // Test your luck with random level selection
        //gameScene.scene.restart({ levelIndex: nextLevelIndex }) //TODO ACTUAL LEVEL SELECT MENU
        gameScene.scene.pause();
        gameScene.scene.launch('LevelSelectScene');
    });

    // Add level text
    gameScene.add.text(10, 10, 'Level ' + (gameScene.levelIndex + 1) + "/" + ALL_LEVELS.length).setColor("0").setFontSize(50)
}