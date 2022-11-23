export const unique = (config) => {
    return JSON.stringify(config);
};
export const Generic = (config) => {
    return {};
};
export const Memory = () => {
    const entities = {};
    function add(entity, entityReference) {
        var _a;
        let unique = ((_a = entity.get_unique) === null || _a === void 0 ? void 0 : _a.call(entity)) || entityReference || Math.random().toString();
        if (!(unique in entities)) {
            entities[unique] = entity;
        }
        return unique;
    }
    function get(unique) {
        if (!(unique in entities)) {
            throw new Error(`Unique:${unique} not available in EntityMemory`);
        }
        return entities[unique];
    }
    return { add, get };
};
