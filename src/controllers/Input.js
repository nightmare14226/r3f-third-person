export default class InputController {
  _axes = [0, 0, 0, 0]

  gamepad
  add(gamepad) {
    this.gamepad = gamepad
  }

  get axes() {
    return this.gamepad?.axes || this._axes
  }

  set axes(v) {
    return v
  }

  setAxis(n, v) {
    this._axes[n] = v
  }

  update() {
    this.buttons = this.gamepad?.buttons
  }
}
