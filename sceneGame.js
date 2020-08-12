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
        this.graphics = this.add.graphics();
        this.ui = new UI(this)

        // Create level
        var level = ALL_LEVELS[this.levelIndex]
        if (level.tiles == undefined) this.world = new World(this, undefined)
        else this.world = new World(this, level.tiles.map(row => row.slice()))
        this.pilot = new Pilot(this, level.pilot.coords.slice(), level.pilot.dir, level.pilot.speedModifier)
        this.plane = new Plane(this, level.plane.coords.slice(), level.plane.dir)

        // Add pilot control listeners
        var pilot = this.pilot
        this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', function () { pilot.interact() })
    }

    //Handle input
    update(_, dt) {
        var dirVector = [0, 0]
        if (this.cursors.up.isDown) dirVector = addArray(dirVector, [-1, -1])
        if (this.cursors.down.isDown) dirVector = addArray(dirVector, [1, 1])
        if (this.cursors.right.isDown) dirVector = addArray(dirVector, [-1, 1])
        if (this.cursors.left.isDown) dirVector = addArray(dirVector, [1, -1])

        this.pilot.move(dirVector, dt)
        this.plane.move(dt)
        this.ui.updatePopup(dt)
    }
}

function addArray(a, b) { // quality magic tbh
    return a.map((e, i) => e + b[i]) //Magic, don't touch
}
