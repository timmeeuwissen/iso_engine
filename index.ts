import { InteractMouse } from './interactors/Mouse' 
import { terrain as terrainConfig, canvas as canvasConfig} from './config.json'
import { Draw } from './Draw'
import { Map } from './Map'

const canvas:HTMLCanvasElement = document.getElementById('game_canvas') as HTMLCanvasElement;
const interact_strategy = new InteractMouse(canvas)
const map = new Map();

const draw = new Draw(canvas, terrainConfig, canvasConfig.width, canvasConfig.height)
draw.load_map(map)
draw.set_interact_strategy(interact_strategy)
// todo: execute attach interact strategy
