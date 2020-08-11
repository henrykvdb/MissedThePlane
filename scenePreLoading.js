class PreLoadingScene extends Phaser.Scene {

    constructor() {
        super({ key: 'PreLoadingScene' });
    }

    preload() {
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        this.load.image('splash', 'assets/menu/splashscreen.png');
        this.load.on('complete', this.complete, { scene: this.scene });

    }

    complete(game) {
        game.scene.scene.start('LoadingScene');
        game.scene.scene.stop()
    }
}
