var audio
class LoadingScene extends Phaser.Scene {

    constructor() {
        super({ key: 'LoadingScene' })
    }

    preload() {
        //Draw loading scene
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#59AACA")
        this.splash = this.add.sprite(SIZE_X / 2, SIZE_Y / 2, 'splash').setScale(MIN_XY / 800).setDepth(100)

        if (getAndroid()) Android.getNewUserIdIfNeeded() // Every time we launch, we check if we have no id so we can create one if this is first time launch

        // Load fonts
        this.load.bitmapFont('voxel_font', 'assets/voxel_font.png', 'assets/voxel_font.fnt')

        // Load spritemaps assets
        this.load.multiatlas('entities', 'assets/entities.json', 'assets')
        this.load.multiatlas('menu', 'assets/menu.json', 'assets')
        this.load.multiatlas('tiles', 'assets/tiles.json', 'assets')
        this.load.multiatlas('tutorial', 'assets/tutorial.json', 'assets')

        // Load audio
        this.load.audio('music', ['assets/audio/music.ogg'])
        this.load.audio('levelFailed', ['assets/audio/levelFailed.ogg'])
        this.load.audio('levelWon', ['assets/audio/levelWon.ogg'])
        this.load.audio('buttonUp', ['assets/audio/buttonUp.ogg'])
        this.load.audio('buttonDown', ['assets/audio/buttonDown.ogg'])
        this.load.audio('buttonBlocked', ['assets/audio/buttonBlocked.ogg'])
    }

    create() {
        audio = new Audio(this)
        this.scene.start('MenuScene')
    }
}

function getX(ratioX) {
    return SIZE_X * ratioX
}

function getY(ratioY) {
    return SIZE_Y * ratioY
}

function getXY(ratio) {
    return MIN_XY * ratio
}

// Function to avoid ugly reference errors
function getAndroid() {
    if (typeof Android === "undefined") return undefined
    else return Android
}

function pauseSound() {
    if (audio && audio.music) audio.music.pause()
}

function resumeSound() {
    if (audio && audio.music) audio.music.resume()
}
