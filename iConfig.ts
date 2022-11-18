interface iConfigTerrain {
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
        height: number
    }
}

interface iConfigCanvas {
    width: number,
    height: number
}


interface iConfig {
    canvas: iConfigCanvas,
    terrain: iConfigTerrain
}

export { iConfig, iConfigCanvas, iConfigTerrain }