export default class Mouse {
  x: number
  y: number
  w: number
  h: number
  left: boolean
  right: boolean
  constructor(w: number, h: number) {
    this.x = this.y = 0
    this.w = w
    this.h = h
    this.left = this.right = false
  }

  move(e: MouseEvent){
    this.x = Math.floor()
  }
}