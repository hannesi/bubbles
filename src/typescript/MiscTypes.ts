import { Ball } from "./Ball"

export type Point = {
    x: number,
    y: number
}

export type AbsorbEvent = {
    absorber: Ball,
    absorded: Ball
}