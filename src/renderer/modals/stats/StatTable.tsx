import { type FC, useContext, Fragment } from 'react';
import { Table } from 'react-bootstrap';
import { SettingsContext } from '../../providers/SettingsProvider';
import { getFromStore } from '../../language';


export interface StatsTableProps {
    loading?: boolean
    loadingWidth?: number
    dataTitles?: string[]
    dataRows: {
        [subTitle: string]: (string | number)[]
    }
}

export const StatsTable: FC<StatsTableProps> = ({
    loading,
    loadingWidth,
    dataTitles,
    dataRows
}) => {
    const { settings } = useContext(SettingsContext);

    const hasLoadingWidth = loadingWidth !== undefined && loadingWidth > 0;
    const hasDataTitles = dataTitles !== undefined && dataTitles.length > 0;

    return <Table striped bordered hover size="sm">
        {hasDataTitles ? <thead>
            <tr>
                <th></th>
                {dataTitles.map((title, index) => {
                    return <th key={index}>{getFromStore(title, settings.language)}</th>;
                })}
            </tr>
        </thead> : <Fragment />}
        <tbody className={hasDataTitles ? 'table-group-divider' : ''}>
            {Object.keys(dataRows).map((rowTitle, index) => {
                return <tr key={index}>
                    <td>{getFromStore(rowTitle, settings.language)}</td>
                    {dataRows[rowTitle].map((rowItem, index) => {
                        if (loading) {
                            return <td key={index} className='placeholder-glow'><p className={`placeholder ${hasLoadingWidth ? 'col-10 fs-7 mb-0' : 'col-6 mb-1'}`}>
                                {hasLoadingWidth ? [...Array(loadingWidth).keys()].map(() => '-').join('') : ''}    
                            </p></td>;
                        }
                        return <td key={index}>{rowItem}</td>;
                    })}
                </tr>;
            })}
        </tbody>
    </Table>;
};
