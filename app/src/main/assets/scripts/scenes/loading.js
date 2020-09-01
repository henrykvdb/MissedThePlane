var audio
class LoadingScene extends Phaser.Scene {

    constructor() {
        super({ key: 'LoadingScene' });
    }

    preload() {
        //Draw loading scene
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#59AACA")
        this.splash = this.add.sprite(SIZE_X / 2, SIZE_Y / 2, 'splash').setScale(MIN_XY / 800).setDepth(100);

        if (getAndroid()) Android.getNewUserIdIfNeeded() // Every time we launch, we check if we have no id so we can create one if this is first time launch

        // Load fonts
        this.load.bitmapFont('voxel_font', 'assets/voxel_font.png', 'assets/voxel_font.fnt')

        // Load menu assets
        this.load.image('btn_next', 'assets/menu/button_next.png')
        this.load.image('btn_restart', 'assets/menu/button_restart.png')
        this.load.image('btn_interact', 'assets/menu/button_interact.png')
        this.load.image('btn_removeads', 'assets/menu/button_removeads.png')
        this.load.image('btn_rotate_world', 'assets/menu/button_rotate_world.png')
        this.load.image('btn_rotate', 'assets/menu/button_rotate.png')
        this.load.image('btn_wrench', 'assets/menu/button_wrench.png')
        this.load.image('btn_menu', 'assets/menu/button_menu.png')
        this.load.image('btn_back', 'assets/menu/button_back.png')
        this.load.image('btn_main_campaign', 'assets/menu/button_main_campaign.png')
        this.load.image('btn_main_browser', 'assets/menu/button_main_browser.png')
        this.load.image('btn_main_editor', 'assets/menu/button_main_editor.png')
        this.load.image('btn_main_about', 'assets/menu/button_main_about.png')
        this.load.image('btn_main_menu', 'assets/menu/button_main_menu.png')
        this.load.image('btn_settings', 'assets/menu/button_settings.png')
        this.load.image('btn_delete', 'assets/menu/button_delete.png')
        this.load.image('btn_select_play', 'assets/menu/button_select_play.png')
        this.load.image('upvote', 'assets/menu/upvote.png')
        this.load.image('btn_upvote_square', 'assets/menu/button_upvote_square.png')
        this.load.image('downvote', 'assets/menu/downvote.png')
        this.load.image('btn_downvote_square', 'assets/menu/button_downvote_square.png')
        this.load.image('trophy', 'assets/menu/trophy.png')
        this.load.image('arrow_down', 'assets/tutorial/arrow_down.png')
        for (var i = 0; i < 4; i++) this.load.image('btn_volume_' + i, 'assets/menu/button_volume_' + i + '.png')
        this.load.image('sort_upvote', 'assets/menu/button_sort_upvote.png')
        this.load.image('sort_clear', 'assets/menu/button_sort_trophy.png')
        this.load.image('sort_date', 'assets/menu/button_sort_date.png')
        this.load.image('star', 'assets/menu/star.png')
        this.load.image('rate_balloon', 'assets/menu/rate_balloon.png')
        for (var i = 0; i < 2; i++) this.load.image('btn_publish_' + i, 'assets/menu/button_publish_' + i + '.png')
        for (var i = 0; i < 2; i++) this.load.image('btn_select_edit_' + i, 'assets/menu/button_select_edit_' + i + '.png')
        for (var i = 0; i < 2; i++) this.load.image('btn_playtest_' + i, 'assets/menu/button_playtest_' + i + '.png')
        for (var i = 0; i < 2; i++) this.load.image('btn_save_' + i, 'assets/menu/button_save_' + i + '.png')
        for (var i = 0; i < 2; i++) this.load.image('btn_plus_' + i, 'assets/menu/button_plus_' + i + '.png')
        for (var i = 0; i < 2; i++) this.load.image('btn_minus_' + i, 'assets/menu/button_minus_' + i + '.png')
        for (var i = 0; i < 2; i++) this.load.image('btn_shift_toggle_' + i, 'assets/menu/button_shift_toggle_' + i + '.png')
        for (var i = 0; i < 5; i++) this.load.image('btn_level_' + i, 'assets/menu/button_level_' + i + '.png')
        for (var i = 0; i < 4; i++) this.load.image('btn_shift_' + i, 'assets/menu/button_shift_' + i + '.png')
        for (var i = 0; i < 6; i++) this.load.image('tutorial1' + i, 'assets/tutorial/turn' + i + '.png')
        for (var i = 0; i < 2; i++) this.load.image('tutorial2' + i, 'assets/tutorial/button' + i + '.png')
        for (var i = 0; i < 21; i++) this.load.image('rating' + i, 'assets/menu/progress_bars/rating' + i + '.png') // yikes
        for (var i = 0; i < 21; i++) this.load.image('clear' + i, 'assets/menu/progress_bars/clear' + i + '.png')
        this.load.image('btn_level_home', 'assets/menu/button_level_home.png')
        this.load.image('level_complete', 'assets/menu/level_complete.png')
        this.load.image('level_failed', 'assets/menu/level_failed.png')
        this.load.image('pilot_tip', 'assets/menu/pilot_tip.png')
        this.load.image('select_arrow', 'assets/menu/select_arrow.png')

        // Load terain tile assets
        for (var i = 0; i < 7; i++) this.load.image('grass' + i, 'assets/tiles/grass' + i + '.png')
        for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) this.load.image('mountain' + i + j, 'assets/tiles/mountain' + i + j + '.png')
        for (var i = 0; i < 4; i++) this.load.image('mountainwater' + i, 'assets/tiles/mountainwater' + i + '.png')
        for (var i = 0; i < 4; i++) this.load.image('oneway' + i, 'assets/tiles/oneway' + i + '.png')

        // Load runway
        for (var i = 0; i < 4; i++) this.load.image('stripend' + i, 'assets/tiles/stripend' + i + '.png')
        for (var i = 0; i < 4; i++) this.load.image('stripstart' + i, 'assets/tiles/stripstart' + i + '.png')
        for (var i = 0; i < 2; i++) this.load.image('stripmiddle' + i, 'assets/tiles/stripmiddle' + i + '.png')

        //Special
        for (var i = 0; i < 4; i++) this.load.image('misc' + i, 'assets/tiles/wallhalf' + i + '.png')
        this.load.image('misc4', 'assets/tiles/clockdrawer.png')
        this.load.image('misc5', 'assets/tiles/bed0.png')
        this.load.image('misc6', 'assets/tiles/bed1.png')

        this.load.image('plank', 'assets/tiles/plank.png')
        this.load.image('water', 'assets/tiles/water.png')
        this.load.image('highlight', 'assets/tiles/highlight.png')
        for (var i = 0; i < 2; i++)  ['r','b'].forEach(suffix => {this.load.image('button' + i + suffix, 'assets/tiles/button'+ i + suffix + '.png')});

        // Load entitiy assets
        this.load.multiatlas('pilot', 'assets/entities/pilot.json', 'assets/entities/');
        for (var i = 0; i < 8; i++) this.load.image('plane' + i, 'assets/entities/plane' + i + '.png')
        this.load.image('shadow', 'assets/entities/shadow.png')

        // Load audio
        this.load.audio('music', ['assets/audio/music.ogg'])
        this.load.audio('levelFailed', ['assets/audio/levelFailed.ogg'])
        this.load.audio('levelWon', ['assets/audio/levelWon.ogg'])
        this.load.audio('buttonUp', ['assets/audio/buttonUp.ogg'])
        this.load.audio('buttonDown', ['assets/audio/buttonDown.ogg'])
        this.load.audio('buttonBlocked', ['assets/audio/buttonBlocked.ogg'])
    }

    create() {
        audio = new Audio(this)
        this.scene.start('MenuScene')
    }
}

function getX(ratioX) {
    return SIZE_X * ratioX
}

function getY(ratioY) {
    return SIZE_Y * ratioY
}

function getXY(ratio) {
    return MIN_XY * ratio
}

// Function to avoid ugly reference errors
function getAndroid(){
    if(typeof Android === "undefined") return undefined
    else return Android
}

function pauseSound(){
    if (audio && audio.music) audio.music.pause()
}

function resumeSound(){
    if (audio && audio.music) audio.music.resume()
}
