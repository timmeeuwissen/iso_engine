export type tEntity = {
    get_unique?: () => string
}

export type tEntityConfig = {
    ground?: {
        texture?: string,
    },
    object?: {
        sprite: string, 
    }
}

export type tEntityConfigs = {[key: string]: tEntityConfig}

export type tEntityReference = string

export const unique = (config: tEntityConfig):string => {
    return JSON.stringify(config)
}

export const Generic = (config: tEntityConfig) => {
    return {}
}

export const Memory = () => {
    const entities: {[key: tEntityReference]: tEntity} = {}
    
    function add(entity: tEntity, entityReference?: tEntityReference): string {
        let unique: tEntityReference = entity.get_unique?.() || entityReference || Math.random().toString()
        if (!(unique in entities)){
            entities[unique] = entity
        }
        return unique
    }
    
    function get(unique: string): tEntity {
        if (!(unique in entities)){
            throw new Error(`Unique:${ unique } not available in EntityMemory`)
        }
        return entities[unique]
    }

    return {add, get}
}
