class LevelEditScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelEditScene' })
        this.state = {
            drawerOpen: false,
            shiftEnabled: false,
            position: 0,
            relativePos: 0,
            levelString: ALL_LEVELS[1]
            // We could instantiate seed here if we didn't already get a random from oldLevelToString
        }
    }

    init(data) {
        if (data.state != undefined) Object.keys(data.state).forEach(name => this.state[name] = data.state[name])
    }

    create() {
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        this.state.seed = JSON.parse(this.state.levelString).seed // Copy over the seed of the world if it is present
        this.world = new World(this, this.state.levelString)
        const scene = this
        const BUTTON_GAP = 0.2
        const MARGIN_X = 0.04 //TODO INLINE AND MAKE GLOBAL VARIABLE

        // Menu button
        this.btnMenu = this.add.sprite(getXY(0.04), getXY(MARGIN_X), 'btn_menu').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnMenu.on('pointerdown', function (pointer) {
            scene.scene.launch('MenuScene', {caller: scene.scene.key})
            scene.scene.pause();
        })

        // Increase size button
        this.btnSizeUp = this.add.sprite(SIZE_X - getXY(MARGIN_X) - 4 * getXY(BUTTON_GAP), getXY(0.04), 'btn_plus').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(106)
        this.btnSizeUp.on('pointerdown', function (pointer) {
            var tiles = scene.world.tiles
            tiles.forEach(col => col.push(TILES.GRASS))
            tiles.push(Array.from(Array(tiles.length + 1)).map(_ => TILES.GRASS))
            scene.world.tiles = tiles
            scene.state.levelString = scene.world.exportWorldAsString(scene.state.seed)
            scene.scene.restart(scene.state)
        })

        // Decrease size button
        this.btnSizeDown = this.add.sprite(SIZE_X - getXY(MARGIN_X) - 3 * getXY(BUTTON_GAP), getXY(0.04), 'btn_minus').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(107);
        this.btnSizeDown.on('pointerdown', function (pointer) {
            var tiles = scene.world.tiles
            if (tiles.length <= 4) return // Below 4x4 is not useful and pretty ugly
            scene.world.tiles = tiles.slice(0, tiles.length - 1).map(col => col.slice(0, tiles.length - 1))
            if (scene.world.getTile(scene.pilot.coords) == TILES.AIR) { // Pilot has gotten out of the map
                var pos = scene.pilot.coords
                if (pos[0] == pos[1])    scene.pilot.coords = [pos[0] - 1, pos[1] - 1] // He was on the edge, we move him 1 x and 1 y up
                else if (pos[0] > pos[1]) scene.pilot.coords = [pos[0] - 1, pos[1]]
                else if (pos[0] < pos[1]) scene.pilot.coords = [pos[0], pos[1] - 1]
            }
            var planePos = scene.plane.coords // check if plane is more than 1 tile away from the main land
            if (planePos[0] > scene.world.tiles.length + 1 || planePos[1] > scene.world.tiles.length + 1) {
                if (planePos[0] == planePos[1])     scene.plane.coords = [planePos[0] - 1, planePos[1] - 1] // He was on the edge, we move him 1 x and 1 y up
                else if (planePos[0] > planePos[1]) scene.plane.coords = [planePos[0] - 1, planePos[1]]
                else if (planePos[0] < planePos[1]) scene.plane.coords = [planePos[0], planePos[1] - 1]
            }
            scene.state.levelString = scene.world.exportWorldAsString(scene.state.seed)
            scene.scene.restart(scene.state)
        })

        // Shift arrows
        var size = this.world.tiles.length
        var positions = [[-1.3, size / 2 - 0.5], [size / 2 - 0.5, size + 0.3], [size + 0.3, size / 2 - 0.5], [size / 2 - 0.5, - 1.3]]
        var shiftArrows = []
        for (let i = 0; i < 4; i++) {
            var coords = getScreenCoords(this, positions[i][0], positions[i][1])
            var btnMove = this.add.sprite(coords[0], coords[1], 'btn_shift_' + i)
            btnMove.setOrigin(0.5, (800 - 284 - 85 * 2) / 800).setScale(this.tileScale).setInteractive({ pixelPerfect: true}).setDepth(positions[i][0] + positions[i][1])
            btnMove.setTint("0xFFAA00").visible = this.state.shiftEnabled
            btnMove.on('pointerdown', function (pointer) {
                var tiles = scene.world.tiles
                if (i % 2 == 0) scene.world.tiles = tiles.concat(tiles.splice(0, i == 0 ? 1 : size - 1)) //shift X
                else scene.world.tiles = tiles.map(row => row.concat(row.splice(0, i == 3 ? 1 : size - 1))) //shift Y
                scene.pilot.coords = [(scene.pilot.coords[0] + scene.world.tiles.length + (i % 2 == 0 ? (i == 0 ? -1 : 1) : 0)) % scene.world.tiles.length, 
                                      (scene.pilot.coords[1] + scene.world.tiles.length + (i % 2 != 0 ? (i == 3 ? -1 : 1) : 0)) % scene.world.tiles.length]
                scene.state.levelString = scene.world.exportWorldAsString(scene.state.seed)
                scene.scene.restart(scene.state)
            })
            shiftArrows.push(btnMove)
        }

        // Shift toggle button
        this.btnShift = this.add.sprite(SIZE_X - getXY(MARGIN_X) - 2 * getXY(BUTTON_GAP), getXY(0.04), 'btn_shift_toggle').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(108)
        if (scene.state.shiftEnabled) this.btnShift.setTint(Phaser.Display.Color.GetColor(255, 170, 0))
        else this.btnShift.setTint(Phaser.Display.Color.GetColor(255, 255, 255))
        this.btnShift.on('pointerdown', function (pointer) {
            scene.state.shiftEnabled = !scene.state.shiftEnabled
            shiftArrows.forEach(sprite => sprite.visible = scene.state.shiftEnabled)
            if (scene.state.shiftEnabled) scene.btnShift.setTint(Phaser.Display.Color.GetColor(255, 170, 0))
            else scene.btnShift.setTint(Phaser.Display.Color.GetColor(255, 255, 255))
        })

        // Rotate button
        this.btnRotate = this.add.sprite(SIZE_X - getXY(MARGIN_X) - 1 * getXY(BUTTON_GAP), getXY(0.04), 'btn_rotate').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(109)
        this.btnRotate.on('pointerdown', function (pointer) {
            scene.world.tiles = scene.world.tiles[0].map((_, index) => scene.world.tiles.map(row => row[index]).reverse())
            scene.pilot.coords = [scene.pilot.coords[1], scene.world.tiles.length - scene.pilot.coords[0]]
            scene.pilot.dir = (scene.pilot.dir + 2) % 8
            scene.plane.coords = [scene.plane.coords[1], scene.world.tiles.length - scene.plane.coords[0]]
            scene.plane.dir = (scene.plane.dir + 2) % 8
            scene.state.levelString = scene.world.exportWorldAsString(scene.state.seed)
            scene.scene.restart(scene.state)
        })

        // Export/Save current level button
        this.btnSave = this.add.sprite(SIZE_X - getXY(MARGIN_X), getXY(0.04+BUTTON_GAP), 'btn_save').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(105);
        this.btnSave.on('pointerdown', function (pointer) {
            var levelString =scene.world.exportWorldAsString(scene.state.seed)
            scene.scene.launch('LevelSelectScene', {option: SELECT_MODES.SAVE, levelString: levelString});
            scene.scene.sleep()
        })

        // Open tools drawer
        var drawerSprites = [this.btnSizeUp, this.btnSizeDown, this.btnShift, this.btnRotate, this.btnSave]
        var drawerSpritesX = drawerSprites.map(sprite => sprite.x) 
        var drawerSpritesY = drawerSprites.map(sprite => sprite.y) 
        this.btnDrawer = this.add.sprite(SIZE_X - getXY(MARGIN_X), getXY(0.04), 'btn_wrench').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(110);
        if (!this.state.drawerOpen){
            drawerSprites.forEach(sprite => sprite.x = this.btnDrawer.x)
            drawerSprites.forEach(sprite => sprite.y = this.btnDrawer.y)
        }
        this.btnDrawer.on('pointerdown', function (pointer) {
            scene.state.drawerOpen = !scene.state.drawerOpen

            drawerSprites.forEach(function (sprite, i) {
                // Open -> close
                if (scene.state.drawerOpen) {
                        scene.tweens.add({
                        targets: sprite,
                        x: drawerSpritesX[i],
                        y: drawerSpritesY[i],
                        duration: 300, delay: 0,
                        ease: 'Expo'
                    });
                    scene.btnDrawer.setTint(Phaser.Display.Color.GetColor(255, 170, 0))
                }
                // Close -> open
                else {
                    scene.tweens.add({
                        targets: sprite,
                        x: scene.btnDrawer.x,
                        y: scene.btnDrawer.y,
                        duration: 300, delay: 0,
                        ease: 'Expo'
                    });
                    scene.btnDrawer.setTint(Phaser.Display.Color.GetColor(255, 255, 255))
                }
            })
        })

        // Run button
        this.btnRun = this.add.sprite(SIZE_X - getXY(0.04), SIZE_Y - getXY(0.20), 'btn_playtest').setOrigin(1, 1).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnRun.on('pointerdown', function (pointer) {
            scene.scene.launch('GameScene', { levelString: scene.state.levelString })
            scene.scene.sleep()
        })

        //MAGIC TIME
        this.COUNT_DISPLAY = 5 //SHOULD BE UNEVEN TO HAVE PROPER CENTER
        this.DRAG_WEIGHT = SIZE_X / this.COUNT_DISPLAY // No idea what kind of units this is lol
        this.TILE_SCALE = 0.35 * MIN_XY / 600

        // Make tile sprites
        this.tileSprites = []
        const TILE_HEIGHT = SIZE_Y - getY(0.01)
        for (let i = 0; i < TILES_LEVEL_EDITOR.length; i++) {
            var tileSprite = this.add.sprite(0, TILE_HEIGHT, TILES_LEVEL_EDITOR[i].assets[0])
            tileSprite.setOrigin(0.5, (800 - 284 + 168) / 800)
            tileSprite.setDepth(200)
            tileSprite.setInteractive({ draggable: true, pixelPerfect: true })
            this.tileSprites.push(tileSprite)
        }
        updateSprites(this, this.state.position, 0)

        // Make scrollbar
        const SCROLLBAR_HEIGHT = TILE_HEIGHT - this.TILE_SCALE * 200
        var scrollbar = this.add.tileSprite(0, SCROLLBAR_HEIGHT, SIZE_X, SIZE_Y - SCROLLBAR_HEIGHT, 'menu_invisible').setDepth(150)
        scrollbar.setScale(SIZE_X).setOrigin(0)
        scrollbar.setInteractive({ draggable: true })
        scrollbar.setTint(0, 0, 0).setAlpha(0.5)

        // User is dragging - update positions
        this.input.on('drag', function (pointer, gameObject, dragX) {
            // Calculate the relative drag position
            if (gameObject == scrollbar) scene.state.relativePos = -dragX
            else scene.state.relativePos = pointer.downX - dragX

            // Calculate the absolute position
            var absolutePos = scene.state.position + scene.state.relativePos / scene.DRAG_WEIGHT
            absolutePos = (absolutePos + TILES_LEVEL_EDITOR.length) % TILES_LEVEL_EDITOR.length
            updateSprites(scene, absolutePos, 0)
        })

        // User stops dragging - snap to discrete position
        this.input.on('dragend', function (pointer, gameObject) {
            var distance = pointer.downX - pointer.upX
            scene.state.relativePos = 0

            // User tapped a tile
            if (gameObject != scrollbar && Math.abs(distance) < scene.TILE_SCALE * 400) {
                console.log("tap")
                scene.state.position = scene.tileSprites.indexOf(gameObject) - (scene.COUNT_DISPLAY - 1) / 2
                scene.state.position = (scene.state.position + TILES_LEVEL_EDITOR.length) % TILES_LEVEL_EDITOR.length
                updateSprites(scene, scene.state.position, 100)
            }

            // User swiped to a tile
            else {
                console.log("swipe")
                scene.state.position += distance / scene.DRAG_WEIGHT
                scene.state.position = scene.state.position + TILES_LEVEL_EDITOR.length
                scene.state.position = Math.round(scene.state.position) % TILES_LEVEL_EDITOR.length
                updateSprites(scene, scene.state.position, 100)
            }
        })
    }

    update(_, dt) {
        var pointer = this.input.activePointer;
        if (pointer.isDown) {
            var coords = getGridCoords(this.world.game, pointer.x, pointer.y)
            if (coords[0] < 0 || coords[1] < 0 || coords[0] > this.world.tiles.length - 1 || coords[1] > this.world.tiles.length - 1) return

            this.world.tiles[coords[0]][coords[1]] = TILES_LEVEL_EDITOR[Math.round(this.state.position + this.state.relativePos + 2) % TILES_LEVEL_EDITOR.length]
            this.state.levelString = this.world.exportWorldAsString(this.state.seed)
            this.scene.restart(this.state)
        }
    }
}

function updateSprites(scene, position, duration) {
    for (let i = 0; i < TILES_LEVEL_EDITOR.length; i++) {
        var sprite = scene.tileSprites[i]

        function inCirclarBounds(start, length, variable) {
            if (variable < start) variable += TILES_LEVEL_EDITOR.length
            return variable <= start + length
        }

        if (inCirclarBounds(Math.floor(position), scene.COUNT_DISPLAY + 1, i)) {
            // Set visible and calculate next position
            sprite.visible = true
            const STEP = SIZE_X / (scene.COUNT_DISPLAY - 1)
            var localPos = (i + 1 > position) ? (i - position) : (TILES_LEVEL_EDITOR.length + i - position)
            var newPos = localPos * STEP

            // Update sprite size
            const CENTER = (scene.COUNT_DISPLAY-1)/2
            var size = Math.max(1/(Math.abs(CENTER-localPos) + 1),0.75)
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
