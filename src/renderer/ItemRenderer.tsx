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
    theme?: string
    onHoverEnd?: (event: MouseEvent) => void
    onHoverStart?: (event: MouseEvent) => void
    onContextMenu?: MouseEventHandler<HTMLDivElement>
    onBlur?: FocusEventHandler<HTMLDivElement>
    onClick?: MouseEventHandler<HTMLDivElement>
    onMouseDown?: MouseEventHandler<HTMLDivElement>
    newDiscovery?: boolean
    variants?: Variants
    animate?: boolean | AnimationControls | TargetAndTransition | VariantLabels
    exit?: TargetAndTransition | VariantLabels
    locked?: boolean
    children?: ReactNode
    style?: CSSProperties
}

function getItemStyles(
    initialOffset?: XYCoord,
    currentOffset?: XYCoord,
    dragging?: boolean,
    locked?: boolean
) {
    if (dragging == undefined)
        dragging = false;
    if (locked === undefined)
        locked = false;
    if (!initialOffset || !currentOffset) {
        if (!locked && dragging) {
            return {
                display: 'none',
            };
        }
        return {};
    }

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
    locked?: boolean
): CSSProperties {
    if (isDragging === undefined)
        isDragging = false;
    if (locked === undefined)
        locked = false;
    if (isDragging) {
        left = -100;
        top = -100;
    }
    const transform = `translate3d(${left}px, ${top}px, 0)`;
    return {
        position: 'fixed',
        left: left === undefined ? 0 : left,
        top: top === undefined ? 0 : top,
        transform,
        WebkitTransform: transform,
        // IE fallback: hide the real node using CSS when dragging
        // because IE will ignore our custom "empty image" drag preview.
        opacity: locked ? 1 : isDragging ? 0 : 1,
        height: locked ? '' : isDragging ? 0 : '',
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
        theme,
        onHoverStart,
        onHoverEnd,
        onContextMenu,
        onBlur,
        onClick,
        onMouseDown,
        variants,
        animate,
        exit,
        style
    } = props;

    let {
        dragging,
        hasDropOver,
        maxDepth,
        disabled,
        newDiscovery,
        locked,
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
    if (newDiscovery === undefined)
        newDiscovery = false;
    if (locked === undefined)
        locked = false;
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
            className={`${type}-element btn btn-element p-0
            ${dragging ? '' : type === ItemTypes.SIDE_ELEMENT ? 'mt-2 ms-2' : ''}
            element
            ${theme !== undefined ? '' : `theme-${theme}`}
            ${locked ? 'locked' : ''}
            ${firstDiscovered && !base ? 'holo' : ''}
            ${base ? 'foil' : 'generated'}
            ${maxDepth ? 'rainbow' : ''}
            ${dragging ? 'shadow' : ''}
            z-${dragging ? 'dragging' : destroying ? 'destroying' : type}Element 
            ${dragging ? 'position-absolute': ''}
            ${hasDropOver ? 'active': ''}
            ${newDiscovery ? 'highlight highlight-black-white': ''}
            ${disabled ? 'disabled': ''}`}
            ref={ref}
            data-type={firstDiscovered ? 'holo' : base ? 'foil' : maxDepth ? 'rainbow' : 'none'}
            // onMouseMove={handleMove}
            onHoverEnd={onHoverEnd}
            onHoverStart={onHoverStart}
            onContextMenu={onContextMenu}
            onBlur={onBlur}
            onClick={onClick}
            onMouseDown={onMouseDown}
            variants={variants}
            animate={animate}
            exit={exit}
            style={{
                ...(type === ItemTypes.MAIN_ELEMENT || type === ItemTypes.LOCKED_ELEMENT ? getMainStyles(left, top, dragging, locked) : {}),
                ...(dragging ? getItemStyles(initialOffset, currentOffset) : {}),
                ...(style === undefined ? {} : style),
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
            <div className='btn-holder h-100 w-100'>
                <div className='glare h-100 w-100'>
                    <div className='shine h-100 w-100'>
                        <div className={`holder ${firstDiscovered ? '' : 'not-holo'} py-2 px-2 h-100 w-100`}>
                            {element.emoji} {element.display[settings.language]}
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});
