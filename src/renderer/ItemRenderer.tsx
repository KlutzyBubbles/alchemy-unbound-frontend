/* eslint-disable react/display-name */
import React, { type ReactNode, useContext, CSSProperties, FocusEventHandler, MouseEventHandler, useState, useEffect } from 'react';
import { RecipeElement } from '../common/types';
import { SettingsContext } from './providers/SettingsProvider';
import { XYCoord } from 'react-dnd';
import { AnimationControls, TargetAndTransition, VariantLabels, Variants, motion } from 'framer-motion';
import { ItemTypes } from './types';

export type ElementType = 'main' | 'side' | 'crafting'

export type ItemRendererProps = {
    element: RecipeElement
    type: ItemTypes
    dragging?: boolean
    maxDepth?: boolean
    hasDropOver?: boolean
    disabled?: boolean
    initialOffset?: XYCoord
    currentOffset?: XYCoord
    top?: number
    left?: number
    hideSourceOnDrag?: boolean
    onContextMenu?: MouseEventHandler<HTMLDivElement>
    onBlur?: FocusEventHandler<HTMLDivElement>
    onClick?: MouseEventHandler<HTMLDivElement>
    variants?: Variants
    animate?: boolean | AnimationControls | TargetAndTransition | VariantLabels
    exit?: TargetAndTransition | VariantLabels
    children?: ReactNode
}

function getItemStyles(
    initialOffset?: XYCoord,
    currentOffset?: XYCoord,
    dragging?: boolean
) {
    if (dragging == undefined)
        dragging = false;
    if (!initialOffset || !currentOffset) {
        if (dragging) {
            return {
                display: 'none',
            };
        }
        return {};
    }

    // console.log(`getItemStyles(${JSON.stringify(initialOffset)}, ${JSON.stringify(currentOffset)})`);

    const { x, y } = currentOffset;

    const transform = `translate(${x}px, ${y}px)`;
    return {
        transform,
        WebkitTransform: transform,
    };
}

function getMainStyles(
    left?: number,
    top?: number,
    isDragging?: boolean,
): CSSProperties {
    console.log(`getMainStyles(${left}, ${top}, ${isDragging})`);
    const transform = `translate3d(${left}px, ${top}px, 0)`;
    if (isDragging === undefined)
        isDragging = false;
    return {
        position: 'fixed',
        left: left === undefined ? 0 : left,
        top: top === undefined ? 0 : top,
        transform,
        WebkitTransform: transform,
        // IE fallback: hide the real node using CSS when dragging
        // because IE will ignore our custom "empty image" drag preview.
        opacity: isDragging ? 0 : 1,
        height: isDragging ? 0 : '',
    };
}

export const ItemRenderer = React.forwardRef<HTMLInputElement, ItemRendererProps>((props, ref) => {
    const {
        element,
        type,
        initialOffset,
        currentOffset,
        children,
        top,
        left,
        onContextMenu,
        onBlur,
        onClick,
        variants,
        animate,
        exit
    } = props;

    let {
        dragging,
        hasDropOver,
        maxDepth,
        disabled
    } = props;

    const [destroying, setDestroying] = useState(false);
    const [firstDiscovered, setFirstDiscovered] = useState(false);
    const [base, setBase] = useState(false);

    if (dragging === undefined)
        dragging = false;
    if (hasDropOver === undefined)
        hasDropOver = false;
    if (maxDepth === undefined)
        maxDepth = false;
    if (disabled === undefined)
        disabled = false;
    const { settings } = useContext(SettingsContext);
    //const [xy, setXY] = useState({ x: 0, y: 0 });

    // const handleMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    //     setXY({
    //         x: -e.nativeEvent.offsetX,
    //         y: -e.nativeEvent.offsetY
    //     });
    // };

    useEffect(() => {
        return () => {
            setDestroying(true);
        };
    }, []);

    useEffect(() => {
        const steamId = window.SteamAPI.getSteamId() ?? 'NO_STEAM_ID';
        let firstDiscoveredCheck = false;
        let baseCheck = false;
        for (const recipe of element.recipes) {
            if (recipe.who_discovered === steamId || recipe.first) {
                firstDiscoveredCheck = true;
            }
            if (recipe.base) {
                baseCheck = true;
            }
        }
        setFirstDiscovered(firstDiscoveredCheck);
        setBase(baseCheck);
    }, [element]);

    return (
        <motion.div
            className={`${type}-element btn btn-element ${type === ItemTypes.SIDE_ELEMENT ? dragging ? '' : 'mt-2 ms-2' : ''} p-0
            element
            ${firstDiscovered ? 'holo' : ''}
            ${base ? 'foil' : ''}
            ${maxDepth ? 'rainbow' : ''}
            ${dragging ? 'shadow' : ''}
            z-${dragging ? 'dragging' : destroying ? 'destroying' : type}Element 
            ${dragging ? 'position-absolute': ''}
            ${hasDropOver ? 'active': ''}
            ${disabled ? 'disabled': ''}`}
            ref={ref}
            data-type={firstDiscovered ? 'holo' : base ? 'foil' : maxDepth ? 'rainbow' : 'none'}
            // onMouseMove={handleMove}
            onContextMenu={onContextMenu}
            onBlur={onBlur}
            onClick={onClick}
            variants={variants}
            animate={animate}
            exit={exit}
            style={{
                ...getItemStyles(initialOffset, currentOffset),
                ...(type === ItemTypes.MAIN_ELEMENT ? getMainStyles(left, top, dragging) : {}),
                // zIndex: dragging ? 69 : 50,
                // backgroundPosition: `var(${xy.x}px) var(${xy.y}px)`,
                '--pointer-x': '50%',
                '--pointer-y': '50%',
                '--pointer-from-center': 0,
                '--pointer-from-top': 0.5,
                '--pointer-from-left': 0.5,
                '--card-opacity': 1,
                '--rotate-x': '0deg',
                '--rotate-y': '0deg',
                '--background-x': '50%',
                '--background-y': '50%'
            }}
        >
            <div className='glare h-100 w-100'>
                <div className='shine h-100 w-100'>
                    <div className='holder py-2 px-2 h-100 w-100'>
                        {element.emoji} {element.display[settings.language]}
                        {children}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});
