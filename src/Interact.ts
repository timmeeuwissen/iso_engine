import { tInteractor } from "./tInteract"
import { Keyboard as KeyboardInteractor } from "./interactors/Keyboard"
import { Mouse as MouseInteractor } from "./interactors/Mouse"


export const Interact = (canvas: HTMLCanvasElement) => {
    
    const interactors = {
        Keyboard: KeyboardInteractor(canvas),
        Mouse: MouseInteractor(canvas),
    }

    Object.values(interactors).forEach(interactor => interactor.attach())

    return { interactors }
}