export type tMapCoords = {[key: number]: {[key: number]: tTileCoords}}
export type tCoord = [number,number] 

export enum eCoordLocations {
    bottom,
    right,
    top,
    left,
}

export const opposites: {[key in keyof typeof eCoordLocations]: eCoordLocations} = {
    bottom: eCoordLocations.top,
    right: eCoordLocations.left,
    top: eCoordLocations.bottom,
    left: eCoordLocations.right,
}

export type tTileCoords = {
    unslanted: { -readonly [key in keyof typeof eCoordLocations]: tCoord },
    slanted: { -readonly [key in keyof typeof eCoordLocations]: tCoord }
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