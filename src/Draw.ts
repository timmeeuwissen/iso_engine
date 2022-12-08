import { tConfigTerrain, Terrain } from "./draw/Terrain"
import { Map as WorldMap, tMapAt } from './Map'
import { Earth as EarthDrawable } from './draw/terrain/Earth'
import { Entities as EntitiesDrawable } from './draw/terrain/Entities'
import { Grid as GridDrawable } from './draw/terrain/Grid'
import { Water as WaterDrawable } from './draw/terrain/Water'
import { Ocean as OceanDrawable } from './draw/terrain/Ocean'
import { Map as MapDrawable } from './draw/terrain/Map'
import { MapCoords, tCoord } from "./draw/MapCoords"

export type tDrawable = (
    terrainConfig: tConfigTerrain, 
    map: ReturnType<typeof WorldMap>,
    mapCoords: ReturnType<typeof MapCoords>,
    ctx: CanvasRenderingContext2D,
    terrain: ReturnType<typeof Terrain>
) => { draw_all: () => void }

export type tDrawPoints = { draw: (points: tCoord[]) => void }

export const Draw = (
    canvas: HTMLCanvasElement, 
    terrainConfig: tConfigTerrain, 
    width:number, 
    height:number,
    map: ReturnType<typeof WorldMap>) => {

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
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

    // todo ; cache higher than here
    const draw = () => {
        drawables.forEach(drawable => {
            ctx.save();
            drawable(terrainConfig, map, mapCoords, ctx, terrain).draw_all()
            ctx.restore();
        })
    }

    return { draw }
}


