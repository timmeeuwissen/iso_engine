import { tDrawable } from "../../Draw";
import { tEntity, tEntityConfig } from "../../Entity";
import { eRecType, tMapAt } from "../../Map";
import { tCoord, tMapCoords, tTileCoords } from "../MapCoords";
import { Sprite } from "../Sprite";

export const Entities: tDrawable = (terrainConfig, map, mapCoords, ctx, terrain) => {       

    type tDrawInstructions = Array<[tCoord, tEntityConfig['object']]>;
    let drawInstructions:tDrawInstructions = []
    const sprite = Sprite(ctx);

    const percentage_between_points = (coordA: tCoord, coordB: tCoord, pct: number): tCoord => 
    [
        coordA[0] + ((coordA[0] - coordB[0]) / 100 * pct),
        coordA[1] + ((coordA[1] - coordB[1]) / 100 * pct)
    ]

    const get_calculation_isolation = () => {
        const calculationInstructions: tDrawInstructions = [];
        const levelOffset = (terrainConfig.tile.width / 3 * 2 / 2);
        const cb = (xLoc: number, zLoc: number, mapAt: tMapAt, recType: eRecType) => {
            
            if (!mapAt?.entityReference) {
                return;
            }
            const entity = map.entityMemory.get(mapAt.entityReference);
            if (!entity) {
                return;
            }
            if (entity.object?.sprite) {
                const coords = mapCoords.get(xLoc, zLoc);
                if (!coords ) {
                    return;
                }
                
                // default to the bottom of the tile as draw coordinate
                let groundCoord = coords.slanted.bottom;
                // check if we need to move accross the tile
                if (mapAt.mutations?.offsetPct) {
                    groundCoord = percentage_between_points(
                        percentage_between_points(coords.slanted.left, coords.slanted.bottom, mapAt.mutations.offsetPct.z),
                        percentage_between_points(coords.slanted.top, coords.slanted.right, mapAt.mutations.offsetPct.z),
                        -mapAt.mutations.offsetPct.x
                    )
                    const jumpCoord: tCoord = [
                        groundCoord[0], 
                        groundCoord[1] + ((mapAt.mutations.offsetPct.y / 100) * levelOffset)
                    ];
                    calculationInstructions.push([jumpCoord, entity.object]);

                }
                else {
                    calculationInstructions.push([groundCoord, entity.object]);
                }

            }
        }
        const result = () => { return calculationInstructions }
        return {cb, result};
    }

    const calculate = () => {
        drawInstructions = [];
        const isolation = get_calculation_isolation();
        map.iterate(isolation.cb, true);
        drawInstructions = isolation.result();
    }

    const draw_all = () => {
        const isolation = get_calculation_isolation();
        map.iterate(isolation.cb, true, [eRecType.dynamic]);
        const dynamicInstructions = isolation.result();
        // todo: sort!
        [...drawInstructions, ...dynamicInstructions].forEach(([coord, object]) => sprite.draw(coord, object));
    }

    return { calculate, draw_all }
}