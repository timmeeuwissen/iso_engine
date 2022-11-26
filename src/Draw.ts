import { tConfigTerrain } from "./draw/Terrain"
import { Map as WorldMap, tMapAt } from './Map'

type tCoord = [number,number] 
type tTileCoords = {bottom: tCoord, right: tCoord, top: tCoord, left: tCoord}
type tMapCoords = {[key: number]: {[key: number]: tTileCoords}}

export const Draw = (
    canvas: HTMLCanvasElement, 
    terrainConfig: tConfigTerrain, 
    width:number, 
    height:number,
    map: ReturnType<typeof WorldMap>) => {

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    // TODO: calculate the actual movement when the tile is projected in iso perspective
    // TODO: the incline of the perspective should be 30 percent
    const tileDraw = {
        x: terrainConfig.tile.width,
        y: terrainConfig.tile.width / 3 * 2
    }

    const startPos = {x: width / 2, y: height}

    const mapCoords: tMapCoords = {}

    const draw_lines = (coords: tCoord[]) => {
       coords.forEach((point, index) => {
            if (!point) return 

            let [pointX, pointY] = point;
            if (index === 0) {
                ctx.beginPath();
                ctx.moveTo(pointX, pointY);
            }
            else {
                ctx.lineTo(pointX, pointY)
            }
            
            if (index === coords.length-1) {
                // ctx.closePath();
                ctx.stroke();
            }
        });
    };

    const draw_tile_surface = (coords: tTileCoords, mapRec: tMapAt) => {
        ctx.beginPath();
        ctx.moveTo(coords.bottom[0], coords.bottom[1]-1);
        ctx.lineTo(coords.right[0]-1, coords.right[1]);
        ctx.lineTo(coords.top[0], coords.top[1]+1);
        ctx.lineTo(coords.left[0]+1, coords.left[1]);
        ctx.lineTo(coords.bottom[0], coords.bottom[1]-1);
        ctx.closePath();
        ctx.fillStyle = "#55ff55"
        ctx.fill()
    }

    const store_map_coords = (x:number, z:number, coords: tTileCoords) => {
        if (!(x in mapCoords)) {
            mapCoords[x] = {}
        }
        if (!(z in mapCoords[x])) {
            mapCoords[x][z] = coords
        }
    }

    const get_map_coord = (x:number, z:number): tTileCoords | undefined => {
        return mapCoords[x]?.[z]
    }

    //  draw an isometric square
    const draw_tile = (x: number, z:number, mapRec?: tMapAt) => {
        Object.entries(terrainConfig.tile.line).forEach(
            // @ts-ignore: Should only figure out a couple of keys of the context, however they don't traverse well implicitly
            ([key, value]) => ctx[key] = value
        );

        const 
            levelDelta = (mapRec && typeof mapRec.level != 'undefined' ? mapRec.level : terrainConfig.level.plane) * 0.5 * tileDraw.y,
            startX = startPos.x + ((0.5 * (x-1) * tileDraw.x) - (0.5 * (z-1) * tileDraw.x)),
            startY = startPos.y - ((0.5 * (x-1) * tileDraw.y) + (0.5 * (z-1) * tileDraw.y)) - levelDelta;
        
        const coords:tTileCoords = {
            bottom: 
                get_map_coord(x, z-1)?.left || 
                get_map_coord(x-1, z)?.right || 
                [startX, startY],
            right:  
                get_map_coord(x+1, z)?.bottom || 
                get_map_coord(x, z-1)?.top || 
                [startX + 0.5 * tileDraw.x, startY - 0.5 * tileDraw.y],
            top:    
                get_map_coord(x+1, z)?.left || 
                get_map_coord(x, z+1)?.right ||
                get_map_coord(x+1, z+1)?.bottom ||
                [startX, startY - tileDraw.y],
            left:   
                get_map_coord(x-1, z)?.top || 
                get_map_coord(x, z+1)?.bottom ||
                [startX - 0.5 * tileDraw.x, startY - 0.5 * tileDraw.y]
        }
        
        store_map_coords(x, z, coords);
        const lines = [];
        if (z == 1) lines.push(coords.bottom)
        lines.push(coords.right, coords.top, coords.left);
        if(lines.length == 4 || x == 1) lines.push(coords.bottom);
        draw_lines(lines);

        draw_tile_surface(coords, mapRec);
    }

    const draw_map = () => {
        // todo : convert to generator function
        map.iterate(draw_tile);
    }

    const draw_grid = () => {
        let x:number, z:number
        for (x = 1; x <= terrainConfig.dims.x; x++) {
            for (z = 1; z <= terrainConfig.dims.z; z++) {
                if (!mapCoords[x]?.[z]) {
                    draw_tile(x, z)
                }
            }
        }
    }

    const draw_earth = () => {
        type tCoordsAndRefs = {x: number, y:number, point: tCoord}

        [
            Object.entries(mapCoords).reduce(
                (acc, tuple) => {
                    acc.push({
                        x: tuple[0] as unknown as number, 
                        y: 1,
                        point:tuple[1][1].bottom
                    });
                    if (tuple[0] == terrainConfig.dims.x.toString()) {
                        acc.push({
                            x: tuple[0] as unknown as number, 
                            y: 1,
                            point:tuple[1][1].right
                        });
                    }
                    return acc;
                }, 
                [] as tCoordsAndRefs[]
            ),
            Object.entries(mapCoords[1]).reduce(
                (acc, tuple) => { 
                    acc.push({
                        x: 1, 
                        y: parseInt(tuple[0] as unknown as string),
                        point: tuple[1].bottom
                    }); 
                    if (tuple[0] == terrainConfig.dims.z.toString()) {
                        acc.push({
                            x: 1, 
                            y: parseInt(tuple[0] as unknown as string),
                            point: tuple[1].left
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
                firstTile = map.get_map_at(edges[0].x, edges[0].y),
                lastTile = map.get_map_at(edges[edges.length-1].x, edges[edges.length-1].y),
                lastCoords = edges[edges.length-1];
            earthPoints.push(
                [   lastCoords.point[0],
                    lastCoords.point[1] + 
                        ((lastTile?.level || terrainConfig.level.plane) - terrainConfig.level.bedrock) *
                        tileDraw.y
                ],
                [   edges[0].point[0],
                    edges[0].point[1] + 
                        ((firstTile?.level || terrainConfig.level.plane) - terrainConfig.level.bedrock) *
                        tileDraw.y
                ],
                edges[0].point
            )
            draw_lines(earthPoints);

            ctx.fillStyle = '#964B00';
            ctx.fill();
        })
    }

    const draw = () => {
        draw_map();
        draw_grid();
        draw_earth();
    }

    return { draw }
}


