var assets
var text

class LevelSelectScene extends Phaser.Scene {

    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    preload() { }

    create() {
        const Y_START = 200 * MIN_XY / 600

        const selectScene = this;
        this.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(0).setOrigin(0, 0).setTint("0xD0EEFF")
        text = this.add.text(SIZE_X / 2, Y_START / 3, 'Select a level to play', { fill: '#000000', fontSize: 40 * MIN_XY / 600, fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(100)

        // Close button
        this.btnMenu = selectScene.add.sprite(getXY(0.04), getXY(0.04), 'btn_menu').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(200)
        this.btnMenu.on('pointerdown', function (pointer) {
            selectScene.scene.launch('MenuScene', { caller: selectScene.scene.key })
            selectScene.scene.pause() //TODO PAUSE INSTEAD OF STOP?
        })

        //MAGIC TIME
        this.COUNT_DISPLAY = 9 //SHOULD BE UNEVEN TO HAVE PROPER CENTER
        this.MIN_POS = (1 - this.COUNT_DISPLAY) / 2
        this.MAX_POS = this.MIN_POS + ALL_LEVELS.length - 1
        this.DRAG_WEIGHT = SIZE_X / this.COUNT_DISPLAY // No idea what kind of units this is lol
        this.TILE_SCALE = 0.1 * MIN_XY / 600


        this.position = this.MIN_POS
        this.lastPos = this.MIN_POS
        const scene = this
        this.world = new World(this, ALL_LEVELS[0])

        // Make tile sprites
        this.levelSprites = []
        this.levelNumbers = []
        const SPRITE_HEIGHT = SIZE_Y / 2
        for (let i = 0; i < ALL_LEVELS.length; i++) {
            // Create tile
            var asset = 'btn_level_' + JSON.parse(ALL_LEVELS[i]).difficulty
            var tileSprite = this.add.sprite(0, SPRITE_HEIGHT, asset)
            tileSprite.setScale(this.TILE_SCALE)
            tileSprite.setDepth(200)
            tileSprite.setInteractive({ draggable: true })

            //Create tile text
            var tileNumber = selectScene.add.text(0, SPRITE_HEIGHT, i == 0 ? "" : i, { fill: '#000000', fontSize: 50 * MIN_XY / 600, fontStyle: 'bold' })
            tileNumber.setDepth(201).setOrigin(0.5, 0.5)

            this.levelSprites.push(tileSprite)
            this.levelNumbers.push(tileNumber)
        }
        updateSprites2(this, this.position, 0)

        // Make scrollbar
        var scrollbar = this.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(150)
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
                var newPos = scene.levelSprites.indexOf(gameObject) + scene.MIN_POS
                if (newPos == scene.position) {
                    scene.scene.start('GameScene', { levelIndex: newPos - scene.MIN_POS});
                    scene.scene.stop()
                }
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
}

function updateSprites2(scene, position, duration) { //TODO move in class
    var snappedPos = Math.min(Math.max(Math.round(position), scene.MIN_POS), scene.MAX_POS)
    if (snappedPos != scene.lastPos) {
        scene.lastPos = snappedPos

        // Destroy the world and kill its children ;)
        if (scene.world != undefined) {
            scene.world.destroy()
            scene.world = undefined
        }

        // Create new world
        scene.world = new World(scene, ALL_LEVELS[snappedPos - scene.MIN_POS])
    }

    for (let i = 0; i < ALL_LEVELS.length; i++) {
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
