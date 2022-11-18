import { Entity } from "./Entity"

// for now a multiton
class EntityMemory {
    entities: {[key: string]: Entity} = {}
    
    add_entity(entity): string {
        let unique: string = entity.get_unique()
        if (!(unique in this.entities)){
            this.entities[unique] = entity
        }
        return unique
    }
    
    get_entity(unique): Entity {
        if (!(unique in this.entities)){
            throw new Error(`Unique:${ unique } not available in EntityMemory`)
        }
        return this.entities[unique]
    }
        
}

export { EntityMemory }