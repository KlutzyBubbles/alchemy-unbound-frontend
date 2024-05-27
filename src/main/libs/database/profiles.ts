import { DatabaseData } from 'src/common/types/saveFormat';
import { createDatabase, getDatabaseInfo, reset, save, setDatabaseInfo } from './recipeStore';
import { setWorkingDatabase } from './workingName';
import logger from 'electron-log/main';

export async function switchProfile(profile: string, info: DatabaseData) {
    logger.silly('switchProfile', profile, info);
    await save();
    logger.debug('Saved');
    await setWorkingDatabase(profile);
    logger.debug('setWorkingDatabase done');
    // await switchInfo(info);
    await createDatabase(info);
    logger.debug('createDatabase done');
    await switchInfo(info);
    logger.debug('switchInfo done');
    await save();
    logger.debug('Saved');
}

async function switchInfo(info: DatabaseData) {
    let existingInfo = getDatabaseInfo();
    if (existingInfo.type !== info.type) {
        setDatabaseInfo(info);
        existingInfo = info;
    }
    if (existingInfo.type === 'daily' || existingInfo.type === 'weekly') {
        if (existingInfo.expiry !== info.expiry) {
            setDatabaseInfo({
                type: existingInfo.type,
                expiry: info.expiry
            });
            await reset();
        }
    }
}
