import { tDrawable } from "../../Draw";
import { tEntity, tEntityConfig } from "../../Entity";
import { eRecType, tMapAt } from "../../Map";
import { tCoord, tMapCoords, tTileCoords } from "../MapCoords";
import { Sprite } from "../Sprite";

export const Entities: tDrawable = (terrainConfig, map, mapCoords, ctx, terrain) => {       

    type tDrawInstructions = Array<[tTileCoords, tEntityConfig['object']]>;
    let drawInstructions:tDrawInstructions = []
    const sprite = Sprite(ctx);

    const get_calculation_isolation = () => {
        const calculationInstructions: tDrawInstructions = [];
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
                calculationInstructions.push([coords, entity.object]);
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

        // todo: sort
        [...drawInstructions, ...dynamicInstructions].forEach(([coord, object]) => sprite.draw(coord.slanted.bottom, object));
    }

    return { calculate, draw_all }
}