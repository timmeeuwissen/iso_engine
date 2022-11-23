// maintains the state of the map

import { tEntityReference } from "./Entity"
import { Memory as EntityMemory } from "./Entity"

type tResolverCallback = (x: number, z: number) => tMapAt

type tMapRecordEntity = {
    level?: number,
    sizeX: number,
    sizeZ: number,
    entityReference?: string
}

type tMapRecordReference = {
    resolver: tResolverCallback,
    refX: number,
    refZ: number
}

type tMapRecord = tMapRecordEntity | tMapRecordReference

export type tMapAt = (tMapRecord & {hitRecord?: tMapRecord}) | undefined

export const Map = () => {
    const map: {[key: number]: {[key: number]: tMapRecord}} = {};

    const entityMemory = EntityMemory()

    const set_map_record = (x: number, z: number, record: tMapRecord) => {
        if (!(x in map)) {
            map[x] = {}
        }
        if (!(z in map[x])) {
            map[x][z] = record
        }
    }

    //  maintains properties of a tile in the map
    const set_map_position = (
        x: number, 
        z: number, 
        level: number | undefined, 
        sizeX: number = 1, 
        sizeZ: number = 1, 
        entityReference: tEntityReference) => {

        set_map_record(x, z, {level, sizeX, sizeZ, entityReference})
        
        if (sizeX > 1 || sizeZ > 1){
            let xIncr: number, zIncr: number
            for(xIncr = 0; xIncr < sizeX; xIncr++) {
                for(zIncr = 0; zIncr < sizeZ; zIncr++) {
                    if (xIncr || zIncr) {
                        set_reference(x+xIncr, z+zIncr, x, z)
                    }
                }
            }
        }
    }

    //  when tiles are bigger, reference resolvers are introduced.
    const set_reference = (x: number, z: number, refX: number, refZ: number) => {
        set_map_record(x, z, { resolver: get_map_at , refX, refZ})
    }

    // gets the item on a map, even if it is part of an earlier, bigger structure.
    // when that is the case you get where your exact hit was, but also obtain the higher structure.
    const get_map_at = (x: number, z: number): tMapAt => {
        const exactPosition: tMapRecord | undefined = map[x]?.[z]
        
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
            return exactPosition
        }
    }

    return { set_map_position, entityMemory }
}
