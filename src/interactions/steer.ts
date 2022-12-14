import { AccessExpression } from "typescript";
import { Sprite } from "../draw/Sprite"
import { tEntityConfig } from "../Entity"
import { Interact } from "../Interact"
import { tMapConfig } from "../Map";
import { TranslateHelper } from "../TranslateHelper";


enum KeyCode {
    left = 'ArrowLeft',
    up = 'ArrowUp',
    right = 'ArrowRight',
    down = 'ArrowDown',
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
        calculatedNext = CoE.reduce((acc: typeof initialCalc, cb) => cb(acc, 1 / 1000 * time), initialCalc);
        cartesianPosition = translate.iso_to_cartesian(
            calculatedNext.isoPosition.x, 
            calculatedNext.isoPosition.z, 
            calculatedNext.isoPosition.y
        );
        console.log(cartesianPosition)
    }

    const calculate_steering: calculationStep = (acc, fraction) => {
        if (activity.up) {acc.isoDeltas.z += movementConf.delta.steer * fraction}
        if (activity.down) {acc.isoDeltas.z -= movementConf.delta.steer * fraction}
        if (activity.left) {acc.isoDeltas.x -= movementConf.delta.steer * fraction}
        if (activity.right) {acc.isoDeltas.x += movementConf.delta.steer * fraction}
        return acc;
    }

    const calculate_drag: calculationStep = (acc, fraction) => {
        Object.keys(acc.isoDeltas).forEach((axleKey) => {
            const axle = axleKey as unknown as keyof typeof acc.isoDeltas;
            const directionBeforeDrag = acc.isoDeltas[axle] > 0;
            acc.isoDeltas[axle] = Math.abs(acc.isoDeltas[axle]) - (movementConf.delta.drag * fraction)
            if (acc.isoDeltas[axle] < 0) {
                acc.isoDeltas[axle] = 0;
            }
            if (!directionBeforeDrag) {
                acc.isoDeltas[axle] *= -1;
            }
        })
        return acc;
    }

    const apply_position: calculationStep = (acc, fraction) => {
        acc.isoPosition.x = acc.isoPosition.x + (acc.isoDeltas.x);
        acc.isoPosition.y = acc.isoPosition.y + (acc.isoDeltas.y);
        acc.isoPosition.z = acc.isoPosition.z + (acc.isoDeltas.z);
        return acc;
    }

    const correct_collision: calculationStep = (acc) => {
        // did we go cross boundaries of the collidable? Bounce back
        return acc;
    }

    const attach = () => {
        interact.interactors.Keyboard.observe(
            (key: string, evt: KeyboardEvent) => {
                activity.up = (evt.key == KeyCode.up && evt.type == 'keydown');
                activity.down = (evt.key == KeyCode.down && evt.type == 'keydown');
                activity.left = (evt.key == KeyCode.left && evt.type == 'keydown');
                activity.right = (evt.key == KeyCode.right && evt.type == 'keydown');
                console.log(evt);
            }
        );
    };

    const draw = () => {
        ctx.save();
        ctx.fillStyle = '#000';
        ctx.fillRect(cartesianPosition.x, cartesianPosition.y, 5, 5);
        ctx.restore();
        // Sprite(ctx).draw([cartesianPosition.x, cartesianPosition.y], entityConfig.object);
    }

    return { attach, calculate, draw }
}