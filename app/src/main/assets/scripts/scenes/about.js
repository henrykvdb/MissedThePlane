class AboutScene extends Phaser.Scene {

    constructor() {
        super({ key: 'AboutScene' });
    }

    init(data) {
    }

    create() {
        this.background = this.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(0).setOrigin(0, 0).setTint("0x59AACA")
        const scene = this

        // Return to menu
        this.btnReturn = scene.add.sprite(getXY(0.04), getXY(0.04), 'btn_back').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(0)
        this.btnReturn.on('pointerdown', function (pointer) {
            console.log("back")
            console.log(scene.scene.key)
            scene.scene.launch('MenuScene', {caller: scene.scene.key});
            scene.scene.pause()
        })
    }
}