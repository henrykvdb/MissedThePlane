var COLOR_LIGHT = "0xd5c175"
var COLOR_DARK = "0xbe8f17"
var COLOR_DARK_GREEN = "0x3ea529"
var COLOR_LIGHT_GREEN = "0x4ac431"
TIMEOUT_TRESHOLD = 7000 // ms after which to show timed out message

PUBLIC_LEVELS = {} // A dict for levels for each sorting method, so we can switch between received sorts without having to fetch again
// each list will be filled with level objects as soon as the levels have been fetched from the database.
// A level object has all fields which are present in the database (deleted, levelString, author, submitdate, etc)

class BrowserScene extends Phaser.Scene {

    constructor() {
        super({ key: 'BrowserScene' })
    }

    init(data) {
        this.sortOn = data.sortOn ? data.sortOn : "upvoteRatio"
        this.startAt = data.startAt
        this.newPageRequest = data.newPageRequest
    }

    create() {
        var scene = this
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D0EEFF")

        // Return button gets made early
        scene.buttonMenu = scene.add.sprite(getXY(0.04), getXY(0.04), 'menu', 'button_back').setOrigin(0, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        scene.buttonMenu.on('pointerdown', function (pointer) {
            scene.scene.start('MenuScene', { caller: null })
        })

        if (getAndroid()) { // We don't have levels or want to refresh, we fetch from server
            if (!Android.canGetPublished(this.sortOn) && PUBLIC_LEVELS[this.sortOn] && !PUBLIC_LEVELS[this.sortOn].isNewPage && !this.newPageRequest) {scene.createBrowser(scene); return} // We have fetched the levels previously, so recently we simply use them
            Android.getPublishedLevels(this.sortOn, this.startAt ? this.startAt : null) 
            this.loadingText = this.add.bitmapText(SIZE_X / 2, SIZE_Y / 2, 'voxel_font', "Loading levels...",  40 * MIN_XY / 600).setTint(0).setDepth(100).setOrigin(0.5, 0.5)
            waitForLevels(this.sortOn).then(() => scene.createBrowser(scene))
            .catch((errorMessage) => showDialog(scene, 400, "An error occured", errorMessage+"\nPlease try again.", undefined, "Okay...", () => scene.scene.start('MenuScene', {caller: null})))
        } else {
            PUBLIC_LEVELS['upvoteRatio'] = [{ "deleted": false, "plays": 2, "public": true, "upvotes": 89, "authorName": "winnie", "lastUpdate": 1598301498, "levelString": "{\"size\":4,\"tiles\":[[1,1,8,8],[6,1,8,8],[4,1,8,8],[1,1,8,8]],\"pilot\":[3.5,0.5,1],\"plane\":[4.5,0.5,1],\"difficulty\":\"0\",\"seed\":24868.43850759175}", "clears": 1, "name": "Epic level name", "submitDate": 1598991808, "authorId": "S2VK21LCRgEVy2jhEpT3", "downvotes": 0, "id": "1KHWkR2T7Tng5senQfWr" }, { "deleted": false, "plays": 13, "upvotes": 4, "public": true, "authorName": "Robert", "levelString": "{\"size\":4,\"tiles\":[[1,1,1,1],[8,8,8,1],[8,6,4,1],[1,1,1,2]],\"pilot\":[3.5,0.5,1],\"plane\":[0.5,3.5,5],\"difficulty\":\"0\",\"seed\":67.49858129093678}", "clears": 9, "lastUpdate": 1598386551, "submitDate": 1597753800, "name": "Private level", "downvotes": 1, "authorId": "S2VK21LCRgEVy2jhEpT3", "id": "W6C5Nj22mB3yGrwxCZv0" }]
            this.createBrowser(this)
        }

    }

    createBrowser(scene) {
        if (this.loadingText) this.loadingText.destroy()
        PUBLIC_LEVELS[scene.sortOn].isNewPage = scene.newPageRequest

        const BUTTON_SPACING = getXY(0.3)
        scene.sortVotes = scene.add.sprite(SIZE_X / 2 - BUTTON_SPACING, getXY(0.04),'menu', 'button_sort_upvote').setOrigin(0.5, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        scene.sortVotes.on('pointerdown', () => {if (scene.sortOn == "upvoteRatio") return; scene.scene.restart({sortOn: 'upvoteRatio', newPageRequest: false})})
        if (scene.sortOn != "upvoteRatio") scene.sortVotes.setTint("0xaaaaaa")

        scene.sortDate = scene.add.sprite(SIZE_X / 2, getXY(0.04), 'menu', 'button_sort_date').setOrigin(0.5, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        scene.sortDate.on('pointerdown', () => {if (scene.sortOn == "submitDate") return; scene.scene.restart({sortOn: 'submitDate', newPageRequest: false})})
        if (scene.sortOn != "submitDate") scene.sortDate.setTint("0xaaaaaa")

        scene.sortHard = scene.add.sprite(SIZE_X / 2 + BUTTON_SPACING, getXY(0.04), 'menu', 'button_sort_trophy').setOrigin(0.5, 0).setScale(0.25 * MIN_XY / 600).setInteractive().setDepth(100)
        scene.sortHard.on('pointerdown', () => {if (scene.sortOn == "clearRatio") return; scene.scene.restart({sortOn: 'clearRatio', newPageRequest: false})})
        if (scene.sortOn != "clearRatio") scene.sortHard.setTint("0xaaaaaa")

        // Create panel
        var panel = scene.rexUI.add.scrollablePanel({
            x: SIZE_X / 2,
            y: SIZE_Y / 2 + getXY(0.4) / 2,
            width: SIZE_X,
            height: SIZE_Y - getXY(0.4),

            panel: {
                child: createPanel(scene),
                mask: { padding: 1 },
            }
        }).layout()
    }
}

var createPanel = function (scene) {
    var sizer = scene.rexUI.add.sizer({ orientation: 'y', space: { item: 30 } })
    PUBLIC_LEVELS[scene.sortOn].forEach(level => sizer.add(new LevelCard(scene, level, false)))
    if (PUBLIC_LEVELS[scene.sortOn].length >= 50) sizer.add(new NextCard(scene, PUBLIC_LEVELS[scene.sortOn][PUBLIC_LEVELS[scene.sortOn].length - 1]))
    return sizer
}

function getTimeLetter(oldSeconds) {
    var seconds = new Date().getTime() / 1000 - oldSeconds
    if (seconds < 0) seconds = -seconds
    if (seconds > 60 * 60 * 24 * 30.5 * 12){
        var value = Math.floor(seconds / (60 * 60 * 24 * 30.5 * 12))
        return (value>1)? value + " yrs" : value + " yr"
    }
    else if (seconds > 60 * 60 * 24 * 30.5){
        var someDate = new Date(1970, 0, 1) // Epoch
        someDate.setSeconds(oldSeconds)
        return someDate.toLocaleString('default', { month: 'long' }).slice(0,3).toLowerCase()
    }
    else if (seconds > 60 * 60 * 24 * 7){
        var value = Math.floor(seconds / (60 * 60 * 24 * 7))
        return (value>1)? value + " wks" : value + " wk"
    }
    else if (seconds > 60 * 60 * 24){
        var value = Math.floor(seconds / (60 * 60 * 24))
        return (value>1)? value + " days" : value + " day"
    }
    else if (seconds > 60 * 60){
        var value = Math.floor(seconds / (60 * 60))
        return (value>1)? value + " hrs" : value + " hr"
    }
    else if (seconds > 60){
        var value = Math.floor(seconds / (60))
        return (value>1)? value + " mins" : value + " min"
    }
    else if (s > 1) return seconds + " secs"
    else return seconds + " sec"
}

const CARD_WIDTH = 0.7
const CARD_HEIGHT = 0.28
class CustomCard {
    constructor() {

        const HEIGHT = CARD_HEIGHT * SIZE_Y
        //Fields
        this.rotation = 0
        this.scaleX = 1
        this.scaleY = 1
        this.hidden_x = 0
        this.hidden_y = 0
        this.width = 0
        this.height = 0
        this.displayWidth = 0
        this.displayHeight = HEIGHT
        this.originX = 0
        this.originY = 0
        this.displayOriginX = 0
        this.displayOriginY = 0

        Object.defineProperty(this, 'x', {
            set: function (newX) {
                var diff = newX - this.hidden_x
                this.hidden_x = newX
                this.children.forEach(sprite => sprite.x += diff)
            },
            get: function () {
                return this.hidden_x
            },
        })
        Object.defineProperty(this, 'y', {
            set: function (newY) {
                var diff = newY - this.hidden_y
                this.hidden_y = newY
                this.children.forEach(sprite => sprite.y += diff)
            },
            get: function () {
                return this.hidden_y
            },
        })
    }

    setScrollFactor(x, y) {
        this.children.forEach(sprite => sprite.setScrollFactor(x, y))
    }

    on(event, fn, context) {
        this.children.forEach(sprite => sprite.on(event, fn, context))
    }

    off(event, fn, context) {
        this.children.forEach(sprite => sprite.off(event, fn, context))
    }

    destroy() {
        this.children.forEach(sprite => sprite.destroy())
    }
}

class LevelCard extends CustomCard {
    constructor(scene, levelData, shouldCheck) {
        super()

        if (getAndroid() && Android.getAge() < 18) {
            levelData.name = "Level " + levelData.id.substring(0, 3)
            levelData.authorName = levelData.authorName.substring(0, 3)
        }

        const WIDTH = SIZE_X * CARD_WIDTH
        const HEIGHT = SIZE_Y * CARD_HEIGHT
        if (!shouldCheck && scene.cardOverflow == undefined) {
            var testLevel = {}
            Object.assign(shouldCheck, levelData)
            testLevel.name = "AAAAAAAAAAAA"
            testLevel.authorName = "AAAAAAAAAAAA"
            testLevel.date = "2y"
            new LevelCard(scene, levelData, true).destroy()
        }

        this.children = []
        this.children.push(scene.rexUI.add.roundRectangle(0, 0, WIDTH, HEIGHT, getXY(0.04), COLOR_LIGHT).setStrokeStyle(getXY(0.01), COLOR_DARK, 1))

        // [Main info text]

        // Title
        const START_FIRST = -WIDTH / 2 + getXY(0.04)
        var title = scene.add.bitmapText(START_FIRST, -HEIGHT / 2 + getXY(0.08), 'voxel_font', levelData.name, 40 * MIN_XY / 600).setOrigin(0, 1).setTint(0)
        this.children.push(title)
        var remainingWidth = WIDTH - title.width - getXY(0.04)

        // Start button
        var startButton = scene.add.sprite(WIDTH / 2 - getXY(0.04), 0, 'menu', 'button_playtest_0').setScale(0.3 * MIN_XY / 600).setInteractive().setOrigin(1, 0.5).setDepth(50)
        startButton.on('pointerdown', () => {
            console.log("playing level " + levelData.id)
            Android.playLevel(levelData.id, false)
            scene.scene.start('GameScene', { levelIndex: levelData.id, levelString: levelData.levelString, public: true, levelName: levelData.name })
        })
        this.children.push(startButton)
        remainingWidth -= startButton.width * startButton.scaleX + getXY(0.04)

        // Details
        const START_DETAILS = START_FIRST + title.width * title.scaleX + getXY(0.06)
        const DETAILS_TEXT = "by " + levelData.authorName + ", " + getTimeLetter(levelData.submitDate)
        var detailsText = scene.add.bitmapText(START_DETAILS, -HEIGHT / 2 + getXY(0.08), 'voxel_font', DETAILS_TEXT, 28 * MIN_XY / 600).setOrigin(0, 1).setTint(0)
        this.children.push(detailsText)
        if (shouldCheck) { scene.cardOverflow = detailsText.width + getXY(0.06) > remainingWidth; return }
        else if (scene.cardOverflow) {
            detailsText.x = START_FIRST
            detailsText.y = 0
        }

        // [First column]

        // Vote bar
        const rateBarTexture = levelData.upvotes + levelData.downvotes <= 0 ? "rating20" : 'rating' + Math.floor(20 * levelData.upvotes / (levelData.upvotes + levelData.downvotes))
        var rateBar = scene.add.sprite(START_FIRST, HEIGHT / 2 - getXY(0.02), 'menu', rateBarTexture).setOrigin(0, 1).setScale(0.015 * WIDTH, 40)
        this.children.push(rateBar)

        // Vote text
        const BAR_WIDTH = rateBar.width * rateBar.scaleX
        const CENTER_FIRST = START_FIRST + BAR_WIDTH / 2
        var rateUpIcon = scene.add.sprite(0, HEIGHT * 0.15, 'menu', 'upvote').setScale(getXY(0.001) / 8).setOrigin(0, 0.5)
        var rateUpText = scene.add.bitmapText(0, HEIGHT * 0.15, 'voxel_font', levelData.upvotes, 30 * MIN_XY / 600).setOrigin(0, 0.5).setTint(0)
        var rateDownIcon = scene.add.sprite(0, HEIGHT * 0.15, 'menu', 'downvote').setScale(getXY(0.001) / 8).setOrigin(0, 0.5)
        var rateDownText = scene.add.bitmapText(0, HEIGHT * 0.15, 'voxel_font', levelData.downvotes, 30 * MIN_XY / 600).setOrigin(1, 0.5).setTint(0)
        const RATE_INFO_WIDTH = 2 * rateUpIcon.width * rateUpIcon.scaleX + rateUpText.width + rateDownText.width + 3 * getXY(0.02)
        rateUpIcon.x = CENTER_FIRST - RATE_INFO_WIDTH / 2
        rateUpText.x = rateUpIcon.x + rateUpIcon.width * rateUpIcon.scaleX + getXY(0.02)
        rateDownIcon.x = rateUpText.x + rateUpText.width + getXY(0.02)
        rateDownText.x = rateUpIcon.x + RATE_INFO_WIDTH
        this.children.push(rateUpIcon)
        this.children.push(rateUpText)
        this.children.push(rateDownIcon)
        this.children.push(rateDownText)

        // [Second column]

        const START_SECOND = START_FIRST + BAR_WIDTH + getXY(0.04)
        const clearBarTexture = levelData.plays <= 0 ? 'clear0' : 'clear' + Math.floor(20 * levelData.clears / levelData.plays)
        this.children.push(scene.add.sprite(START_SECOND, HEIGHT / 2 - getXY(0.02), 'menu', clearBarTexture).setOrigin(0, 1).setScale(0.015 * WIDTH, 40))

        const CENTER_SECOND = START_SECOND + BAR_WIDTH / 2
        var clearIcon = scene.add.sprite(0, HEIGHT * 0.15, 'menu', 'trophy').setScale(getXY(0.001) / 8).setOrigin(0, 0.5)
        var clearText = scene.add.bitmapText(0, HEIGHT * 0.15, 'voxel_font', 'Solved: ' + (levelData.plays <= 0 ? 0 : Math.round(levelData.clears / levelData.plays * 100)) + '%', 30 * MIN_XY / 600).setTint(0).setOrigin(1, 0.5)
        const CLEAR_INFO_WIDTH = clearIcon.width * clearIcon.scaleX + clearText.width * clearText.scaleX + getXY(0.02)
        clearIcon.x = CENTER_SECOND - CLEAR_INFO_WIDTH / 2
        clearText.x = CENTER_SECOND + CLEAR_INFO_WIDTH / 2
        this.children.push(clearIcon)
        this.children.push(clearText)
    }
}

class NextCard extends CustomCard {
    constructor(scene, lastLevel) {
        super()
        const WIDTH = SIZE_X * CARD_WIDTH
        const HEIGHT = SIZE_Y * CARD_HEIGHT // maybe make next card bigger?

        this.children = []
        this.children.push(scene.rexUI.add.roundRectangle(0, 0, WIDTH, HEIGHT, getXY(0.04), COLOR_LIGHT_GREEN).setStrokeStyle(getXY(0.01), COLOR_DARK_GREEN, 1))

        var title = scene.add.bitmapText(0, 0, 'voxel_font', "Next page", 60 * MIN_XY / 600).setOrigin(0.5, 0.5).setTint(0)
        this.children.push(title)

        // next button
        var nextButton = scene.add.sprite(WIDTH / 2 - getXY(0.04), 0, 'menu', 'button_playtest_0').setScale(0.3 * MIN_XY / 600).setInteractive().setOrigin(1, 0.5).setDepth(50)
        nextButton.on('pointerdown', () => {
            if (scene.sortOn == "submitDate") var startAt = lastLevel.submitDate - 1
            else if (scene.sortOn == "clearRatio") var startAt = lastLevel.clearRatio - 0.0001
            else if (scene.sortOn == "upvoteRatio") var startAt = lastLevel.upvoteRatio - 0.0001
            console.log("Going to next page with value" + startAt)
            scene.scene.restart({ sortOn: scene.sortOn, startAt: startAt.toString(), newPageRequest: true })
        })
        this.children.push(nextButton)
    }
}

// Accepts level data (or an error string if we couldn't fetch levels for any reason) from kotlin function
function receivePublicLevels(sortOn, levelData) {
    try {
        var newLevels = JSON.parse(levelData)
        PUBLIC_LEVELS[sortOn] = newLevels
    } catch (error) {
        PUBLIC_LEVELS[sortOn] = levelData
    }
}

function waitForLevels(sortOn) {
    PUBLIC_LEVELS[sortOn] = []
    return new Promise(function (resolve, reject) {
        (function checkLevels(timeSpentWaiting) {
            if (timeSpentWaiting > TIMEOUT_TRESHOLD) return reject("Connection timed out.")
            if (PUBLIC_LEVELS[sortOn].length > 0) { // We received an answer
                if (Array.isArray(PUBLIC_LEVELS[sortOn])) return resolve()
                else { // PUBLIC_LEVELS was accepted but it is not an array, meaning we assume it is an error string
                    var errorMessage = PUBLIC_LEVELS[sortOn]
                    PUBLIC_LEVELS[sortOn] = []
                    return reject(errorMessage)
                }
            }
            setTimeout(checkLevels, 50, timeSpentWaiting + 50)
        })(0)
    })
}