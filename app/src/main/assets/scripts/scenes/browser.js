class BrowserScene extends Phaser.Scene {

    constructor() {
        super({ key: 'BrowserScene' });
    }

    init(data) {
        this.LEVELS = ALL_LEVELS
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

        // Display constants
        this.COUNT_DISPLAY = 7 //SHOULD BE UNEVEN TO HAVE PROPER CENTER
        this.MIN_POS = (1 - this.COUNT_DISPLAY) / 2
        this.MAX_POS = this.MIN_POS + this.LEVELS.length - 1
        this.DRAG_WEIGHT = SIZE_X / this.COUNT_DISPLAY // No idea what kind of units this is lol
        this.LEVEL_BOX_SCALE = 0.1 * MIN_XY / 600 // Scale of the level select boxes
        this.LEVEL_BOX_HEIGHT = SIZE_Y / 2 // Height of the center of the level select boxes

        // Draw pointer arrows
        const CENTER_OFFSET = 400 * this.LEVEL_BOX_SCALE
        //this.add.sprite(SIZE_X / 2, this.LEVEL_BOX_HEIGHT - CENTER_OFFSET, 'select_arrow').setOrigin(0.5, 1).setScale(this.LEVEL_BOX_SCALE).setDepth(100)
        //this.add.sprite(SIZE_X / 2, this.LEVEL_BOX_HEIGHT + CENTER_OFFSET, 'select_arrow').setOrigin(0.5, 0).setScale(this.LEVEL_BOX_SCALE).setDepth(100).flipY = true

        // Init default state
        this.position = this.MIN_POS
        this.lastPos = this.MIN_POS
        this.world = new World(this, this.LEVELS[0])

        // Make tile sprites
        this.levelSprites = Array(this.LEVELS.length)
        this.updateSprites(this.position, 0)

        // Make scrollbar
        var scrollbar = this.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(50).setInteractive({ draggable: true })
        scrollbar.setScale(SIZE_X).setOrigin(0).setTint(0, 0, 0).setAlpha(0.2)

        // User is dragging - update positions
        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            // Calculate the relative drag position
            var relativePos
            if (gameObject == scrollbar) relativePos = -dragY
            else relativePos = pointer.downY - dragY

            // Calculate the absolute position
            var absolutePos = scene.position + relativePos / scene.DRAG_WEIGHT
            absolutePos = Math.min(Math.max(absolutePos, scene.MIN_POS), scene.MAX_POS)
            scene.updateSprites(absolutePos, 0)
        })

        // User stops dragging - snap to discrete position
        this.input.on('dragend', function (pointer, gameObject) {
            var distance = pointer.downY - pointer.upY

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

    handleInput() {
        var index = this.position - this.MIN_POS
        console.log("input given: ", i)
    }

    createSprite(index, posY) {
        // Create border
        var asset = 'btn_level_' + JSON.parse(this.LEVELS[index]).difficulty
        this.levelSprites[index] = this.add.sprite(SIZE_X/2, posY, asset).setScale(this.LEVEL_BOX_SCALE).setDepth(100).setInteractive({ draggable: true })
    }

    updateSprites(position, duration) {
        var snappedPos = Math.min(Math.max(Math.round(position), this.MIN_POS), this.MAX_POS)
        if (snappedPos != this.lastPos || this.forceReload) {
            this.forceReload = false
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

            // Sprite in viewbox
            if (position <= i && i <= position + this.COUNT_DISPLAY - 1) {

                // Calculate next position
                const STEP = SIZE_Y / (this.COUNT_DISPLAY - 1)
                var localPos = (i + 1 > position) ? (i - position) : (TILES_LEVEL_EDITOR.length + i - position)
                var newPos = localPos * STEP

                if (sprite) {
                    // Set visible
                    sprite.visible = true

                    // Move the sprite to the new position
                    if (duration != 0 && Math.abs(newPos - sprite.y) < STEP * 2.5) {
                        this.tweens.add({
                            targets: sprite,
                            y: newPos,
                            duration: duration, delay: 0, completeDelay: 0, loopDelay: 0, repeatDelay: 0
                        });
                    }
                    else {
                        sprite.y = newPos
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
            }
        }
    }
}
