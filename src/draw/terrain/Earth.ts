import { tDrawable } from "../../Draw";
import { tCoord } from "../MapCoords";

type tCoordsAndRefs = {x: number, z:number, point: tCoord}

export const Earth: tDrawable = (terrainConfig, map, mapCoords, ctx, terrain) => {    

    let drawInstructions:tCoord[] = [];

    const calculate = () => {
        drawInstructions = [];
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
            drawInstructions = [...drawInstructions, ...edges.reduce((acc, edge) => {  return [...acc, edge.point] }, [] as tCoord[])];
            // the right side
            const 
                firstTile = map.get(edges[0].x, edges[0].z),
                lastTile = map.get(edges[edges.length-1].x, edges[edges.length-1].z),
                lastCoords = edges[edges.length-1];
            
            drawInstructions.push(
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

        })        
    }

    const draw_all = () => {
        draw(drawInstructions);
    }
    
    const draw = (earthPoints: tCoord[]) => {
        terrain.draw_lines(earthPoints);

        ctx.fillStyle = '#964B00';
        ctx.fill();
    }

    return { calculate, draw_all }
}