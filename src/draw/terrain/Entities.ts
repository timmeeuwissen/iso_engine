import { tDrawable } from "../../Draw";
import { tEntity, tEntityConfig } from "../../Entity";
import { tCoord, tMapCoords, tTileCoords } from "../MapCoords";
import { Sprite } from "../Sprite";

export const Entities: tDrawable = (terrainConfig, map, mapCoords, ctx, terrain) => {       

    let drawInstructions: [tTileCoords, tEntityConfig['object']][]= []

    const calculate = () => {
        drawInstructions = [];
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

                const coords = mapCoords.get(xLoc, zLoc);
                if (!coords ) {
                    return;
                }
                drawInstructions.push([coords, entity.object]);
            }
        }, true);

    }

    const draw_all = () => {
        drawInstructions.forEach(([coord, object]) => Sprite(ctx).draw(coord.slanted.bottom, object));
    }

    return { calculate, draw_all }
}