import { tDrawable } from "../../Draw";

export const Map: tDrawable = (terrainConfig, map, mapCoords, ctx, terrain) => { 
        
    const draw_all = () => {
        // todo : convert to generator function
        map.iterate(terrain.draw_tile);
    }

    
    
    return { draw_all }
}