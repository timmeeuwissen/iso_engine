import { tDrawable } from "../../Draw";
import { tEntity, tEntityConfig } from "../../Entity";
import { tCoord, tMapCoords, tTileCoords } from "../MapCoords";

export const Entities: tDrawable = (terrainConfig, map, mapCoords, ctx, terrain) => {       

    const images: {[key: string]: Promise<HTMLImageElement>} = {}

    let drawInstructions: [tTileCoords, tEntityConfig['object']][]= []

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
        drawInstructions.forEach(([coord, object]) => draw(coord, object));
    }

    const draw = (coords: tTileCoords, entityObject: tEntityConfig['object']) => {
        if (!entityObject) return;
        load_image(entityObject.sprite).then((img) => {
            if (!entityObject) {
                return;
            }

            let drawCoord = coords.slanted.bottom;
            // if (entityObject.drawPos) {
            //     if(entityObject.drawPos in coords.slanted) {
            //         drawCoord = coords.slanted[entityObject.drawPos as str in tEntityConfig]
            //     }
            // }

            // TODO: positioning based on drawPos prop
            ctx.drawImage(
                img,
                // position in sprite
                entityObject.xPos,
                entityObject.yPos - entityObject.height,
                // size of graphic in sprite
                entityObject.width,
                entityObject.height,
                // draw position
                drawCoord[0] - entityObject.width / 2,
                drawCoord[1] - entityObject.height,
                // draw dimensions
                entityObject.width,
                entityObject.height
            )              
        });

    }

    return { calculate, draw, draw_all }
}