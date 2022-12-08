import { tDrawable } from "../../Draw";

export const Map: tDrawable = (terrainConfig, map, mapCoords, ctx, terrain) => { 
    const calculate = () => map.iterate(terrain.get_tileCoords);

    // todo : convert to generator function
    const draw_all = () =>  map.iterate(terrain.draw_tile);
    
    return { calculate, draw_all }
}