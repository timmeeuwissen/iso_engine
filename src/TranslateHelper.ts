import { tMapConfig } from "./Map";

export const TranslateHelper = (mapConfig: tMapConfig) => {
    const cartesian_to_tile = (x: number, y: number) => {

    }

    const iso_to_cartesian = (x: number, z: number, y: number) => {
        return {
            x: x,
            y: y,
        }
    }

    return { cartesian_to_tile, iso_to_cartesian }
}
