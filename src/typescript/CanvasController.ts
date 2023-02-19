import { Ball } from "./Ball";
import { generateBalls } from "./BallGenerator";
import { AbsorbEvent } from "./MiscTypes";

export class CanvasController {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    balls: Ball[];
    constructor(canvasId: string, width: number, height: number, initialBallCount: number) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.canvas.width = this.width = width;
        this.canvas.height = this.height = height;
        this.balls = generateBalls(initialBallCount, {x: 0, y: 0}, {x: width, y: height});
    }
    render() {
        // this.ctx.clearRect(0, 0, this.width, this.height)
        this.ctx.fillStyle = "#050020"
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.balls.forEach(b => b.render(this.ctx));
    }
    updateBalls() {
        this.balls.forEach(b => {
            b.advancePosition();
            b.handleCollisionWithRect({x: 0, y: 0}, {x: this.width, y: this.height})
            const absorbEvents: AbsorbEvent[] = this.findAbsorbEvents();
            this.handleAbsorbEvents(absorbEvents);
            // if (this.balls.length <= 1) { this.balls = this.balls[0].explode()}
        })
        console.log(this.balls.reduce((acc, cur) => {
            return acc + cur.volume
        }, 0))
    }
    private handleAbsorbEvents(evs: AbsorbEvent[]) {
        evs.forEach(e => e.absorber.absorb(e.absorded));
        this.balls = this.balls.reduce((acc: Ball[], cur: Ball)  => {
            return acc.concat(cur.handleStatusChanges())
        }, [])
    }
    private findAbsorbEvents(): AbsorbEvent[] {
        const events: AbsorbEvent[] = [];
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = 0; j < this.balls.length; j++) {
                if (i !== j && this.balls[i].coversCompletely(this.balls[j])) {
                    events.push({absorber: this.balls[i], absorded: this.balls[j]})
                }
            }
        }
        return events;
    }
}