declare module "vanta/dist/vanta.dots.min" {
  export type VantaDotsOptions = {
    el: HTMLElement
    THREE?: unknown
    color?: number
    color2?: number
    backgroundColor?: number
    backgroundAlpha?: number
    size?: number
    spacing?: number
    showLines?: boolean
    mouseControls?: boolean
    touchControls?: boolean
    gyroControls?: boolean
    minHeight?: number
    minWidth?: number
    scale?: number
    scaleMobile?: number
  }

  export type VantaDotsEffect = {
    destroy: () => void
    resize: () => void
  }

  const DOTS: (options: VantaDotsOptions) => VantaDotsEffect

  export default DOTS
}
