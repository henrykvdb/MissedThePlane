class GameScene extends Phaser.Scene {

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.levelIndex = data.levelIndex
        this.audio = data.audio //TODO ???
    }

    create() {
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        this.cursors = this.input.keyboard.createCursorKeys()
        this.input.keyboard.addKeys({up:Phaser.Input.Keyboard.KeyCodes.W,down:Phaser.Input.Keyboard.KeyCodes.S,left:Phaser.Input.Keyboard.KeyCodes.A,right:Phaser.Input.Keyboard.KeyCodes.D,restart:Phaser.Input.Keyboard.KeyCodes.R});
        this.graphics = this.add.graphics();
        this.ui = new UI(this)

        // Create level
        var level = ALL_LEVELS[this.levelIndex]
        this.world = new World(this, level.tiles.map(row => row.slice()))
        this.pilot = new Pilot(this, level.pilot.coords.slice(), level.pilot.dir, level.pilot.speedModifier)
        this.plane = new Plane(this, level.plane.coords.slice(), level.plane.dir)

        // Add pilot control listeners
        var pilot = this.pilot
        this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', function () { pilot.interact() })
        
        this.ui.showLevelText(this.levelIndex)

        this.input.on('pointerdown', () => this.world.handleMouseInput(this.input.mousePointer.x, this.input.mousePointer.y));
    }

    //Handle input
    update(_, dt) {
        if (this.input.keyboard.keys[Phaser.Input.Keyboard.KeyCodes.R].isDown) this.scene.restart({ levelIndex: this.levelIndex })
        
        var dirVector = [0, 0] // key checking is a bit verbose but whatever
        if (this.input.keyboard.keys[Phaser.Input.Keyboard.KeyCodes.W].isDown || this.cursors.up.isDown)    dirVector = addArray(dirVector, [-1, -1])
        if (this.input.keyboard.keys[Phaser.Input.Keyboard.KeyCodes.S].isDown || this.cursors.down.isDown)  dirVector = addArray(dirVector, [1, 1])
        if (this.input.keyboard.keys[Phaser.Input.Keyboard.KeyCodes.D].isDown || this.cursors.right.isDown) dirVector = addArray(dirVector, [-1, 1])
        if (this.input.keyboard.keys[Phaser.Input.Keyboard.KeyCodes.A].isDown || this.cursors.left.isDown)  dirVector = addArray(dirVector, [1, -1])

        this.pilot.move(dirVector, dt)
        this.plane.update(dt)
        this.ui.updatePopup(dt)
    }
}

function addArray(a, b) { // quality magic tbh
    return a.map((e, i) => e + b[i]) //Magic, don't touch
}
