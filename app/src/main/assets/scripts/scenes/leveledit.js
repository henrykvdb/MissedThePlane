class LevelEditScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelEditScene' })
        this.START_LEVEL = oldLevelToString(ALL_LEVELS[7])
    }

    init(data) {
        if (data.start_level != undefined) this.START_LEVEL = data.start_level
    }

    create() {
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        this.world = new World(this, this.START_LEVEL)

        // Rotate
        var scene = this
        this.btnRotate = this.add.sprite(getXY(0.04), getXY(0.04), 'btn_rotate').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnRotate.on('pointerdown', function (pointer) {
            scene.world.tiles = scene.world.tiles[0].map((_, index) => scene.world.tiles.map(row => row[index]).reverse())
            var newString = scene.world.exportWorldAsString()
            scene.scene.restart({ start_level: newString })
        })

        // Shift arrows
        var size = this.world.tiles.length
        var positions = [[-1.3, size / 2 - 0.5], [size / 2 - 0.5, size + 0.3], [size + 0.3, size / 2 - 0.5], [size / 2 - 0.5, - 1.3]]
        for (let i = 0; i < 4; i++) {
            var scene = this
            var coords = getScreenCoords(this, positions[i][0], positions[i][1])
            var btnMove = this.add.sprite(coords[0], coords[1], 'btn_shift_'+i)
            btnMove.setOrigin(0.5, (800 - 284 - 85 * 2) / 800).setScale(this.tileScale).setInteractive({pixelPerfect: true, }).setDepth(positions[i][0] + positions[i][1]).setTint("0xFFAA00")
            btnMove.on('pointerdown', function (pointer) {
                var tiles = scene.world.tiles
                if (i % 2 == 0) tiles = tiles.concat(tiles.splice(0, i == 0 ? 1 : size - 1)) //shift X
                else tiles = tiles.map(row => row.concat(row.splice(0, i == 3 ? 1 : size - 1))) //shift Y
                scene.scene.restart({ tiles })
            })
        }

        // Close button //TODO readd
        /*this.btnRestart = this.add.sprite(SIZE_X - 10*getXY(0.04), getXY(0.04), 'btn_close').setOrigin(1, 0).setScale(0.20 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnRestart.on('pointerdown', function (pointer) {
            LevelEditScene.scene.resume('GameScene');
            LevelEditScene.scene.stop()
        })*/

        // Export current level
        this.btnSave = this.add.sprite(SIZE_X - 5*getXY(0.04), getXY(0.04), 'btn_save').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnSave.on('pointerdown', function (pointer) {
            console.log(scene.world.exportWorldAsString())
        })

        // Increase size
        this.btnSizeUp = this.add.sprite(SIZE_X - getXY(0.04), getXY(0.04), 'btn_size_0').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnSizeUp.on('pointerdown', function (pointer) {
            var tiles = scene.world.tiles
            tiles.forEach(col => col.push(TILES.GRASS))
            tiles.push(Array.from(Array(tiles.length + 1)).map(_ => TILES.GRASS))
            scene.scene.restart({ tiles })

        })

        // Decrease size
        this.btnSizeDown = this.add.sprite(SIZE_X - getXY(0.04), getXY(0.185), 'btn_size_1').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnSizeDown.on('pointerdown', function (pointer) {
            var tiles = scene.world.tiles
            if (tiles.length <= 3) return // Below 3x3 is not useful and pretty ugly
            tiles = tiles.slice(0, tiles.length - 1).map(col => col.slice(0, tiles.length - 1))
            scene.scene.restart({ tiles })
        })

        //MAGIC TIME
        this.COUNT_DISPLAY = 5 //SHOULD BE UNEVEN TO HAVE PROPER CENTER
        this.COUNT_TOTAL = TILES_LEVEL_EDITOR.length
        this.TOPHEIGT = SIZE_Y - getY(0.14)
        this.DRAG_WEIGHT = SIZE_X / this.COUNT_DISPLAY // No idea what kind of units this is lol
        this.TILE_SCALE = 0.25 * MIN_XY / 600

        // Make tile sprites
        this.tileSprites = []
        this.tweenArray = Array.from(Array(this.COUNT_TOTAL))
        for (let i = 0; i < TILES_LEVEL_EDITOR.length; i++) {
            var tileSprite = this.add.sprite(0, this.TOPHEIGT, TILES_LEVEL_EDITOR[i].assets[0])
            tileSprite.setOrigin(0.5, (800 - 284 - 85 * 2) / 800)
            tileSprite.setScale(this.TILE_SCALE)
            tileSprite.setDepth(200)
            tileSprite.setInteractive({ draggable: true, pixelPerfect: true})
            scene.tileSprites.push(tileSprite)
        }
        updateSprites(this, 0, 0)

        // Make scrollbar
        var scrollbar = this.add.tileSprite(0, this.TOPHEIGT, SIZE_X, 50, 'menu_invisible').setDepth(150)
        scrollbar.setScale(SIZE_X)
        scrollbar.setOrigin(0)
        scrollbar.setInteractive({ draggable: true })

        // User is dragging - update positions
        var position = 0
        this.input.on('drag', function (pointer, gameObject, dragX) {
            // Calculate the relative drag position
            var relativePos
            if (gameObject == scrollbar) relativePos = -dragX
            else relativePos = pointer.downX - dragX

            // Calculate the absolute position
            var absolutePos = position + relativePos / scene.DRAG_WEIGHT
            absolutePos = (absolutePos + scene.COUNT_TOTAL) % scene.COUNT_TOTAL
            updateSprites(scene, absolutePos, 0)
        })

        // User stops dragging - snap to discrete position
        this.input.on('dragend', function (pointer, gameObject) {
            var distance = pointer.downX - pointer.upX

            // User tapped a tile
            if (Math.abs(distance) < scene.TILE_SCALE * 400) {
                position = scene.tileSprites.indexOf(gameObject) - (scene.COUNT_DISPLAY - 1) / 2
                position = (position + scene.COUNT_TOTAL) % scene.COUNT_TOTAL
                updateSprites(scene, position, 100)
            }

            // User swiped to a tile
            else {
                console.log(distance)
                position += distance / scene.DRAG_WEIGHT
                position = position + scene.COUNT_TOTAL
                position = Math.round(position) % scene.COUNT_TOTAL
                updateSprites(scene, position, 250)
            }
        })
    }

    update(_, dt) {
    }
}

function updateSprites(scene, position, duration) {
    for (let i = 0; i < TILES_LEVEL_EDITOR.length; i++) {
        var sprite = scene.tileSprites[i]

        function inCirclarBounds(start, length, variable) {
            if (variable < start) variable += scene.COUNT_TOTAL
            return variable <= start + length
        }

        if (inCirclarBounds(Math.floor(position), scene.COUNT_DISPLAY + 1, i)) {
            // Set visible and calculate next position
            sprite.visible = true
            const STEP = SIZE_X / (scene.COUNT_DISPLAY - 1)
            var localPos = (i + 1 > position) ? (i - position) : (scene.COUNT_TOTAL + i - position)
            var newPos = localPos * STEP

            //Move the sprite to the new position
            if (duration != 0 && Math.abs(newPos-sprite.x)<STEP*2.5) {
                scene.tweenArray[i] = scene.tweens.add({
                    targets: sprite,
                    x: newPos,
                    duration: duration, delay: 0, completeDelay: 0, loopDelay: 0, repeatDelay: 0
                });
            }
            else sprite.x = newPos
        }
        else sprite.visible = false
    }
}
