function Pilot(game, coords) {
    this.coords = coords
    this.game = game

    this.sprite = createSprite(game, coords[0], coords[1], 'pilot4')
    this.sprite.setScale(this.sprite.scaleX / 1.5)
    
}