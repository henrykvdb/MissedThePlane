const SIZE_X = 1000
const SIZE_Y = 600

//359x 208y for one block shift
const SHIFT_X = 147
const SHIFT_Y = 85

var config = {
    type: Phaser.AUTO,
    width: SIZE_X,
    height: SIZE_Y,
    scene: [ LoadingScene, GameScene, LevelSelectScene ]
}

var game = new Phaser.Game(config)
