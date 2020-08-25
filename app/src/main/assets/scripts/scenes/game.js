class GameScene extends Phaser.Scene {

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.levelIndex = data.levelIndex != undefined ? data.levelIndex : -1 // Is either campaign index or level edit index OR public level id
        this.levelString = data.levelString // If this is passed, we are playtesting a level with this string
        this.public = data.public // If this is true, the levelIndex is the databse levelId of the level we are playing
        this.levelName = data.levelName // optional parameter to show levelName in the corner
    }

    create() {
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        this.cursors = this.input.keyboard.createCursorKeys()
        this.input.keyboard.addKeys({up:Phaser.Input.Keyboard.KeyCodes.W,down:Phaser.Input.Keyboard.KeyCodes.S,left:Phaser.Input.Keyboard.KeyCodes.A,right:Phaser.Input.Keyboard.KeyCodes.D,restart:Phaser.Input.Keyboard.KeyCodes.R});
        this.graphics = this.add.graphics();
        this.ui = new UI(this, this.levelString != undefined && !this.public)

        // Create level
        var inputString = this.levelString != undefined ? this.levelString : ALL_LEVELS[this.levelIndex]
        this.levelStatus = LEVEL_STATUS.PLAYING
        this.world = new World(this, inputString)
        this.timePlaying = 0;

        this.input.on('pointerdown', () => this.world.handleMouseInput(this.input.activePointer.x, this.input.activePointer.y));
    }

    //Handle input
    update(_, dt) {
        if (this.input.keyboard.keys[Phaser.Input.Keyboard.KeyCodes.R].isDown) this.scene.restart({ levelIndex: this.levelIndex })

        this.world.pilot.update(dt)
        this.world.plane.update(dt)
        this.ui.updatePopup(dt)
        this.timePlaying += dt
    }

    setLevelStatus(newStatus) {
        if (newStatus == this.levelStatus) return
        if (newStatus == LEVEL_STATUS.COMPLETED) {
            if (getAndroid() && this.levelString == undefined) Android.setHighestLevel(this.levelIndex)
            if (this.public) this.ui.showRatingOptions()
            this.world.clearRunway()
            audio.playPopup(true)
            this.ui.startPopupAnimation(true)
            this.ui.btnRestart.visible = false
            if (this.levelIndex < ALL_LEVELS.length - 1 && !this.public) this.ui.btnNext.visible = true
        } else if (newStatus == LEVEL_STATUS.FAILED) {
            audio.playPopup(false)
            this.ui.startPopupAnimation(false)
        }
        this.levelStatus = newStatus
    }

    returnToEditor(solved) {
        this.scene.stop()
        this.scene.wake('EditorScene')
        this.scene.get('EditorScene').setSolvable(solved)
    }

    returnToBrowser() {
        if (getAndroid() && this.ui.currentVote != undefined) Android.voteForLevel(this.levelIndex, this.ui.currentVote)
        if (getAndroid() && this.levelStatus == LEVEL_STATUS.COMPLETED) Android.playLevel(this.levelIndex, true)
        this.scene.stop()
        this.scene.start('BrowserScene')
    }
}

function addArray(a, b) { // quality magic tbh
    return a.map((e, i) => e + b[i]) //Magic, don't touch
}
