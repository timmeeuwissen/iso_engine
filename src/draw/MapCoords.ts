export type tMapCoords = {[key: number]: {[key: number]: tTileCoords}}
export type tCoord = [number,number] 

export type tTileCoords = {
    unslanted: {
        bottom: tCoord, 
        right: tCoord, 
        top: tCoord, 
        left: tCoord
    },
    slanted: {
        bottom: tCoord, 
        right: tCoord, 
        top: tCoord, 
        left: tCoord
    }
}

export const MapCoords = () => {
    const mapCoords: tMapCoords = {}

    const set = (x:number, z:number, coords: tTileCoords) => {
        if (!(x in mapCoords)) {
            mapCoords[x] = {}
        }
        if (!(z in mapCoords[x])) {
            mapCoords[x][z] = coords
        }
    }

    const get = (x:number, z:number): tTileCoords | undefined => {
        return mapCoords[x]?.[z]
    }

    return { set, get, getAll: () => mapCoords }
}