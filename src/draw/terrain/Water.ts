import { tDrawable } from "../../Draw";
import { tConfigTerrain } from "../Terrain";
import { Map as WorldMap, tMapAt } from '../../Map';
import { tCoord } from "../MapCoords";

export const Water: tDrawable = (terrainConfig, map, mapCoords, ctx, terrain) => {    
    const draw = () => {
        const waterLevel = terrainConfig.level.water;
        let lakePoints: tCoord[] = [];

        map.iterate((xLoc, zLoc, mapAt) => {
            if (typeof mapAt?.level == "undefined" || mapAt.level > waterLevel) {
                return;
            }
            // check if any of the edges dips underwater
            const coords = mapCoords.getAll()[xLoc][zLoc],
                relativePosition = Object.entries(coords.slanted).reduce((acc, [coordKey, value]) => {
                    const unslantedCoord: tCoord = coords.unslanted[coordKey as 'bottom' | 'left' | 'right' | 'top'];
                    if (xLoc==3) {
                        console.log(xLoc, zLoc, coords)
                    }
                    if (value[1] != unslantedCoord[1] ) {
                        acc.below.push(value);
                        console.log(xLoc, zLoc, coordKey, 'slanted is bigger than unslanted')
                    }
                    else if (value[0] == unslantedCoord[0] && value[1] == unslantedCoord[1]) {
                        acc.waterline.push(value);
                    }
                    return acc;
                },
                {
                    waterline: [] as tCoord[],
                    below: [] as tCoord[]
                }
            );
            
            if (relativePosition.waterline.length && relativePosition.below.length) {
                lakePoints = [...lakePoints, ...relativePosition.waterline]
            }
        });
        const sortedLakepoints = lakePoints.sort((coordA, coordB) =>{
            return Math.atan2(coordA[1], coordA[0]) > Math.atan2(coordB[1], coordB[0]) ? 1 : 0
        })

        
        console.log('lakepoints', sortedLakepoints);

        terrain.draw_lines(sortedLakepoints)
        ctx.globalAlpha = 0.5
        ctx.fillStyle = '#00f'
        ctx.fill()
        ctx.globalAlpha = 1
        // how in the hell will we sort this mess to become a circle.
    }

    return { draw }
}

