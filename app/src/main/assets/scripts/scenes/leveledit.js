class LevelEditScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelEditScene' });
        var START_SIZE = 3
        this.INIT_TILES = Array.from(Array(START_SIZE)).map(_ => Array.from(Array(START_SIZE)).map(() => TILES.GRASS))
        this.INIT_TILES = ALL_LEVELS[7].tiles.map(row => row.slice())
    }

    init(data) {
        if (data.tiles != undefined) this.INIT_TILES = data.tiles
    }

    create() {
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")
        this.world = new World(this, this.INIT_TILES)

        // Rotate
        var leveleditScene = this
        this.btnRotate = this.add.sprite(getXY(0.04), getXY(0.04), 'btn_removeads').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnRotate.on('pointerdown', function (pointer) {
            var tiles = leveleditScene.world.tiles
            tiles = tiles[0].map((_, index) => tiles.map(row => row[index]).reverse())
            leveleditScene.scene.restart({ tiles })
        })

        // Shift arrows
        var size = this.world.tiles.length
        var evenWorld = size % 2 == 0
        var shiftX = (getScreenCoords(this, 0, size - 1)[0] - getScreenCoords(this, size - 1, 0)[0]) / 4 + this.shiftX / 2
        var shiftY = (getScreenCoords(this, size - 1, size - 1)[1] - getScreenCoords(this, 0, 0)[1]) / 4 + this.shiftY / 2
        var centerY = evenWorld ? getScreenCoords(this, size / 2, size / 2)[1] : getScreenCoords(this, (size - 1) / 2, (size - 1) / 2)[1] + this.shiftY
        for (let i = 0; i < 4; i++) {
            var leveleditScene = this
            var originX = i > 1
            var originY = i == 0 || i == 3
            var btnMove = this.add.sprite(SIZE_X / 2 + (originX ? -1 : 1) * shiftX, centerY - (originY ? 1 : -1) * shiftY, 'btn_removeads').setOrigin(originX, originY).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
            btnMove.on('pointerdown', function (pointer) {
                var tiles = leveleditScene.world.tiles
                if (i % 2 == 0) tiles = tiles.concat(tiles.splice(0, i == 0 ? 1 : size - 1)); //shift X
                else tiles = tiles.map(row => row.concat(row.splice(0, i == 3 ? 1 : size - 1))); //shift Y
                leveleditScene.scene.restart({ tiles })
            })
        }

        // Close button //TODO readd
        /*this.btnRestart = this.add.sprite(SIZE_X - 10*getXY(0.04), getXY(0.04), 'btn_close').setOrigin(1, 0).setScale(0.20 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnRestart.on('pointerdown', function (pointer) {
            LevelEditScene.scene.resume('GameScene');
            LevelEditScene.scene.stop()
        })*/

        // Increase size
        var leveleditScene = this
        this.btnSizeUp = this.add.sprite(SIZE_X - getXY(0.04), getXY(0.04), 'btn_removeads').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnSizeUp.on('pointerdown', function (pointer) {
            var tiles = leveleditScene.world.tiles
            tiles.forEach(col => col.push(TILES.GRASS))
            tiles.push(Array.from(Array(tiles.length + 1)).map(_ => TILES.GRASS))
            leveleditScene.scene.restart({ tiles })

        })

        // Decrease size
        this.btnSizeDown = this.add.sprite(SIZE_X - getXY(0.04), getXY(0.185), 'btn_removeads').setOrigin(1, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100);
        this.btnSizeDown.on('pointerdown', function (pointer) {
            var tiles = leveleditScene.world.tiles
            if (tiles.length <= 3) return // Below 3x3 is not useful and pretty ugly
            tiles = tiles.slice(0, tiles.length - 1).map(col => col.slice(0, tiles.length - 1))
            leveleditScene.scene.restart({ tiles })
        })

        //MAGIC TIME
        this.COUNT_DISPLAY = 5 //SHOULD BE UNEVEN TO HAVE PROPER CENTER
        this.COUNT_TOTAL = TILES_LEVEL_EDITOR.length
        this.TOPHEIGT = SIZE_Y - getY(0.14)
        this.DRAG_WEIGHT = SIZE_X / this.COUNT_DISPLAY // No idea what kind of units this is lol

        // Make tile sprites
        this.tileSprites = []
        for (let i = 0; i < TILES_LEVEL_EDITOR.length; i++) {
            var tileSprite = this.add.sprite(0, this.TOPHEIGT, TILES_LEVEL_EDITOR[i].assets[0])
            tileSprite.setOrigin(0.5, (800 - 284 - 85 * 2) / 800)
            tileSprite.setScale(0.25 * MIN_XY / 600)
            tileSprite.setDepth(200)//.setInteractive()
            leveleditScene.input.setHitAreaRectangle(tileSprite, 0, 120, 400, 400)
            leveleditScene.input.enableDebug(tileSprite)
            tileSprite.on('pointerdown', function (pointer) {
                updateSprites(leveleditScene, i-2, false)
            })

            leveleditScene.tileSprites.push(tileSprite)
        }
        updateSprites(this, 0, false)

        // Make (invisible) scrollbar
        var scrollbar = this.add.tileSprite(0, this.TOPHEIGT, SIZE_X, 50, 'menu_invisible').setDepth(150);
        scrollbar.setScale(SIZE_X)
        scrollbar.setOrigin(0)
        scrollbar.setInteractive()
        this.input.setDraggable(scrollbar);

        // User is dragging - update positions
        var position = 0
        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            scrollbar.tilePositionX = dragX;
            var dragPos = position + dragX / leveleditScene.DRAG_WEIGHT
            dragPos = (dragPos + leveleditScene.COUNT_TOTAL) % leveleditScene.COUNT_TOTAL
            updateSprites(leveleditScene, dragPos, false)
        });

        // User stops dragging - snap to discrete position
        this.input.on('dragend', function (pointer, gameObject, dragX, dragY) {
            position += (pointer.upX - pointer.downX) / leveleditScene.DRAG_WEIGHT
            position = position + leveleditScene.COUNT_TOTAL
            position = Math.round(position) % leveleditScene.COUNT_TOTAL
            updateSprites(leveleditScene, position, false)
        });
    }

    update(_, dt) {
    }
}

function updateSprites(leveleditScene, position, smooth) {
    for (let i = 0; i < TILES_LEVEL_EDITOR.length; i++) {
        var sprite = leveleditScene.tileSprites[i]

        function inCirclarBounds(start, length, variable) {
            if (variable < start) variable += leveleditScene.COUNT_TOTAL
            return variable <= start + length
        }

        if (inCirclarBounds(Math.floor(position), leveleditScene.COUNT_DISPLAY + 1, i)) {
            sprite.visible = true
            const STEP = SIZE_X / (leveleditScene.COUNT_DISPLAY - 1)
            var localPos = (i + 1 > position) ? (i - position) : (leveleditScene.COUNT_TOTAL + i - position)
            //console.log(i + "; local: " + localPos)
            if(smooth) return //fuck this
            else sprite.x = localPos * STEP
        }
        else sprite.visible = false
    }
}
