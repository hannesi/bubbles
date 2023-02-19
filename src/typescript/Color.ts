export class Color {
    private _r!: number;
    private set r(value: number) {
        this._r = Math.min(255, Math.max(0, value));
    }
    public get r(): number {
        return this._r;
    }

    private _g!: number;
    private set g(value: number) {
        this._g = Math.min(255, Math.max(0, value));
    }
    public get g(): number {
        return this._g;
    }

    private _b!: number;
    private set b(value: number) {
        this._b = Math.min(255, Math.max(0, value));
    }
    public get b(): number {
        return this._b;
    }

    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    private get2DigitHexString(value: number): string {
        return ('00' + value.toString(16)).slice(-2);
    }

    toHexString(): string {
        return '#'.concat(this.get2DigitHexString(this.r), this.get2DigitHexString(this.g), this.get2DigitHexString(this.b));
    }

    toRGBAString(alpha: number): string {
        const a = Math.max(0, Math.min(alpha, 1))
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${a})`
    }

    debug() {
        console.log('db')
        console.log(this._r, this._g, this._b);
    }

    mixWeighted(mixColor: Color, mixWeight: number, ownWeight: number) {
        this.r = this.weightedAverage(this.r, ownWeight, mixColor.r, mixWeight);
        this.g = this.weightedAverage(this.g, ownWeight, mixColor.g, mixWeight);
        this.b = this.weightedAverage(this.b, ownWeight, mixColor.b, mixWeight);
    }
    private weightedAverage(v1: number, w1: number, v2: number, w2: number) {
        return Math.round(((v1 * w1) + (v2 * w2)) / (w1 + w2));
    }
}


export class RandomColor extends Color {
    constructor() {
        super(
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
        )
    }
}