// maintains the state of the map

import { tEntityReference, tEntityConfig, tEntityConfigs } from "./Entity"
import { Memory as EntityMemory, Generic } from "./Entity"
import { RequireKeys } from "./tHelpers"

type tResolverCallback = (x: number, z: number) => tMapAt

export type tMapRecordEntity = {
    level?: number,
    sizeX?: number,
    sizeZ?: number,
    entityReference?: string
}

type tMapRecordReference = {
    resolver: tResolverCallback,
    refX: number,
    refZ: number
}

export type tMapConfig = {[key: number]: {[key: number]: tMapRecordEntity}}

export type tMapRecord = tMapRecordEntity | tMapRecordReference

export type tMapAt = (tMapRecordEntity & {hitRecord?: tMapRecordReference}) | undefined

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
        mapRec: tMapRecordEntity) => {
        
        // setting defaults
        const mapRecReq: RequireKeys<tMapRecordEntity, 'sizeX' | 'sizeZ'> = {
            sizeX: 1, 
            sizeZ: 1,
            ...mapRec
        }
        console.log(mapRecReq, mapRec);

        set_map_record(x, z, mapRecReq)
        
        if (mapRecReq.sizeX > 1 || mapRecReq.sizeZ > 1){
            let xIncr: number, zIncr: number
            for(xIncr = 0; xIncr < mapRecReq.sizeX; xIncr++) {
                for(zIncr = 0; zIncr < mapRecReq.sizeZ; zIncr++) {
                    if (xIncr || zIncr) {
                        set_reference(
                            parseInt(x as unknown as string)+xIncr, 
                            parseInt(z as unknown as string)+zIncr, 
                            x, z
                        )
                    }
                }
            }
        }
    }

    //  when tiles are bigger, reference resolvers are introduced.
    const set_reference = (x: number, z: number, refX: number, refZ: number) => {
        console.log('setting reference', x, z, refX, refZ);
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
                return undefined
            }
        }
        else {
            return exactPosition
        }
    }

    const load_entities = (entityConfig: tEntityConfigs) => {
        Object.entries(entityConfig).forEach(([unique, entityConfig]) => {
            entityMemory.add(Generic(entityConfig), unique)
        })    
    }

    const load_map = (mapConfig: tMapConfig) => {
        Object.entries(mapConfig).forEach(([xLoc, zPositions]) => {
            Object.entries(zPositions).forEach(([zLoc, mapRec]) => {
                set_map_position(
                    xLoc as unknown as number, 
                    zLoc as unknown as number, 
                    mapRec
                )
            })
        })
    }

    // todo : convert to an iterator
    const iterate = (cb: (xLoc: number, zLoc: number, tMapAt: tMapAt) => void) => {
        Object.entries(map).forEach(([xLoc, zPositions]) => {
            Object.entries(zPositions).forEach(([zLoc]) => {
                cb(
                    xLoc as unknown as number,
                    zLoc as unknown as number,
                    get_map_at(xLoc as unknown as number, zLoc as unknown as number)
                );
            });
        });
    }

    return { set_map_position, entityMemory, load_entities, load_map, iterate };
}
