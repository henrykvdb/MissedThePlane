var assets
var text

const X_START = 160;
const Y_START = 200;
const SHIFT = 130;
const ROW_COUNT = 5;

class LevelSelectScene extends Phaser.Scene {

    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    preload() { }

    create() {
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        text = this.add.text(SIZE_X / 2 - X_START / 2, Y_START / 3, 'Select a level to play', { fill: '#000000', fontSize: 40, fontStyle: 'bold' }).setOrigin(0.5, 0)
        text = this.add.text(X_START / 5, SIZE_Y - Y_START / 1.5, 'Feeling stuck? Skip to the next one!', { fill: '#000000', fontSize: 40, fontStyle: 'bold' })

        // Close button
        var LevelSelectScene = this;
        this.btnRestart = this.add.sprite(900, 100, 'btn_close').setScale(0.25).setInteractive().setDepth(100);
        this.btnRestart.on('pointerdown', function (pointer) {
            LevelSelectScene.scene.resume('GameScene');
            LevelSelectScene.scene.stop()
        });

        // Level buttons
        for (let i = 0; i < ALL_LEVELS.length; i++) {
            var pos = [X_START + SHIFT * (i % ROW_COUNT), Y_START + SHIFT * Math.floor(i / ROW_COUNT)]
            var asset = 'btn_level_' + ALL_LEVELS[i].difficulty
            var text = i == 0 ? "🏠" : i
            LevelSelectScene.add.text(pos[0], pos[1], text, { fill: '#000000', fontSize: 60, fontStyle: 'bold' }).setOrigin(0.5, 0.5)
            var button = LevelSelectScene.add.sprite(pos[0], pos[1], asset).setOrigin(0.5, 0.5).setScale(0.1).setInteractive()
            button.smoothed = false;
            button.on('pointerdown', function (pointer) {
                LevelSelectScene.scene.start('GameScene', { levelIndex: i });
                LevelSelectScene.scene.stop()
            });
        }
    }
}
