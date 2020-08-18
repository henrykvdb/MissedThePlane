const VOLUME_STEP = 0.3

class Audio{
    constructor(game) {
        this.started = false
        this.game = game
        this.volumeIndex = 2
        this.popupSounds = [this.game.sound.add('levelWon'), this.game.sound.add('levelFailed')]
    }

    playPopup(success) {
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

    toggleVolume() {
        this.volumeIndex = ++this.volumeIndex%4
        this.game.sound.volume = VOLUME_STEP * this.volumeIndex
    }

    start() {
        if(this.started) return
        this.started = true
        
        this.music = this.game.sound.add('music', { loop: true })
        this.music.play()
        this.game.sound.setVolume(this.volumeIndex * VOLUME_STEP)
        this.game.sound.pauseOnBlur = false
    }
}