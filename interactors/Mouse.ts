import { iInteract } from "../aInteract";

class InteractMouse implements iInteract {
    canvas: HTMLCanvasElement
    container: HTMLElement

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.container = canvas.parentElement || document.body;
    }

    mouseDown(ctx: GlobalEventHandlers, me: MouseEvent) {}

    mouseUp(ctx: GlobalEventHandlers, me: MouseEvent) {}

    mouseMove(ctx: GlobalEventHandlers, me: MouseEvent) {}

    attach() {
        // this.container.onmousemove?.(this.mouseMove);
        // this.container.onmouseup?.(this.mouseUp);
        // this.container.onmousedown?.(this.mouseDown);
    }
}

export { InteractMouse }