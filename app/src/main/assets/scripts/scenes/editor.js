class EditorScene extends Phaser.Scene {

    constructor() {
        super({ key: 'EditorScene' })
    }

    init(data) {
        // Constants
        this.COUNT_DISPLAY = 9 // should be uneven to have a center tile
        this.DRAG_WEIGHT = SIZE_X / this.COUNT_DISPLAY // This value works, no idea what kind of units it is?
        this.TILE_SCALE = 0.35 * MIN_XY / 600 // Scale of the tiles in the drawer

        // Data from init
        if (data.levelIndex == undefined || data.levelString == undefined || data.isSolvable == undefined)
            throw "Not enough data provided to create an editor instance"
        this.levelIndex = data.levelIndex
        this.world = new World(this, data.levelString)
        this.isSolvable = data.isSolvable // Changes like madeChanges but only gets set to true on playtest completion

        // Default values
        this.madeChanges = false
        this.drawerOpen = false
        this.shiftEnabled = false
        this.position = TILES_LEVEL_EDITOR.length + (1 - this.COUNT_DISPLAY) / 2 + 2 // +2 to account for the two entities (pilot & plane)
        this.relativePos = 0
    }

    create() {
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        const scene = this
        const BUTTON_GAP = 0.2
        const MARGIN_X = 0.04 //TODO INLINE AND MAKE GLOBAL VARIABLE

        // Menu button
        this.buttonMenu = this.add.sprite(getXY(0.04), getXY(MARGIN_X), 'menu', 'button_menu').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        this.buttonMenu.on('pointerdown', function (pointer) {
            scene.scene.launch('MenuScene', { caller: scene.scene.key })
            scene.scene.pause()
        })

        // Increase size button
        var MAX_SIZE = 10
        var plusTexture = 'button_plus_' + (scene.world.tiles.length >= MAX_SIZE ? 0 : 1)
        this.buttonSizeUp = this.add.sprite(SIZE_X - getXY(MARGIN_X) - 4 * getXY(BUTTON_GAP), getXY(0.04), 'menu', plusTexture).setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(106)
        this.buttonSizeUp.on('pointerdown', function (pointer) {
            var tiles = scene.world.tiles
            if (tiles.length >= MAX_SIZE) return // Above 10x10 is pretty smol
            tiles.forEach(col => col.push(TILES.GRASS))
            tiles.push(Array.from(Array(tiles.length + 1)).map(_ => TILES.GRASS))
            scene.world.tiles = tiles
            scene.makeChanges(true)
            if (scene.world.tiles.length > MIN_SIZE) scene.buttonSizeDown.setTexture('menu', 'button_minus_1')
            if (scene.world.tiles.length >= MAX_SIZE) scene.buttonSizeUp.setTexture('menu', 'button_plus_0')
        })

        // Decrease size button
        var MIN_SIZE = 4
        var minusTexture = 'button_minus_' + (scene.world.tiles.length <= MIN_SIZE ? 0 : 1)
        this.buttonSizeDown = this.add.sprite(SIZE_X - getXY(MARGIN_X) - 3 * getXY(BUTTON_GAP), getXY(0.04), 'menu', minusTexture).setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(107)
        this.buttonSizeDown.on('pointerdown', function (pointer) {
            var tiles = scene.world.tiles
            if (tiles.length <= MIN_SIZE) return // Below 4x4 is not useful and pretty ugly
            scene.world.tiles = tiles.slice(0, tiles.length - 1).map(col => col.slice(0, tiles.length - 1))
            if (scene.world.getTile(scene.world.pilot.coords) == TILES.AIR) { // Pilot has gotten out of the map
                // He was on the edge, we move him 1 x and 1 y up
                var pos = scene.world.pilot.coords
                if (pos[0] == pos[1]) scene.world.pilot.coords = [pos[0] - 1, pos[1] - 1]
                else if (pos[0] > pos[1]) scene.world.pilot.coords = [pos[0] - 1, pos[1]]
                else if (pos[0] < pos[1]) scene.world.pilot.coords = [pos[0], pos[1] - 1]

                // Moving in is blocked by a tile, remove pilot
                if (TILES_IMPASSABLE_PILOT.includes(scene.world.getTile(scene.world.pilot.coords))) {
                    scene.world.pilot.coords = [-10, -10] // He gone
                }
            }
            var planePos = scene.world.plane.coords // check if plane is more than 1 tile away from the main land
            if (planePos[0] > scene.world.tiles.length + 1 || planePos[1] > scene.world.tiles.length + 1) {
                if (planePos[0] == planePos[1]) scene.world.plane.coords = [planePos[0] - 1, planePos[1] - 1] // He was on the edge, we move him 1 x and 1 y up
                else if (planePos[0] > planePos[1]) scene.world.plane.coords = [planePos[0] - 1, planePos[1]]
                else if (planePos[0] < planePos[1]) scene.world.plane.coords = [planePos[0], planePos[1] - 1]
            }
            scene.makeChanges(true)
            if (scene.world.tiles.length <= MIN_SIZE) scene.buttonSizeDown.setTexture('menu', 'button_minus_0')
            if (scene.world.tiles.length < MAX_SIZE) scene.buttonSizeUp.setTexture('menu', 'button_plus_1')
        })

        // Shift arrows
        var size = this.world.tiles.length
        var positions = [[-1.3, size / 2 - 0.5], [size / 2 - 0.5, size + 0.3], [size + 0.3, size / 2 - 0.5], [size / 2 - 0.5, - 1.3]]
        var shiftArrows = []
        for (let i = 0; i < 4; i++) {
            var coords = getScreenCoords(this, positions[i][0], positions[i][1])
            var buttonMove = this.add.sprite(coords[0], coords[1], 'menu', 'button_shift_' + i).setDepth(50)
            buttonMove.setOrigin(0.5, (800 - 284 - 85 * 2) / 800).setScale(this.tileScale).setInteractive({ pixelPerfect: true }).setDepth(positions[i][0] + positions[i][1])
            buttonMove.setTint("0xFFAA00").visible = this.shiftEnabled
            buttonMove.on('pointerdown', function (pointer) {
                var tiles = scene.world.tiles
                if (i % 2 == 0) scene.world.tiles = tiles.concat(tiles.splice(0, i == 0 ? 1 : scene.world.tiles.length - 1)) //shift X
                else scene.world.tiles = tiles.map(row => row.concat(row.splice(0, i == 3 ? 1 : scene.world.tiles.length - 1))) //shift Y

                // Shift pilot
                scene.world.pilot.coords = [(scene.world.pilot.coords[0] + scene.world.tiles.length + (i % 2 == 0 ? (i == 0 ? -1 : 1) : 0)) % scene.world.tiles.length,
                (scene.world.pilot.coords[1] + scene.world.tiles.length + (i % 2 != 0 ? (i == 3 ? -1 : 1) : 0)) % scene.world.tiles.length]

                // Shift plane
                var newPlanePos = [(scene.world.plane.coords[0] + (i % 2 == 0 ? (i == 0 ? -1 : 1) : 0)), (scene.world.plane.coords[1] + (i % 2 != 0 ? (i == 3 ? -1 : 1) : 0))]
                if (scene.inPlaneBounds(newPlanePos.map(v => Math.floor(v)))) scene.world.plane.coords = newPlanePos

                // Update
                scene.makeChanges(true)
            })
            shiftArrows.push(buttonMove)
        }

        // Shift toggle button
        this.buttonShift = this.add.sprite(SIZE_X - getXY(MARGIN_X) - 1 * getXY(BUTTON_GAP), getXY(0.04), 'menu', 'button_shift_toggle_0').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(108)
        if (scene.shiftEnabled) this.buttonShift.setTint(Phaser.Display.Color.GetColor(255, 170, 0))
        else this.buttonShift.setTint(Phaser.Display.Color.GetColor(255, 255, 255))
        this.buttonShift.on('pointerdown', function (pointer) {
            scene.shiftEnabled = !scene.shiftEnabled
            shiftArrows.forEach(sprite => { sprite.visible = scene.shiftEnabled; sprite.setDepth(50) })
            if (scene.shiftEnabled) scene.buttonShift.setTint(Phaser.Display.Color.GetColor(255, 170, 0))
            else scene.buttonShift.setTint(Phaser.Display.Color.GetColor(255, 255, 255))
        })

        // Rotate button
        this.buttonRotateWorld = this.add.sprite(SIZE_X - getXY(MARGIN_X) - 2 * getXY(BUTTON_GAP), getXY(0.04), 'menu', 'button_rotate_world').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(109)
        this.buttonRotateWorld.on('pointerdown', function (pointer) {
            scene.world.rotateOneways()
            scene.world.tiles = scene.world.tiles[0].map((_, index) => scene.world.tiles.map(row => row[index]).reverse())
            scene.world.pilot.coords = [scene.world.pilot.coords[1], scene.world.tiles.length - scene.world.pilot.coords[0]]
            scene.world.pilot.dir = (scene.world.pilot.dir + 2) % 8
            scene.world.plane.coords = [scene.world.plane.coords[1], scene.world.tiles.length - scene.world.plane.coords[0]]
            scene.world.plane.dir = (scene.world.plane.dir + 2) % 8
            scene.makeChanges(true)
        })

        // Export/Save current level button
        this.buttonSave = this.add.sprite(SIZE_X - getXY(MARGIN_X), getXY(0.04 + BUTTON_GAP), 'menu', 'button_save_' + (this.madeChanges ? 1 : 0)).setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(105)
        this.buttonSave.on('pointerdown', function (pointer) {
            if (!scene.madeChanges) return
            scene.madeChanges = false
            var levelString = scene.world.exportWorldAsString()
            console.log(levelString)
            if (getAndroid()) {
                console.log("saving")
                Android.setLocalLevel(scene.levelIndex, levelString)
                Android.updateLevel(scene.levelIndex, levelString)
                Android.setSolvable(scene.levelIndex, scene.isSolvable)
            } else USER_LEVELS[scene.levelIndex] = levelString
            scene.buttonSave.setTexture('menu', 'button_save_0')
        })

        // Open tools drawer
        var drawerSprites = [this.buttonSizeUp, this.buttonSizeDown, this.buttonShift, this.buttonRotateWorld, this.buttonSave]
        var drawerSpritesX = drawerSprites.map(sprite => sprite.x)
        var drawerSpritesY = drawerSprites.map(sprite => sprite.y)
        this.buttonDrawer = this.add.sprite(SIZE_X - getXY(MARGIN_X), getXY(0.04), 'menu', 'button_wrench').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(110)
        if (!this.drawerOpen) {
            drawerSprites.forEach(sprite => sprite.x = this.buttonDrawer.x)
            drawerSprites.forEach(sprite => sprite.y = this.buttonDrawer.y)
        } else {
            scene.buttonDrawer.setTint(Phaser.Display.Color.GetColor(255, 170, 0))
        }
        this.buttonDrawer.on('pointerdown', function (pointer) {
            scene.drawerOpen = !scene.drawerOpen

            drawerSprites.forEach(function (sprite, i) {
                // Open -> close
                if (scene.drawerOpen) {
                    scene.tweens.add({
                        targets: sprite,
                        x: drawerSpritesX[i],
                        y: drawerSpritesY[i],
                        duration: 300, delay: 0,
                        ease: 'Expo'
                    })
                    scene.buttonDrawer.setTint(Phaser.Display.Color.GetColor(255, 170, 0))
                }
                // Close -> open
                else {
                    scene.tweens.add({
                        targets: sprite,
                        x: scene.buttonDrawer.x,
                        y: scene.buttonDrawer.y,
                        duration: 300, delay: 0,
                        ease: 'Expo'
                    })
                    scene.buttonDrawer.setTint(Phaser.Display.Color.GetColor(255, 255, 255))
                }
            })
        })

        // Run button
        this.buttonRun = this.add.sprite(SIZE_X - getXY(0.04), SIZE_Y - getXY(0.20), 'menu', 'button_playtest_' + (scene.isSolvable ? 1 : 0)).setOrigin(1, 1).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        this.buttonRun.on('pointerdown', function (pointer) {
            scene.scene.launch('GameScene', { levelIndex: scene.levelIndex, levelString: scene.world.exportWorldAsString() })
            scene.scene.sleep()
        })

        // Rotate button for plane, pilot and oneways (default hidden)
        this.buttonRotate = this.add.sprite(getXY(0.04), SIZE_Y - getXY(0.20), 'menu', 'button_rotate').setOrigin(0, 1).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        this.buttonRotate.on('pointerdown', () => {
            // Get the sprite index and texture asset
            var index = Math.round(scene.position + scene.relativePos + (scene.COUNT_DISPLAY - 1) / 2) % scene.sprites.length
            while (index < 0) index += scene.sprites.length
            var texture = scene.sprites[index].frame.name

            if (texture.includes('plane') && scene.world.plane) {
                scene.world.plane.dir = (this.world.plane.dir + 2) % 8
                scene.sprites[index].setTexture('entities', 'plane' + scene.world.plane.dir)
                scene.world.plane.updateSprites()
                scene.makeChanges(false)
            }
            else if (texture.includes('pilot') && scene.world.pilot) {
                scene.world.pilot.dir = (scene.world.pilot.dir + 2) % 8
                scene.sprites[index].setTexture('entities', 'pilot' + scene.world.pilot.dir)
                scene.world.pilot.updateSprites()
                scene.makeChanges(false)
            } else if (texture.includes('oneway')) {
                var newRotation = (parseInt(texture.substr(-1)) + 1) % 4
                scene.sprites[index].setTexture('tiles', 'oneway' + newRotation)
            }
            else console.log("Tried to rotate current entity but neither pilot or plane is selected!")
        })
        this.buttonRotate.visible = false

        // Cover sprites out of screen
        this.add.rectangle(SIZE_X, 0, SIZE_X, SIZE_Y, 0xD0EEFF).setDepth(290).setOrigin(0)

        // Make tile sprites
        const SLIDER_SPRITES = []
        const TILE_HEIGHT = SIZE_Y - getY(0.01)
        for (let i = 0; i < TILES_LEVEL_EDITOR.length; i++) {
            var tileSprite = this.add.sprite(0, TILE_HEIGHT, 'tiles', TILES_LEVEL_EDITOR[i].assets[0])
            tileSprite.setOrigin(0.5, (800 - 284 + 168) / 800).setDepth(200).setInteractive({ draggable: true, pixelPerfect: true }).visible = false
            SLIDER_SPRITES.push(tileSprite)
        }

        // Make entitiy sprites
        var tileSprite = this.add.sprite(0, TILE_HEIGHT, 'entities', 'pilot' + this.world.pilot.dir)
        tileSprite.setOrigin(0.5, (800 - 178) / 800).setDepth(200).setInteractive({ draggable: true })
        SLIDER_SPRITES.push(tileSprite)
        tileSprite = this.add.sprite(0, TILE_HEIGHT, 'entities', 'plane' + this.world.plane.dir)
        tileSprite.setOrigin(0.5, (800 - 249) / 800).setDepth(200).setInteractive({ draggable: true, pixelPerfect: true })
        SLIDER_SPRITES.push(tileSprite)

        // Make scrollbar
        const SCROLLBAR_HEIGHT = TILE_HEIGHT - this.TILE_SCALE * 200
        var clickCatcher = this.add.rectangle(0, 0, SIZE_X, SCROLLBAR_HEIGHT, 0x000000).setOrigin(0).setAlpha(0.001).setDepth(0).setInteractive({ draggable: true })
        var scrollbar = this.add.rectangle(0, SCROLLBAR_HEIGHT, SIZE_X, SIZE_Y - SCROLLBAR_HEIGHT, 0x000000).setOrigin(0).setAlpha(0.5).setDepth(50).setInteractive({ draggable: true })

        // Draw slider
        this.sprites = SLIDER_SPRITES // Seperate for if we ever want to implement categories
        this.updateDrawerSprites(this.position, 0)

        // User starts dragging - handle editor
        this.input.on('dragstart', function (pointer, gameObject) {
            if (gameObject == clickCatcher) scene.handleInput()
        })

        // User is dragging - update positions
        this.input.on('drag', function (pointer, gameObject, dragX) {
            if (gameObject == clickCatcher) { scene.handleInput(); return }

            // Calculate the relative drag position
            if (gameObject == scrollbar) scene.relativePos = -dragX / scene.DRAG_WEIGHT
            else scene.relativePos = (pointer.downX - dragX) / scene.DRAG_WEIGHT

            // Calculate the absolute position
            var absolutePos = scene.position + scene.relativePos
            absolutePos = (absolutePos + scene.sprites.length) % scene.sprites.length
            scene.updateDrawerSprites(absolutePos, 0)
        })

        // User stops dragging - snap to discrete position
        this.input.on('dragend', function (pointer, gameObject) {
            if (gameObject == clickCatcher) { scene.handleInput(); return }

            var distance = (pointer.downX - pointer.upX) / scene.DRAG_WEIGHT
            var time = pointer.upTime - pointer.downTime
            scene.relativePos = 0

            // User tapped a tile
            if (gameObject != scrollbar && distance <= 0.2 && time < 250) {
                scene.position = scene.sprites.indexOf(gameObject) - (scene.COUNT_DISPLAY - 1) / 2
                scene.position = (scene.position + scene.sprites.length) % scene.sprites.length
                scene.updateDrawerSprites(scene.position, 100)
            }

            // User swiped to a tile
            else {
                scene.position += distance
                scene.position = Math.round(scene.position + scene.sprites.length) % scene.sprites.length
                scene.updateDrawerSprites(scene.position, 100)
            }
        })
    }

    inWorldBounds(coords) {
        return coords[0] >= 0 && coords[1] >= 0 && coords[0] <= this.world.tiles.length - 1 && coords[1] <= this.world.tiles.length - 1
    }

    // Plane bounds are special because they don't include corners (cause plane can't go to island from a corner block) and they go one block out
    inPlaneBounds(coords) {
        if ((coords[0] == -1 || coords[0] == this.world.tiles.length) && (coords[1] == -1 || coords[1] == this.world.tiles.length)) return false
        else return coords[0] >= -1 && coords[1] >= -1 && coords[0] <= this.world.tiles.length && coords[1] <= this.world.tiles.length
    }

    makeChanges(restart) {
        this.isSolvable = false
        this.buttonRun.setTexture('menu', 'button_playtest_0')
        if (!this.madeChanges) {
            this.madeChanges = true
            this.buttonSave.setTexture('menu', 'button_save_1')
            if (getAndroid()) Android.setSolvable(this.levelIndex, false)
        }

        if (restart) {
            this.world.destroy()
            this.world = new World(this, this.world.exportWorldAsString())
        }
    }

    // The user returned from playtesting, we update the solvability of this field
    setSolvable(solved) {
        if (this.isSolvable || !solved) return // The user didn't finish it, it doesn't give new information
        this.isSolvable = true
        this.buttonRun.setTexture('menu', "button_playtest_1")
        // The user completed the level, and while we should wait until a save to store this value, there have been no changes since last save
        // Which means it is save to save the solvability immediately
        if (getAndroid() && !this.madeChanges) Android.setSolvable(this.levelIndex, true)
    }

    handleInput() {
        // Get the sprite index and texture asset
        var index = Math.round(this.position + this.relativePos + (this.COUNT_DISPLAY - 1) / 2) % this.sprites.length
        while (index < 0) index += this.sprites.length
        var texture = this.sprites[index].frame.name

        // Get the input event
        var pointer = this.input.activePointer
        var coords = getGridCoords(this, pointer.x, pointer.y)

        // Handle the input
        if (texture.includes('plane')) {
            if (!this.inPlaneBounds(coords)) return
            if (this.inWorldBounds(coords) && TILES_IMPASSABLE_PLANE.includes(this.world.getTile(coords))) return
            if (this.world.plane.coords[0] == coords[0] + 0.5 && this.world.plane.coords[1] == coords[1] + 0.5) return
            this.world.plane.coords = [coords[0] + 0.5, coords[1] + 0.5]
            this.world.plane.updateSprites()
            this.makeChanges(false)
        }
        else if (texture.includes('pilot')) {
            if (!this.inWorldBounds(coords)) return
            if (TILES_IMPASSABLE_PILOT.includes(this.world.tiles[coords[0]][coords[1]])) return
            if (this.world.pilot.coords[0] == coords[0] + 0.5 && this.world.pilot.coords[1] == coords[1] + 0.5) return
            this.world.pilot.coords = [coords[0] + 0.5, coords[1] + 0.5]
            this.world.pilot.updateSprites()
            this.makeChanges(false)
        }
        else if (this.inWorldBounds(coords)) {
            var oldTile = this.world.getTile(coords)
            var newTile = TILES_LEVEL_EDITOR[index]
            if (newTile == TILES.ONEWAY_0) newTile = eval("TILES.ONEWAY_" + this.sprites[index].frame.name.substr(-1))
            if (oldTile == newTile) return // No need to edit anything if this tile is already the selected tile

            // Check pilot collision with impassible
            var pilotCoords = this.world.pilot.coords
            if (coords[0] == Math.floor(pilotCoords[0]) && coords[1] == Math.floor(pilotCoords[1]) && TILES_IMPASSABLE_PILOT.includes(newTile)) {
                this.world.pilot.coords = [-10, -10] // He gone
                this.world.pilot.updateSprites()
            }

            // Check plane collision with impassible
            var planeCoords = this.world.plane.coords
            if (coords[0] == Math.floor(planeCoords[0]) && coords[1] == Math.floor(planeCoords[1]) && TILES_IMPASSABLE_PLANE.includes(newTile)) {
                this.world.plane.coords = [this.world.tiles.length + 0.5, 1.5]
                this.world.plane.updateSprites()
            }

            // If the runway is not part of the previous runway convert the old one to grass
            var removeOldRunway = false
            if (newTile == TILES.RUNWAY) {
                // Check if the new runway tile is in the right line
                var runwayTiles = this.world.runwayCoords
                if (runwayTiles.length > 1) {
                    var index = TILES.RUNWAY.assets.indexOf(this.world.sprites[runwayTiles[0][0]][runwayTiles[0][1]].frame.name)
                    removeOldRunway = (index % 2 == 0 && runwayTiles[0][1] != coords[1]) || (index % 2 == 1 && runwayTiles[0][0] != coords[0])
                }

                // Check if it is touching any of the previous runway tiles
                if (runwayTiles.length > 0 && !getNeighbourCoords(coords, this.world.tiles.length).map(c => this.world.getTile(c)).includes(TILES.RUNWAY)) {
                    removeOldRunway = true
                }
            }

            // Remove runway
            if (removeOldRunway) this.world.tiles.forEach((row, x) => row.forEach((type, y) => { if (type == TILES.RUNWAY) this.world.setTile([x, y], TILES.GRASS) }))

            this.world.setTile(coords, newTile)
            this.makeChanges(oldTile == TILES.RUNWAY || newTile == TILES.RUNWAY)
        }
    }

    update(_, dt) {
        // Get the sprite index and texture asset
        var index = Math.round(this.position + this.relativePos + (this.COUNT_DISPLAY - 1) / 2) % this.sprites.length
        while (index < 0) index += this.sprites.length
        var texture = this.sprites[index].frame.name

        this.buttonRotate.visible = (texture.includes('plane') || texture.includes('pilot') || texture.includes('oneway'))
    }

    updateDrawerSprites(position, duration) {
        for (let i = 0; i < this.sprites.length; i++) {
            var sprite = this.sprites[i]

            var scene = this // Needed for the function below
            function inCirclarBounds(start, length, variable) {
                if (variable < start) variable += scene.sprites.length
                return variable <= start + length
            }

            if (inCirclarBounds(Math.floor(position), this.COUNT_DISPLAY + 1, i)) {
                // Set visible and calculate next position
                sprite.visible = true
                const STEP = SIZE_X / (this.COUNT_DISPLAY - 1)
                var localPos = (i + 1 > position) ? (i - position) : (this.sprites.length + i - position)
                var newPos = localPos * STEP

                // Update sprite size
                const CENTER = (this.COUNT_DISPLAY - 1) / 2
                var size = Math.max(1 / (Math.abs(CENTER - localPos) + 1), 0.75)
                if (sprite.frame.name.includes("pilot")) size /= 1.5
                sprite.setScale(this.TILE_SCALE * size)

                // Move the sprite to the new position
                if (duration != 0 && Math.abs(newPos - sprite.x) < STEP * 2.5) {
                    this.tweens.add({
                        targets: sprite,
                        x: newPos,
                        duration: duration, delay: 0, completeDelay: 0, loopDelay: 0, repeatDelay: 0
                    })
                }
                else sprite.x = newPos
            }
            else sprite.visible = false
        }
    }
}