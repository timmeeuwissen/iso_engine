import { tDrawable } from "../../Draw";
import { tConfigTerrain } from "../Terrain";
import { Map as WorldMap, tMapAt } from '../../Map';

export const Grid: tDrawable = (terrainConfig, map, mapCoords, ctx, terrain) => {    

    let drawInstructions: [number, number][] = [];

    const calculate = () => {
        drawInstructions = []
        let x:number, z:number
        for (x = 1; x <= terrainConfig.dims.x; x++) {
            for (z = 1; z <= terrainConfig.dims.z; z++) {
                if (!mapCoords.get(x, z)) {
                    drawInstructions.push([x, z]);
                }
            }
        }
        drawInstructions.forEach(([x, z]) => terrain.get_tileCoords(x, z));
    }

    const draw_all = () => {
        drawInstructions.forEach(([x, z]) => terrain.draw_tile(x, z));
    }


    return { calculate, draw_all }
}