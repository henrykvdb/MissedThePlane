VOL_POS_X = 900 // Slider width in pixels
VOL_POS_Y = 500 // Slider width in pixels
VOL_THICKNESS = 20 // Slider width in pixels
VOL_LENGTH = 100 // Slider width in pixels
VOL_OFFSET = 45 // Slider width in pixels

class GameScene extends Phaser.Scene {

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.levelIndex = data.levelIndex
    }

    create() {
        //this.scene.stop('MenuScene');
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        this.cursors = this.input.keyboard.createCursorKeys()
        this.graphics = this.add.graphics();
        this.volumeSlider = []

        // Start music
        //this.music = this.sound.add('music', { loop: true })
        //this.music.play()

        // Next button
        var gameScene = this
        this.btnNext = this.add.sprite(900, 100, 'btn_next').setScale(0.25).setInteractive();
        this.btnNext.visible = false;
        this.btnNext.on('pointerdown', function (pointer) {
            gameScene.scene.restart({ levelIndex: ++gameScene.levelIndex })
        });

        // Restart button
        this.btnRestart = this.add.sprite(900, 100, 'btn_restart').setScale(0.5).setInteractive();
        this.btnRestart.on('pointerdown', function (pointer) {
            gameScene.scene.restart({ levelIndex: gameScene.levelIndex })
        });

        // Draw sound change bar
        gameScene.graphics.fillStyle(0x000000, 0.4);
        var sliderTop = VOL_POS_Y - VOL_LENGTH - VOL_OFFSET;
        gameScene.volumeSlider.push(gameScene.graphics.fillRect(VOL_POS_X - VOL_THICKNESS / 2, sliderTop, VOL_THICKNESS, VOL_LENGTH).setInteractive())
        gameScene.volumeSlider.push(gameScene.add.sprite(VOL_POS_X, sliderTop + VOL_LENGTH / 2, 'btn_volume_head'))
        gameScene.volumeSlider[0].visible = false
        gameScene.volumeSlider[1].setScale(2 * VOL_THICKNESS / 16).setInteractive({ draggable: true }).visible = false
        gameScene.volumeSlider[1].on('drag', function (pointer, dragX, dragY) {
            gameScene.volumeSlider[1].setPosition(gameScene.volumeSlider[1].x, Math.min(Math.max(dragY, VOL_POS_Y - VOL_LENGTH - VOL_OFFSET), VOL_POS_Y - VOL_OFFSET));
            var volume = 1 - (gameScene.volumeSlider[1].y - sliderTop) / VOL_LENGTH;
            console.log('volume: ', volume)
            //TODO actually update volume
        })

        // Sound change button
        this.btnVolume = this.add.sprite(VOL_POS_X, VOL_POS_Y, 'btn_volume').setScale(0.25).setInteractive();
        this.btnVolume.on('pointerdown', function (pointer) {
            if (gameScene.volumeSlider[0].visible || gameScene.volumeSlider[0].visible) {
                gameScene.volumeSlider[0].visible = false
                gameScene.volumeSlider[1].visible = false
            }
            else {
                gameScene.volumeSlider[0].visible = true
                gameScene.volumeSlider[1].visible = true
            }
        });

        // Level change button
        this.btnLevels = this.add.sprite(90, 90, 'btn_levels').setScale(0.25).setInteractive();
        this.btnLevels.on('pointerdown', function (pointer) {
            var nextLevelIndex = Math.floor(Math.random() * ALL_LEVELS.length) // Test your luck with random level selection
            gameScene.scene.restart({ levelIndex: nextLevelIndex }) //TODO ACTUAL LEVEL SELECT MENU
        });

        // Add level text
        if (this.levelIndex == 0) this.add.text(10, 10, 'Tutorial').setColor("0").setFontSize(50)
        else this.add.text(10, 10, 'Level ' + this.levelIndex + "/" + (ALL_LEVELS.length - 1)).setColor("0").setFontSize(50)

        // Create level
        var level = ALL_LEVELS[this.levelIndex]
        if (level.tiles == undefined) this.world = new World(this, undefined)
        else this.world = new World(this, level.tiles.map(row => row.slice()))
        this.pilot = new Pilot(this, level.pilot.coords.slice(), level.pilot.dir)
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
    }
}

function addArray(a, b) { // quality magic tbh
    return a.map((e, i) => e + b[i]) //Magic, don't touch
}
