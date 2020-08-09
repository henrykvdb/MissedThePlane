const SIZE_X = 1000
const SIZE_Y = 600

//359x 208y for one block shift
const SHIFT_X = 147
const SHIFT_Y = 85

var config = {
    type: Phaser.AUTO,
    width: SIZE_X,
    height: SIZE_Y,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

var game = new Phaser.Game(config)

var assets
function preload() {
    //Add terain tile assets
    for (var i = 0; i < 7; i++) this.load.image('G' + i, 'assets/tiles/grass' + i + '.png')
    for (var i = 0; i < 4; i++) this.load.image('M' + i, 'assets/tiles/mountain' + i + '.png')
    this.load.image('W0', 'assets/tiles/water0.png')
    this.load.image('B0', 'assets/tiles/button0.png')
    this.load.image('B1', 'assets/tiles/button1.png')
    assets = {
        'G': Array.from(new Array(7), (v, i) => "G" + i),
        "W": ['W0'],
        'M': Array.from(new Array(4), (v, i) => "M" + i),
        'B0': ['B0'],
        'B1': ['B1']
    }

    //Add pilot assets
    for (var i = 0; i < 8; i++) this.load.image('pilot' + i, 'assets/entities/pilot' + i + '.png')
}

function create() {
    this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
    this.cursors = this.input.keyboard.createCursorKeys()

    var levelIndex = 2 // choose level here
    var level = ALL_LEVELS[levelIndex]
    this.add.text(10, 10, 'Level ' + levelIndex).setColor("0").setFontSize(50);

    this.world = new World(this, undefined)
    this.pilot = new Pilot(this, level.pilot.coords, level.pilot.dir)

    var pilot = this.pilot
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down',function(){pilot.interact()});
}

//Handle input
function update() {
    var dir = [0, 0]
    if (this.cursors.up.isDown) dir = addArray(dir, [-1, -1])
    if (this.cursors.down.isDown) dir = addArray(dir, [1, 1])
    if (this.cursors.right.isDown) dir = addArray(dir, [-1, 1])
    if (this.cursors.left.isDown) dir = addArray(dir, [1, -1])

    this.pilot.move(dir)
}

function addArray(a, b) { // quality magic tbh
    return a.map((e, i) => e + b[i]) //Magic, don't touch
}
