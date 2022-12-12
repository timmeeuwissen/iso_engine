import { tEntityConfig } from "../Entity";

export const Sprite = (ctx: CanvasRenderingContext2D) => {
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

    const draw = (coords: [x: number, y: number], entityObject: tEntityConfig['object']) => {
        if (!entityObject) return;
        load_image(entityObject.sprite).then((img) => {
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
        });

    }

    return { draw }
}