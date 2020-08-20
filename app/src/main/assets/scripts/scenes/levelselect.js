var assets
var text

const SELECT_MODES = {
    OPEN: "Open a level",
    EDIT: "Edit a level",
    SAVE: "Save a level"
}

class LevelSelectScene extends Phaser.Scene {

    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    init(data) {
        if (data.levelString) this.levelString = data.levelString

        if (data.option) this.mode = data.option
        else throw "Level select called without a mode"

        this.LEVELS = this.mode == SELECT_MODES.OPEN ? ALL_LEVELS : USER_LEVELS

        const Y_START = 200 * MIN_XY / 600 //TODO figure out what to do with this stupid text and var
        text = this.add.text(SIZE_X / 2, Y_START / 3, this.mode, { fill: '#000000', fontSize: 40 * MIN_XY / 600, fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(100)
    }

    preload() { }

    create() {
        const Y_START = 200 * MIN_XY / 600 //TODO figure out what to do with this stupid text and var

        const scene = this;
        var background = this.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(0).setOrigin(0, 0).setTint("0xD0EEFF")

        // Close button
        this.btnMenu = scene.add.sprite(getXY(0.04), getXY(0.04), 'btn_back').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        if (this.mode != SELECT_MODES.SAVE) {
            this.btnMenu.on('pointerdown', function (pointer) {
                scene.scene.launch('MenuScene', { caller: scene.scene.key });
                scene.scene.pause()
            })
        } else {
            this.btnInteract.on('pointerdown', function (pointer) {
                scene.scene.stop()
                scene.scene.wake('LevelEditScene')
            })
        }

        //MAGIC TIME
        this.COUNT_DISPLAY = 9 //SHOULD BE UNEVEN TO HAVE PROPER CENTER
        this.MIN_POS = (1 - this.COUNT_DISPLAY) / 2
        this.MAX_POS = this.MIN_POS + this.LEVELS.length - 1
        this.DRAG_WEIGHT = SIZE_X / this.COUNT_DISPLAY // No idea what kind of units this is lol
        this.TILE_SCALE = 0.1 * MIN_XY / 600


        this.position = this.MIN_POS
        this.lastPos = this.MIN_POS
        this.world = new World(this, this.LEVELS[0])

        // Make tile sprites
        this.levelSprites = []
        this.levelNumbers = []
        const SPRITE_HEIGHT = SIZE_Y / 2
        for (let i = 0; i < this.LEVELS.length; i++) {
            // Create tile
            var asset = 'btn_level_' + JSON.parse(this.LEVELS[i]).difficulty
            var tileSprite = this.add.sprite(0, SPRITE_HEIGHT, asset)
            tileSprite.setScale(this.TILE_SCALE)
            tileSprite.setDepth(100)
            tileSprite.setInteractive({ draggable: true })

            //Create tile text
            var text = (i == 0 && this.mode == SELECT_MODES.LOAD) ? "" : i
            var tileNumber = scene.add.text(0, SPRITE_HEIGHT, text, { fill: '#000000', fontSize: 50 * MIN_XY / 600, fontStyle: 'bold' })
            tileNumber.setDepth(101).setOrigin(0.5, 0.5)

            this.levelSprites.push(tileSprite)
            this.levelNumbers.push(tileNumber)
        }
        updateSprites2(this, this.position, 0)

        // Make scrollbar
        var scrollbar = this.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(50)
        scrollbar.setScale(SIZE_X).setOrigin(0)
        scrollbar.setTint(0, 0, 0).setAlpha(0.2)
        scrollbar.setInteractive({ draggable: true })

        // User is dragging - update positions
        this.input.on('drag', function (pointer, gameObject, dragX) {
            // Calculate the relative drag position
            var relativePos
            if (gameObject == scrollbar) relativePos = -dragX
            else relativePos = pointer.downX - dragX

            // Calculate the absolute position
            var absolutePos = scene.position + relativePos / scene.DRAG_WEIGHT
            absolutePos = Math.min(Math.max(absolutePos, scene.MIN_POS), scene.MAX_POS)
            updateSprites2(scene, absolutePos, 0)
        })

        // User stops dragging - snap to discrete position
        this.input.on('dragend', function (pointer, gameObject) {
            var distance = pointer.downX - pointer.upX

            // User tapped a tile
            if (gameObject != scrollbar && Math.abs(distance) < scene.TILE_SCALE * 400) {
                console.log("tap")
                // Trigger action if tap on current tile
                var newPos = scene.levelSprites.indexOf(gameObject) + scene.MIN_POS
                if (newPos == scene.position) scene.handleInput()
                else scene.position = newPos

                updateSprites2(scene, scene.position, 50)
            }

            // User swiped to a tile
            else {
                console.log("swipe")
                scene.position += distance / scene.DRAG_WEIGHT
                scene.position = Math.min(Math.max(Math.round(scene.position), scene.MIN_POS), scene.MAX_POS)
                updateSprites2(scene, scene.position, 50)
            }
        })
    }

    handleInput() {
        var index = this.position - this.MIN_POS

        if (this.mode == SELECT_MODES.OPEN) {
            Android.deleteLevel('bestAccountAround', index)
            this.scene.start('GameScene', { levelIndex: index })
            this.scene.stop()
        }
        else if (this.mode == SELECT_MODES.EDIT) {
            this.scene.start('LevelEditScene', {
                state: {
                    drawerOpen: false, shiftEnabled: false,
                    position: 0, relativePos: 0,
                    levelString: this.LEVELS[index]
                }
            });
            this.scene.stop()
        }
        else if (this.mode == SELECT_MODES.SAVE) {
            this.LEVELS[index] = this.levelString
            this.forceReload = true
            updateSprites2(this, this.position, 0)
        }
    }
}

function updateSprites2(scene, position, duration) { //TODO move in class
    var snappedPos = Math.min(Math.max(Math.round(position), scene.MIN_POS), scene.MAX_POS)
    if (snappedPos != scene.lastPos || scene.forceReload) {
        scene.forceReload = false
        scene.lastPos = snappedPos

        // Destroy the world and kill its children ;)
        if (scene.world != undefined) {
            scene.world.destroy()
            scene.world = undefined
        }

        // Create new world
        scene.world = new World(scene, scene.LEVELS[snappedPos - scene.MIN_POS])
    }

    for (let i = 0; i < scene.LEVELS.length; i++) {
        var sprite = scene.levelSprites[i]
        var number = scene.levelNumbers[i]

        if (position <= i && i <= position + scene.COUNT_DISPLAY - 1) {
            // Set visible
            sprite.visible = true
            number.visible = true

            // Calculate next position
            const STEP = SIZE_X / (scene.COUNT_DISPLAY - 1)
            var localPos = (i + 1 > position) ? (i - position) : (TILES_LEVEL_EDITOR.length + i - position)
            var newPos = localPos * STEP

            // Move the sprite to the new position
            if (duration != 0 && Math.abs(newPos - sprite.x) < STEP * 2.5) {
                scene.tweens.add({
                    targets: number,
                    x: newPos,
                    duration: duration, delay: 0, completeDelay: 0, loopDelay: 0, repeatDelay: 0
                });
                scene.tweens.add({
                    targets: sprite,
                    x: newPos,
                    duration: duration, delay: 0, completeDelay: 0, loopDelay: 0, repeatDelay: 0
                });
            }
            else {
                sprite.x = newPos
                number.x = newPos
            }
        }
        else {
            sprite.visible = false
            number.visible = false
        }
    }
}
