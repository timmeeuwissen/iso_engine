import { aInteract } from "../aInteract";

class InteractMouse extends aInteract {

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