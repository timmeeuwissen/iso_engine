import { tConfigTerrain } from "./draw/Terrain"
import { Memory, tEntity } from "./Entity"
import { Map as WorldMap, tMapAt } from './Map'

type tCoord = [number,number] 
type tTileCoords = {
    unslanted: {
        bottom: tCoord, 
        right: tCoord, 
        top: tCoord, 
        left: tCoord
    },
    slanted: {
        bottom: tCoord, 
        right: tCoord, 
        top: tCoord, 
        left: tCoord
    }
}
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
        ctx.moveTo(coords.slanted.bottom[0], coords.slanted.bottom[1]-1);
        ctx.lineTo(coords.slanted.right[0]-1, coords.slanted.right[1]);
        ctx.lineTo(coords.slanted.top[0], coords.slanted.top[1]+1);
        ctx.lineTo(coords.slanted.left[0]+1, coords.slanted.left[1]);
        ctx.lineTo(coords.slanted.bottom[0], coords.slanted.bottom[1]-1);
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
            levelDelta = ((mapRec && typeof mapRec.level != 'undefined' ? mapRec.level : terrainConfig.level.plane)) * 0.5 * tileDraw.y,
            startX = startPos.x + ((0.5 * (x-1) * tileDraw.x) - (0.5 * (z-1) * tileDraw.x)),
            startY = startPos.y - ((0.5 * (x-1) * tileDraw.y) + (0.5 * (z-1) * tileDraw.y)) - levelDelta - tileDraw.y;
        
        const unslanted: { 
            bottom: tCoord, 
            right: tCoord, 
            top: tCoord, 
            left: tCoord
        } = {
            bottom: [startX, startY],
            right: [startX + 0.5 * tileDraw.x, startY - 0.5 * tileDraw.y],
            top: [startX, startY - tileDraw.y],
            left: [startX - 0.5 * tileDraw.x, startY - 0.5 * tileDraw.y]
        }

        const coords:tTileCoords = {
            unslanted,
            slanted: {
                bottom: 
                    get_map_coord(x, z-1)?.slanted.left || 
                    get_map_coord(x-1, z)?.slanted.right || 
                    unslanted.bottom,
                right:  
                    get_map_coord(x+1, z)?.slanted.bottom || 
                    get_map_coord(x, z-1)?.slanted.top || 
                    unslanted.right,
                top:    
                    get_map_coord(x+1, z)?.slanted.left || 
                    get_map_coord(x, z+1)?.slanted.right ||
                    get_map_coord(x+1, z+1)?.slanted.bottom ||
                    unslanted.top,
                left:   
                    get_map_coord(x-1, z)?.slanted.top || 
                    get_map_coord(x, z+1)?.slanted.bottom ||
                    unslanted.left
            }
        }
        
        store_map_coords(x, z, coords);
        const lines = [];
        if (z == 1) lines.push(coords.slanted.bottom)
        lines.push(coords.slanted.right, coords.slanted.top, coords.slanted.left);
        if(lines.length == 4 || x == 1) lines.push(coords.slanted.bottom);
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
                        point:tuple[1][1].slanted.bottom
                    });
                    if (tuple[0] == terrainConfig.dims.x.toString()) {
                        acc.push({
                            x: tuple[0] as unknown as number, 
                            y: 1,
                            point:tuple[1][1].slanted.right
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
                        point: tuple[1].slanted.bottom
                    }); 
                    if (tuple[0] == terrainConfig.dims.z.toString()) {
                        acc.push({
                            x: 1, 
                            y: parseInt(tuple[0] as unknown as string),
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

    const draw_water = () => {
        const waterLevel = terrainConfig.level.water;
        let lakePoints: tCoord[] = [];

        map.iterate((xLoc, zLoc, mapAt) => {
            if (typeof mapAt?.level == "undefined" || mapAt.level > waterLevel) {
                return;
            }
            // check if any of the edges dips underwater
            const coords = mapCoords[xLoc][zLoc],
                relativePosition = Object.entries(coords.slanted).reduce((acc, [coordKey, value]) => {
                        const unslantedCoord: tCoord = coords.unslanted[coordKey as 'bottom' | 'left' | 'right' | 'top'];
                        if (value[1] > unslantedCoord[1] ) {
                            acc.below.push(value);
                        }
                        else if (value[0] == unslantedCoord[0] && value[1] == unslantedCoord[1]) {
                            acc.waterline.push(value);
                        }
                        return acc;
                    },
                    {
                        waterline: [] as tCoord[],
                        below: [] as tCoord[]
                    }
                );
            
            if (relativePosition.waterline.length && relativePosition.below.length) {
                lakePoints = [...lakePoints, ...relativePosition.waterline]
            }
        });

        lakePoints.sort((coordA, coordB) =>{
            return Math.atan2(coordA[1], coordA[0]) > Math.atan2(coordB[1], coordB[0]) ? 1 : 0
        })

        draw_lines(lakePoints)
        ctx.globalAlpha = 0.5
        ctx.fillStyle = '#00f'
        ctx.fill()
        ctx.globalAlpha = 1
        // how in the hell will we sort this mess to become a circle.
    }

    // todo ; cache higher than here
    const images: {[key: string]: Promise<HTMLImageElement>} = {}
    const load_image = (src: string): Promise<HTMLImageElement> => {
        if (!(src in images)) {
            images[src] = new Promise((resolve, reject) => {
                let img = new Image()
                img.onload = () => resolve(img)
                img.onerror = reject
                img.src = `assets/${src}`
              });
        }

        return images[src]
      }
      
    const draw_entities = () => {
        map.iterate((xLoc, zLoc, mapAt) => {
            if (!mapAt?.entityReference) {
                return;
            }

            const entity = map.entityMemory.get(mapAt.entityReference);
            if (!entity) {
                return;
            }
            // TODO: cache sprite definition
            if (entity.object?.sprite) {

                const coords = get_map_coord(xLoc, zLoc);
                if (!coords ) {
                    return;
                }

                load_image(entity.object.sprite).then((img) => {
                    if (!entity.object) {
                        return;
                    }

                    let drawCoord = coords.slanted.bottom;
                    // if (entity.object.drawPos) {
                    //     if(entity.object.drawPos in coords.slanted) {
                    //         drawCoord = coords.slanted[entity.object.drawPos as str in tEntityConfig]
                    //     }
                    // }

                    // TODO: positioning based on drawPos prop
                    ctx.drawImage(
                        img,
                        // position in sprite
                        entity.object.xPos,
                        entity.object.yPos - entity.object.height,
                        // size of graphic in sprite
                        entity.object.width,
                        entity.object.height,
                        // draw position
                        drawCoord[0] - entity.object.width / 2,
                        drawCoord[1] - entity.object.height,
                        // draw dimensions
                        entity.object.width,
                        entity.object.height
                    )              
                });
            }
        }, true);
    }

    const draw = () => {
        draw_map();
        draw_grid();
        draw_earth();
        draw_water();
        draw_entities();
    }

    return { draw }
}


