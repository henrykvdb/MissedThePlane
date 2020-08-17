class LevelEditScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelEditScene' })
        this.START_LEVEL = oldLevelToString(ALL_LEVELS[7])
        this.drawerOpen = false
        this.shiftEnabled = false
    }

    init(data) {
        if (data.levelString != undefined) this.START_LEVEL = data.levelString
        if (data.drawerOpen != undefined) this.drawerOpen = data.drawerOpen
        if (data.shiftEnabled != undefined) this.shiftEnabled = data.shiftEnabled
    }

    create() {
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        this.world = new World(this, this.START_LEVEL)
        var scene = this

        // Close button
        this.btnRestart = this.add.sprite(getXY(0.04), getXY(0.04), 'btn_close').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnRestart.on('pointerdown', function (pointer) {
            LevelEditScene.scene.resume('GameScene');
            LevelEditScene.scene.stop()
        })

        // Increase size button
        this.btnSizeUp = this.add.sprite(SIZE_X - getXY(0.84), getXY(0.04), 'btn_size_0').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(106)
        this.btnSizeUp.on('pointerdown', function (pointer) {
            var tiles = scene.world.tiles
            tiles.forEach(col => col.push(TILES.GRASS))
            tiles.push(Array.from(Array(tiles.length + 1)).map(_ => TILES.GRASS))
            scene.world.tiles = tiles
            var levelString = scene.world.exportWorldAsString()
            scene.scene.restart({ levelString: levelString, drawerOpen: scene.drawerOpen, shiftEnabled: scene.shiftEnabled }) //TODO pilot + plane pos

        })

        // Decrease size button
        this.btnSizeDown = this.add.sprite(SIZE_X - getXY(0.68), getXY(0.04), 'btn_size_1').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(107);
        this.btnSizeDown.on('pointerdown', function (pointer) {
            var tiles = scene.world.tiles
            if (tiles.length <= 3) return // Below 3x3 is not useful and pretty ugly
            scene.world.tiles = tiles.slice(0, tiles.length - 1).map(col => col.slice(0, tiles.length - 1))
            var levelString = scene.world.exportWorldAsString()
            scene.scene.restart({ levelString: levelString, drawerOpen: scene.drawerOpen, shiftEnabled: scene.shiftEnabled }) //TODO pilot + plane pos
        })

        // Shift arrows
        var size = this.world.tiles.length
        var positions = [[-1.3, size / 2 - 0.5], [size / 2 - 0.5, size + 0.3], [size + 0.3, size / 2 - 0.5], [size / 2 - 0.5, - 1.3]]
        var shiftArrows = []
        for (let i = 0; i < 4; i++) {
            var scene = this
            var coords = getScreenCoords(this, positions[i][0], positions[i][1])
            var btnMove = this.add.sprite(coords[0], coords[1], 'btn_shift_' + i)
            btnMove.setOrigin(0.5, (800 - 284 - 85 * 2) / 800).setScale(this.tileScale).setInteractive({ pixelPerfect: true, }).setDepth(positions[i][0] + positions[i][1])
            btnMove.setTint("0xFFAA00").visible = this.shiftEnabled
            btnMove.on('pointerdown', function (pointer) {
                var tiles = scene.world.tiles
                if (i % 2 == 0) scene.world.tiles = tiles.concat(tiles.splice(0, i == 0 ? 1 : size - 1)) //shift X
                else scene.world.tiles = tiles.map(row => row.concat(row.splice(0, i == 3 ? 1 : size - 1))) //shift Y
                var levelString = scene.world.exportWorldAsString()
                scene.scene.restart({ levelString: levelString, drawerOpen: scene.drawerOpen, shiftEnabled: scene.shiftEnabled }) //TODO pilot + plane pos
            })
            shiftArrows.push(btnMove)
        }

        // Shift toggle button
        this.btnShift = this.add.sprite(SIZE_X - getXY(0.52), getXY(0.04), 'btn_removeads').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(108)
        if (scene.shiftEnabled) this.btnShift.setTint(Phaser.Display.Color.GetColor(255, 170, 0))
        else this.btnShift.setTint(Phaser.Display.Color.GetColor(255, 255, 255))
        this.btnShift.on('pointerdown', function (pointer) {
            scene.shiftEnabled = !scene.shiftEnabled
            shiftArrows.forEach(sprite => sprite.visible = scene.shiftEnabled)
            if (scene.shiftEnabled) scene.btnShift.setTint(Phaser.Display.Color.GetColor(255, 170, 0))
            else scene.btnShift.setTint(Phaser.Display.Color.GetColor(255, 255, 255))
        })

        // Rotate button
        var scene = this
        this.btnRotate = this.add.sprite(SIZE_X - getXY(0.36), getXY(0.04), 'btn_rotate').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(109)
        this.btnRotate.on('pointerdown', function (pointer) {
            scene.world.tiles = scene.world.tiles[0].map((_, index) => scene.world.tiles.map(row => row[index]).reverse())
            var levelString = scene.world.exportWorldAsString()
            scene.scene.restart({ levelString: levelString, drawerOpen: scene.drawerOpen, shiftEnabled: scene.shiftEnabled }) //TODO pilot + plane pos
        })

        // Open tools drawer
        var drawerSprites = [this.btnSizeUp, this.btnSizeDown, this.btnShift, this.btnRotate]
        var drawerSpritesX = drawerSprites.map(sprite => sprite.x)
        if (!this.drawerOpen) drawerSprites.forEach(sprite => sprite.x = SIZE_X - getXY(0.20))
        this.btnDrawer = this.add.sprite(SIZE_X - getXY(0.20), getXY(0.04), 'btn_removeads').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(110);
        this.btnDrawer.on('pointerdown', function (pointer) {
            scene.drawerOpen = !scene.drawerOpen

            drawerSprites.forEach(function (sprite, i) {
                // Open -> close
                if (scene.drawerOpen) scene.tweens.add({
                    targets: sprite,
                    x: drawerSpritesX[i],
                    duration: 100, delay: 0, completeDelay: 0, loopDelay: 0, repeatDelay: 0
                });
                // Close -> open
                else scene.tweens.add({
                    targets: sprite,
                    x: SIZE_X - getXY(0.20),
                    duration: 100, delay: 0, completeDelay: 0, loopDelay: 0, repeatDelay: 0
                });
            })
        })

        // Import level button
        this.btnLoad = this.add.sprite(SIZE_X - getXY(0.04), getXY(0.04), 'btn_removeads').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnLoad.on('pointerdown', function (pointer) {
            console.log("LOADING WORLD...")
            console.log("haha just kidding we can't do that yet ;)")
            console.log(scene.world.exportWorldAsString()) //TODO
        })

        // Export/Save current level button
        this.btnSave = this.add.sprite(SIZE_X - getXY(0.04), getXY(0.20), 'btn_save').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnSave.on('pointerdown', function (pointer) {
            console.log(scene.world.exportWorldAsString()) //TODO
        })

        // Run button
        this.btnRun = this.add.sprite(SIZE_X - getXY(0.04), SIZE_Y - getXY(0.20), 'btn_removeads').setOrigin(1, 1).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnRun.on('pointerdown', function (pointer) {
            console.log(scene.world.exportWorldAsString()) //TODO
        })

        //MAGIC TIME
        this.COUNT_DISPLAY = 5 //SHOULD BE UNEVEN TO HAVE PROPER CENTER
        this.COUNT_TOTAL = TILES_LEVEL_EDITOR.length
        this.DRAG_WEIGHT = SIZE_X / this.COUNT_DISPLAY // No idea what kind of units this is lol
        this.TILE_SCALE = 0.3 * MIN_XY / 600

        // Make tile sprites
        this.tileSprites = []
        const TILE_HEIGHT = SIZE_Y - getY(0.04)
        for (let i = 0; i < TILES_LEVEL_EDITOR.length; i++) {
            var tileSprite = this.add.sprite(0, TILE_HEIGHT, TILES_LEVEL_EDITOR[i].assets[0])
            tileSprite.setOrigin(0.5, (800 - 284) / 800)
            tileSprite.setDepth(200)
            tileSprite.setInteractive({ draggable: true, pixelPerfect: true })
            scene.tileSprites.push(tileSprite)
        }
        updateSprites(this, 0, 0)

        // Make scrollbar
        const SCROLLBAR_HEIGT =  TILE_HEIGHT - this.TILE_SCALE*200
        var scrollbar = this.add.tileSprite(0, SCROLLBAR_HEIGT, SIZE_X, SIZE_Y - SCROLLBAR_HEIGT, 'menu_invisible').setDepth(150)
        scrollbar.setScale(SIZE_X)
        scrollbar.setOrigin(0)
        scrollbar.setInteractive({ draggable: true })
        scrollbar.setAlpha(0.5)
        scrollbar.setTint(0,0,0)

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
            if (gameObject != scrollbar && Math.abs(distance) < scene.TILE_SCALE * 400) {
                console.log("tap")
                position = scene.tileSprites.indexOf(gameObject) - (scene.COUNT_DISPLAY - 1) / 2
                position = (position + scene.COUNT_TOTAL) % scene.COUNT_TOTAL
                updateSprites(scene, position, 100)
            }

            // User swiped to a tile
            else {
                console.log("swipe")
                position += distance / scene.DRAG_WEIGHT
                position = position + scene.COUNT_TOTAL
                position = Math.round(position) % scene.COUNT_TOTAL
                updateSprites(scene, position, 100)
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

            // Update sprite size
            const CENTER = (scene.COUNT_DISPLAY-1)/2
            var size = Math.max(1/(Math.abs(CENTER-localPos) + 1),0.7)
            sprite.setScale(scene.TILE_SCALE*size)

            // Move the sprite to the new position
            if (duration != 0 && Math.abs(newPos - sprite.x) < STEP * 2.5) {
                scene.tweens.add({
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
