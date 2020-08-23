class GameScene extends Phaser.Scene {

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.levelIndex = data.levelIndex ? data.levelIndex : 0
        this.levelString = data.levelString // We are playing a loaded level, we hide most of the UI
    }

    create() {
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        this.cursors = this.input.keyboard.createCursorKeys()
        this.input.keyboard.addKeys({up:Phaser.Input.Keyboard.KeyCodes.W,down:Phaser.Input.Keyboard.KeyCodes.S,left:Phaser.Input.Keyboard.KeyCodes.A,right:Phaser.Input.Keyboard.KeyCodes.D,restart:Phaser.Input.Keyboard.KeyCodes.R});
        this.graphics = this.add.graphics();
        this.ui = new UI(this, this.levelString != undefined)

        // Create level
        var inputString = this.levelString ? this.levelString : ALL_LEVELS[this.levelIndex]
        this.levelStatus = LEVEL_STATUS.PLAYING
        this.world = new World(this, inputString)

        this.input.on('pointerdown', () => this.world.handleMouseInput(this.input.activePointer.x, this.input.activePointer.y));
    }

    //Handle input
    update(_, dt) {
        if (this.input.keyboard.keys[Phaser.Input.Keyboard.KeyCodes.R].isDown) this.scene.restart({ levelIndex: this.levelIndex })

        this.pilot.update(dt)
        this.plane.update(dt)
        this.ui.updatePopup(dt)
    }

    setLevelStatus(newStatus) {
        if (newStatus == this.levelStatus) return
        this.levelStatus = newStatus
        if (newStatus == LEVEL_STATUS.COMPLETED) {
            this.world.clearRunway()
            audio.playPopup(true)
            this.ui.startPopupAnimation(true)
            this.ui.btnRestart.visible = false
            if (this.levelIndex < ALL_LEVELS.length - 1) this.ui.btnNext.visible = true
        } else if (newStatus == LEVEL_STATUS.FAILED) {
            audio.playPopup(false)
            this.ui.startPopupAnimation(false)
        }
    }

    returnToEditor() {
        this.scene.stop()
        this.scene.wake('EditorScene')
    }
}

function addArray(a, b) { // quality magic tbh
    return a.map((e, i) => e + b[i]) //Magic, don't touch
}
