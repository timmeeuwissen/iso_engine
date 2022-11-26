import { tConfigTerrain } from "./draw/Terrain"

type tConfigCanvas = {
    width: number,
    height: number
}


type tConfig = {
    canvas: tConfigCanvas,
    terrain: tConfigTerrain
}

export { tConfig, tConfigCanvas }