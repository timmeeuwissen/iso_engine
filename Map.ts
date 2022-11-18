// maintains the state of the map

import { Entity } from "./Entity"
import { EntityMemory } from "./EntityMemory"

type tResolverCallback = (x: number, z: number) => tMapAt

type tMapRecordEntity = {
    level?: number,
    sizeX: number,
    sizeZ: number,
    entityMemoryReference?: string
}

type tMapRecordReference = {
    resolver: tResolverCallback,
    refX: number,
    refZ: number
}

type tMapRecord = tMapRecordEntity | tMapRecordReference

type tMapAt = (tMapRecord & {hitRecord?: tMapRecord}) | undefined

class Map {
    map: {[key: number]: {[key: number]: tMapRecord}}
    entityMemory: EntityMemory = new EntityMemory

    private set_map_record(x: number, z: number, record: tMapRecord) {
        if (!(x in this.map)) {
            this.map[x] = {}
        }
        if (!(z in this.map[x])) {
            this.map[x][z] = record
        }
    }

    //  maintains properties of a tile in the map
    set_map_position(x: number, z: number, level: number | undefined, sizeX: number = 1, sizeZ: number = 1, entityObject: Entity | undefined) {
        const entityMemoryReference: string | undefined = entityObject ? this.entityMemory.add_entity(entityObject) : undefined
        
        this.set_map_record(x, z, {level, sizeX, sizeZ, entityMemoryReference})
        
        if (sizeX > 1 || sizeZ > 1){
            let xIncr: number, zIncr: number
            for(xIncr = 0; xIncr < sizeX; xIncr++) {
                for(zIncr = 0; zIncr < sizeZ; zIncr++) {
                    if (xIncr || zIncr) {
                        this.set_reference(x+xIncr, z+zIncr, x, z)
                    }
                }
            }
        }
    }

    //  when tiles are bigger, reference resolvers are introduced.
    set_reference(x, z, refX, refZ) {
        this.set_map_record(x, z, { resolver: this.get_map_at , refX, refZ})
    }

    // gets the item on a map, even if it is part of an earlier, bigger structure.
    // when that is the case you get where your exact hit was, but also obtain the higher structure.
    get_map_at(x: number, z: number): tMapAt  {
        const exactPosition: tMapRecord | undefined = this.map[x]?.[z]
        
        if (!exactPosition) {
            return undefined;
        }

        // todo: possibility for infinitely cyclic references and recursion
        if('resolver' in exactPosition){
            const parentPosition: tMapAt = exactPosition.resolver(exactPosition.refX, exactPosition.refZ)
            if (parentPosition){
                return { ...parentPosition, hitRecord: exactPosition }
            }
            else {
                return exactPosition
            }
        }
        else {
            return exactPosition;
        }
    }
}

export { Map, tMapAt }