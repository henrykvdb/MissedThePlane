var assets
var text

const SAVE_SLOTS = 10
const SELECT_MODES = {
    PLAY: "Play",
    EDIT: "Edit",
}

class LevelSelectScene extends Phaser.Scene {

    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    init(data) {
        if (data.levelString) this.levelString = data.levelString

        if (data.option) this.mode = data.option
        else throw "Level select called without a mode"

        if (this.mode == SELECT_MODES.PLAY) {
            this.LEVELS = ALL_LEVELS
        }
        else if (!getAndroid()) {
            this.LEVELS = USER_LEVELS // Default local levels
        }
        else {
            this.LEVELS = []
            for (let i = 0; i < SAVE_SLOTS; i++) {
                this.LEVELS.push(Android.getLocalLevel(i))
            }
        }

        const Y_START = 200 * MIN_XY / 600 //TODO figure out what to do with this stupid text and var
        text = this.add.text(SIZE_X / 2, Y_START / 3, this.mode + " a level", { fill: '#FFFFFF', fontSize: 40 * MIN_XY / 600, fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(100)
    }

    create() {
        const scene = this;
        this.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(0).setOrigin(0, 0).setTint("0xD0EEFF")

        // Close button
        this.btnMenu = scene.add.sprite(getXY(0.04), getXY(0.04), 'btn_back').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnMenu.on('pointerdown', function (pointer) {
            scene.scene.launch('MenuScene', { caller: scene.scene.key });
            scene.scene.pause()
        })

        // Confirm button
        this.btnConfirm = scene.add.sprite(SIZE_X - getXY(0.04), SIZE_Y - getXY(0.04), 'btn_select_' + this.mode).setOrigin(1, 1).setScale(0.45 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnConfirm.on('pointerdown', () => scene.handleInput())

        if (this.mode == SELECT_MODES.EDIT) {
            this.btnPublish = scene.add.sprite(getXY(0.04), SIZE_Y - getXY(0.17), 'btn_publish').setOrigin(0, 1).setScale(0.35 * MIN_XY / 600).setInteractive().setDepth(100)
            this.btnPublish.on('pointerdown', () => {
                var index = scene.position - scene.MIN_POS
                if (getAndroid() && Android.getSolvable(index)) Android.publishLevel(index, Android.getLocalLevel(index), "My public level") // TODO fix name input etc
                scene.redraw()
            })

            this.btnDelete = scene.add.sprite(getXY(0.04), SIZE_Y - getXY(0.04), 'btn_delete').setOrigin(0, 1).setScale(0.35 * MIN_XY / 600).setInteractive().setDepth(100)
            this.btnDelete.on('pointerdown', () => {
                var index = scene.position - scene.MIN_POS
                if (getAndroid()) {
                    Android.deleteLevel(index)
                    Android.setLocalLevel(index, DEFAULT_LEVEL)
                }
                scene.LEVELS[index] = DEFAULT_LEVEL
                scene.redraw()
            })
        }

        // Display constants
        this.COUNT_DISPLAY = 9 //SHOULD BE UNEVEN TO HAVE PROPER CENTER
        this.MIN_POS = (1 - this.COUNT_DISPLAY) / 2
        this.MAX_POS = this.MIN_POS + this.LEVELS.length - 1
        this.DRAG_WEIGHT = SIZE_X / this.COUNT_DISPLAY // No idea what kind of units this is lol
        this.LEVEL_BOX_SCALE = 0.1 * MIN_XY / 600 // Scale of the level select boxes
        this.LEVEL_BOX_HEIGHT = SIZE_Y / 2 // Height of the center of the level select boxes

        // Draw pointer arrows
        const CENTER_OFFSET = 400 * this.LEVEL_BOX_SCALE
        this.add.sprite(SIZE_X / 2, this.LEVEL_BOX_HEIGHT - CENTER_OFFSET, 'select_arrow').setOrigin(0.5, 1).setScale(this.LEVEL_BOX_SCALE).setDepth(100)
        this.add.sprite(SIZE_X / 2, this.LEVEL_BOX_HEIGHT + CENTER_OFFSET, 'select_arrow').setOrigin(0.5, 0).setScale(this.LEVEL_BOX_SCALE).setDepth(100).flipY = true

        // Init default state
        // TODO: if the user is saving, maybe it makes sense to let the select start on the current save slot
        this.position = this.MIN_POS
        this.lastPos = this.MIN_POS
        this.world = new World(this, this.LEVELS[0])

        // Make tile sprites
        this.levelSprites = Array(this.LEVELS.length)
        this.levelNumbers = Array(this.LEVELS.length)
        this.redraw()

        // Make scrollbar
        var scrollbar = this.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(50).setInteractive({ draggable: true })
        scrollbar.setScale(SIZE_X).setOrigin(0).setTint(0, 0, 0).setAlpha(0.2)

        // User is dragging - update positions
        this.input.on('drag', function (pointer, gameObject, dragX) {
            // Calculate the relative drag position
            var relativePos
            if (gameObject == scrollbar) relativePos = -dragX
            else relativePos = pointer.downX - dragX

            // Calculate the absolute position
            var absolutePos = scene.position + relativePos / scene.DRAG_WEIGHT
            absolutePos = Math.min(Math.max(absolutePos, scene.MIN_POS), scene.MAX_POS)
            scene.updateSprites(absolutePos, 0)
        })

        // User stops dragging - snap to discrete position
        this.input.on('dragend', function (pointer, gameObject) {
            var distance = pointer.downX - pointer.upX

            // User tapped a tile
            if (gameObject != scrollbar && Math.abs(distance) < scene.LEVEL_BOX_SCALE * 400) {
                console.log("tap")
                scene.position = scene.levelSprites.indexOf(gameObject) + scene.MIN_POS
                scene.updateSprites(scene.position, 50)
            }

            // User swiped to a tile
            else {
                console.log("swipe")
                scene.position += distance / scene.DRAG_WEIGHT
                scene.position = Math.min(Math.max(Math.round(scene.position), scene.MIN_POS), scene.MAX_POS)
                scene.updateSprites(scene.position, 50)
            }
        })
    }

    redraw() {
        this.updateSprites(this.position, 0, true)
    }

    handleInput() {
        var index = this.position - this.MIN_POS

        if (this.mode == SELECT_MODES.PLAY) {
            this.scene.start('GameScene', { levelIndex: index })
            this.scene.stop()
        }
        else if (this.mode == SELECT_MODES.EDIT) {
            this.scene.start('EditorScene', {
                state: {
                    drawerOpen: false, shiftEnabled: false,
                    position: 0, relativePos: 0,
                    levelIndex: index,
                    levelString: this.LEVELS[index]
                }
            });
            this.scene.stop()
        }
    }

    createSprite(index, posX) {
        // Create border
        var asset = 'btn_level_' + JSON.parse(this.LEVELS[index]).difficulty
        this.levelSprites[index] = this.add.sprite(posX, this.LEVEL_BOX_HEIGHT, asset).setScale(this.LEVEL_BOX_SCALE).setDepth(100).setInteractive({ draggable: true })

        // Create tile text
        var text = (index == 0 && this.mode == SELECT_MODES.PLAY) ? "" : index
        this.levelNumbers[index] = this.add.text(posX, this.LEVEL_BOX_HEIGHT, text, { fill: '#FFFFFF', fontSize: 50 * MIN_XY / 600, fontStyle: 'bold' }).setDepth(101).setOrigin(0.5, 0.5)
    }

    updateSprites(position, duration, forceReload) {
        var snappedPos = Math.min(Math.max(Math.round(position), this.MIN_POS), this.MAX_POS)
        if (snappedPos != this.lastPos || forceReload) {
            this.lastPos = snappedPos

            // Destroy the world and kill its children ;)
            if (this.world != undefined) {
                this.world.destroy()
                this.world = undefined
            }

            // Create new world
            this.world = new World(this, this.LEVELS[snappedPos - this.MIN_POS])
        }

        // Itterate over all sprites
        for (let i = 0; i < this.LEVELS.length; i++) {

            var sprite = this.levelSprites[i]
            var number = this.levelNumbers[i]

            // Sprite in viewbox
            if (position <= i && i <= position + this.COUNT_DISPLAY - 1) {

                // Calculate next position
                const STEP = SIZE_X / (this.COUNT_DISPLAY - 1)
                var localPos = (i + 1 > position) ? (i - position) : (TILES_LEVEL_EDITOR.length + i - position)
                var newPos = localPos * STEP

                if (sprite) {
                    // Set visible
                    sprite.visible = true
                    number.visible = true

                    // Move the sprite to the new position
                    if (duration != 0 && Math.abs(newPos - sprite.x) < STEP * 2.5) {
                        this.tweens.add({
                            targets: number,
                            x: newPos,
                            duration: duration, delay: 0, completeDelay: 0, loopDelay: 0, repeatDelay: 0
                        });
                        this.tweens.add({
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
                    // Create sprite
                    this.createSprite(i, newPos)
                }
            }
            // Sprite not in viewbox
            else if (sprite) {
                sprite.visible = false
                number.visible = false
            }
        }
    }
}
