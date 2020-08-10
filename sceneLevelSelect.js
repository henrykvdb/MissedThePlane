var assets
var text
class LevelSelectScene extends Phaser.Scene {

    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    preload() {}

    create() {
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        text = this.add.text(250, 16, '', { fill: '#000000' })
        text.text = "Welcome to this shit menu";

        var scene = this.scene
        this.btnPlay = this.add.sprite(500, 300, 'play').setOrigin(0.5, 1.5).setScale(0.5).setInteractive();
        this.btnPlay.on('pointerdown', function (pointer) {
            scene.start('GameScene');
            scene.stop();
        });

        this.btnLevels = this.add.sprite(500, 300, 'levels').setOrigin(0.5, 0.5).setScale(0.5).setInteractive();
        this.btnLevels.on('pointerdown', function (pointer) {
            text.text = 'you clicked level?'
        });

        this.btnOptions = this.add.sprite(500, 300, 'options').setOrigin(0.5, -.5).setScale(0.5).setInteractive();
        this.btnOptions.on('pointerdown', function (pointer) {
            text.text = 'not implemented haha'
        });

    }
}
