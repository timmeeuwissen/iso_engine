import { tDrawable } from "../../Draw";

export const Entities: tDrawable = (terrainConfig, map, mapCoords, ctx, terrain) => {       

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
        
    const draw = () => {
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

    return { draw }
}