import { tConfig, tConfigTerrain } from "./tConfig"
import { aInteract } from "./aInteract"
import { Map } from './Map'

class Draw {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    terrainConfig:tConfigTerrain
    tileDraw: {
        x: number,
        y: number
    }
    startPos: {
        x: number,
        y: number
    }
    map: Map
    interactStrategy: aInteract | null = null

    constructor(canvas: HTMLCanvasElement, terrainConfig: tConfigTerrain, width:number, height:number) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        this.terrainConfig = terrainConfig
        
        // TODO: calculate the actual movement when the tile is projected in iso perspective
        // TODO: the incline of the perspective should be 30 percent
        this.tileDraw = {
            x: 12,
            y: 12 / 3 * 2
        }
        
        this.startPos = {x: width / 2, y: height}
    }
    
    load_map(map: Map) {
        this.map = map
        this.redraw()
    }

    set_interact_strategy(interact_strategy: aInteract) {
        this.interactStrategy = interact_strategy
    }
    
    draw_grid(x, z) {
        Object.entries(this.terrainConfig.tile.line).forEach(
            ([key, value]) => this.ctx[key] = value
        );
          
        //  draw an isometric square
        this.ctx.moveTo(this.startPos.x + (x - 1) * this.tileDraw.x, this.startPos.y + (z - 1) * this.tileDraw.y);
        this.ctx.lineTo(this.startPos.x + x * 0.5 * this.tileDraw.x, this.startPos.y + z * 0.5 * this.tileDraw.y);
        this.ctx.lineTo(this.startPos.x + (x - 1) * this.tileDraw.x, this.startPos.y + z * this.tileDraw.y);
        this.ctx.lineTo(this.startPos.x - x * 0.5 * this.tileDraw.x, this.startPos.y + z * 0.5 * this.tileDraw.y);
        this.ctx.lineTo(this.startPos.x + (x - 1) * this.tileDraw.x, this.startPos.y + (z - 1) * this.tileDraw.y);
    }

    redraw() {
        let x:number, z:number
        for (x = 1; x <= this.terrainConfig.dims.x; x++) {
            for (z = 1; z <= this.terrainConfig.dims.z; z++) {
                this.draw_grid(x, z)
            }
        }
    }
}

export { Draw }
