import { Color, RandomColor } from "./Color";
import { BALLS_FROM_EXPLOSION_MAX, BALLS_FROM_EXPLOSION_MIN, BALL_ABSORB_RESISTANCE_HANDICAP_MULTIPLIER, BALL_EXPLOSION_ON_ABSORB, BALL_EXPLOSION_ON_VOLUME, BALL_MAX_ABSORBS, BALL_MAX_SPAWN_VOLUME, BALL_MAX_VOLUME, BALL_MIN_SPAWN_VOLUME, BALL_SPEED } from "./Constants";
import { randomFromInclusiveRange } from "./functions";
import { Point } from "./MiscTypes";


export class Ball {
    private _volume!: number;
    private _radius!: number;
    speedMultiplier: number;
    speed: number;
    velocity: Point;
    public get volume(): number {
        return this._volume;
    }
    public set volume(value: number) {
        this._volume = Math.max(0, value);
        this._radius = Math.cbrt((value * 3) / (4 * Math.PI));
    }

    private get radius(): number {
        return this._radius;
    }
    
    
    private _direction! : Point;
    public get direction() : Point {
        return this._direction;
    }
    public set direction(v : Point) {
        const length = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
        this._direction = {x: v.x / length, y: v.y / length}
    }

    
    private _absorbCount = 0;
    public get absorbCount() : number {
        return this._absorbCount;
    }
    private set absorbCount(v : number) {
        this._absorbCount = v;
    }
    
    
    private position: Point;
    
    color: Color;

    public beenAbsorbed = false;

    constructor(volume: number, color: Color, position: Point, directionDeg: number) {
        this.volume = volume;
        this.color = color;
        this.position = position;
        this.direction = {x: Math.cos(directionDeg), y: Math.sin(directionDeg)}
        this.speedMultiplier = Math.random() * 4;
        // this.speed = BALL_SPEED * this.speedMultiplier;
        this.speed = BALL_SPEED * Math.exp(this.speedMultiplier)
        this.velocity = {x: this.direction.x * this.speed, y: this.direction.y * this.speed}
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.arc(this.position.x,
                this.position.y,
                this.getRadius(),
                0,
                2 * Math.PI
             );
        // ctx.fillStyle = this.color.toHexString();
        ctx.fillStyle = this.color.toRGBAString(0.5);
        ctx.fill();
    }

    getRadius() {
        return Math.cbrt((this.volume * 3) / (4 * Math.PI));
    }

    updatePosition(newPosition: Point): void {
        this.position = newPosition;
    }

    advancePosition(): void {
        // this.position = {
        //     x: this.position.x + this.direction.x * this.speed,
        //     y: this.position.y + this.direction.y * this.speed
        // }
        this.position = {
            x: this.position.x + this.velocity.x,
            y: this.position.y + this.velocity.y
        }
    }

    handleCollisionWithRect(topLeft: Point, bottomRight: Point) {
        if (this.position.x - this.radius <= topLeft.x || this.position.x + this.radius >= bottomRight.x) {
            this.direction = {x: -this.direction.x, y: this.direction.y}
            this.velocity = {x: -this.velocity.x, y: this.velocity.y}
        }
        if (this.position.y - this.radius <= topLeft.y || this.position.y + this.radius >= bottomRight.y) {
            this.direction = {x: this.direction.x, y: -this.direction.y}
            this.velocity = {x: this.velocity.x, y: -this.velocity.y}
        }
        // alla oleva omaan metodiinsa
        this.position = {
            x: Math.max(topLeft.x + this.radius, Math.min(this.position.x, bottomRight.x - this.radius)),
            y: Math.max(topLeft.y + this.radius, Math.min(this.position.y, bottomRight.y - this.radius)),
        }
    }

    canReach(ball: Ball): boolean {
        return Math.sqrt(Math.pow(ball.position.x - this.position.x, 2) + Math.pow(ball.position.y - this.position.y, 2)) <= this.radius;
    }

    coversCompletely(ball: Ball): boolean {
        return Math.sqrt(Math.pow(ball.position.x - this.position.x, 2) + Math.pow(ball.position.y - this.position.y, 2)) <= this.radius - ball.radius;
    }

    absorb(absorded: Ball): void {
        if (this.volume <= absorded.volume * BALL_ABSORB_RESISTANCE_HANDICAP_MULTIPLIER) return;
        this.volume = this.volume + absorded.volume;
        this.color.mixWeighted(absorded.color, absorded.volume, this.volume);
        absorded.beenAbsorbed = true;
        this.absorbCount = this.absorbCount + 1;
        this.velocity = {
            x: (this.velocity.x * this.volume + absorded.velocity.x * absorded.volume) / (this.volume + absorded.volume),
            y: (this.velocity.y * this.volume + absorded.velocity.y * absorded.volume) / (this.volume + absorded.volume)
        }
    }

    handleStatusChanges(): Ball[] {
        if (this.beenAbsorbed) {
            return [];
        }
        if ((BALL_EXPLOSION_ON_ABSORB && BALL_MAX_ABSORBS < this.absorbCount) 
            || (BALL_EXPLOSION_ON_VOLUME && BALL_MAX_VOLUME < this.volume)) {
            return this.explode();
        }
        return Array.of(this);
    }

    explode(): Ball[] {
        let volume = this.volume;
        const newBallsAmount = randomFromInclusiveRange(BALLS_FROM_EXPLOSION_MIN, BALLS_FROM_EXPLOSION_MAX)
        const initialBallVolume = (volume / newBallsAmount / 2)
        const newBallVolumes: number[] = new Array(newBallsAmount).fill(initialBallVolume);
        volume -= newBallsAmount * initialBallVolume;
        let i = 0;
        while (volume > 0) {
            const newVol = Math.min(volume, randomFromInclusiveRange(BALL_MIN_SPAWN_VOLUME, BALL_MAX_SPAWN_VOLUME));
            newBallVolumes[i] += newVol;
            volume -= newVol;
            i = (i + 1) % (newBallsAmount - 1)
        }
        const newPosDegGap = 360 / newBallVolumes.length;
        return newBallVolumes.map((v, i) => {
            const position: Point = {x: this.position.x + Math.cos(newPosDegGap * i) * this.radius, y: this.position.y + Math.sin(newPosDegGap * i) * this.radius}

            // return new Ball(v, new RandomColor(), position, newPosDegGap * i)

            return new Ball(v,
                 new Color(this.color.r + Math.floor(Math.random() * 120 - 60), 
                           this.color.g + Math.floor(Math.random() * 120 - 60), 
                           this.color.b + Math.floor(Math.random() * 120 - 60)), 
                 position, 
                 newPosDegGap * i)

            // return new Ball(v, new Color(this.color.r, this.color.g, this.color.b), position, newPosDegGap * i)
        })
    }
}
