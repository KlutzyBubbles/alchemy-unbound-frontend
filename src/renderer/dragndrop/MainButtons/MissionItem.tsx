import { Fragment, type FC, useContext } from 'react';
import { IoCheckmarkCircleOutline, IoRemoveCircleOutline } from 'react-icons/io5';
import { MissionLevelStore } from '../../../common/types/saveFormat';
import { mockElement } from '../../utils';
import { ItemTypes } from '../../types';
import { ItemRenderer } from '../../ItemRenderer';
import { MissionDifficulty, missionRewards } from '../../../common/mission';
import { SoundContext } from '../../providers/SoundProvider';

export interface MissionItemProps {
    store: MissionLevelStore,
    type: MissionDifficulty
    isItem: boolean
    onClick?: () => void
}

export const MissionItem: FC<MissionItemProps> = ({
    store,
    type,
    isItem,
    onClick
}) => {
    const { playSound } = useContext(SoundContext);

    const clickInside = () => {
        playSound('drop', 0.5);
        if (onClick !== undefined) {
            onClick();
        }
    };

    const subContent = <Fragment>
        <span className={`text-${store.complete ? 'success' : 'secondary'} fs-4 pe-2`}>
            {store.complete ? <IoCheckmarkCircleOutline /> : <IoRemoveCircleOutline />}
        </span>
        <ItemRenderer
            element={mockElement({
                name: store.name,
                display: store,
                emoji: store.emoji,
                depth: 0,
                first: 0,
                who_discovered: '',
                base: 1
            })}
            type={ItemTypes.RECIPE_ELEMENT}
            data-bs-toggle={isItem ? '' : 'dropdown'}
            aria-expanded="false"
            onClick={clickInside}
            dragging={false}/>
        <div className={`badge user-select-none text-bg-${store.complete ? 'secondary' : 'primary'} rounded-pill ${isItem ? 'float-end' : ''} fs-6 ms-2 mt-2`}>{store.complete ? '-' : missionRewards[type]}</div>
    </Fragment>;
    if (!isItem) {
        return subContent;
    }
    return (
        <div className={isItem ? 'dropdown-item text-body user-select-none' : ''}>
            {subContent}
        </div>
    );
};
