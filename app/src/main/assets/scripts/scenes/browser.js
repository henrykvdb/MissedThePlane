PUBLIC_LEVELS = [] // This list will be filled with level objects as soon as the levels have been fetched from the database.
// A level object has all fields which are present in the database (deleted, levelString, author, submitdate, etc)

class BrowserScene extends Phaser.Scene {

    constructor() {
        super({ key: 'BrowserScene' })
    }

    init(data) {
        this.sortOn = data.sortOn
        this.startAt = data.startAt
    }

    create() {
        var scene = this
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")

        // Return button gets made early
        scene.btnMenu = scene.add.sprite(getXY(0.04), getXY(0.04), 'btn_back').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        scene.btnMenu.on('pointerdown', function (pointer) {
            scene.scene.start('MenuScene', {caller: null})
        })

        if (getAndroid()) { // We don't have levels or want to refresh, we fetch from server
            Android.getPublishedLevels(this.sortOn ? this.sortOn : null, this.startAt ? this.startAt : null) 
            var loadingText = this.add.text(SIZE_X / 2, SIZE_Y / 2, "Loading levels...", { fill: '#FFFFFF', fontSize: 25 * MIN_XY / 600, fontStyle: 'bold' }).setOrigin(0.5, 0.5).setDepth(100)
            scene.tweens.add({ targets: loadingText, alpha: 0, duration: 700, delay: 1000 })
            waitForLevels().then(() => scene.createBrowser(scene))
        } else {
            // todo remove pc dev lines
            PUBLIC_LEVELS = [{ "deleted": false, "plays": 2, "public": true, "upvotes": 89, "authorName": "winnie", "lastUpdate": 1598301498, "levelString": "{\"size\":4,\"tiles\":[[1,1,8,8],[6,1,8,8],[4,1,8,8],[1,1,8,8]],\"pilot\":[3.5,0.5,1],\"plane\":[4.5,0.5,1],\"difficulty\":\"0\",\"seed\":24868.43850759175}", "clears": 1, "name": "Epic level name", "submitDate": 1598832120, "authorId": "S2VK21LCRgEVy2jhEpT3", "downvotes": 0, "id": "1KHWkR2T7Tng5senQfWr" }, { "deleted": false, "plays": 13, "upvotes": 4, "public": true, "authorName": "Robert", "levelString": "{\"size\":4,\"tiles\":[[1,1,1,1],[8,8,8,1],[8,6,4,1],[1,1,1,2]],\"pilot\":[3.5,0.5,1],\"plane\":[0.5,3.5,5],\"difficulty\":\"0\",\"seed\":67.49858129093678}", "clears": 9, "lastUpdate": 1598386551, "submitDate": 1597753800, "name": "Private level", "downvotes": 1, "authorId": "S2VK21LCRgEVy2jhEpT3", "id": "W6C5Nj22mB3yGrwxCZv0" }]
            this.createBrowser(this)
        }

    }

    createBrowser(scene) {
        const BUTTON_SPACING = getXY(0.3)
        scene.sortVotes = scene.add.sprite(SIZE_X / 2 - BUTTON_SPACING, getXY(0.04), 'sort_upvote').setOrigin(0.5, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        scene.sortVotes.on('pointerdown', () => {if (scene.sortOn == "upvoteRatio") return; scene.scene.restart({sortOn: 'upvoteRatio'})})
        if (scene.sortOn == "upvoteRatio" || !scene.sortOn) scene.sortVotes.setTint("0xaaaaaa")

        scene.sortDate = scene.add.sprite(SIZE_X / 2, getXY(0.04), 'sort_date').setOrigin(0.5, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        scene.sortDate.on('pointerdown', () => {if (scene.sortOn == "submitDate") return; scene.scene.restart({sortOn: 'submitDate'})})
        if (scene.sortOn == "submitDate") scene.sortDate.setTint("0xaaaaaa")

        scene.sortHard = scene.add.sprite(SIZE_X / 2 + BUTTON_SPACING, getXY(0.04), 'sort_clear').setOrigin(0.5, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        scene.sortHard.on('pointerdown', () => {if (scene.sortOn == "clearRatio") return; scene.scene.restart({sortOn: 'clearRatio'})})
        if (scene.sortOn == "clearRatio") scene.sortHard.setTint("0xaaaaaa")

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
    var sizer = scene.rexUI.add.sizer({ orientation: 'y', space: { item: 30 } })
    PUBLIC_LEVELS.forEach(level => sizer.add(createCard(scene, level), { expand: true }))
    return sizer
}

var COLOR_LIGHT = "0xd5c175"
var COLOR_DARK = "0xbe8f17"
var createCard = function (scene, levelData) {
    var startButton = scene.add.sprite(0, 0, 'btn_playtest_0').setScale(0.3 * MIN_XY / 600).setInteractive().setDepth(100)
    startButton.on('pointerdown', () => {
        console.log("playing level " + levelData.id)
        Android.playLevel(levelData.id, false)
        scene.scene.start('GameScene', { levelIndex: levelData.id, levelString: levelData.levelString, public: true, levelName: levelData.name })
    })

    var date = new Date(1970, 0, 1); // Epoch
    date.setSeconds(levelData.submitDate);
    date = date.getFullYear() + "/" + (date.getMonth()+1) + "/" + date.getDate() // eventually add hours?

    var thumbInfo = scene.rexUI.add.sizer({orientation: 'x', space: { left: 20, right: 20, top: 0, bottom: 0, item: 10 }})
        .add(scene.add.sprite(0, 0, 'upvote').setScale(0.15), {align: 'left'})
        .add(scene.add.text(0, 0, levelData.upvotes,{ fill: '#000000', fontSize: 25 * MIN_XY / 600}, {align: 'left'}))
        .addSpace()
        .add(scene.add.sprite(0, 0, 'downvote').setScale(0.15), {align: 'right'})
        .add(scene.add.text(0, 0, levelData.downvotes,{ fill: '#000000', fontSize: 25 * MIN_XY / 600}, {align: 'right'}))
        .setDepth(100)

    var rateBar = levelData.upvotes+levelData.downvotes <= 0 ? "rating20" : 'rating' + Math.floor(20*levelData.upvotes/(levelData.upvotes+levelData.downvotes))
    var ratingSizer = scene.rexUI.add.sizer({orientation: 'y', space: { left: 20, right: 20, top: 0, bottom: 0, item: 10 }})
        .add(thumbInfo)
        .add(scene.add.sprite(0, 0, rateBar).setScale(20, 40)).setDepth(100)

    var clearInfo = scene.rexUI.add.sizer({orientation: 'x', space: { left: 20, right: 20, top: 0, bottom: 0, item: 10 }})
        .add(scene.add.sprite(0, 0, 'trophy').setScale(0.15))
        .add(scene.add.text(0, 0, 'Solved: ' + (levelData.plays <= 0 ? 0 : Math.round(levelData.clears/levelData.plays*100)) + '%',{ fill: '#000000', fontSize: 25 * MIN_XY / 600}))
        .setDepth(100)

    var clearBar = levelData.plays <= 0 ? 'clear0' : 'clear' + Math.floor(20*levelData.clears/levelData.plays)
    var clearSizer = scene.rexUI.add.sizer({orientation: 'y', space: { left: 20, right: 20, top: 0, bottom: 0, item: 10 }})
        .add(clearInfo)
        .add(scene.add.sprite(0, 0,  clearBar).setScale(20, 40)).setDepth(100)

    var toprowSizer = scene.rexUI.add.sizer({orientation: 'x', space: { left: 0, right: 0, top: 0, bottom: 0, item: 20 }})
        .add(scene.add.text(0, 0, levelData.name,{ fill: '#000000', fontSize: 30 * MIN_XY / 600, fontStyle: 'bold' }, {align:'left'}))
        .addSpace()
        .add(scene.add.text(0, 0, "by " + levelData.authorName + " " + date, { fill: '#000000', fontSize: 20 * MIN_XY / 600}, {align:'right'}))
        .setDepth(100)

    var botrowSizer = scene.rexUI.add.sizer({orientation: 'x', space: { left: 20, right: 20, top: 20, bottom: 0, item: 40 }})
        .add(ratingSizer, {align: 'left'})
        .addSpace()
        .add(clearSizer, {align: 'right'})
        .setDepth(100)

    var middleSizer = scene.rexUI.add.sizer({orientation: 'y', space: { left: 20, right: 20, top: 0, bottom: 0, item: 10 }})
        .add(toprowSizer)
        .addSpace()
        .add(botrowSizer, {align: 'bot'})
        .setDepth(100)

    return scene.rexUI.add.sizer({orientation: 'x', space: { left: 20, right: 20, top: 20, bottom: 20, item: 10 }})
        .addBackground(scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, COLOR_LIGHT).setStrokeStyle(getXY(0.01), COLOR_DARK, 1))
        .add(scene.rexUI.add.roundRectangle(0, 0, getXY(0.2), getXY(0.2), 5, COLOR_DARK))
        .add(middleSizer)
        .addSpace()
        .add(startButton, {align: 'right'})
}

function receivePublicLevels(levelData) {
    PUBLIC_LEVELS = JSON.parse(levelData)
}

// TODO: check every loop if we have left the browser before we could receive any levels, so we don't waste performance on this
function waitForLevels() {
    PUBLIC_LEVELS = []
    return new Promise(function (resolve, reject) {
        (function checkLevels() {
            if (PUBLIC_LEVELS.length > 0) return resolve();
            setTimeout(checkLevels, 50);
        })();
    });
}