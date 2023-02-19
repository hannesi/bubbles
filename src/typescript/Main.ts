import { CanvasController } from "./CanvasController";
import { BALL_COUNT, CANVAS_HEIGHT, CANVAS_WIDTH, FPS } from "./Constants";

window.onload = () => {
    console.log('Howdy Bubbles!');
    document.getElementById('start-button')?.addEventListener('click', () => {
        const ballsAmountInput = document.getElementById('balls-amount') as HTMLInputElement;
        const ballsAmount: number = Number.parseInt(ballsAmountInput.value);
        const element = document.getElementById('pre-launch');
        element?.parentNode?.removeChild(element);
        play(ballsAmount)
    })
}

function play(ballsAmount: number) {
    const cc: CanvasController = new CanvasController('main-canvas', window.innerWidth - 25, window.innerHeight - 25, ballsAmount);
    cc.render();
    window.setInterval(() => { cc.updateBalls(); cc.render()}, 1000/FPS)
}
