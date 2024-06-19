import { DatabaseData } from '../../../common/types/saveFormat';
import { getMission, getUserDetails } from '../server';
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
    if (profile === 'custom') {
        await getUserDetails(true);
        logger.debug('User details done');
    }
}

async function switchInfo(info: DatabaseData) {
    let existingInfo = await getDatabaseInfo();
    if (existingInfo.type !== info.type) {
        setDatabaseInfo(info);
        existingInfo = info;
    }
    if (existingInfo.type === 'daily' || existingInfo.type === 'weekly') {
        const mission = await getMission(existingInfo.type);
        let expires = existingInfo.expires;
        if (mission.type === 'success') {
            expires = mission.result.expires;
        }
        if (existingInfo.expires !== expires) {
            setDatabaseInfo({
                type: existingInfo.type,
                expires: expires
            });
            await reset();
        }
    }
}
