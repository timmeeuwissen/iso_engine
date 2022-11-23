type tConfigTerrain = {
    dims: {
        x: number,
        z: number
    },
    level: {
        water: number,
        snow: number,
        plane: number
    },
    tile: {
        width: number,
        height: number,
        line: CanvasRenderingContext2D
    }
}

type tConfigCanvas = {
    width: number,
    height: number
}


type tConfig = {
    canvas: tConfigCanvas,
    terrain: tConfigTerrain
}

export { tConfig, tConfigCanvas, tConfigTerrain }