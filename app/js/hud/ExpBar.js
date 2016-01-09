
export default class ExpBar extends THREE.Object3D {

  constructor () {
    super()

    this.blankPixelArea = 1

    this.fg = new THREE.Sprite(new THREE.SpriteMaterial({
      map: ResourceManager.get("hud-exp-bar-fill"),
      transparent: true
    }))
    this.fg.material.opacity = 0.85
    this.add(this.fg)

    this.bg = new THREE.Sprite(new THREE.SpriteMaterial({
      map: ResourceManager.get("hud-exp-bar-bg") ,
      transparent: true
    }))
    this.bg.material.opacity = 0.5
    this.add(this.bg)

    this.scale.set(this.bg.material.map.image.width * HUD_SCALE, this.bg.material.map.image.height * HUD_SCALE, 1)

    this.width = (this.bg.material.map.image.width * HUD_SCALE) / 2
    this.height = (this.bg.material.map.image.height * HUD_SCALE) / 2

    this.set(0)
  }

  set (percentage) {
    var totalHeight = this.bg.material.map.image.height
      , unusableHeight = this.blankPixelArea
      , usableHeight = totalHeight - unusableHeight
      , usableRatio = ((totalHeight - unusableHeight * 2)/totalHeight)

    var finalPercentage = (unusableHeight/totalHeight) + (usableRatio - (percentage * usableRatio)) // (unusableHeight/totalHeight) // - (0.6*usableRatio)
    var randWaitTime = 1000 + (Math.random() * 1000)

    this.fg.material.map.offset.x = -finalPercentage
    this.fg.position.x = -finalPercentage
  }

}


