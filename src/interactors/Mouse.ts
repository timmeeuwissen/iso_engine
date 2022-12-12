import { tInteractor } from "../tInteract"

export enum state {down, up, move}
export type observer = (x: number, y: number, state: state, me: MouseEvent) => void;

export const Mouse: tInteractor = (canvas: HTMLCanvasElement) => {

    const observers: observer[] = [];

    const mouseDown = (evt: MouseEvent) => observers.forEach((cb) => cb(evt.x, evt.y, state.down, evt))

    const mouseUp = (evt: MouseEvent) => observers.forEach((cb) => cb(evt.x, evt.y, state.up, evt))

    const mouseMove = (evt: MouseEvent) =>  observers.forEach((cb) => cb(evt.x, evt.y, state.move, evt))

    const attach = () => {
        canvas.onmousedown = mouseDown;
        canvas.onmouseup = mouseUp;
        canvas.onmousemove = mouseMove;
    }

    const observe = (cb: observer) => observers.push(cb); 

    return { attach, observe }
}

