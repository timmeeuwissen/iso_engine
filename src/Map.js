import { Memory as EntityMemory } from "./Entity";
export const Map = () => {
    const map = {};
    const entityMemory = EntityMemory();
    const set_map_record = (x, z, record) => {
        if (!(x in map)) {
            map[x] = {};
        }
        if (!(z in map[x])) {
            map[x][z] = record;
        }
    };
    const set_map_position = (x, z, level, sizeX = 1, sizeZ = 1, entityReference) => {
        set_map_record(x, z, { level, sizeX, sizeZ, entityReference });
        if (sizeX > 1 || sizeZ > 1) {
            let xIncr, zIncr;
            for (xIncr = 0; xIncr < sizeX; xIncr++) {
                for (zIncr = 0; zIncr < sizeZ; zIncr++) {
                    if (xIncr || zIncr) {
                        set_reference(x + xIncr, z + zIncr, x, z);
                    }
                }
            }
        }
    };
    const set_reference = (x, z, refX, refZ) => {
        set_map_record(x, z, { resolver: get_map_at, refX, refZ });
    };
    const get_map_at = (x, z) => {
        var _a;
        const exactPosition = (_a = map[x]) === null || _a === void 0 ? void 0 : _a[z];
        if (!exactPosition) {
            return undefined;
        }
        if ('resolver' in exactPosition) {
            const parentPosition = exactPosition.resolver(exactPosition.refX, exactPosition.refZ);
            if (parentPosition) {
                return Object.assign(Object.assign({}, parentPosition), { hitRecord: exactPosition });
            }
            else {
                return exactPosition;
            }
        }
        else {
            return exactPosition;
        }
    };
    return { set_map_position, entityMemory };
};
