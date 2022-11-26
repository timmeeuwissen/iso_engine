export type tConfigTerrain = {
    dims: {
        x: number,
        z: number
    },
    level: {
        bedrock: number,
        water: number,
        snow: number,
        plane: number
    },
    tile: {
        width: number,
        line: CanvasRenderingContext2D
    }
}

export const Terrain = (config: tConfigTerrain) => {

}