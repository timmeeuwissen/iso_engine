import { Sprite } from "../draw/Sprite"
import { tEntityConfig } from "../Entity"
import { Interact } from "../Interact"
import { tMapConfig } from "../Map";
import { TranslateHelper } from "../TranslateHelper";


enum KeyCode {
    left = 37,
    up = 38,
    right = 39,
    down = 40
}

const initialCalc = {
    // position from within the isometric perspective. Point 0 is intended 
    // to be the bottom corner of the map. After this, we need translation 
    // to the cartesian system
    isoPosition: {
        x: 0,
        y: 0,
        z: 0,
    },
    
    // deltas in pixels from within the iso perspective. 
    // still need to be translated to cartesian x and y positions
    isoDeltas: {
        x: 0,
        y: 0,
        z: 0,
    }
}

type calculationStep = (acc: typeof initialCalc, time: number) => typeof initialCalc;

export const Steer = (
    ctx: CanvasRenderingContext2D, 
    entityConfig: tEntityConfig, 
    interact: ReturnType<typeof Interact>,
    mapConfig: tMapConfig
    ) => {    
    
    const translate = TranslateHelper(mapConfig);
    
    if (!entityConfig.movement) {
        console.error(entityConfig, 'no movement supported');
        return;
    }
    
    const movementConf = entityConfig.movement;   
    
    // cartesian position into which the isometrical position is being translated
    let cartesianPosition = {
        x: 0,
        y: 0,
    }

    const activity = {
        up: false,
        down: false,
        left: false,
        right: false,
    }

    const get_initial = () => {
        const ret = JSON.parse(JSON.stringify(initialCalc));
        return ret;
    }

    let calculatedNext = get_initial();

    const calculate = (time: number) => {
        // start Chain of Execution
        const CoE: Array<calculationStep> = [
            calculate_steering,
            calculate_drag,
            apply_position,
            correct_collision,
        ]
        calculatedNext = CoE.reduce((acc: typeof initialCalc, cb) => cb(acc, time), initialCalc);
        cartesianPosition = translate.iso_to_cartesian(
            calculatedNext.isoPosition.x, 
            calculatedNext.isoPosition.z, 
            calculatedNext.isoPosition.y
        );
        console.log(cartesianPosition)
    }

    const calculate_steering: calculationStep = (acc) => {
        if (activity.up) {acc.isoDeltas.z += movementConf.delta.steer}
        if (activity.down) {acc.isoDeltas.z -= movementConf.delta.steer}
        if (activity.left) {acc.isoDeltas.x -= movementConf.delta.steer}
        if (activity.right) {acc.isoDeltas.x += movementConf.delta.steer}
        return acc;
    }

    const apply_position: calculationStep = (acc, time) => {
        acc.isoPosition.x = acc.isoPosition.x + (acc.isoDeltas.x / 1000 * time);
        acc.isoPosition.y = acc.isoPosition.y + (acc.isoDeltas.y / 1000 * time);
        acc.isoPosition.z = acc.isoPosition.z + (acc.isoDeltas.z / 1000 * time);
        return acc;
    }

    const calculate_drag: calculationStep = (acc) => {
        return acc;
    }

    const correct_collision: calculationStep = (acc) => {
        // did we go cross boundaries of the collidable? Bounce back
        return acc;
    }

    const attach = () => {
        interact.interactors.Keyboard.observe(
            (key: string, evt: KeyboardEvent) => {
                activity.up = (evt.keyCode == KeyCode.up);
                activity.down = (evt.keyCode == KeyCode.down);
                activity.left = (evt.keyCode == KeyCode.left);
                activity.right = (evt.keyCode == KeyCode.right);
            }
        );
    };

    const draw = () => {
        ctx.save();
        ctx.fillStyle = '#000';
        ctx.fillRect(cartesianPosition.x, cartesianPosition.y, 2, 2);
        ctx.restore();
        // Sprite(ctx).draw([cartesianPosition.x, cartesianPosition.y], entityConfig.object);
    }

    return { attach, calculate, draw }
}