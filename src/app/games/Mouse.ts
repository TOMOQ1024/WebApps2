export default class Mouse {
  x: number
  y: number
  w: number
  h: number
  left: boolean
  right: boolean
  constructor(w=0, h=0) {
    this.x = this.y = 0
    this.w = w
    this.h = h
    this.left = this.right = false
  }

  move(e: MouseEvent){
    const rect = (e.target as unknown as HTMLElement).getBoundingClientRect()
    if(this.w && this.h){
      this.x = Math.floor((e.clientX - rect.left) * this.w / rect.width)
      this.y = Math.floor((e.clientY - rect.top) * this.h / rect.height)
    }
    else{
      this.x = (e.clientX - rect.left) / rect.width
      this.y = (e.clientY - rect.top) / rect.height
    }
  }
}