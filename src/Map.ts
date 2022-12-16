// maintains the state of the map

import { tEntityReference, tEntityConfig, tEntityConfigs } from "./Entity"
import { Memory as EntityMemory, Generic } from "./Entity"
import { tConfigTerrain } from "./draw/Terrain"
import { RequireKeys } from "./tHelpers"
import { ObjectType } from "typescript"

type tResolverCallback = (x: number, z: number) => tMapAt

export type tEntityMutations = {offsetPct?: {x: number, z: number}}

export type tMapRecordEntity = {
    level?: number,
    sizeX?: number,
    sizeZ?: number,
    entityReference?: string,
    type?: eRecType,
    mutations?: tEntityMutations,
}

type tMapRecordReference = {
    resolver: tResolverCallback,
    refX: number,
    refZ: number,
    level?: number,
    type?: eRecType
}

type tCoordTuple = [number, number];

export type tIterateCB = (xLoc: number, zLoc: number, tMapAt: tMapAt, recType: eRecType) => void;

export enum eRecType {
    config,
    filler,
    slope,
    other,
    dynamic,
}

export type tMapConfig = {[key: number]: {[key: number]: tMapRecordEntity}}

export type tMapRecord = tMapRecordEntity | tMapRecordReference


type tMapRecDim = RequireKeys<tMapRecordEntity, 'sizeX' | 'sizeZ'>;

export type tMapAt = (tMapRecordEntity & {hitRecord?: tMapRecordReference}) | undefined

export const Map = (terrainConfig: tConfigTerrain) => {
    const map: Record<number, Record<number, Record<eRecType, tMapRecord>>> = {};
    const typeOptimized: {[key in eRecType]?: tCoordTuple[]} = {};

    const entityMemory = EntityMemory()

    const set_fixed = (x: number, z: number, record: tMapRecord, recType?: eRecType) => {
        const optimizeKey: eRecType = typeof recType != 'undefined' ? recType : eRecType.other;
        
        if (!(x in map)) {
            map[x] = {}
        }
        if (!(z in map[x])) {
            map[x][z] = {} as Record<eRecType, tMapRecord>
        } 
        if (!(optimizeKey in map[x][z])) {
            map[x][z][optimizeKey] = {...record, type: optimizeKey}
        }
        else {
            // todo : overwrite?
            console.error('record was already set');
            return;
        }

        if (typeof typeOptimized[optimizeKey] == 'undefined') {
            typeOptimized[optimizeKey] = []
        }
        (typeOptimized[optimizeKey] as tCoordTuple[]).push([x, z]);
    }

    const smoothen_height_edges = (
            x: number, 
            z: number, 
            mapRecDim: tMapRecDim
        ) => {
        
        if (typeof mapRecDim.level == 'undefined') return;

        const depthDirection = mapRecDim.level > terrainConfig.level.plane 
            ? -1 : 1;
        
        if (mapRecDim.level == terrainConfig.level.plane ||
            mapRecDim.level + depthDirection == terrainConfig.level.plane){
            return;
        }

        const layers = [];
        for (let iDiff = 1, iTarg = Math.abs(terrainConfig.level.plane - mapRecDim.level); 
            iDiff <= iTarg;
            iDiff++){

            const layer = {
                x: x - iDiff,
                z: z - iDiff,
                sizeX: mapRecDim.sizeX + iDiff * 2,
                sizeZ: mapRecDim.sizeZ + iDiff * 2,
                level: mapRecDim.level + iDiff * depthDirection
            }
            

            let xIncr: number, zIncr: number
            for(xIncr = 0; xIncr < layer.sizeX; xIncr++) {
                for(zIncr = 0; zIncr < layer.sizeZ; zIncr++) {
                    // only the outer rim
                    if (!xIncr || !zIncr || xIncr == layer.sizeX-1 || zIncr == layer.sizeZ-1) {
                        // limit to the edges of the terrain
                        const 
                            targX = layer.x + xIncr,
                            targZ = layer.z + zIncr;
                        
                        if ((targX >= 1 && targX <= terrainConfig.dims.x) &&
                            (targZ >= 1 && targZ <= terrainConfig.dims.z)) {
                            set_reference(
                                layer.x + xIncr, 
                                layer.z + zIncr, 
                                x, z, 
                                eRecType.slope,
                                layer.level
                            )
                        }
                    }
                }
            }
        }        
    }

    //  maintains properties of a tile in the map
    const generate_implications = (
        x: number, 
        z: number, 
        mapRec: tMapRecordEntity,
        recType?: eRecType) => {
        
        let defaults = {
            sizeX: 1, 
            sizeZ: 1,
        };

        if(mapRec.entityReference) {
            const entityRef = entityMemory.get(mapRec.entityReference);
            if (entityRef) {
                if (entityRef.tile?.sizeX) { defaults.sizeX = entityRef.tile.sizeX}
                if (entityRef.tile?.sizeZ) { defaults.sizeX = entityRef.tile.sizeZ}
            }
        }

        // setting defaults
        const mapRecDim: tMapRecDim = {
            ...defaults,
            ...mapRec
        }

        set_fixed(x, z, mapRecDim, recType)
        
        if (mapRecDim.sizeX > 1 || mapRecDim.sizeZ > 1){
            let xIncr: number, zIncr: number
            for(xIncr = 0; xIncr < mapRecDim.sizeX; xIncr++) {
                for(zIncr = 0; zIncr < mapRecDim.sizeZ; zIncr++) {
                    if (xIncr || zIncr) {
                        set_reference(
                            parseInt(x as unknown as string)+xIncr, 
                            parseInt(z as unknown as string)+zIncr, 
                            x, z,
                            eRecType.filler
                        )
                    }
                }
            }
        }

        smoothen_height_edges(x, z, mapRecDim);
    }

    //  when tiles are bigger, reference resolvers are introduced.
    const set_reference = (x: number, z: number, refX: number, refZ: number, recType?: eRecType, level?: number) => {
        set_fixed(x, z, { resolver: get , refX, refZ, level}, recType)
    }

    // gets the item on a map, even if it is part of an earlier, bigger structure.
    // when that is the case you get where your exact hit was, but also obtain the higher structure.
    const get = (x: number, z: number, recTypes?: eRecType[]): tMapAt => {
        // todo: you can hit multiple. We need to cater for that.
        const stuffAtPosition = map[x]?.[z]
        
        if (!stuffAtPosition) {
            return undefined;
        }

        const exactPosition = stuffAtPosition[(recTypes || Object.values(eRecType) as unknown as eRecType[]).find((recType: eRecType) => {
            return (recType in stuffAtPosition);
        }) as eRecType]

        // todo: possibility for infinitely cyclic references and recursion
        if('resolver' in exactPosition){
            const parentPosition: tMapAt = exactPosition.resolver(exactPosition.refX, exactPosition.refZ)
            if (parentPosition){
                return { 
                    ...parentPosition, 
                    hitRecord: exactPosition, 
                    level: typeof exactPosition.level == 'undefined'  ? parentPosition.level : exactPosition.level,
                    type: typeof exactPosition.type == 'undefined'  ? parentPosition.type : exactPosition.type
                };
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
            entityMemory.add(entityConfig, unique)
        })    
    }

    const load_map = (mapConfig: tMapConfig) => {
        Object.entries(mapConfig).forEach(([xLoc, zPositions]) => {
            Object.entries(zPositions).forEach(([zLoc, mapRec]) => {
                generate_implications(
                    parseInt(xLoc), 
                    parseInt(zLoc), 
                    mapRec,
                    eRecType.config
                )
            })
        })
    }

    const unset_rec_type = (recType: eRecType) => {
        if (!typeOptimized[recType]) return;
        typeOptimized[recType]?.forEach(coordTuple => delete map[coordTuple[0]][coordTuple[1]][recType]);
        delete typeOptimized[recType];
    }

    // todo : convert to an iterator
    const iterate = (cb: tIterateCB, reverse = false, recTypes?: eRecType[]) => {
        // because of order and absence of order in object
        (recTypes || Object.values(eRecType) as unknown as eRecType[]).forEach((recType: eRecType, index) => {
            if (!typeOptimized[recType]) {
                return;
            }
            
            (reverse 
                ? (typeOptimized[recType] as tCoordTuple[]).reverse() 
                : (typeOptimized[recType] as tCoordTuple[]))
                .forEach((coordTuple) => {
                    cb(
                        coordTuple[0], 
                        coordTuple[1], 
                        get(coordTuple[0], coordTuple[1], [recType]),
                        recType
                    )
                }) 
        })
    }

    return { generate_implications, entityMemory, load_entities, load_map, iterate, get, set_fixed, unset_rec_type };
}
