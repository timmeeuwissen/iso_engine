import { tCoord } from "./draw/MapCoords";
import { tConfigTerrain } from "./draw/Terrain";
import { Map } from "./Map";

export const TranslateHelper = (map: ReturnType<typeof Map>, terrainConfig: tConfigTerrain) => {
    
    const plane_iso_tile_dims = {
        // calculate pythagorian length of the line between bottom and left
        x: Math.sqrt(Math.pow(terrainConfig.tile.width / 2 / 2, 2) + Math.pow(terrainConfig.tile.width / 3 * 2 / 2, 2)),
        z: Math.sqrt(Math.pow(terrainConfig.tile.width / 2 / 2, 2) + Math.pow(terrainConfig.tile.width / 3 * 2 / 2, 2)),
        y: terrainConfig.tile.width / 3 * 2 / 2
    }
    
    const iso_to_tile = (x: number, z: number, y: number) => {
        return {
            x: Math.floor(x / plane_iso_tile_dims.x) + 1,
            z: Math.floor(z / plane_iso_tile_dims.z) + 1,
            y: Math.floor(y / plane_iso_tile_dims.y),
            offsetPct: {
                x: (100 / plane_iso_tile_dims.x) * x - Math.floor(x / plane_iso_tile_dims.x),
                z: (100 / plane_iso_tile_dims.z) * z - Math.floor(z / plane_iso_tile_dims.z)
            }
        }
    }

    const iso_to_cartesian = (x: number, z: number, y: number) => {
        // height of a tile is width / 3 * 2.
        return {
            x: x - (z / 3 * 2),
            y: (x / 3 * 2) + z,
        }
    }


    return { iso_to_tile, iso_to_cartesian }
}
