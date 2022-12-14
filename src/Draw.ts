import { tConfigTerrain, Terrain } from "./draw/Terrain"
import { Map as WorldMap, tMapAt } from './Map'
import { Earth as EarthDrawable } from './draw/terrain/Earth'
import { Entities as EntitiesDrawable } from './draw/terrain/Entities'
import { Grid as GridDrawable } from './draw/terrain/Grid'
import { Water as WaterDrawable } from './draw/terrain/Water'
import { Ocean as OceanDrawable } from './draw/terrain/Ocean'
import { Map as MapDrawable } from './draw/terrain/Map'
import { MapCoords, tCoord } from "./draw/MapCoords"
import { isAccessor } from "typescript"

export type tDrawable = (
    terrainConfig: tConfigTerrain, 
    map: ReturnType<typeof WorldMap>,
    mapCoords: ReturnType<typeof MapCoords>,
    ctx: CanvasRenderingContext2D,
    terrain: ReturnType<typeof Terrain>
) => { 
    calculate: () => void,
    draw_all: () => void 
}

export type tDrawPoints = { draw: (points: tCoord[]) => void }

export const Draw = (
    ctx: CanvasRenderingContext2D, 
    terrainConfig: tConfigTerrain, 
    width:number, 
    height:number,
    map: ReturnType<typeof WorldMap>) => {

    const mapCoords = MapCoords();
    const terrain = Terrain(ctx, terrainConfig, width, height, mapCoords);

    // TODO: calculate the actual movement when the tile is projected in iso perspective
    // TODO: the incline of the perspective should be 30 percent

    const drawables: tDrawable[] = [
        MapDrawable,
        GridDrawable,
        EarthDrawable,
        WaterDrawable,
        OceanDrawable,
        EntitiesDrawable,
    ];

    // invoke drawables within their own context
    const drawableCtxs = drawables
        .reduce(
            (acc, drawable) => [...acc, drawable(terrainConfig, map, mapCoords, ctx, terrain)], 
            [] as ReturnType<tDrawable>[]
        )

    // precalculate all that is needed
    drawableCtxs.forEach(drawableCtx => drawableCtx.calculate());

    const draw = (time: number) => drawableCtxs.forEach(drawableCtx => drawableCtx.draw_all());

    const clear = () => { ctx.clearRect(0, 0, width, height);}

    return { draw, clear, mapCoords }
}


