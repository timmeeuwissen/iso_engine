export const Draw = (canvas, terrainConfig, width, height) => {
    const ctx = canvas.getContext('2d');
    const tileDraw = {
        x: 12,
        y: 12 / 3 * 2
    };
    const startPos = { x: width / 2, y: height };
    const draw_tile = (x, z) => {
        Object.entries(terrainConfig.tile.line).forEach(([key, value]) => ctx[key] = value);
        const tilePos = [
            [startPos.x + (x - 1) * tileDraw.x, startPos.y + (z - 1) * tileDraw.y],
            [startPos.x + x * 0.5 * tileDraw.x, startPos.y + z * 0.5 * tileDraw.y],
            [startPos.x + (x - 1) * tileDraw.x, startPos.y + z * tileDraw.y],
            [startPos.x - x * 0.5 * tileDraw.x, startPos.y + z * 0.5 * tileDraw.y]
        ];
        const lineOps = [
            [ctx.moveTo, 0, 0],
            [ctx.lineTo, 1, 1],
            [ctx.lineTo, 2, 1],
            [ctx.lineTo, 3, 1],
            [ctx.lineTo, 0, 1],
        ];
        return lineOps.reduce((acc, [cFn, iPos, lineDrew]) => {
            [x, z] = tilePos[iPos];
            cFn.call(null, x, z);
            acc.lines += lineDrew;
            return acc;
        }, { lines: 0 });
    };
    const draw_grid = () => {
        let x, z;
        for (x = 1; x <= terrainConfig.dims.x; x++) {
            for (z = 1; z <= terrainConfig.dims.z; z++) {
                draw_tile(x, z);
            }
        }
    };
    return { draw_grid };
};
