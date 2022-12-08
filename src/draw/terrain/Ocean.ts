import { tDrawable } from "../../Draw";
import { tMapAt } from "../../Map";
import { tCoord } from "../MapCoords";
import { Water } from "./Water";

type tCoordsAndRefs = {x: number, z:number, point: tCoord}

export const Ocean: tDrawable = (terrainConfig, map, mapCoords, ctx, terrain) => {    
    const water = Water(terrainConfig, map, mapCoords, ctx, terrain);
    let drawInstructions: tCoord[] = [];

    const calculate = () => {
        [
            Object.entries(mapCoords.getAll()).reduce(
                (acc, tuple) => {
                    acc.push({
                        x: tuple[0] as unknown as number, 
                        z: 1,
                        point:tuple[1][1].slanted.bottom
                    });
                    if (tuple[0] == terrainConfig.dims.x.toString()) {
                        acc.push({
                            x: tuple[0] as unknown as number, 
                            z: 1,
                            point:tuple[1][1].slanted.right
                        });
                    }
                    return acc;
                }, 
                [] as tCoordsAndRefs[]
            ),
            Object.entries(mapCoords.getAll()[1]).reduce(
                (acc, tuple) => { 
                    acc.push({
                        x: 1, 
                        z: parseInt(tuple[0] as unknown as string),
                        point: tuple[1].slanted.bottom,
                    }); 
                    if (tuple[0] == terrainConfig.dims.z.toString()) {
                        acc.push({
                            x: 1, 
                            z: parseInt(tuple[0] as unknown as string),
                            point: tuple[1].slanted.left
                        });     
                    }                    
                    return acc;
                },
                [] as tCoordsAndRefs[]
            )
        ].forEach((edges) => {
            drawInstructions = edges
                .reduce((acc, edge, edgeIndex) => {
                    // todo: check against previous point
                    const 
                        curTile = map.get(edge.x, edge.z),
                        prevTile = map.get(edges[edgeIndex-1]?.x, edges[edgeIndex-1]?.z);
                    if (curTile && (
                            (typeof curTile.level != 'undefined' && curTile.level <= terrainConfig.level.water) ||
                            (curTile.hitRecord && typeof curTile.hitRecord.level != 'undefined' && curTile.hitRecord.level <= terrainConfig.level.water) ||
                            (prevTile && typeof prevTile.level != 'undefined' && prevTile.level <= terrainConfig.level.water)
                        )) {
                        acc.push(edge.point);
                        console.log(curTile, edge, prevTile, edges[edgeIndex-1])
                    }
                    return acc
                }, 
                [] as tCoord[]
            );

        })
    }
    
    const draw_all = () => {
        water.draw(drawInstructions);
    }

    return { calculate, draw_all }
}