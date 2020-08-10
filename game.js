var music
class GameScene extends Phaser.Scene {

    constructor() {
        super({ key: 'GameScene' });
    }

    // Everything is loaded in the menu to not cause lag when using the UI
    preload() {}

    create() {
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")

        // Start music
        music = this.sound.add('music', { loop: true })
        music.play()

        // Draw menu button
        var scene = this.scene
        this.btnMenu = this.add.sprite(900, 100, 'menu').setScale(0.5).setInteractive();
        this.btnMenu.on('pointerdown', function (pointer) {
            scene.start('MenuScene');
        });

        // GAME SETTINGS
        var levelIndex = 2 // choose level here
        var level = ALL_LEVELS[levelIndex]
        this.add.text(10, 10, 'Level ' + levelIndex).setColor("0").setFontSize(50)

        this.world = new World(this, level.tiles)
        this.pilot = new Pilot(this, level.pilot.coords, level.pilot.dir)
        this.plane = new Plane(this, level.plane.coords, level.plane.dir)

        // Add pilot control listeners
        var pilot = this.pilot
        this.cursors = this.input.keyboard.createCursorKeys()
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
    }
}

function addArray(a, b) { // quality magic tbh
    return a.map((e, i) => e + b[i]) //Magic, don't touch
}
