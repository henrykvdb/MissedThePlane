class BrowserScene extends Phaser.Scene {

    constructor() {
        super({ key: 'BrowserScene' })
    }

    init(data) {
        this.LEVELS = ALL_LEVELS
    }

    preload() {
        this.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(0).setOrigin(0, 0).setTint("0xD0EEFF")
        this.load.scenePlugin({ key: 'rexuiplugin', url: 'scripts/libraries/rexuiplugin.min.js', sceneKey: 'rexUI' })
    }

    create() {
        const scene = this

        // Close button
        this.btnMenu = scene.add.sprite(getXY(0.04), getXY(0.04), 'btn_back').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        this.btnMenu.on('pointerdown', function (pointer) {
            scene.scene.launch('MenuScene', { caller: scene.scene.key })
            scene.scene.pause()
        })

        const BUTTON_SPACING = getXY(0.3)
        this.sortVotes = this.add.sprite(SIZE_X / 2 - BUTTON_SPACING, getXY(0.04), 'btn_back').setOrigin(0.5, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        this.sortVotes.on('pointerdown', function (pointer) { console.log("sorting votes") })

        this.sortDate = this.add.sprite(SIZE_X / 2, getXY(0.04), 'btn_back').setOrigin(0.5, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        this.sortDate.on('pointerdown', function (pointer) { console.log("sorting date") })

        this.sortHard = this.add.sprite(SIZE_X / 2 + BUTTON_SPACING, getXY(0.04), 'btn_back').setOrigin(0.5, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        this.sortHard.on('pointerdown', function (pointer) { console.log("sorting hard") })

        // Create panel
        var panel = this.rexUI.add.scrollablePanel({
            x: SIZE_X / 2,
            y: SIZE_Y / 2 + getXY(0.1),
            width: SIZE_X,
            height: SIZE_Y - getXY(0.24),

            scrollMode: 0,
            //background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 10, COLOR_LIGHT),

            panel: {
                child: createPanel(this),
                mask: { padding: 1 },
            },

            slider: {
                track: this.rexUI.add.roundRectangle(0, 0, getXY(0.04), getXY(0.02), getXY(0.02), COLOR_DARK),
                thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, getXY(0.03), COLOR_LIGHT),
            },

            space: {
                left: getXY(0.2),
                right: getXY(0.2),
                top: getXY(0.02),
                bottom: 0,
                panel: getXY(0.02),
            }
        }).layout()

        // Improve default scrollbar
        var hideScrollTween
        var thumb = panel.childrenMap.slider.childrenMap.thumb; thumb.alpha = 0; thumb.x = SIZE_X - getXY(0.02)
        var track = panel.childrenMap.slider.childrenMap.track; track.alpha = 0; track.x = SIZE_X - getXY(0.02)
        panel.on('scroll', function (panel) {
            thumb.x = SIZE_X - getXY(0.02); track.x = SIZE_X - getXY(0.02)
            if (hideScrollTween) hideScrollTween.restart()
            else hideScrollTween = scene.tweens.addCounter({
                from: 1,
                to: 0,
                duration: 700,
                ease: Phaser.Math.Easing.Cubic.In,
                onUpdate: function (tween) {
                    thumb.alpha = tween.getValue()
                    track.alpha = tween.getValue()
                }
            })
        })
    }
}

var createPanel = function (scene) {
    var sizer = scene.rexUI.add.sizer({ orientation: 'y', space: { item: 10 } })
    var data = "this is data from the database which we use to create the card"
    return sizer.add(
        createCard(scene, data), // child
        { expand: true }
    ).add(
        createCard(scene, data), // child
        { expand: true }
    ).add(
        createCard(scene, data), // child
        { expand: true }
    ).add(
        createCard(scene, data), // child
        { expand: true }
    ).add(
        createCard(scene, data), // child
        { expand: true }
    )
}
var COLOR_LIGHT = "0xD5C175"
var COLOR_DARK = "0xBE8E17"
var createCard = function (scene, data) {
    return scene.rexUI.add.sizer({
        orientation: 'x',
        space: { left: 20, right: 20, top: 20, bottom: 20, item: 10 }
    })
        .addBackground(
            scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined).setStrokeStyle(getXY(0.004), COLOR_LIGHT, 1)
        )
        .add(
            scene.rexUI.add.roundRectangle(0, 0, getXY(0.2), getXY(0.2), 5, COLOR_LIGHT)
        )
        .add(
            scene.add.text(0, 0, "\"Very hard map\"\nby Henrykvdb\nETL-LFC", { fill: '#000000', fontSize: 20 * MIN_XY / 600, fontStyle: 'bold' })
        )
        .addSpace()
        .add(
            scene.add.text(0, 0, "WINRATE\n19/45\n" + (100 * 19 / 45).toFixed(2) + "%", { fill: '#000000', fontSize: 20 * MIN_XY / 600, fontStyle: 'bold' })
        )
        .add(
            scene.add.rectangle(0, 0, getXY(0.008), getXY(0.2), COLOR_LIGHT)
        )
        .add(
            scene.add.text(0, 0, "2\ndays\nago", { fill: '#000000', fontSize: 20 * MIN_XY / 600, fontStyle: 'bold' })
        )
        .add(
            scene.add.rectangle(0, 0, getXY(0.008), getXY(0.2), COLOR_LIGHT)
        )
        .add(
            scene.add.text(0, 0, "6 votes\n" + (100 * 5 / 6).toFixed(2) + "%\nupvoted", { fill: '#000000', fontSize: 20 * MIN_XY / 600, fontStyle: 'bold' })
        )
        .addSpace()
        .add(
            scene.add.sprite(0, 0, 'btn_playtest').setScale(0.3 * MIN_XY / 600).setInteractive()
        )
}