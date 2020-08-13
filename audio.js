const VOLUME_STEP = 0.3

function Audio(game) {

    this.playPopup = function(success) {
        this.game.tweens.add({ // fade out current music
            delay: 0,
            targets: this.music,
            volume: 0,
            duration: 400
          })
        this.popupSounds[success ? 0 : 1].play()
        this.game.tweens.add({  // fade music back in
            delay: 3150,
            targets: this.music,
            volume: 1,
            duration: 1000
        });
    }

    this.toggleVolume = function() {
        this.volumeIndex = ++this.volumeIndex%4
        this.game.sound.volume = VOLUME_STEP * this.volumeIndex
    }

    this.start = function() {
        this.music = this.game.sound.add('music', { loop: true })
        this.music.play()
        this.game.sound.setVolume(this.volumeIndex * VOLUME_STEP)
        this.game.sound.pauseOnBlur = false
    }

    // init
    this.game = game
    this.volumeIndex = 2
    this.popupSounds = [this.game.sound.add('levelWon'), this.game.sound.add('levelFailed')]
}