import { Ball } from "./Ball";
import { RandomColor } from "./Color";
import { Point } from "./MiscTypes";
import { randomFromInclusiveRange } from "./functions";
import { BALL_MAX_SPAWN_VOLUME, BALL_MIN_SPAWN_VOLUME } from "./Constants";

export function generateBalls(amount: number, minPos: Point, maxPos: Point): Ball[] {
    const balls: Ball[] = [];
    for (let i = 0; i < amount; i++) {
        balls.push(new Ball(
            // TODO: valiaikainen mysteerivakio
            randomFromInclusiveRange(BALL_MIN_SPAWN_VOLUME, BALL_MAX_SPAWN_VOLUME), 
            new RandomColor(), 
            clampedRandomPosition(minPos, maxPos),
            randomDirection(),
        ))
    }
    return balls;
}

function clampedRandomPosition(min: Point, max: Point): Point {
    return {
        x: randomFromInclusiveRange(min.x, max.x),
        y: randomFromInclusiveRange(min.y, max.y)
    }
}

function randomDirection(): number {
    return randomFromInclusiveRange(0, 359);
}
