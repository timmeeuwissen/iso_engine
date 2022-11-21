import { tConfigTerrain } from "./tConfig"
import { Map } from './Map'

type tTilePos = [number,number][]

export const Draw = (canvas: HTMLCanvasElement, terrainConfig: tConfigTerrain, width:number, height:number) => {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    // TODO: calculate the actual movement when the tile is projected in iso perspective
    // TODO: the incline of the perspective should be 30 percent
    const tileDraw = {
        x: 12,
        y: 12 / 3 * 2
    }
    const startPos = {x: width / 2, y: height}

    //  draw an isometric square
    const draw_tile = (x, z) => {
        Object.entries(terrainConfig.tile.line).forEach(
            ([key, value]) => ctx[key] = value
        );
        
        const tilePos:tTilePos = [
            [startPos.x + (x - 1) * tileDraw.x, startPos.y + (z - 1) * tileDraw.y],
            [startPos.x + x * 0.5 * tileDraw.x, startPos.y + z * 0.5 * tileDraw.y],
            [startPos.x + (x - 1) * tileDraw.x, startPos.y + z * tileDraw.y],
            [startPos.x - x * 0.5 * tileDraw.x, startPos.y + z * 0.5 * tileDraw.y]
        ]

        const lineOps: [(x: number, y: number) => void, number, number][] = [
            [ctx.moveTo, 0, 0],
            [ctx.lineTo, 1, 1],
            [ctx.lineTo, 2, 1],
            [ctx.lineTo, 3, 1],
            [ctx.lineTo, 0, 1],
        ]
        
        lineOps.reduce(
            (acc, [cFn, iPos, lineDrew]) => { 
                cFn.apply(tilePos[iPos]); 
                acc.lines += lineDrew;
                return acc;
            }, 
            {lines: 0}
        )

    }

    const draw_grid = () => {
        let x:number, z:number
        for (x = 1; x <= terrainConfig.dims.x; x++) {
            for (z = 1; z <= terrainConfig.dims.z; z++) {
                draw_tile(x, z)
            }
        }
    }

    return { draw_grid }
}


