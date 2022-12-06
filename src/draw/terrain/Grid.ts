import { tDrawable } from "../../Draw";
import { tConfigTerrain } from "../Terrain";
import { Map as WorldMap, tMapAt } from '../../Map';

export const Grid: tDrawable = (terrainConfig, map, mapCoords, ctx, terrain) => {    

    const draw = () => {
        let x:number, z:number
        for (x = 1; x <= terrainConfig.dims.x; x++) {
            for (z = 1; z <= terrainConfig.dims.z; z++) {
                if (!mapCoords.get(x, z)) {
                    terrain.draw_tile(x, z)
                }
            }
        }
    }


    return { draw }
}