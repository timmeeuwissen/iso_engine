export type tEntity = {
    get_unique?: () => string
}

export type tEntityConfig = {
    tile?: {
        texture?: string,
        sizeX: number,
        sizeZ: number
    },
    object?: {
        sprite: string, 
        xPos: number,
        yPos: number,
        width: number,
        height: number,
        drawPos: 'bottom' | 'right' | 'top' | 'left' | 'middle' 
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
    const entities: {[key: tEntityReference]: tEntityConfig} = {}
    
    function add(entity: tEntityConfig, entityReference?: tEntityReference): string {
        let unique: tEntityReference = entityReference || Math.random().toString()
        if (!(unique in entities)){
            entities[unique] = entity
        }
        return unique
    }
    
    function get(unique: string): tEntityConfig  {
        if (!(unique in entities)){
            throw new Error(`Unique:${ unique } not available in EntityMemory`)
        }
        return entities[unique];
    }

    return {add, get}
}
