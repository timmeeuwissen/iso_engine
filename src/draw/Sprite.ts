import { tEntityConfig } from "../Entity";

export const Sprite = (ctx: CanvasRenderingContext2D) => {
    const imagePromises: {[key: string]: Promise<HTMLImageElement>} = {}
    const images: {[key: string]: HTMLImageElement} = {}

    const load_image = (src: string): Promise<HTMLImageElement> => {
        if (!(src in imagePromises)) {
            imagePromises[src] = new Promise((resolve, reject) => {
                let img = new Image()
                img.onload = () => {
                    images[src] = img;
                    resolve(img);
                }
                img.onerror = reject
                img.src = `assets/${src}`
            });
        }

        return imagePromises[src]
    }

    const draw = (coords: [x: number, y: number], entityObject: tEntityConfig['object']) => {
        if (!entityObject) return;

        if (entityObject.sprite in images) {
            draw_image(images[entityObject.sprite], coords, entityObject)
        }
        else {
            load_image(entityObject.sprite).then((img) => {
                draw_image(img, coords, entityObject);
            });
        }
    }

    const draw_image = (img: HTMLImageElement, coords: [x: number, y: number], entityObject: tEntityConfig['object']) => {
        if (!entityObject) {
            return;
        }

        ctx.drawImage(
            img,
            // position in sprite
            entityObject.xPos,
            entityObject.yPos - entityObject.height,
            // size of graphic in sprite
            entityObject.width,
            entityObject.height,
            // draw position
            coords[0] - entityObject.width / 2,
            coords[1] - entityObject.height,
            // draw dimensions
            entityObject.width,
            entityObject.height
        )     
        
    }

    return { draw }
}