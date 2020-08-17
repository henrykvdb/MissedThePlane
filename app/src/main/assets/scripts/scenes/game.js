class GameScene extends Phaser.Scene {

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.levelIndex = data.levelIndex
    }

    create() {
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        this.cursors = this.input.keyboard.createCursorKeys()
        this.input.keyboard.addKeys({up:Phaser.Input.Keyboard.KeyCodes.W,down:Phaser.Input.Keyboard.KeyCodes.S,left:Phaser.Input.Keyboard.KeyCodes.A,right:Phaser.Input.Keyboard.KeyCodes.D,restart:Phaser.Input.Keyboard.KeyCodes.R});
        this.graphics = this.add.graphics();
        this.ui = new UI(this)

        // Create level
        var inputString = oldLevelToString(ALL_LEVELS[this.levelIndex])
        this.levelStatus = LEVEL_STATUS.PLAYING
        this.world = new World(this, inputString)

        // Add pilot control listeners
        var pilot = this.pilot
        this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', function () { pilot.interact() })
        
        this.ui.showLevelText(this.levelIndex)

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
            this.game.ui.startPopupAnimation(false)
        }
    }
}

function addArray(a, b) { // quality magic tbh
    return a.map((e, i) => e + b[i]) //Magic, don't touch
}
