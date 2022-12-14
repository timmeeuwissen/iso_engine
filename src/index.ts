// import { InteractMouse } from './interactors/Mouse' 
import { terrain as terrainConfig, canvas as canvasConfig} from '../config/config.json'
import * as mapConfig from '../config/maps/default.json'
import * as entityConfig from '../config/entities/default.json'
import { Draw } from './Draw'
import { Map, tMapConfig } from './Map'
import { tEntityConfigs } from './Entity'
import { tConfigTerrain } from './draw/Terrain'
import { createTextChangeRange } from 'typescript'
import { Steer } from './interactions/steer'
import { Interact } from './Interact'
// import { ModuleBlock, ModuleBody, ModuleDeclaration } from 'typescript'
// import { ModuleFormat } from 'rollup'

export const RunEngine = (canvas: HTMLCanvasElement) => {
    // const interact_strategy = new InteractMouse(canvas)
    const map = Map(terrainConfig as unknown as tConfigTerrain);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    // @ts-ignore json-loader imports as a module
    const entityConfigs = entityConfig.default as tEntityConfigs
    
    map.load_entities(entityConfigs);
    // @ts-ignore json-loader imports as a module
    map.load_map(mapConfig.default as unknown as tMapConfig);

    const draw = Draw(
        ctx, 
        terrainConfig as unknown as tConfigTerrain, 
        canvasConfig.width, 
        canvasConfig.height,
        map
    )
    
    const user = Steer(ctx, entityConfigs.ball, Interact(canvas), mapConfig);
    if(user) {
        user.attach()
    }
    const drawFrame = (time: number) => {
        // console.log('drawing @ FPS', Math.round(1000 / time));
        draw.clear();
        draw.draw();
        if (user) {
            user.calculate(time);
            user.draw();
        }
        requestAnimationFrame(drawFrame);
    }

    requestAnimationFrame(drawFrame);
    

    // todo: execute attach interact strategy
}