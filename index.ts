// import { InteractMouse } from './interactors/Mouse' 
import { terrain as terrainConfig, canvas as canvasConfig} from './config/config.json'
import * as entityConfig from './config/entities/default.json'
import { Draw } from './Draw'
import { Map } from './Map'
import { Generic } from './Entity'
import { tConfigTerrain } from './tConfig'

export const RunEngine = () => {
    const canvas:HTMLCanvasElement = document.getElementById('game_canvas') as HTMLCanvasElement;
    // const interact_strategy = new InteractMouse(canvas)
    const map = Map();

    Object.entries(entityConfig).forEach(([unique, entityConfig]) => {
        map.entityMemory.add(Generic(entityConfig), unique)
    })

    const draw = Draw(
        canvas, 
        terrainConfig as tConfigTerrain, 
        canvasConfig.width, 
        canvasConfig.height
    )

    // todo: execute attach interact strategy
}