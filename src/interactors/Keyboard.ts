import { tInteractor } from "../tInteract"

export type observer = (key: string, evt: KeyboardEvent) => void;

export const Keyboard: tInteractor = (canvas: HTMLCanvasElement) => {

    const observers: observer[] = [];

    const keyDown = (evt: KeyboardEvent) => observers.forEach(cb => cb(evt.key, evt))

    const attach = () => {
        window.document.onkeydown = keyDown;
    }

    const observe = (cb: observer) => observers.push(cb); 

    return { attach, observe }
}

