import { tDrawable, tDrawPoints } from "../../Draw";
import { tConfigTerrain, Terrain } from "../Terrain";
import { Map as WorldMap, tMapAt } from '../../Map';
import { eCoordLocations, MapCoords, opposites, tCoord, tTileCoordRec, tTileCoords } from "../MapCoords";


// todo : want to extend the output type, but takes way to long to figure out
export const Water = (
        terrainConfig: tConfigTerrain, 
        map: ReturnType<typeof WorldMap>,
        mapCoords: ReturnType<typeof MapCoords>,
        ctx: CanvasRenderingContext2D,
        terrain: ReturnType<typeof Terrain>
    ) => {    
    const draw_all = () => {
        const waterLevel = terrainConfig.level.water;
        let lakePoints: tCoord[] = [];
        let relevantTiles: tTileCoordRec[] = [];

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
                    waterline: {} as tTileCoordRec,
                    below: {} as tTileCoordRec
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
                // only add two, otherwise we're at the risk of drawing triangles.
                lakePoints = [
                    ...lakePoints, 
                    ...Object.entries(relevantTiles[nextIndex] as {[key: string]: tCoord})
                        .reduce((acc: tCoord[], [newLocation, newCoord]): tCoord[] => {
                            Object.entries(currentTile as {[key: string]: tCoord}).forEach(([curLocation]) => {
                                if (curLocation != newLocation && acc.length < 2){
                                    acc.push(newCoord as tCoord);
                                }
                            });

                            return acc;
                        }, [])
                ];

                // carry on from the neighbour onwards
                currentTile = relevantTiles[nextIndex];

                // delete the neighbour from the list to search
                relevantTiles.splice(nextIndex,1);
            } 
        }
        
        draw(lakePoints);
    }

    const draw = (waterPoints: tCoord[]) => {
        ctx.save();        
        terrain.draw_lines(waterPoints);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#00f';
        ctx.fill();
        ctx.restore();
    }

    return { draw, draw_all }
}

