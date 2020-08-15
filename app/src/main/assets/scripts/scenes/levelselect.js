var assets
var text

class LevelSelectScene extends Phaser.Scene {

    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    preload() { }

    create() {
        const X_START = 160*MIN_XY/600
        const Y_START = 200*MIN_XY/600
        const SHIFT = 130*MIN_XY/600
        const ROW_COUNT = 5

        var LevelSelectScene = this;
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        LevelSelectScene.add.sprite(X_START * 1.7, SIZE_Y, "pilot_tip").setOrigin(1, 1).setScale(MIN_XY/600)
        text = this.add.text(SIZE_X / 2, Y_START / 3, 'Select a level to play', { fill: '#000000', fontSize: 40*MIN_XY/600, fontStyle: 'bold' }).setOrigin(0.5, 0)
        text = this.add.text(X_START * 2, SIZE_Y - Y_START / 1.2, 'Feeling stuck?', { fill: '#000000', fontSize: 40*MIN_XY/600, }).setOrigin(0,0)
        this.add.text(X_START * 2, SIZE_Y - Y_START / 1.8, 'Skip to the next one!', { fill: '#000000', fontSize: 40*MIN_XY/600, }).setOrigin(0,0)

        // Close button
        this.btnRestart = this.add.sprite(SIZE_X-getXY(0.14), getXY(0.14), 'btn_close').setScale(0.20*MIN_XY/600).setInteractive().setDepth(100);
        this.btnRestart.on('pointerdown', function (pointer) {
            LevelSelectScene.scene.resume('GameScene');
            LevelSelectScene.scene.stop()
        });

        // Level buttons
        for (let i = 0; i < ALL_LEVELS.length; i++) {
            var pos = [SIZE_X / 2 + SHIFT * ((i % ROW_COUNT) - (ALL_LEVELS.length / ROW_COUNT)), Y_START + SHIFT * Math.floor(i / ROW_COUNT)]
            var asset = 'btn_level_' + ALL_LEVELS[i].difficulty
            LevelSelectScene.add.text(pos[0], pos[1], i == 0 ? "" : i, { fill: '#000000', fontSize: 60, fontStyle: 'bold' }).setOrigin(0.5, 0.5)
            var button = LevelSelectScene.add.sprite(pos[0], pos[1], asset).setOrigin(0.5, 0.5).setScale(0.1*MIN_XY/600).setInteractive()
            button.smoothed = false;
            button.on('pointerdown', function (pointer) {
                LevelSelectScene.scene.start('GameScene', { levelIndex: i });
                LevelSelectScene.scene.stop()
            });
        }
    }
}
