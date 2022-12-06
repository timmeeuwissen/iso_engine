import { MapCoords, tCoord, tTileCoords } from "./MapCoords"
import { tMapAt } from "../Map"

export type tConfigTerrain = {
    dims: {
        x: number,
        z: number
    },
    level: {
        bedrock: number,
        water: number,
        snow: number,
        plane: number
    },
    tile: {
        width: number,
        line: CanvasRenderingContext2D
    }
}

export const Terrain = (
    ctx: CanvasRenderingContext2D, 
    terrainConfig: tConfigTerrain,
    width:number, 
    height:number,
    mapCoords: ReturnType<typeof MapCoords>
    ) => {
    
    const tileDraw = {
        x: terrainConfig.tile.width,
        y: terrainConfig.tile.width / 3 * 2
    }

    const startPos = {x: width / 2, y: height}
    
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

    const draw_lines = (coords: tCoord[]) => {
        ctx.save();
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
         ctx.restore();
     };
    
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
                    mapCoords.get(x, z-1)?.slanted.left || 
                    mapCoords.get(x-1, z)?.slanted.right || 
                    unslanted.bottom,
                right:  
                    mapCoords.get(x+1, z)?.slanted.bottom || 
                    mapCoords.get(x, z-1)?.slanted.top || 
                    unslanted.right,
                top:    
                    mapCoords.get(x+1, z)?.slanted.left || 
                    mapCoords.get(x, z+1)?.slanted.right ||
                    mapCoords.get(x+1, z+1)?.slanted.bottom ||
                    unslanted.top,
                left:   
                    mapCoords.get(x-1, z)?.slanted.top || 
                    mapCoords.get(x, z+1)?.slanted.bottom ||
                    unslanted.left
            }
        }
        
        mapCoords.set(x, z, coords);
        const lines = [];
        if (z == 1) lines.push(coords.slanted.bottom)
        lines.push(coords.slanted.right, coords.slanted.top, coords.slanted.left);
        if(lines.length == 4 || x == 1) lines.push(coords.slanted.bottom);
        draw_lines(lines);
    
        draw_tile_surface(coords, mapRec);
    }

    return {
        draw_lines,
        draw_tile,
        draw_tile_surface,
        startPos,
        tileDraw
    }
}