PUBLIC_LEVELS = [] // This list will be filled with level objects as soon as the levels have been fetched from the database.
                   // A level object has all fields which are present in the database (deleted, levelString, author, submitdate, etc)

class BrowserScene extends Phaser.Scene {

    constructor() {
        super({ key: 'BrowserScene' })
    }

    init(data) {
        this.LEVELS = ALL_LEVELS
    }

    preload() {
        this.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(0).setOrigin(0, 0).setTint("0xD0EEFF")
    }

    create() {
        if (getAndroid()) {
            var scene = this
            Android.getPublishedLevels()

             // Close button
            scene.btnMenu = scene.add.sprite(getXY(0.04), getXY(0.04), 'btn_back').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
            scene.btnMenu.on('pointerdown', function (pointer) {
                scene.scene.launch('MenuScene', { caller: scene.scene.key })
                scene.scene.pause()
            })

            var loadingText = this.add.text(SIZE_X / 2, SIZE_Y / 2, "Loading levels...", { fill: '#FFFFFF', fontSize: 25 * MIN_XY / 600, fontStyle: 'bold' }).setOrigin(0.5, 0.5).setDepth(100)
            scene.tweens.add({targets: loadingText, alpha: 0, duration: 700, delay: 1000})
            waitForLevels().then(() => scene.createBrowser(scene))
        } else {
            this.add.text(SIZE_X / 2, SIZE_Y / 2, "Get yourself a phone to see this menu ;)", { fill: '#FFFFFF', fontSize: 25 * MIN_XY / 600}).setOrigin(0.5, 0.5).setDepth(100)
        }
        
    }

    createBrowser(scene) {
        scene.add.tileSprite(0, 0, SIZE_X, SIZE_Y, 'menu_invisible').setDepth(0).setOrigin(0, 0).setTint("0xD0EEFF")
    
        const BUTTON_SPACING = getXY(0.3)
        scene.sortVotes = scene.add.sprite(SIZE_X / 2 - BUTTON_SPACING, getXY(0.04), 'btn_back').setOrigin(0.5, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        scene.sortVotes.on('pointerdown', function (pointer) { console.log("sorting votes") })
    
        scene.sortDate = scene.add.sprite(SIZE_X / 2, getXY(0.04), 'btn_back').setOrigin(0.5, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        scene.sortDate.on('pointerdown', function (pointer) { console.log("sorting date") })
    
        scene.sortHard = scene.add.sprite(SIZE_X / 2 + BUTTON_SPACING, getXY(0.04), 'btn_back').setOrigin(0.5, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        scene.sortHard.on('pointerdown', function (pointer) { console.log("sorting hard") })
    
        // Create panel
        var panel = scene.rexUI.add.scrollablePanel({
            x: SIZE_X / 2,
            y: SIZE_Y / 2 + getXY(0.1),
            width: SIZE_X,
            height: SIZE_Y - getXY(0.24),
    
            scrollMode: 0,
            //background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, COLOR_LIGHT),
    
            panel: {
                child: createPanel(scene),
                mask: { padding: 1 },
            },
    
            slider: {
                track: scene.rexUI.add.roundRectangle(0, 0, getXY(0.04), getXY(0.02), getXY(0.02), COLOR_DARK),
                thumb: scene.rexUI.add.roundRectangle(0, 0, 0, 0, getXY(0.03), COLOR_LIGHT),
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
    PUBLIC_LEVELS.forEach(level => sizer.add(createCard(scene, level), {expand: true}))
    PUBLIC_LEVELS = []
    return sizer
}

var COLOR_LIGHT = "0xD5C175"
var COLOR_DARK = "0xBE8E17"
var createCard = function (scene, levelData) {
    return scene.rexUI.add.sizer({
        orientation: 'x',
        space: { left: 20, right: 20, top: 20, bottom: 20, item: 10 }
    })
    .addBackground(scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined).setStrokeStyle(getXY(0.004), COLOR_LIGHT, 1))
    .add(scene.rexUI.add.roundRectangle(0, 0, getXY(0.2), getXY(0.2), 5, COLOR_LIGHT))

    .add(scene.add.text(0, 0, "\"Very hard map\"\nby Henrykvdb\nETL-LFC",{ fill: '#000000', fontSize: 20 * MIN_XY / 600, fontStyle: 'bold' }))
    .addSpace()

    .add(scene.add.text(0, 0, levelData.levelString,{ fill: '#000000', fontSize: 20 * MIN_XY / 600, fontStyle: 'bold' }))
    .add(scene.add.rectangle(0, 0, getXY(0.008), getXY(0.2), COLOR_LIGHT))

    .add(scene.add.text(0, 0, levelData.public.toString(),{ fill: '#000000', fontSize: 20 * MIN_XY / 600, fontStyle: 'bold' }))
    .add(scene.add.rectangle(0, 0, getXY(0.008), getXY(0.2), COLOR_LIGHT))

    .add(scene.add.text(0, 0, "6 votes\n" + (100 * 5 / 6).toFixed(2) + "%\nupvoted",{ fill: '#000000', fontSize: 20 * MIN_XY / 600, fontStyle: 'bold' }))
    .addSpace()

    .add(scene.add.sprite(0, 0, 'btn_playtest').setScale(0.3 * MIN_XY / 600).setInteractive())
}

function receivePublicLevels(levelData) {
    PUBLIC_LEVELS = JSON.parse(levelData)
}

// TODO: check every loop if we have left the browser before we could receive any levels, so we don't waste performance on this
function waitForLevels() {
    return new Promise(function (resolve, reject) {
        (function checkLevels(){
            if (PUBLIC_LEVELS.length > 0) return resolve();
            setTimeout(checkLevels, 50);
        })();
    });
}