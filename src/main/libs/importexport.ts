import { promises as fs } from 'fs';
import logger from 'electron-log/main';
import { dialog } from 'electron';
import { hasProp } from '../../common/utils';
import { getHintSaveFormat, loadHintV1, setHintRaw } from './hints';
import { checkLanguages, databaseV1toV2, databaseV2toV3, databaseV3toV4, fillWithBase, getDatabaseInfo, getDatabaseSaveFormat, setDataRaw, setDatabaseInfo, setServerVersion } from './database/recipeStore';
import { LATEST_SERVER_VERSION } from '../../common/types';
import { DatabaseData } from '../../common/types/saveFormat';

const EXPORT_VERSION = 1;

export async function importFile(): Promise<boolean> {
    const fileDialog = await dialog.showOpenDialog({
        filters: [{
            name: 'Alchemy Unbound Database',
            extensions: ['unbound']
        }],
        properties: [
            'openFile'
        ],
    });
    if (fileDialog.canceled) {
        return false;
    }
    if (fileDialog.filePaths.length === 0) {
        return false;
    } else {
        const filePath = fileDialog.filePaths[0];
        let text: string = undefined;
        try {
            text = await fs.readFile(filePath, 'utf-8');
        } catch (e) {
            if (e.code === 'ENOENT') {
                return false;
            } else {
                logger.error(`Failed to read imported database file with error ${e.code}`);
                throw new Error('Failed to read database file');
            }
        }
        if (text === undefined || text === null) {
            return false;
        }
        let raw = undefined;
        logger.silly('Imported found text', text);
        try {
            raw = JSON.parse(text);
        } catch (e) {
            logger.error('Failed to translate imported database to JSON');
            throw new Error('Imported a malformed JSON');
        }
        logger.silly('Imported found raw', raw);
        if (raw === undefined || raw === null) {
            return false;
        }

        if (!hasProp(raw, 'database') || !hasProp(raw, 'hint')) {
            throw new Error('Malformed database file selected (level 1)');
        }

        // DATABASE VALIDATION
        const database = raw.database;
        if (!hasProp(database, 'version') || !hasProp(database, 'data') || !Array.isArray(database.data)) {
            throw new Error('Malformed database file selected');
        }
        let version = -1;
        try {
            version = parseInt(database.version);
        } catch (e) {
            logger.error('Failed to translate imported database to JSON');
            throw new Error('Imported database version isnt supported');
        }
        if (version < 1) {
            throw new Error('Database version isnt supported');
        }
        let tempServerVersion = -1;
        try {
            tempServerVersion = parseInt(database.server ?? '1'/*`${LATEST_SERVER_VERSION}`*/);
        } catch (e) {
            tempServerVersion = LATEST_SERVER_VERSION;
            logger.error('Failed to translate imported database to JSON');
            throw new Error('Imported database server version isnt supported');
        }
        if (tempServerVersion < 1) {
            throw new Error('Database server version isnt supported');
        }
        setServerVersion(tempServerVersion);
        let foundInfo: DatabaseData = {
            type: 'base'
        };
        if (hasProp(database, 'info') && database.info !== undefined) {
            foundInfo = {
                type: database.info.type ?? 'base',
                expires: database.info.expires
            };
        }
        logger.silly('Imported found info', foundInfo, database.info);
        if (foundInfo.type !== 'base'/* && (foundInfo.type as DatabaseType) !== 'custom'*/) {
            throw new Error('Info type must be of type base');
        }
        let workingVersion = database.version;
        const v1db = database.data;
        let v2db = database.data;
        let v3db = database.data;
        let v4db = database.data;
        logger.silly('rawDb', database);
        if (workingVersion === 1) {
            try {
                logger.info('Found v1, migrating...');
                v2db = databaseV1toV2(v1db);
                workingVersion = 2;
            } catch (e) {
                throw new Error('Failed loading the database from version 1');
            }
        }
        if (workingVersion === 2) {
            try {
                logger.info('Found v2, migrating...');
                logger.silly('v2db', v2db);
                v3db = await databaseV2toV3(v2db);
                logger.silly('v3db', v3db);
                workingVersion = 3;
            } catch (e) {
                throw new Error('Failed loading the database from version 2');
            }
        }
        if (workingVersion === 3) {
            try {
                logger.info('Found v3, migrating...');
                logger.silly('v3db', v3db);
                v4db = await databaseV3toV4(v3db);
                logger.silly('v4db', v4db);
                workingVersion = 4;
            } catch (e) {
                throw new Error('Failed loading the database from version 3');
            }
        }
        if (workingVersion === 4) {
            try {
                logger.info('Found v4, importing...');
                logger.silly(v4db);
                setDatabaseInfo(foundInfo);
                // if (foundInfo.type === 'custom') {
                //     await setDataRaw(await noFill(v4db));
                // } else {
                await setDataRaw(await checkLanguages(await fillWithBase(v4db)));
                // }
            } catch (e) {
                logger.error('Database import error', e);
                throw new Error('Failed loading the database from version 3');
            }
        } else {
            logger.error(`Unknown imported database version '${database.version}'`);
            throw new Error(`Unknown imported database version '${database.version}'`);
        }

        // HINT VALIDATION
        const hint = raw.hint;
        if (!hasProp(hint, 'version') || !hasProp(hint, 'hint') || !Array.isArray(hint.hint)) {
            throw new Error('Malformed hint file selected');
        }
        version = -1;
        try {
            version = parseInt(hint.version);
        } catch (e) {
            logger.error('Failed to translate imported hint to JSON');
            throw new Error('Imported hint version isnt supported');
        }
        if (version < 1) {
            throw new Error('Hint version isnt supported');
        }
        if (hint.version === 1) {
            try {
                setHintRaw(loadHintV1(hint.hint));
            } catch (e) {
                throw new Error('Failed loading the database from version');
            }
        } else {
            logger.error(`Unknown imported hint version '${hint.version}'`);
            throw new Error(`Unknown imported hint version '${hint.version}'`);
        }
        return true;
    }
}

export async function exportDatabase(): Promise<boolean> {
    const fileDialog = await dialog.showSaveDialog({
        filters: [{
            name: 'Alchemy Unbound Database',
            extensions: ['unbound']
        }],
        properties: [
            'createDirectory',
            'showOverwriteConfirmation'
        ],
    });
    if (fileDialog.canceled || fileDialog.filePath === undefined || fileDialog.filePath === null) {
        return false;
    }
    try {
        const info = await getDatabaseInfo();
        if (info.type !== 'base') {
            throw new Error('Cannot export a non base save');
        }
        await fs.writeFile(fileDialog.filePath, JSON.stringify({
            version: EXPORT_VERSION,
            database: getDatabaseSaveFormat(),
            hint: getHintSaveFormat(),
        }), 'utf-8');
        return true;
    } catch (e) {
        logger.error('Database export error', e);
        throw new Error('Failed to save database file');
    }
}
