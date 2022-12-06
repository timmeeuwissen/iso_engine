// maintains the state of the map

import { tEntityReference, tEntityConfig, tEntityConfigs } from "./Entity"
import { Memory as EntityMemory, Generic } from "./Entity"
import { tConfigTerrain } from "./draw/Terrain"
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
    refZ: number,
    level?: number
}

export type tMapConfig = {[key: number]: {[key: number]: tMapRecordEntity}}

export type tMapRecord = tMapRecordEntity | tMapRecordReference

type tMapRecDim = RequireKeys<tMapRecordEntity, 'sizeX' | 'sizeZ'>;

export type tMapAt = (tMapRecordEntity & {hitRecord?: tMapRecordReference}) | undefined

export const Map = (terrainConfig: tConfigTerrain) => {
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
                                layer.level
                            )
                        }
                    }
                }
            }
                
    
        }
        
    }

    //  maintains properties of a tile in the map
    const set_map_position = (
        x: number, 
        z: number, 
        mapRec: tMapRecordEntity) => {
        
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

        set_map_record(x, z, mapRecDim)
        
        if (mapRecDim.sizeX > 1 || mapRecDim.sizeZ > 1){
            let xIncr: number, zIncr: number
            for(xIncr = 0; xIncr < mapRecDim.sizeX; xIncr++) {
                for(zIncr = 0; zIncr < mapRecDim.sizeZ; zIncr++) {
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

        smoothen_height_edges(x, z, mapRecDim);
    }

    //  when tiles are bigger, reference resolvers are introduced.
    const set_reference = (x: number, z: number, refX: number, refZ: number, level?: number) => {
        set_map_record(x, z, { resolver: get_map_at , refX, refZ, level})
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
                return { 
                    ...parentPosition, 
                    hitRecord: exactPosition, 
                    level: typeof exactPosition.level == 'undefined'  ? parentPosition.level : exactPosition.level
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
                set_map_position(
                    parseInt(xLoc), 
                    parseInt(zLoc), 
                    mapRec
                )
            })
        })
    }

    // todo : convert to an iterator
    const iterate = (cb: (xLoc: number, zLoc: number, tMapAt: tMapAt) => void, reverse = false) => {
        const row = reverse ? Object.entries(map).reverse() : Object.entries(map);
        row.forEach(([xLoc, zPositions]) => {
            const col = reverse ? Object.entries(zPositions).reverse() : Object.entries(zPositions);
            col.forEach(([zLoc]) => {
                cb(
                    xLoc as unknown as number,
                    zLoc as unknown as number,
                    get_map_at(xLoc as unknown as number, zLoc as unknown as number)
                );
            });
        });
    }

    return { set_map_position, entityMemory, load_entities, load_map, iterate, get_map_at };
}
