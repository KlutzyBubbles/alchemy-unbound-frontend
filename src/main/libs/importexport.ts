import { promises as fs } from 'fs';
import logger from 'electron-log/main';
import { dialog } from 'electron';
import { hasProp } from '../../common/utils';
import { getHintSaveFormat, loadHintV1, setHintRaw } from './hints';
import { getDatabaseSaveFormat, loadDatabaseV1, loadDatabaseV2, setDataRaw, setServerVersion } from './database';
import { LATEST_SERVER_VERSION } from '../../common/types';

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
        try {
            raw = JSON.parse(text);
        } catch (e) {
            logger.error('Failed to translate imported database to JSON');
            throw new Error('Imported a malformed JSON');
        }
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
            tempServerVersion = parseInt(database.server ?? `${LATEST_SERVER_VERSION}`);
        } catch (e) {
            tempServerVersion = LATEST_SERVER_VERSION;
            logger.error('Failed to translate imported database to JSON');
            throw new Error('Imported database server version isnt supported');
        }
        if (tempServerVersion < 1) {
            throw new Error('Database server version isnt supported');
        }
        setServerVersion(tempServerVersion);
        if (database.version === 1) {
            try {
                await setDataRaw(loadDatabaseV1(database.data));
            } catch (e) {
                throw new Error('Failed loading the database from version');
            }
        } else if (database.version === 2) {
            try {
                await setDataRaw(await loadDatabaseV2(database.data));
            } catch (e) {
                throw new Error('Failed loading the database from version');
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
        await fs.writeFile(fileDialog.filePath, JSON.stringify({
            version: EXPORT_VERSION,
            database: getDatabaseSaveFormat(),
            hint: getHintSaveFormat(),
        }), 'utf-8');
        return true;
    } catch (e) {
        throw new Error('Failed to save database file');
    }
}
