// import { InteractMouse } from './interactors/Mouse' 
import { terrain as terrainConfig, canvas as canvasConfig} from '../config/config.json'
import * as mapConfig from '../config/maps/default.json'
import * as entityConfig from '../config/entities/default.json'
import { Draw } from './Draw'
import { Map, tMapConfig } from './Map'
import { tEntityConfigs } from './Entity'
import { tConfigTerrain } from './draw/Terrain'
// import { ModuleBlock, ModuleBody, ModuleDeclaration } from 'typescript'
// import { ModuleFormat } from 'rollup'

export const RunEngine = (canvas: HTMLCanvasElement) => {
    // const interact_strategy = new InteractMouse(canvas)
    const map = Map(terrainConfig as unknown as tConfigTerrain);

    // @ts-ignore json-loader imports as a module
    map.load_entities(entityConfig.default as tEntityConfigs);
    // @ts-ignore json-loader imports as a module
    map.load_map(mapConfig.default as unknown as tMapConfig);

    const draw = Draw(
        canvas, 
        terrainConfig as unknown as tConfigTerrain, 
        canvasConfig.width, 
        canvasConfig.height,
        map
    )

    draw.draw()

    // todo: execute attach interact strategy
}