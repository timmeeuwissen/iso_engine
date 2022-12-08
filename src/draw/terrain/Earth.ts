import { tDrawable } from "../../Draw";
import { tCoord } from "../MapCoords";

export const Earth: tDrawable = (terrainConfig, map, mapCoords, ctx, terrain) => {    

    const draw_all = () => {
        type tCoordsAndRefs = {x: number, z:number, point: tCoord}

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
                        point: tuple[1].slanted.bottom
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
            ).reverse()
        ].forEach((edges) => {
            const earthPoints: tCoord[] = edges.reduce((acc, edge) => {  return [...acc, edge.point] }, [] as tCoord[]);
            // the right side
            const 
                firstTile = map.get(edges[0].x, edges[0].z),
                lastTile = map.get(edges[edges.length-1].x, edges[edges.length-1].z),
                lastCoords = edges[edges.length-1];
            earthPoints.push(
                [   lastCoords.point[0],
                    lastCoords.point[1] + 
                        ((lastTile?.level || terrainConfig.level.plane) - terrainConfig.level.bedrock) *
                        terrain.tileDraw.y
                ],
                [   edges[0].point[0],
                    edges[0].point[1] + 
                        ((firstTile?.level || terrainConfig.level.plane) - terrainConfig.level.bedrock) *
                        terrain.tileDraw.y
                ],
                edges[0].point
            )

            draw(earthPoints);
        })
    }
    
    const draw = (earthPoints: tCoord[]) => {
        terrain.draw_lines(earthPoints);

        ctx.fillStyle = '#964B00';
        ctx.fill();
    }

    return { draw_all }
}