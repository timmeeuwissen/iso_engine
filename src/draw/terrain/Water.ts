import { tDrawable } from "../../Draw";
import { tConfigTerrain } from "../Terrain";
import { Map as WorldMap, tMapAt } from '../../Map';
import { eCoordLocations, opposites, tCoord, tTileCoords } from "../MapCoords";

type tRelevantTile = { -readonly [key in keyof typeof eCoordLocations]?: tCoord }

export const Water: tDrawable = (terrainConfig, map, mapCoords, ctx, terrain) => {    
    const draw = () => {
        const waterLevel = terrainConfig.level.water;
        let lakePoints: tCoord[] = [];
        let relevantTiles: tRelevantTile[] = [];

        map.iterate((xLoc, zLoc, mapAt) => {
            if (typeof mapAt?.level == "undefined" || mapAt.level > waterLevel || mapAt < waterLevel) {
                return;
            }

            // check if any of the edges dips underwater
            const coords = mapCoords.getAll()[xLoc][zLoc],
                relativePosition = Object.entries(coords.slanted).reduce((acc, [key, value]) => {
                    const coordKey = key as keyof typeof eCoordLocations;
                    const unslantedCoord: tCoord = coords.unslanted[coordKey];
                    if (value[1] !=  unslantedCoord[1] ) {
                        acc.below[coordKey] = value;
                    }
                    else if (value[0] == unslantedCoord[0] && value[1] == unslantedCoord[1]) {
                        acc.waterline[coordKey] = value;
                    }
                    return acc;
                },
                {
                    waterline: {} as { -readonly [key in keyof typeof eCoordLocations]?: tCoord },
                    below: {} as { -readonly [key in keyof typeof eCoordLocations]?: tCoord }
                }
            );
            
            // when all edges dip under water, we don't need a line to indicate the shore.
            // when all edges are still at the water threshold level, nothing sunk under water
            // when some edges dipped under water, we need to draw a line that makes sense
            if (Object.keys(relativePosition.waterline).length && Object.keys(relativePosition.below).length) {
                relevantTiles.push(relativePosition.waterline);
            }
        });

        let currentTile = relevantTiles.shift()
        if (currentTile) {
            lakePoints = [...lakePoints, ...Object.values(currentTile) as tCoord[]]
            while (relevantTiles.length) {
                // find the neighbour
                const nextIndex = relevantTiles.findIndex((relevantTile) => {
                    let trying = true;

                    Object.entries(relevantTile as {[key: string]: tCoord}).every(([relLocation, relCoord]) => {
                        Object.entries(currentTile as {[key: string]: tCoord}).every(([curLocation, curCoord]) => {
                            if((curLocation != relLocation)){
                                if (relCoord[0] == curCoord[0] &&
                                    relCoord[1] == curCoord[1]) {
                                        trying = false;
                                        return false;
                                    }
                            }        
                            return trying;                        
                        })
                        return trying;
                    });

                    if (!trying) {
                        return true;
                    } 
                });

                
                // filter all the relevant points from the neighbour
                lakePoints = Object.entries(relevantTiles[nextIndex] as {[key: string]: tCoord}).reduce((acc, [newLocation, newCoord]) => {
                    Object.entries(currentTile as {[key: string]: tCoord}).forEach(([curLocation]) => {
                        if (curLocation != newLocation){
                            acc.push(newCoord);
                        }
                        return acc;
                    });

                    return lakePoints;
                }, lakePoints);

                // carry on from the neighbour onwards
                currentTile = relevantTiles[nextIndex];

                // delete the neighbour from the list to search
                relevantTiles.splice(nextIndex,1);
            } 
        }
        
        console.log('lakepoints', lakePoints);

        terrain.draw_lines(lakePoints)
        ctx.globalAlpha = 0.5
        ctx.fillStyle = '#00f'
        ctx.fill()
        ctx.globalAlpha = 1
        // how in the hell will we sort this mess to become a circle.
    }

    return { draw }
}

