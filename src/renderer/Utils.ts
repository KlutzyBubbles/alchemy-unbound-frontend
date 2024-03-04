import { DropTargetMonitor, XYCoord } from 'react-dnd';
import { DragItem } from './types';

export function getXY(item: DragItem, monitor: DropTargetMonitor): XYCoord {
    const delta = monitor.getClientOffset() as XYCoord;
    let left = delta.x;
    let top = delta.y;
    if (item.top !== undefined && item.left !== undefined) {
        const delta = monitor.getDifferenceFromInitialOffset() as XYCoord;
        left = Math.round(item.left + delta.x);
        top = Math.round(item.top + delta.y);
    }
    return {
        x: left,
        y: top
    };
}

export function hasProp<O extends NonNullable<unknown>, K extends keyof O>(o: O, k: K): boolean {
    return Object.prototype.hasOwnProperty.call(o, k);
}

export function makeId(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}
