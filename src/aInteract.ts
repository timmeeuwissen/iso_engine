abstract class aInteract {
    canvas: HTMLCanvasElement
    container: HTMLElement

    constructor (canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.container = canvas.parentElement || document.body;
    };
    attach() {};
}

export { aInteract }