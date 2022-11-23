import { terrain as terrainConfig, canvas as canvasConfig } from '../config/config.json';
import * as entityConfig from '../config/entities/default.json';
import { Draw } from './Draw';
import { Map } from './Map';
import { Generic } from './Entity';
export const RunEngine = (canvas) => {
    const map = Map();
    Object.entries(entityConfig).forEach(([unique, entityConfig]) => {
        map.entityMemory.add(Generic(entityConfig), unique);
    });
    const draw = Draw(canvas, terrainConfig, canvasConfig.width, canvasConfig.height);
};
