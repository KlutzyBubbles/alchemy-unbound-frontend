import type { FC } from 'react';
import { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { Tooltip } from 'react-bootstrap';

import { Recipe } from '../../../common/types';
import { ItemTypes } from '../../types';
import { mockElement } from '../../utils';
import { ItemRenderer } from '../../ItemRenderer';
import { getFromStore, getPlaceholderLanguage } from '../../language';
import { DEFAULT_HINT, DEFAULT_MAX_HINTS } from '../../../common/hints';
import logger from 'electron-log/renderer';
import { SettingsContext } from '../../providers/SettingsProvider';
import { Overlay } from 'react-bootstrap';
import { IoHelpOutline, IoRefreshOutline } from 'react-icons/io5';
import { InfoContext } from '../../providers/InfoProvider';

export interface HintButtonProps {
    refreshProp: number
}

export const HintButton: FC<HintButtonProps> = ({
    refreshProp
}) => {
    const [hintOpen, setHintOpen] = useState<boolean>(false);
    const [maxHints, setMaxHints] = useState<number>(DEFAULT_MAX_HINTS);
    const [hintPoints, setHintPoints] = useState<number>(DEFAULT_HINT.hintsLeft);
    const [currentHint, setCurrentHint] = useState<Recipe>(DEFAULT_HINT.hint);
    const [hovered, setHovered] = useState<boolean>(false);
    const [showTooltip, setShowTooltip] = useState<boolean>(true);
    const { settings } = useContext(SettingsContext);
    const tooltipRef = useRef(undefined);
    const { fileVersions } = useContext(InfoContext);

    const refresh = async () => {
        try {
            const newHint = await window.HintAPI.getHint(false);
            setShowTooltip(newHint === undefined);
            setCurrentHint(newHint);
            const maxHintsTemp = await window.HintAPI.getMaxHints();
            setMaxHints(maxHintsTemp);
            const hintsLeft = await window.HintAPI.getHintsLeft();
            setHintPoints(hintsLeft);
        } catch (error) {
            logger.error('Failed getting hint data from main', error);
        }
    };

    useEffect(() => {
        refresh();
        if (tooltipRef.current !== undefined && tooltipRef.current !== null) {
            tooltipRef.current.addEventListener('hide.bs.dropdown', () => {
                setHintOpen(false);
            });
            tooltipRef.current.addEventListener('show.bs.dropdown', () => {
                setHintOpen(true);
            });
        }
        return () => {
            if (tooltipRef.current !== undefined && tooltipRef.current !== null) {
                tooltipRef.current.removeEventListener('hide.bs.dropdown');
                tooltipRef.current.removeEventListener('show.bs.dropdown');
            }
        };
    }, []);

    useEffect(() => {
        refresh();
    }, [refreshProp]);

    const hintClick = () => {
        (async () => {
            if (currentHint === undefined) {
                const recipe = await window.HintAPI.getHint(true);
                setHintPoints(await window.HintAPI.getHintsLeft());
                setShowTooltip(recipe === undefined);
                setCurrentHint(recipe);
            }
        })();
    };

    const onHoverStart = () => {
        setHovered(true);
    };

    const onHoverEnd = () => {
        setHovered(false);
    };

    const resetHint = async () => {
        await window.HintAPI.resetHint(true);
        setCurrentHint(undefined);
        setShowTooltip(false);
        setHintOpen(false);
    };

    if (fileVersions.databaseInfo.type === 'custom') {
        return <Fragment />;
    }

    return (
        <Fragment>
            <div
                className="hint-drop dropstart float-end mb-2 me-2 fs-1"
                ref={tooltipRef}
                data-bs-display="static"
                onMouseEnter={onHoverStart}
                onMouseLeave={onHoverEnd}
            >
                <button
                    className="btn btn-secondary btn btn-info fs-1 p-2 d-flex"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    onClick={hintClick}
                >
                    <IoHelpOutline />
                    <span className={`
                        position-absolute
                        top-0
                        start-0
                        translate-middle
                        badge
                        rounded-pill
                        ${hintPoints === maxHints ? 'bg-danger text-light' : hintPoints === 0 ? 'bg-secondary text-light' : 'bg-warning text-dark'}
                        fs-7`
                    }>
                        {hintPoints}/{maxHints}
                    </span>
                </button>
                <div className={`dropdown-menu ${ hintOpen ? 'show' : '' } overflow-visible`}>
                    {currentHint === undefined ? (
                        <div className='dropdown-item text-body disabled'>
                            <ItemRenderer
                                element={mockElement({
                                    name: '?',
                                    display: getPlaceholderLanguage('?'),
                                    emoji: '❓',
                                    depth: 0,
                                    first: 0,
                                    who_discovered: '',
                                    base: 1
                                })}
                                type={ItemTypes.RECIPE_ELEMENT}
                                dragging={false}/>
                                +
                            <ItemRenderer
                                element={mockElement({
                                    name: '?',
                                    display: getPlaceholderLanguage('?'),
                                    emoji: '❓',
                                    depth: 0,
                                    first: 0,
                                    who_discovered: '',
                                    base: 1
                                })}
                                type={ItemTypes.RECIPE_ELEMENT}
                                dragging={false}/>
                                =
                            <ItemRenderer
                                element={mockElement({
                                    name: '?',
                                    display: getPlaceholderLanguage('?'),
                                    emoji: '❓',
                                    depth: 0,
                                    first: 0,
                                    who_discovered: '',
                                    base: 1
                                })}
                                type={ItemTypes.RECIPE_ELEMENT}
                                dragging={false}/>
                        </div>
                    ) : (
                        <Fragment>
                            <div className='dropdown-item text-body'>
                                <div
                                    className='badge btn btn-danger rounded-pill float-start fs-6 position-fixed m-0'
                                    onClick={resetHint}
                                    style={{
                                        left: '-1.5rem',
                                        bottom: '1.2rem'
                                    }}>
                                    <IoRefreshOutline />
                                </div>
                                <ItemRenderer
                                    element={mockElement(currentHint.a)}
                                    type={ItemTypes.RECIPE_ELEMENT}
                                    dragging={false}/>
                                <span className='fs-3'>+</span>
                                <ItemRenderer
                                    element={mockElement({
                                        name: '?',
                                        display: getPlaceholderLanguage('?'),
                                        emoji: '❓',
                                        depth: 0,
                                        first: 0,
                                        who_discovered: '',
                                        base: 1
                                    })}
                                    type={ItemTypes.RECIPE_ELEMENT}
                                    dragging={false}/>
                                <span className='fs-3'>=</span>
                                <ItemRenderer
                                    element={mockElement(currentHint)}
                                    type={ItemTypes.RECIPE_ELEMENT}
                                    dragging={false}/>
                            </div>
                        </Fragment>
                    )}
                </div>
            </div>
            <Overlay target={tooltipRef.current} show={showTooltip && hovered && !hintOpen} placement="left">
                {(props) => (
                    <Tooltip id="overlay-example" {...props}>
                        {getFromStore('hintTooltip', settings.language)}
                    </Tooltip>
                )}
            </Overlay>
        </Fragment>
    );
};
